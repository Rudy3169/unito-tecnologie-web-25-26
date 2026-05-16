import { useState, type FormEvent, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, AlertCircle, Heart, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/apiFetch';
import './CommentSection.css';

interface Comment {
    id: number;
    text: string;
    authorName: string;
    authorId: number;
    likesCount?: number;
    isLikedByMe?: boolean;
    parentId?: number | null;
    creationDate?: string;
}

interface CommentSectionProps {
    postId: number;
    postAuthorId: number;
    isOpen: boolean;
    onClose: () => void;
    onCommentsUpdated?: () => void;
    highlightCommentId?: number;
}

export function CommentSection({ postId, postAuthorId, isOpen, onClose, onCommentsUpdated, highlightCommentId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();
    const [highlightedId, setHighlightedId] = useState<number | null>(null);
    const commentListRef = useRef<HTMLDivElement>(null);

    // Stato per tracciare a CHI stiamo rispondendo e sotto quale COMMENTO GENITORE
    const [replyingTo, setReplyingTo] = useState<{ authorName: string, parentId: number } | null>(null);

    // Stato per tracciare quali risposte sono "espanse/visibili"
    const [expandedReplies, setExpandedReplies] = useState<Record<number, boolean>>({});

    // Stato per tracciare quale commento stiamo eliminando
    const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

    // Funzione per caricare i commenti
    const getRelativeTime = (dateString?: string) => {
        if (!dateString) return 'Ora';

        const now = new Date();
        const past = new Date(dateString);
        const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

        if (diffInSeconds < 60) return `${Math.max(0, diffInSeconds)} sec fa`;

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} min fa`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} h fa`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} giorn${diffInDays === 1 ? 'o' : 'i'} fa`;

        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) return `${diffInWeeks} sett fa`;

        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) return `${diffInMonths} mes${diffInMonths === 1 ? 'e' : 'i'} fa`;

        const diffInYears = Math.floor(diffInDays / 365);
        return `${diffInYears} ann${diffInYears === 1 ? 'o' : 'i'} fa`;
    };

    useEffect(() => {
        // Se il popup è chiuso, non fare nulla
        if (!isOpen) return;

        // --- RESET ---
        setExpandedReplies({}); // Chiude tutte le risposte
        setReplyingTo(null);    // Rimuove il badge "Rispondi a..."
        setNewComment('');      // Svuota la barra di testo
        setErrorMsg('');        // Pulisce eventuali errori precedenti

        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');
        apiFetch(`/api/social/posts/${postId}/commenti?utenteId=${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-store' // Forza il ricaricamento da server
        })
            .then(res => res.ok ? res.json() : [])
            .then(data => {

                setComments(data.map((c: any) => ({
                    id: c.id,
                    text: c.testo ?? c.text ?? '',
                    authorName: c.author?.name ?? 'Utente',
                    authorId: c.author?.id ?? c.authorId ?? 0,
                    likesCount: c.likesCount ?? 0,
                    isLikedByMe: c.likedByMe ?? false,
                    parentId: c.parentId || null,
                    creationDate: c.creationDate || new Date().toISOString()
                })));
            })
            .catch(err => console.error("Errore caricamento commenti:", err));
    }, [isOpen, postId]);

    // Effetto per scrollare e evidenziare il commento target
    useEffect(() => {
        if (!highlightCommentId || comments.length === 0 || !isOpen) return;

        // Espandi automaticamente il thread che contiene il commento target
        const targetComment = comments.find(c => c.id === highlightCommentId);
        if (targetComment?.parentId) {
            setExpandedReplies(prev => ({ ...prev, [targetComment.parentId!]: true }));
        }

        // Piccolo delay per lasciare tempo al DOM di renderizzare
        const timer = setTimeout(() => {
            const element = document.querySelector(`[data-comment-id="${highlightCommentId}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setHighlightedId(highlightCommentId);

                // Rimuovi l'highlight dopo l'animazione
                setTimeout(() => setHighlightedId(null), 3000);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [highlightCommentId, comments, isOpen]);

    // Funzione per aggiungere o rimuovere un like a un commento
    const handleLikeComment = (commentId: number) => {
        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');

        // Aggiornamento ottimistico della UI
        setComments(comments.map(c => {
            if (c.id === commentId) {
                const isNowLiked = !c.isLikedByMe;
                return {
                    ...c,
                    isLikedByMe: isNowLiked,
                    likesCount: isNowLiked ? (c.likesCount || 0) + 1 : Math.max(0, (c.likesCount || 0) - 1)
                };
            }
            return c;
        }));

        // Chiamata al backend per rendere il dato permanente
        apiFetch(`/api/social/commenti/${commentId}/like?utenteId=${userId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        }).catch(err => {
            console.error("Errore salvataggio like commento:", err);
            // In caso di errore, ricarichiamo i commenti dal server per ripristinare lo stato corretto
            const tokenFetch = localStorage.getItem('phytosend_token');
            const userId = localStorage.getItem('phytosend_userId');
            apiFetch(`/api/social/posts/${postId}/commenti?utenteId=${userId}`, {
                headers: { 'Authorization': `Bearer ${tokenFetch}` },
                cache: 'no-store'
            })
                .then(res => res.json())
                .then(data => {
                    setComments(data.map((c: any) => ({
                        id: c.id,
                        text: c.testo ?? c.text ?? '',
                        authorName: c.author?.name ?? 'Utente',
                        authorId: c.author?.id ?? c.authorId ?? 0,
                        likesCount: c.likesCount ?? 0,
                        isLikedByMe: c.likedByMe ?? false,
                        parentId: c.parentId || null,
                        creationDate: c.creationDate || new Date().toISOString()
                    })));
                });
        });
    };

    // Funzione per rispondere a un commento
    const handleReply = (authorName: string, parentId: number) => {
        setNewComment(`@${authorName} `);
        setReplyingTo({ authorName, parentId });
        if (onCommentsUpdated) onCommentsUpdated();
    };

    // Funzione per espandere o comprimere le risposte
    const toggleReplies = (parentId: number) => {
        setExpandedReplies(prev => ({
            ...prev,
            [parentId]: !prev[parentId]
        }));
    };

    // Gestisce l'invio del commento
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (!newComment.trim()) {
            setErrorMsg('Il commento non può essere vuoto.');
            return;
        }

        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');

        try {
            // Se stiamo rispondendo, potresti voler passare parentId al backend!
            const response = await apiFetch(
                `/api/social/posts/${postId}/commenti?utenteId=${userId}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        testo: newComment,
                        parentId: replyingTo?.parentId || null,
                        creationDate: new Date().toISOString()
                    })
                }
            );

            if (response.ok) {
                const created = await response.json();

                // Aggiungiamo il commento (o la risposta) all'interfaccia
                setComments([...comments, {
                    id: created.id || Date.now(),
                    text: newComment,
                    authorName: 'Tu',
                    authorId: Number(userId),
                    likesCount: 0,
                    isLikedByMe: false,
                    parentId: replyingTo?.parentId || null,
                    creationDate: new Date().toISOString()
                }]);

                // Se abbiamo appena risposto, espandiamo in automatico le risposte di quel genitore
                if (replyingTo?.parentId) {
                    setExpandedReplies(prev => ({ ...prev, [replyingTo.parentId]: true }));
                }

                setNewComment('');
                setReplyingTo(null);
            } else {
                setErrorMsg('Errore nell\'invio del commento.');
            }
        } catch {
            setErrorMsg('Impossibile contattare il server.');
        }
    };

    // Gestisce l'eliminazione del commento
    const confirmDeleteComment = async () => {
        if (commentToDelete === null) return;

        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');

        try {
            const response = await apiFetch(`/api/social/posts/${postId}/commenti/${commentToDelete}?utenteId=${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                // Rimuoviamo il commento (e a cascata le sue risposte visivamente)
                setComments(comments.filter(c => c.id !== commentToDelete && c.parentId !== commentToDelete));
                if (onCommentsUpdated) onCommentsUpdated();
            } else {
                alert("Errore o permessi insufficienti per eliminare il commento.");
            }
        } catch (err) {
            console.error("Errore cancellazione commento:", err);
        } finally {
            setCommentToDelete(null);
        }
    };

    if (!isOpen) return null;

    // Otteniamo l'ID dell'utente corrente
    const currentUserId = Number(localStorage.getItem('phytosend_userId'));

    // Filtriamo i commenti GENITORI (che non hanno un parentId)
    const parentComments = comments
        .filter(c => !c.parentId)
        .sort((a, b) => new Date(b.creationDate!).getTime() - new Date(a.creationDate!).getTime());

    return (
        <div className="comment-overlay" onClick={onClose}>
            <div className="comment-modal" onClick={e => e.stopPropagation()}>
                <div className="comment-modal-header">
                    <h3><MessageCircle size={18} /> Commenti</h3>
                    <button className="comment-close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="comment-list">
                    {parentComments.length === 0 ? (
                        <p className="comment-empty">Ancora nessun commento</p>
                    ) : (
                        parentComments.map(parent => {
                            const replies = comments
                                .filter(c => c.parentId === parent.id)
                                .sort((a, b) => new Date(b.creationDate!).getTime() - new Date(a.creationDate!).getTime());

                            const isExpanded = expandedReplies[parent.id];

                            const isPostAuthor = currentUserId === postAuthorId;
                            const isParentAuthor = currentUserId === parent.authorId;
                            const parentHasReplies = replies.length > 0;
                            const canDeleteParent = isPostAuthor || (isParentAuthor && !parentHasReplies);

                            console.log(`Commento di ${parent.authorName} | MioID: ${currentUserId} | AutorePost: ${postAuthorId} | AutoreCommento: ${parent.authorId}`);

                            return (
                                <div key={`parent-${parent.id}`} className="comment-thread">
                                    {/* 1. IL COMMENTO GENITORE */}
                                    <div
                                        className={`comment-item-content ${highlightedId === parent.id ? 'comment-highlight' : ''}`}
                                        data-comment-id={parent.id}
                                    >
                                        <div className="comment-header-row">
                                            <strong onClick={() => navigate(`/profile/${parent.authorId}`)} style={{ cursor: 'pointer' }}>{parent.authorName}</strong>
                                            <span className="comment-time">{getRelativeTime(parent.creationDate)}</span>

                                            {/* Il cestino ora è sulla riga del nome */}
                                            {canDeleteParent && (
                                                <button className="header-delete-btn" onClick={() => setCommentToDelete(parent.id)} title="Elimina">
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <p>{parent.text}</p>
                                        <div className="comment-mini-actions">
                                            {/* MI PIACE */}
                                            <button onClick={() => handleLikeComment(parent.id)}>
                                                <Heart size={12} fill={parent.isLikedByMe ? "var(--color-error)" : "none"} color={parent.isLikedByMe ? "var(--color-error)" : "currentColor"} />
                                                {parent.likesCount || ''}
                                            </button>
                                            {/* RISPONDI */}
                                            {!isParentAuthor && (
                                                <button onClick={() => handleReply(parent.authorName, parent.id)}>Rispondi</button>
                                            )}
                                        </div>
                                    </div>

                                    {/* 2. LE RISPOSTE */}
                                    {
                                        replies.length > 0 && (
                                            <div className="comment-replies">
                                                {!isExpanded ? (
                                                    <button className="toggle-replies-btn" onClick={() => toggleReplies(parent.id)}>
                                                        Visualizza {replies.length} rispost{replies.length === 1 ? 'a' : 'e'}
                                                    </button>
                                                ) : (
                                                    <div className="nested-replies-list">
                                                        {replies.map(reply => {
                                                            const isReplyAuthor = currentUserId === reply.authorId;
                                                            const canDeleteReply = isPostAuthor || isReplyAuthor;

                                                            return (
                                                                <div
                                                                    key={`reply-${reply.id}`}
                                                                    className={`comment-item-content ${highlightedId === reply.id ? 'comment-highlight' : ''}`}
                                                                    data-comment-id={reply.id}
                                                                >
                                                                    <div className="comment-header-row">
                                                                        <strong onClick={() => navigate(`/profile/${reply.authorId}`)} style={{ cursor: 'pointer' }}>{reply.authorName}</strong>
                                                                        <span className="comment-time">{getRelativeTime(reply.creationDate)}</span>
                                                                    </div>
                                                                    <p>{reply.text}</p>
                                                                    <div className="comment-mini-actions">
                                                                        {/* MI PIACE */}
                                                                        <button onClick={() => handleLikeComment(reply.id)}>
                                                                            <Heart size={12} fill={reply.isLikedByMe ? "var(--color-error)" : "none"} color={reply.isLikedByMe ? "var(--color-error)" : "currentColor"} />
                                                                            {reply.likesCount || ''}
                                                                        </button>
                                                                        {/* RISPONDI */}
                                                                        {!isReplyAuthor && (
                                                                            <button onClick={() => handleReply(reply.authorName, parent.id)}>Rispondi</button>
                                                                        )}

                                                                        {/* ELIMINA */}
                                                                        {canDeleteReply && (
                                                                            <button className="delete-mini-btn" onClick={() => setCommentToDelete(reply.id)}>
                                                                                Elimina
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}

                                                        {/* Mostra "Nascondi" o in generale, ma lo richiedi specificamente se sono > 3 */}
                                                        {replies.length > 3 ? (
                                                            <button className="toggle-replies-btn hide" onClick={() => toggleReplies(parent.id)}>
                                                                Nascondi risposte
                                                            </button>
                                                        ) : (
                                                            <button className="toggle-replies-btn hide" onClick={() => toggleReplies(parent.id)}>
                                                                Nascondi
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    }
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="comment-input-area">
                    {replyingTo && (
                        <div className="reply-badge">
                            <span>Rispondi a <strong>{replyingTo.authorName}</strong></span>
                            <button onClick={() => { setReplyingTo(null); setNewComment(''); }}><X size={12} /></button>
                        </div>
                    )}
                    <form className="comment-form" onSubmit={handleSubmit}>
                        <input
                            className="comment-input"
                            type="text"
                            placeholder="Scrivi un commento..."
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                        />
                        <button type="submit" className="comment-submit-btn">
                            <Send size={14} />
                        </button>
                    </form>
                </div>
                {errorMsg && <p className="comment-error"><AlertCircle size={14} /> {errorMsg}</p>}
            </div>
            {/* --- POPUP ELIMINAZIONE COMMENTO --- */}
            {
                commentToDelete !== null && (
                    <div className="comment-overlay" style={{ zIndex: 1100 }} onClick={() => setCommentToDelete(null)}>
                        <div className="delete-modal" onClick={e => e.stopPropagation()}>
                            <h3>Elimina commento</h3>
                            <p>Sei sicuro di voler eliminare questo commento?</p>
                            <div className="delete-modal-actions">
                                <button className="cancel-btn" onClick={() => setCommentToDelete(null)}>Annulla</button>
                                <button className="confirm-delete-btn" onClick={confirmDeleteComment}>Elimina</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}