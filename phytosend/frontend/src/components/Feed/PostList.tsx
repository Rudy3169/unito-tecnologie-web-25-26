import { PostCard, type PostProps } from './PostCard';

interface PostListProps {
    posts: PostProps[];
    onToggleLike: (id: number) => void;
    onDeletePost: (id: number) => void;
    onCommentUpdate: () => void;
    onToggleSave?: (id: number) => void;
    defaultOpenLikes?: boolean;
    highlightLikeUserId?: number;
    lastPostRef?: (node: HTMLDivElement | null) => void;
}

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