import { PostCard } from './PostCard';
import type { PostProps } from '../../types';
interface PostListProps {
    posts: PostProps[]; // Array di post da visualizzare
    onToggleLike: (id: number) => void; // Funzione per fare like
    onDeletePost: (id: number) => void; // Funzione per eliminare post
    onCommentUpdate: () => void; // Funzione per aggiornare commenti
    onToggleSave?: (id: number) => void; // Funzione per salvare post
    defaultOpenLikes?: boolean; // Indica se aprire i like di default
    highlightLikeUserId?: number; // ID utente da evidenziare
    lastPostRef?: (node: HTMLDivElement | null) => void; // Ref per l'ultimo post
}

/**
 * COMPONENTE POST LIST
 * Non contiene logica di business o chiamate API.
 * Si limita a ciclare un array di dati (PostProps) fornito dal padre e a mapparli in componenti PostCard.
 * Sfrutta il pattern 'ref' (lastPostRef) per l'implementazione dell'Infinite Scroll 
 * tramite l'IntersectionObserver nel componente genitore.
 */
export function PostList({ posts, onToggleLike, onDeletePost, onCommentUpdate, onToggleSave, defaultOpenLikes, highlightLikeUserId, lastPostRef }: PostListProps) {
    if (posts.length === 0) {
        return <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Nessun post da mostrare. <br />Inizia tu piantando un seme!</p>;
    }

    return (
        <div className="post-list">
            {posts.map((post, index) => {
                const isLastElement = index === posts.length - 1;
                return (
                    <div key={post.id} ref={isLastElement ? lastPostRef : null}>
                        <PostCard
                            id={post.id}
                            title={post.title}
                            description={post.description}
                            urlphoto={post.urlphoto}
                            creationDate={post.creationDate}
                            author={post.author}
                            plant={post.plant}
                            likesCount={post.likesCount}
                            isLikedByMe={post.isLikedByMe}
                            isSavedByMe={post.isSavedByMe}
                            commentsCount={post.commentsCount}
                            onLike={onToggleLike}
                            onDelete={onDeletePost}
                            onSave={onToggleSave}
                            onCommentUpdate={onCommentUpdate}
                            defaultOpenLikes={defaultOpenLikes}
                            highlightLikeUserId={highlightLikeUserId}
                        />
                    </div>
                );
            })}
        </div>
    );
}