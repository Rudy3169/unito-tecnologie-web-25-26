import { useState, useEffect } from 'react';
import { PenLine, AlertTriangle } from 'lucide-react';
import { PostList } from './PostList';
import { CreatePostForm } from './CreatePostForm';
import type { PostProps } from './PostCard';
import './HomeFeed.css';

export function HomeFeed() {

    // Funzione per caricare i post
    const [posts, setPosts] = useState<PostProps[]>([]);

    // Funzione per aggiungere un post
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Funzione per eliminare un post
    const [postToDelete, setPostToDelete] = useState<number | null>(null);

    // Funzione per caricare i post
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
                if (res.status === 401 || res.status === 403) {
                    localStorage.clear();
                    window.location.href = '/';
                    return;
                }
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

    // Funzione per mettere like a un post
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

    // Funzione per eliminare un post
    const handleDeleteClick = (postId: number) => {
        setPostToDelete(postId);
    };

    // Funzione per confermare l'eliminazione di un post
    const confirmDelete = async () => {
        if (postToDelete === null) return;

        const postId = postToDelete;
        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');

        try {
            const response = await fetch(`/api/social/posts/${postId}?utenteId=${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setPosts(posts.filter(post => post.id !== postId));
            } else {
                alert("Errore: Impossibile eliminare il post.");
            }
        } catch (err) {
            console.error("Errore cancellazione:", err);
        } finally {
            // Qualsiasi cosa succeda (successo o errore), chiudiamo il pop-up
            setPostToDelete(null);
        }
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

            {/* Lista post */}
            <PostList
                posts={posts}
                onToggleLike={handleToggleLike}
                onDeletePost={handleDeleteClick}
                onCommentUpdate={caricaPosts}
            />

            {/* POP-UP DI CONFERMA ELIMINAZIONE */}
            {postToDelete !== null && (
                <div className="comment-overlay" onClick={() => setPostToDelete(null)}>
                    <div className="delete-modal" onClick={e => e.stopPropagation()}>
                        <h3><AlertTriangle color="var(--color-error)" size={24} /> Elimina Post</h3>
                        <p>Sei sicuro di voler eliminare definitivamente questo post?</p>

                        <div className="delete-modal-actions">
                            <button className="cancel-btn" onClick={() => setPostToDelete(null)}>
                                Annulla
                            </button>
                            <button className="confirm-delete-btn" onClick={confirmDelete}>
                                Elimina
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

