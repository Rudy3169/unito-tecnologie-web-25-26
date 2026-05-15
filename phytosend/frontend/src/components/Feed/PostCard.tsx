import { Heart, MessageCircle, Bookmark, Trash2, X, Loader, User } from 'lucide-react';
import { CommentSection } from './CommentSection';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/apiFetch';
import './PostCard.css';

export interface AuthorDto {
    id: number;
    name: string;
    surname: string;
    email: string;
    role: string;
}

export interface PostProps {
    id: number;
    title: string;
    description: string;
    urlphoto: string;
    creationDate: string;
    author: AuthorDto;
    plant?: {
        id: number;
        name?: string;
        card?: {
            id: number;
            commonName: string;
        }
    };
    likesCount?: number;
    isLikedByMe?: boolean;
    isSavedByMe?: boolean;
    commentsCount?: number;
    onCommentUpdate: () => void;
}

interface PostCardLayoutProps extends PostProps {
    onLike?: (id: number) => void;
    onDelete?: (id: number) => void;
    onSave?: (id: number) => void;
    onCommentUpdate: () => void;
    defaultOpenComments?: boolean;
    highlightCommentId?: number;
}

export function PostCard({
    id, title, description, urlphoto, creationDate, author, plant, likesCount, isLikedByMe, isSavedByMe, commentsCount, onLike, onDelete, onSave, onCommentUpdate, defaultOpenComments, highlightCommentId
}: PostCardLayoutProps) {
    const [showComments, setShowComments] = useState(defaultOpenComments || false);
    const [showLikes, setShowLikes] = useState(false);
    const [likesList, setLikesList] = useState<AuthorDto[]>([]);
    const [loadingLikes, setLoadingLikes] = useState(false);
    const navigate = useNavigate();

    // Controllo di sicurezza Frontend: Questo post è mio?
    const currentUserId = localStorage.getItem('phytosend_userId');

    // Pulizia brutale: toglie spazi e soprattutto le virgolette " o ' invisibili!
    const cleanUserId = currentUserId ? currentUserId.replace(/['"]/g, '').trim() : null;

    // Ora facciamo un confronto tra numeri puri e perfetti
    const isMyPost = cleanUserId != null && Number(cleanUserId) === Number(author?.id);

    // Funzione per formattare la data in tempo relativo ("2 ore fa", "1 mese fa", ecc.)
    const getRelativeTime = (dateStr: string) => {
        if (!dateStr) return '';
        // Assicuriamoci che venga letta come UTC per evitare sfasamenti
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
        if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'settimana' : 'settimane'} fa`;
        if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'mese' : 'mesi'} fa`;
        return `${diffYears} ${diffYears === 1 ? 'anno' : 'anni'} fa`;
    };

    const handleOpenLikesList = async () => {
        if (!likesCount || likesCount === 0) return;
        setShowLikes(true);
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

    return (
        <article className="post-card">
            <header className="post-header">
                {/* Raggruppiamo Avatar e Info in un div per gestire lo spazio */}
                <div className="header-user-section">
                    <div className="user-avatar"
                        onClick={() => author?.id && navigate(`/profile/${author.id}`)}
                        style={{ cursor: 'pointer' }}>
                        {author?.name?.charAt(0)?.toUpperCase() ?? '?'}
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
                        {(commentsCount ?? 0) > 0 && <span className="action-count">{commentsCount}</span>}
                    </button>
                </div>

                {/* Segnalibro a Destra con Animazione */}
                <button className={`action-btn ${isSavedByMe ? 'saved' : ''}`} onClick={() => onSave && onSave(id)}>
                    <Bookmark size={24} fill={isSavedByMe ? "currentColor" : "none"} />
                </button>
            </div>

            <div className="post-content">
                <span className="likes" onClick={handleOpenLikesList} style={{ cursor: (likesCount ?? 0) > 0 ? 'pointer' : 'default' }}>
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
                onCommentsUpdated={onCommentUpdate}
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
                                        <li key={user.id} className="like-user-item" onClick={() => navigate(`/profile/${user.id}`)}>
                                            <div className="like-user-avatar">
                                                <User size={20} />
                                            </div>
                                            <span className="like-user-name">{user.name} {user.surname}</span>
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