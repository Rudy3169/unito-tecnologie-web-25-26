import { useState, type FormEvent, useEffect } from 'react';
import { MessageCircle, X, Send, AlertCircle, Heart, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api';
import './CommentSection.css';

interface Comment {
    id: number; // ID del commento
    text: string; // Testo del commento
    authorName: string; // Nome dell'autore del commento
    authorId: number; // ID dell'autore del commento
    likesCount?: number; // Numero di like al commento
    isLikedByMe?: boolean; // Flag per indicare se l'utente ha messo like al commento
    parentId?: number | null; // ID del commento genitore (per risposte nidificate)
    creationDate?: string; // Data di creazione del commento
    profilePhotoUrl?: string | null; // URL della foto profilo dell'autore del commento
}

interface CommentSectionProps {
    postId: number; // ID del post
    postAuthorId: number; // ID dell'autore del post
    isOpen: boolean; // Flag per indicare se la modale dei commenti è aperta
    onClose: () => void; // Funzione per chiudere la modale dei commenti
    onCommentsUpdated?: (newCount?: number) => void; // Funzione per aggiornare il conteggio dei commenti
    highlightCommentId?: number; // ID del commento da evidenziare
}

/**
 * COMPONENTE COMMENT SECTION
 * Gestisce l'intera iterazione sui commenti di un post (inserimento, visualizzazione, like, cancellazione).
 * Supporta una struttura dati ad albero (Thread nidificati tramite parentId) 
 * e il parsing del testo per generare dinamicamente le Menzioni (@Nome).
 */
export function CommentSection({ postId, postAuthorId, isOpen, onClose, onCommentsUpdated, highlightCommentId }: CommentSectionProps) {
    // ==========================================
    // 1. useState
    // ==========================================

    const [comments, setComments] = useState<Comment[]>([]); // Array di commenti
    const [newComment, setNewComment] = useState(''); // Testo del nuovo commento
    const [errorMsg, setErrorMsg] = useState(''); // Messaggio di errore
    const navigate = useNavigate(); // Funzione di navigazione
    const [highlightedId, setHighlightedId] = useState<number | null>(null); // ID del commento da evidenziare

    // Stato per tracciare a CHI stiamo rispondendo e sotto quale COMMENTO GENITORE
    const [replyingTo, setReplyingTo] = useState<{ authorName: string, parentId: number } | null>(null);

    // Stato per tracciare quali risposte sono "espanse/visibili"
    const [expandedReplies, setExpandedReplies] = useState<Record<number, boolean>>({});

    // Stato per tracciare quale commento stiamo eliminando
    const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

    // Stato per tutti gli utenti per risolvere le menzioni (@Nome)
    const [allUsers, setAllUsers] = useState<any[]>([]);

    // ==========================================
    // 2. useEffect
    // ==========================================

    // Blocco dello scroll del body quando la modale dei commenti è aperta
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('comments-modal-open');
        } else {
            document.body.classList.remove('comments-modal-open');
        }
        return () => {
            document.body.classList.remove('comments-modal-open');
        };
    }, [isOpen]);

    // Carica tutti gli utenti dal backend per risolvere le menzioni
    useEffect(() => {
        if (!isOpen) return;
        const token = localStorage.getItem('phytosend_token');
        apiFetch('/api/utenti', { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    setAllUsers(data.content ?? []);
                }
            })
            .catch(err => console.error("Errore caricamento utenti:", err));
    }, [isOpen]);

    // Usa useEffect per gestire l'apertura/chiusura del popup
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
                    creationDate: c.creationDate || new Date().toISOString(),
                    profilePhotoUrl: c.author?.profilePhotoUrl ?? null
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

    // ==========================================
    // 3. FUNZIONI HANDLER E UTILITY
    // ==========================================

    // PARSING TESTO (REGEX) PER MENZIONI DINAMICHE
    // Questa funzione analizza il testo del commento per cercare pattern come "@Mario".
    // Se la regex trova un match, e quel match corrisponde a un utente reale,
    // sostituisce il testo con uno <span> cliccabile che porta al profilo.
    const renderCommentText = (text: string) => {
        if (!text) return '';
        const mentionRegex = /@([A-Za-zÀ-ÖØ-öø-ÿ0-9._-]+)/g; // Regex per trovare le menzioni (@Nome)
        const parts = []; // Array di parti del testo
        let lastIndex = 0; // Indice dell'ultima parte del testo
        let match; // Match trovato dalla regex

        // Cicla su tutte le menzioni trovate nel testo
        while ((match = mentionRegex.exec(text)) !== null) {
            const matchIndex = match.index; // Indice della menzione
            const fullMatch = match[0]; // Match completo (es. "@Mario")
            const name = match[1]; // Nome utente estratto (es. "Mario")

            // Aggiunge la parte di testo prima della menzione
            if (matchIndex > lastIndex) {
                parts.push(text.substring(lastIndex, matchIndex));
            }

            // Cerca l'utente corrispondente alla menzione
            const matchedUser = allUsers.find(
                u => u.name.toLowerCase() === name.toLowerCase()
            );

            // Se l'utente viene trovato, crea uno span cliccabile che naviga al suo profilo
            if (matchedUser) {
                parts.push(
                    <span
                        key={matchIndex}
                        onClick={() => {
                            onClose();
                            navigate(`/profile/${matchedUser.id}`);
                        }}
                        style={{
                            color: 'var(--color-primary)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textDecoration: 'none'
                        }}
                        onMouseEnter={(e) => {
                            (e.target as HTMLElement).style.color = 'var(--color-primary-light)';
                        }}
                        onMouseLeave={(e) => {
                            (e.target as HTMLElement).style.color = 'var(--color-primary)';
                        }}
                    >
                        {fullMatch}
                    </span>
                );
            } else {
                parts.push(fullMatch); // Se l'utente non viene trovato, aggiunge il testo normale
            }

            lastIndex = mentionRegex.lastIndex; // Aggiorna l'indice dell'ultima parte del testo
        }

        // Aggiunge la parte finale del testo se presente
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }

        // Ritorna le parti del testo o il testo normale se non ci sono menzioni
        return parts.length > 0 ? parts : text;
    };

    // Funzione per calcolare il tempo relativo
    const getRelativeTime = (dateString?: string) => {
        if (!dateString) return 'Ora';

        // Crea una data corrente e una data passata dal commento
        const now = new Date();
        const past = new Date(dateString);
        // Calcola la differenza in secondi
        const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

        if (diffInSeconds < 60) return `${Math.max(0, diffInSeconds)} sec fa`; // Meno di un minuto

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} min fa`; // Minuti

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} h fa`; // Ore

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} giorn${diffInDays === 1 ? 'o' : 'i'} fa`; // Giorni

        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) return `${diffInWeeks} sett fa`; // Settimane

        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) return `${diffInMonths} mes${diffInMonths === 1 ? 'e' : 'i'} fa`; // Mesi

        const diffInYears = Math.floor(diffInDays / 365);
        return `${diffInYears} ann${diffInYears === 1 ? 'o' : 'i'} fa`; // Anni
    };

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
                        creationDate: c.creationDate || new Date().toISOString(),
                        profilePhotoUrl: c.author?.profilePhotoUrl ?? null
                    })));
                });
        });
    };

    // Funzione per rispondere a un commento
    const handleReply = (authorName: string, parentId: number, isNestedReply: boolean) => {
        if (isNestedReply) {
            setNewComment(`@${authorName} `);
        } else {
            setNewComment('');
        }
        setReplyingTo({ authorName, parentId });
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

                const currentUserPhoto = allUsers.find(u => u.id === Number(userId))?.profilePhotoUrl ?? null;

                // Aggiungiamo il commento (o la risposta) all'interfaccia
                setComments([...comments, {
                    id: created.id || Date.now(),
                    text: newComment,
                    authorName: 'Tu',
                    authorId: Number(userId),
                    likesCount: 0,
                    isLikedByMe: false,
                    parentId: replyingTo?.parentId || null,
                    creationDate: new Date().toISOString(),
                    profilePhotoUrl: currentUserPhoto
                }]);

                // Se abbiamo appena risposto, espandiamo in automatico le risposte di quel genitore
                if (replyingTo?.parentId) {
                    setExpandedReplies(prev => ({ ...prev, [replyingTo.parentId]: true }));
                }

                setNewComment('');
                setReplyingTo(null);
                if (onCommentsUpdated) onCommentsUpdated(comments.length + 1);
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
                const remainingComments = comments.filter(c => c.id !== commentToDelete && c.parentId !== commentToDelete);
                setComments(remainingComments);
                if (onCommentsUpdated) onCommentsUpdated(remainingComments.length);
            } else {
                alert("Errore o permessi insufficienti per eliminare il commento.");
            }
        } catch (err) {
            console.error("Errore cancellazione commento:", err);
        } finally {
            setCommentToDelete(null);
        }
    };

    // ==========================================
    // 4. EARLY RETURN E PREPARAZIONE RENDER
    // ==========================================

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
                                        <div className="comment-header-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div
                                                className="comment-avatar"
                                                onClick={() => navigate(`/profile/${parent.authorId}`)}
                                                style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.72rem',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    overflow: 'hidden',
                                                    flexShrink: 0
                                                }}
                                            >
                                                {parent.profilePhotoUrl ? (
                                                    <img src={parent.profilePhotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    parent.authorName.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <strong onClick={() => navigate(`/profile/${parent.authorId}`)} style={{ cursor: 'pointer' }}>{parent.authorName}</strong>
                                            <span className="comment-time">{getRelativeTime(parent.creationDate)}</span>

                                            {/* Il cestino ora è sulla riga del nome */}
                                            {canDeleteParent && (
                                                <button className="header-delete-btn" onClick={() => setCommentToDelete(parent.id)} title="Elimina">
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <p>{renderCommentText(parent.text)}</p>
                                        <div className="comment-mini-actions">
                                            {/* MI PIACE */}
                                            <button onClick={() => handleLikeComment(parent.id)}>
                                                <Heart size={12} fill={parent.isLikedByMe ? "var(--color-error)" : "none"} color={parent.isLikedByMe ? "var(--color-error)" : "currentColor"} />
                                                {parent.likesCount || ''}
                                            </button>
                                            {/* RISPONDI */}
                                            {!isParentAuthor && (
                                                <button onClick={() => handleReply(parent.authorName, parent.id, false)}>Rispondi</button>
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
                                                                    <div className="comment-header-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <div
                                                                            className="comment-avatar"
                                                                            onClick={() => navigate(`/profile/${reply.authorId}`)}
                                                                            style={{
                                                                                width: '20px',
                                                                                height: '20px',
                                                                                borderRadius: '50%',
                                                                                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                                                                                color: 'white',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                fontSize: '0.64rem',
                                                                                fontWeight: 'bold',
                                                                                cursor: 'pointer',
                                                                                overflow: 'hidden',
                                                                                flexShrink: 0
                                                                            }}
                                                                        >
                                                                            {reply.profilePhotoUrl ? (
                                                                                <img src={reply.profilePhotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                            ) : (
                                                                                reply.authorName.charAt(0).toUpperCase()
                                                                            )}
                                                                        </div>
                                                                        <strong onClick={() => navigate(`/profile/${reply.authorId}`)} style={{ cursor: 'pointer' }}>{reply.authorName}</strong>
                                                                        <span className="comment-time">{getRelativeTime(reply.creationDate)}</span>
                                                                    </div>
                                                                    <p>{renderCommentText(reply.text)}</p>
                                                                    <div className="comment-mini-actions">
                                                                        {/* MI PIACE */}
                                                                        <button onClick={() => handleLikeComment(reply.id)}>
                                                                            <Heart size={12} fill={reply.isLikedByMe ? "var(--color-error)" : "none"} color={reply.isLikedByMe ? "var(--color-error)" : "currentColor"} />
                                                                            {reply.likesCount || ''}
                                                                        </button>
                                                                        {/* RISPONDI */}
                                                                        {!isReplyAuthor && (
                                                                            <button onClick={() => handleReply(reply.authorName, parent.id, true)}>Rispondi</button>
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