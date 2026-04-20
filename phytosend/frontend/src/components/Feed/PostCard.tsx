import { Heart, MessageCircle, Bookmark } from 'lucide-react'; // Aggiunto Bookmark, rimosso Share2
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
    commentsCount?: number; // Aggiunto conteggio commenti
}

interface PostCardLayoutProps extends PostProps {
    onLike?: (id: number) => void;
}

export function PostCard({
    id, title, description, urlphoto, author, likesCount, isLikedByMe, commentsCount, onLike
}: PostCardLayoutProps) {
    const [showComments, setShowComments] = useState(false);
    const [isSaved, setIsSaved] = useState(false); // Stato per il salvataggio

    return (
        <article className="post-card">
            <header className="post-header">
                <div className="user-avatar">{author?.name?.charAt(0)?.toUpperCase() ?? '?'}</div>
                <div className="user-info">
                    <span className="username">{author?.name ?? 'Anonimo'}</span>
                    <span className="location">{title}</span>
                </div>
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
                {/* Mostra i commenti solo se sono maggiori di 0 */}
                {(commentsCount ?? 0) > 0 && (
                    <button className="view-comments-btn" onClick={() => setShowComments(true)}>
                        Vedi tutti e {commentsCount} i commenti
                    </button>
                )}
            </div>

            <CommentSection
                postId={id}
                isOpen={showComments}
                onClose={() => setShowComments(false)}
            />
        </article>
    );
}