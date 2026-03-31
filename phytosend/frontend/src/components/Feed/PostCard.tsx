import { Heart, MessageCircle, Share2 } from 'lucide-react';
import './PostCard.css';

export interface PostProps {
    id: number;
    username: string;
    location: string;
    imageUrl: string;
    caption: string;
    likesCount: number;
    // Nuovo stato: ho messo like io?
    isLikedByMe?: boolean;
}

// Aggiungiamo anche la funzione onClick alle prop!
interface PostCardLayoutProps extends PostProps {
    onLike?: (id: number) => void;
}

export function PostCard({
    id, username, location, imageUrl, caption, likesCount, isLikedByMe, onLike
}: PostCardLayoutProps) {

    return (
        <article className="post-card">
            <header className="post-header">
                <div className="user-avatar">{username.charAt(0).toUpperCase()}</div>
                <div className="user-info">
                    <span className="username">{username}</span>
                    <span className="location">{location}</span>
                </div>
            </header>

            <img src={imageUrl} alt={`Post di ${username}`} className="post-image" />

            <div className="post-actions">
                {/* IL PULSANTE CUORE ORA È CICCABILE */}
                <button className="action-btn" onClick={() => onLike && onLike(id)}>
                    {/* Se c'è il like, si colora di Error (Rosso) ed è riempito, altrimenti vuoto standard */}
                    <Heart
                        size={24}
                        fill={isLikedByMe ? "var(--color-error)" : "none"}
                        color={isLikedByMe ? "var(--color-error)" : "currentColor"}
                    />
                </button>
                <button className="action-btn"><MessageCircle size={24} /></button>
                <button className="action-btn"><Share2 size={24} /></button>
            </div>

            <div className="post-content">
                <span className="likes">{likesCount} like per madre natura</span>
                <p className="post-caption">
                    <span>{username}</span>
                    {caption}
                </p>
            </div>
        </article>
    );
}
