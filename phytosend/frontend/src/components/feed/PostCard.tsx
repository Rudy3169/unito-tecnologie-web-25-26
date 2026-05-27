import { Heart, MessageCircle, Bookmark, Trash2, X, Loader } from 'lucide-react';
import { CommentSection } from './CommentSection';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api';
import type { PostCardLayoutProps, AuthorDto } from '../../types';
import './PostCard.css';

/**
 * COMPONENTE POST CARD
 * Componente "core" usato in Feed, Profilo, Giardino e Salvati per mostrare un singolo post.
 * Gestisce l'interattività di base (Like, Salvataggio, Cancellazione, apertura Commenti).
 * È un componente "Smart", nel senso che fa le sue fetch interne per caricare la lista di chi ha messo like.
 */
export function PostCard({
    id, title, description, urlphoto, creationDate, author, plant, likesCount = 0, isLikedByMe = false, isSavedByMe = false, commentsCount = 0, onLike, onDelete, onSave, onCommentUpdate, defaultOpenComments = false, defaultOpenLikes = false, highlightCommentId, highlightLikeUserId
}: PostCardLayoutProps) {
    const [showComments, setShowComments] = useState(defaultOpenComments || false);
    const [showLikes, setShowLikes] = useState(defaultOpenLikes || false);
    const [likesList, setLikesList] = useState<AuthorDto[]>([]);
    const [loadingLikes, setLoadingLikes] = useState(false);
    const [localCommentsCount, setLocalCommentsCount] = useState(commentsCount || 0);
    const navigate = useNavigate();

    // ==========================================
    // CONTROLLO PERMESSI (AUTHORIZATION LATO CLIENT)
    // ==========================================
    // Verifica se il post visualizzato appartiene all'utente loggato.
    const currentUserId = localStorage.getItem('phytosend_userId');

    // Sanitizzazione stringhe: toglie eventuali apici extra dal localStorage che potrebbero far fallire la comparazione.
    const cleanUserId = currentUserId ? currentUserId.replace(/['"]/g, '').trim() : null;

    // Confronto rigoroso tra numeri per abilitare la comparsa del cestino (elimina).
    // NB: L'autorizzazione vera e propria è comunque assicurata dal backend! Questo è solo per la UI.
    const isMyPost = cleanUserId != null && Number(cleanUserId) === Number(author?.id);

    // Sincronizziamo il conteggio locale se la prop cambia dall'esterno (es. refresh globale)
    useEffect(() => {
        setLocalCommentsCount(commentsCount || 0);
    }, [commentsCount]);

    // Blocco dello scroll del body quando la modale dei like è aperta
    useEffect(() => {
        if (showLikes) {
            document.body.classList.add('likes-modal-open');
        } else {
            document.body.classList.remove('likes-modal-open');
        }
        return () => {
            document.body.classList.remove('likes-modal-open');
        };
    }, [showLikes]);

    // ==========================================
    // PARSING E FORMATTAZIONE DATE
    // ==========================================
    // Funzione per formattare la data del post in formato "Tempo Relativo" UX-friendly (es. "2 ore fa").
    const getRelativeTime = (dateStr: string) => {
        if (!dateStr) return '';
        // Appende la 'Z' finale per indicare al motore JS che la stringa fornita dal server 
        // è in formato UTC assoluto, evitando sfasamenti temporali (timezones) dipendenti dal browser del client.
        const utcDateStr = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`;
        const date = new Date(utcDateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();

        // Evitiamo tempi negativi se c'è un leggero scarto di server
        if (diffMs < 0) return 'Adesso';

        const diffMin = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);

        if (diffMin < 1) return 'Adesso';
        if (diffMin < 60) return `${diffMin} min fa`;
        if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'ora' : 'ore'} fa`;
        if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'giorno' : 'giorni'} fa`;
        if (diffDays < 30) return `${diffWeeks} ${diffWeeks === 1 ? 'settimana' : 'settimane'} fa`;
        if (diffDays < 365) return `${diffMonths} ${diffMonths === 1 ? 'mese' : 'mesi'} fa`;
        return `${diffYears} ${diffYears === 1 ? 'anno' : 'anni'} fa`;
    };

    const handleOpenLikesList = async (force = false) => {
        if (!likesCount || likesCount === 0) {
            if (!force) return;
        }
        setShowLikes(true);
        if (likesList.length > 0 && !force) return; // Se già caricati e non forzato, non rifare la chiamata
        setLoadingLikes(true);
        try {
            const token = localStorage.getItem('phytosend_token');
            const response = await apiFetch(`/api/social/posts/${id}/likes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setLikesList(data);
            }
        } catch (error) {
            console.error('Errore durante il recupero dei like:', error);
        } finally {
            setLoadingLikes(false);
        }
    };

    // Effetto per aprire i like se richiesto (es. da notifiche)
    useEffect(() => {
        if (defaultOpenLikes) {
            handleOpenLikesList();
        }
    }, [defaultOpenLikes]);

    // Effetto per aggiornare la lista dei like se cambia lo stato del mio like e la modale è aperta
    useEffect(() => {
        if (showLikes) {
            handleOpenLikesList(true);
        }
    }, [isLikedByMe]);

    return (
        <article className="post-card">
            <header className="post-header">
                {/* Raggruppiamo Avatar e Info in un div per gestire lo spazio */}
                <div className="header-user-section">
                    <div className="user-avatar"
                        onClick={() => author?.id && navigate(`/profile/${author.id}`)}
                        style={{ cursor: 'pointer', overflow: 'hidden' }}>
                        {author?.profilePhotoUrl ? (
                            <img src={author.profilePhotoUrl} alt={author.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            author?.name?.charAt(0)?.toUpperCase() ?? '?'
                        )}
                    </div>
                    <div className="user-info">
                        <span className="username"
                            onClick={() => author?.id && navigate(`/profile/${author.id}`)}
                            style={{ cursor: 'pointer' }}>
                            {author?.name ?? 'Anonimo'}
                        </span>
                        <span className="location"
                            onClick={() => plant && author?.id && navigate(`/garden/${author.id}?plantId=${plant.id}`)}
                            style={{ cursor: plant ? 'pointer' : 'default' }}>
                            {plant?.name || plant?.card?.commonName || title}
                        </span>
                    </div>
                </div>

                {/* IL BOTTONE CESTINO (Spunta solo se isMyPost è true) */}
                {isMyPost && (
                    <button className="delete-post-btn" onClick={() => onDelete && onDelete(id)}>
                        <Trash2 size={18} />
                    </button>
                )}
            </header>

            <img src={urlphoto} alt={`Post di ${author.name}`} className="post-image" />

            {/* Nuovo Layout per le Icone */}
            <div className="post-actions-container">
                <div className="post-actions-left">
                    <button className="action-btn" onClick={() => onLike && onLike(id)}>
                        <Heart
                            size={24}
                            fill={isLikedByMe ? "var(--color-error)" : "none"}
                            color={isLikedByMe ? "var(--color-error)" : "currentColor"}
                        />
                    </button>
                    <button className="action-btn" onClick={() => setShowComments(true)}>
                        <MessageCircle size={24} />
                        {(localCommentsCount ?? 0) > 0 && <span className="action-count">{localCommentsCount}</span>}
                    </button>
                </div>

                {/* Segnalibro a Destra con Animazione */}
                <button className={`action-btn ${isSavedByMe ? 'saved' : ''}`} onClick={() => onSave && onSave(id)}>
                    <Bookmark size={24} fill={isSavedByMe ? "currentColor" : "none"} />
                </button>
            </div>

            <div className="post-content">
                <span className="likes" onClick={() => handleOpenLikesList()} style={{ cursor: (likesCount ?? 0) > 0 ? 'pointer' : 'default' }}>
                    {likesCount} like per Madre Natura
                </span>
                <p className="post-caption">
                    <span onClick={() => author?.id && navigate(`/profile/${author.id}`)} style={{ cursor: 'pointer' }}>
                        {author?.name ?? 'Anonimo'}
                    </span>
                    {description}
                </p>
                {creationDate && (
                    <div className="post-time">
                        {getRelativeTime(creationDate)}
                    </div>
                )}
            </div>

            <CommentSection
                postId={id}
                postAuthorId={author?.id || 0}
                isOpen={showComments}
                onClose={() => setShowComments(false)}
                onCommentsUpdated={(newCount?: number) => {
                    if (newCount !== undefined) {
                        setLocalCommentsCount(newCount);
                    }
                    onCommentUpdate();
                }}
                highlightCommentId={highlightCommentId}
            />

            {/* POP-UP LIKES LIST */}
            {showLikes && (
                <div className="likes-modal-overlay" onClick={() => setShowLikes(false)}>
                    <div className="likes-modal" onClick={e => e.stopPropagation()}>
                        <div className="likes-modal-header">
                            <h3>Piace a</h3>
                            <button className="close-likes-btn" onClick={() => setShowLikes(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="likes-modal-body">
                            {loadingLikes ? (
                                <div className="likes-loading"><Loader size={24} className="spin" /> Caricamento...</div>
                            ) : (
                                <ul className="likes-list">
                                    {likesList.map(user => (
                                        <li 
                                            key={user.id} 
                                            className={`like-user-item ${highlightLikeUserId === user.id ? 'highlight-like' : ''}`} 
                                            onClick={() => navigate(`/profile/${user.id}`)}
                                        >
                                            <div className="like-user-avatar" style={{ overflow: 'hidden' }}>
                                                {user.profilePhotoUrl ? (
                                                    <img src={user.profilePhotoUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    user.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <span className="like-user-name">{user.name} {user.surname}</span>
                                            
                                            {/* Cuore fisso a destra per tutti */}
                                            <Heart 
                                                size={14} 
                                                fill="var(--color-error)" 
                                                color="var(--color-error)" 
                                                className={`like-item-heart ${highlightLikeUserId === user.id ? 'like-indicator-anim' : ''}`} 
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </article>
    );
}