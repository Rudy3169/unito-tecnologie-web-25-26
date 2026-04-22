import { PostCard, type PostProps } from './PostCard';

interface PostListProps {
    posts: PostProps[];
    onToggleLike: (id: number) => void;
    onDeletePost: (id: number) => void;
    onCommentUpdate: () => void;
}

export function PostList({ posts, onToggleLike, onDeletePost, onCommentUpdate }: PostListProps) {
    if (posts.length === 0) {
        return <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Nessun post da mostrare. <br />Inizia tu piantando un seme!</p>;
    }

    return (
        <div className="post-list">
            {posts.map(post => (
                <PostCard
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    description={post.description}
                    urlphoto={post.urlphoto}
                    creationDate={post.creationDate}
                    author={post.author}
                    likesCount={post.likesCount}
                    isLikedByMe={post.isLikedByMe}
                    commentsCount={post.commentsCount}
                    onLike={onToggleLike}
                    onDelete={onDeletePost}
                    onCommentUpdate={onCommentUpdate}
                />
            ))}
        </div>
    );
}