import { useState, type FormEvent, useEffect } from 'react';
import { MessageCircle, X, Send, AlertCircle, Heart } from 'lucide-react';
import './CommentSection.css';

interface Comment {
    id: number;
    text: string;
    authorName: string;
    likesCount?: number;
    isLikedByMe?: boolean;
    parentId?: number | null;
    creationDate?: string;
}

interface CommentSectionProps {
    postId: number;
    isOpen: boolean;
    onClose: () => void;
}

export function CommentSection({ postId, isOpen, onClose }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Stato per tracciare a CHI stiamo rispondendo e sotto quale COMMENTO GENITORE
    const [replyingTo, setReplyingTo] = useState<{ authorName: string, parentId: number } | null>(null);

    // Stato per tracciare quali risposte sono "espanse/visibili"
    const [expandedReplies, setExpandedReplies] = useState<Record<number, boolean>>({});

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
        fetch(`/api/social/posts/${postId}/commenti`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                setComments(data.map((c: any) => ({
                    id: c.id,
                    text: c.testo ?? c.text ?? '',
                    authorName: c.author?.name ?? 'Utente',
                    likesCount: 0,
                    isLikedByMe: false,
                    parentId: c.parentId || null,
                    creationDate: c.creationDate || new Date().toISOString()
                })));
            })
            .catch(err => console.error("Errore caricamento commenti:", err));
    }, [isOpen, postId]);

    const handleLikeComment = (commentId: number) => {
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
    };

    const handleReply = (authorName: string, parentId: number) => {
        setReplyingTo({ authorName, parentId });
        setNewComment(`@${authorName} `);
    };

    const toggleReplies = (parentId: number) => {
        setExpandedReplies(prev => ({
            ...prev,
            [parentId]: !prev[parentId]
        }));
    };

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
            const response = await fetch(
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
                    likesCount: 0,
                    isLikedByMe: false,
                    parentId: replyingTo?.parentId || null
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

    if (!isOpen) return null;

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
                        <p className="comment-empty">Nessun commento ancora. Sii il primo!</p>
                    ) : (
                        parentComments.map(parent => {
                            // Filtriamo le risposte e le ordiniamo per data di creazione
                            const replies = comments
                                .filter(c => c.parentId === parent.id)
                                .sort((a, b) => new Date(b.creationDate!).getTime() - new Date(a.creationDate!).getTime());

                            const isExpanded = expandedReplies[parent.id];

                            return (
                                <div key={parent.id} className="comment-thread">
                                    {/* 1. IL COMMENTO GENITORE */}
                                    <div className="comment-item-content">
                                        <div className="comment-header-row">
                                            <strong>{parent.authorName}</strong>
                                            <span className="comment-time">{getRelativeTime(parent.creationDate)}</span>
                                        </div>
                                        <p>{parent.text}</p>
                                        <div className="comment-mini-actions">
                                            <button onClick={() => handleLikeComment(parent.id)}>
                                                <Heart size={12} fill={parent.isLikedByMe ? "var(--color-error)" : "none"} color={parent.isLikedByMe ? "var(--color-error)" : "currentColor"} />
                                                {parent.likesCount || ''}
                                            </button>
                                            <button onClick={() => handleReply(parent.authorName, parent.id)}>Rispondi</button>
                                        </div>
                                    </div>

                                    {/* 2. LE RISPOSTE (Se ci sono) */}
                                    {
                                        replies.length > 0 && (
                                            <div className="comment-replies">
                                                {!isExpanded ? (
                                                    <button className="toggle-replies-btn" onClick={() => toggleReplies(parent.id)}>
                                                        Visualizza {replies.length} rispost{replies.length === 1 ? 'a' : 'e'}
                                                    </button>
                                                ) : (
                                                    <div className="nested-replies-list">
                                                        {replies.map(reply => (
                                                            <div key={reply.id} className="comment-item nested">
                                                                <div className="comment-item-avatar small">{reply.authorName.charAt(0)}</div>
                                                                <div className="comment-item-content">
                                                                    <div className="comment-header-row">
                                                                        <strong>{reply.authorName}</strong>
                                                                        <span className="comment-time">{getRelativeTime(reply.creationDate)}</span>
                                                                    </div>
                                                                    <p>{reply.text}</p>
                                                                    <div className="comment-mini-actions">
                                                                        <button onClick={() => handleLikeComment(reply.id)}>
                                                                            <Heart size={12} fill={reply.isLikedByMe ? "var(--color-error)" : "none"} color={reply.isLikedByMe ? "var(--color-error)" : "currentColor"} />
                                                                            {reply.likesCount || ''}
                                                                        </button>
                                                                        {/* Quando si risponde a una risposta, il parentId rimane quello del genitore principale */}
                                                                        <button onClick={() => handleReply(reply.authorName, parent.id)}>Rispondi</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}

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
                            Rispondi a <strong>{replyingTo.authorName}</strong>
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
        </div >
    );
}