import { useState, useEffect, useRef, useCallback } from 'react';
import { PenLine, AlertTriangle } from 'lucide-react';
import { PostList } from './PostList';
import { CreatePostForm } from './CreatePostForm';
import type { PostProps } from './PostCard';
import { apiFetch } from '../../utils/apiFetch';
import './HomeFeed.css';

export function HomeFeed() {

    // Funzione per caricare i post
    const [posts, setPosts] = useState<PostProps[]>([]);

    // Funzione per aggiungere un post
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Funzione per eliminare un post
    const [postToDelete, setPostToDelete] = useState<number | null>(null);

    // Pagination state
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Sensore per l'infinite scroll
    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observerRef.current.observe(node);
    }, [loading, hasMore]);

    // Funzione per caricare i post
    const caricaPosts = (pageNum: number) => {
        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');
        const url = userId
            ? `/api/social/posts?utenteId=${userId}&page=${pageNum}&size=10`
            : `/api/social/posts?page=${pageNum}&size=10`;

        setLoading(true);
        apiFetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error(`Errore server: ${res.status}`);
                return res.json();
            })
            .then(data => {
                setPosts(prev => {
                    if (pageNum === 0) return data.content ?? [];
                    return [...prev, ...(data.content ?? [])];
                });
                setHasMore(!data.last);
            })
            .catch(err => console.error("Errore:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        caricaPosts(page);
    }, [page]);

    const handleAddPost = () => {
        if (page === 0) {
            caricaPosts(0);
        } else {
            setPage(0);
        }
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

        apiFetch(`/api/social/posts/${postId}/like?utenteId=${userId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        }).catch(err => {
            console.error("Errore like:", err);
            if (page === 0) caricaPosts(0);
            else setPage(0);
        });
    };

    // Funzione per salvare un post
    const handleToggleSave = (postId: number) => {
        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');

        setPosts(posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    isSavedByMe: !post.isSavedByMe
                };
            }
            return post;
        }));

        apiFetch(`/api/social/posts/${postId}/save?utenteId=${userId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        }).catch(err => {
            console.error("Errore save:", err);
            if (page === 0) caricaPosts(0);
            else setPage(0);
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
            const response = await apiFetch(`/api/social/posts/${postId}?utenteId=${userId}`, {
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
                onToggleSave={handleToggleSave}
                onCommentUpdate={() => {
                    if (page === 0) caricaPosts(0);
                    else setPage(0);
                }}
                lastPostRef={lastElementRef}
            />

            {loading && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>
                    Caricamento nuovi post...
                </div>
            )}

            {!hasMore && posts.length > 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)', marginBottom: '40px' }}>
                    Non ci sono altri post da mostrare.
                </div>
            )}

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

