import { Heart, MessageCircle, Share2 } from 'lucide-react';
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
}


interface PostCardLayoutProps extends PostProps {
    onLike?: (id: number) => void;
}

export function PostCard({
    id, title, description, urlphoto, author, likesCount, isLikedByMe, onLike
}: PostCardLayoutProps) {
    const [showComments, setShowComments] = useState(false);

    return (
        <article className="post-card">
            <header className="post-header">
                <div className="user-avatar">{author?.name?.charAt(0)?.toUpperCase() ?? '?'}</div>                <div className="user-info">
                    <span className="username">{author?.name ?? 'Anonimo'}</span>
                    <span className="location">{title}</span>
                </div>
            </header>

            <img src={urlphoto} alt={`Post di ${author.name}`} className="post-image" />

            <div className="post-actions">
                <button className="action-btn" onClick={() => onLike && onLike(id)}>
                    <Heart
                        size={24}
                        fill={isLikedByMe ? "var(--color-error)" : "none"}
                        color={isLikedByMe ? "var(--color-error)" : "currentColor"}
                    />
                </button>
                <button className="action-btn" onClick={() => setShowComments(true)}>
                    <MessageCircle size={24} />
                </button>
                <button className="action-btn"><Share2 size={24} /></button>
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
                isOpen={showComments}
                onClose={() => setShowComments(false)}
            />        </article>
    );
}
