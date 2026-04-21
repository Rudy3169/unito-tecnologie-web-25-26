import { Heart, MessageCircle, Bookmark, Trash2 } from 'lucide-react';
import { CommentSection } from './CommentSection';
import { useState } from 'react';
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
    likesCount?: number;
    isLikedByMe?: boolean;
    commentsCount?: number;
    onCommentUpdate: () => void;
}

interface PostCardLayoutProps extends PostProps {
    onLike?: (id: number) => void;
    onDelete?: (id: number) => void;
    onCommentUpdate: () => void;
}

export function PostCard({
    id, title, description, urlphoto, author, likesCount, isLikedByMe, commentsCount, onLike, onDelete, onCommentUpdate
}: PostCardLayoutProps) {
    const [showComments, setShowComments] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // 2. Controllo di sicurezza Frontend: Questo post è mio?
    const currentUserId = localStorage.getItem('phytosend_userId');

    // Pulizia brutale: toglie spazi e soprattutto le virgolette " o ' invisibili!
    const cleanUserId = currentUserId ? currentUserId.replace(/['"]/g, '').trim() : null;

    // Ora facciamo un confronto tra numeri puri e perfetti
    const isMyPost = cleanUserId != null && Number(cleanUserId) === Number(author?.id);

    return (
        <article className="post-card">
            <header className="post-header">
                {/* Raggruppiamo Avatar e Info in un div per gestire lo spazio */}
                <div className="header-user-section">
                    <div className="user-avatar">{author?.name?.charAt(0)?.toUpperCase() ?? '?'}</div>
                    <div className="user-info">
                        <span className="username">{author?.name ?? 'Anonimo'}</span>
                        <span className="location">{title}</span>
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
                <button className={`action-btn ${isSaved ? 'saved' : ''}`} onClick={() => setIsSaved(!isSaved)}>
                    <Bookmark size={24} fill={isSaved ? "currentColor" : "none"} />
                </button>
            </div>

            <div className="post-content">
                <span className="likes">{likesCount} like per Madre Natura</span>
                <p className="post-caption">
                    <span>{author?.name ?? 'Anonimo'}</span>
                    {description}
                </p>
            </div>

            <CommentSection
                postId={id}
                postAuthorId={author?.id || 0}
                isOpen={showComments}
                onClose={() => setShowComments(false)}
                onCommentsUpdated={onCommentUpdate}
            />
        </article>
    );
}