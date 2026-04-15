import { useState, useEffect } from 'react';
import { PenLine } from 'lucide-react';
import { PostList } from './PostList';
import { CreatePostForm } from './CreatePostForm';
import type { PostProps } from './PostCard';

export function HomeFeed() {
    const [posts, setPosts] = useState<PostProps[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const caricaPosts = () => {
        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');
        const url = userId
            ? `/api/social/posts?utenteId=${userId}`
            : '/api/social/posts';

        fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error(`Errore server: ${res.status}`);
                return res.json();
            })
            .then(data => setPosts(data.content ?? []))
            .catch(err => console.error("Errore:", err));
    };

    useEffect(() => {
        caricaPosts();
    }, []);

    const handleAddPost = () => {
        caricaPosts();
    };

    const handleToggleLike = (postId: number) => {
        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');

        setPosts(posts.map(post => {
            if (post.id === postId) {
                const isOraLiked = !post.isLikedByMe;
                return {
                    ...post,
                    isLikedByMe: isOraLiked,
                    likesCount: isOraLiked ? (post.likesCount ?? 0) + 1 : (post.likesCount ?? 0) - 1
                };
            }
            return post;
        }));

        fetch(`/api/social/posts/${postId}/like?utenteId=${userId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        }).catch(err => {
            console.error("Errore like:", err);
            caricaPosts();
        });
    };


    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {/* Trigger */}
            <div className="new-post-trigger" onClick={() => setShowCreateForm(true)}>
                <div className="new-post-avatar"><PenLine size={20} /></div>
                <span>Cosa stai coltivando oggi?</span>
            </div>

            {/* Modal */}
            <CreatePostForm
                isOpen={showCreateForm}
                onClose={() => setShowCreateForm(false)}
                onPostCreated={handleAddPost}
            />

            {/* Lista post — NON VA RIMOSSA */}
            <PostList posts={posts} onToggleLike={handleToggleLike} />
        </div>
    );
}

