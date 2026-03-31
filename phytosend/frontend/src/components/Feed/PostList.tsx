import { PostCard, type PostProps } from './PostCard';

interface PostListProps {
    posts: PostProps[];
    // Nuova prop ponte!
    onToggleLike: (id: number) => void;
}

export function PostList({ posts, onToggleLike }: PostListProps) {
    if (posts.length === 0) {
        return <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Nessun post da mostrare. Pianta un seme!</p>;
    }

    return (
        <div className="post-list">
            {posts.map(post => (
                <PostCard
                    key={post.id}
                    id={post.id}
                    username={post.username}
                    location={post.location}
                    imageUrl={post.imageUrl}
                    caption={post.caption}
                    likesCount={post.likesCount}
                    isLikedByMe={post.isLikedByMe}
                    onLike={onToggleLike} /* Lo passiamo al componente finale */
                />
            ))}
        </div>
    );
}
