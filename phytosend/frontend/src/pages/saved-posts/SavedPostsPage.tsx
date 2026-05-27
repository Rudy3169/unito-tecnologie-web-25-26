import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../../api';
import { PostList } from '../../components/feed/PostList';
import { PostCard } from '../../components/feed/PostCard';
import type { PostProps } from '../../types';
import { Bookmark, Grid3X3, List, Heart, MessageCircle } from 'lucide-react';
import '../home/HomePage.css';
import '../profile/ProfilePage.css'; // Per riutilizzare la griglia e la modale del profilo

/**
 * COMPONENTE SAVED POSTS PAGE
 * Mostra i post che l'utente ha salvato (segnalibro).
 * Supporta due modalità di visualizzazione interscambiabili: Griglia (stile Instagram) e Lista (stile Feed).
 */
export function SavedPosts() {
    const [posts, setPosts] = useState<PostProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
    const modalScrollRef = useRef<HTMLDivElement>(null);

    // ==========================================
    // FETCH DEI POST SALVATI
    // ==========================================
    const caricaPostSalvati = () => {
        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');

        if (!userId) return;

        // Richiede al backend esclusivamente la sottolista di post salvati dall'utente
        apiFetch(`/api/social/posts/saved?utenteId=${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error(`Errore server: ${res.status}`);
                return res.json();
            })
            .then(data => {
                setPosts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Errore recupero post salvati:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        caricaPostSalvati();
    }, []);

    // ==========================================
    // SINCRONIZZAZIONE DELLA VISUALIZZAZIONE (EVENTS)
    // ==========================================
    // Comunica con l'Header Mobile (esterno a questo componente) tramite eventi globali (CustomEvent)
    // per tenere sincronizzato il bottone Grid/List che si trova in un'altra parte dell'albero React.
    useEffect(() => {
        const handleRequest = () => {
            window.dispatchEvent(new CustomEvent('sync-saved-posts-view-mode', { detail: viewMode }));
        };
        const handleChange = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail) {
                setViewMode(customEvent.detail);
            }
        };
        window.addEventListener('request-saved-posts-view-mode', handleRequest);
        window.addEventListener('change-saved-posts-view-mode', handleChange);

        // Invia lo stato iniziale appena montato
        window.dispatchEvent(new CustomEvent('sync-saved-posts-view-mode', { detail: viewMode }));

        return () => {
            window.removeEventListener('request-saved-posts-view-mode', handleRequest);
            window.removeEventListener('change-saved-posts-view-mode', handleChange);
        };
    }, [viewMode]);

    // Gestione della classe body per la testata Instagram-style su mobile
    useEffect(() => {
        if (selectedPostIndex !== null) {
            document.body.classList.add('post-modal-open');
        } else {
            document.body.classList.remove('post-modal-open');
        }
        return () => {
            document.body.classList.remove('post-modal-open');
        };
    }, [selectedPostIndex]);

    // Ascolta l'evento di chiusura modale della header mobile
    useEffect(() => {
        const handleCloseModal = () => setSelectedPostIndex(null);
        window.addEventListener('close-post-modal', handleCloseModal);
        return () => window.removeEventListener('close-post-modal', handleCloseModal);
    }, []);

    // Quando un post viene aperto in modale, scrolla alla posizione corretta
    useEffect(() => {
        if (selectedPostIndex !== null && modalScrollRef.current) {
            setTimeout(() => {
                const postElements = modalScrollRef.current?.querySelectorAll('.profile-modal-post');
                if (postElements && postElements[selectedPostIndex]) {
                    postElements[selectedPostIndex].scrollIntoView({ behavior: 'auto', block: 'start' });
                }
            }, 50);
        }
    }, [selectedPostIndex]);

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
            caricaPostSalvati();
        });
    };

    // =================================================
    // RIMOZIONE DAI SALVATI (AGGIORNAMENTO OTTIMISTICO)
    // =================================================
    const handleToggleSave = (postId: number) => {
        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');

        // Aggiornamento Ottimistico "Radicale": se l'utente clicca il segnalibro qui, 
        // significa che lo sta togliendo (siamo già nei salvati). Facciamo sparire il post SUBITO dalla UI,
        // prima ancora che il server risponda. Questo restituisce una sensazione di estrema reattività.
        setPosts(posts.filter(post => post.id !== postId));

        apiFetch(`/api/social/posts/${postId}/save?utenteId=${userId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        }).catch(err => {
            // Se c'è stato un errore di rete (il comando non è andato a buon fine),
            // dobbiamo annullare l'aggiornamento ottimistico ricaricando lo stato dal server.
            console.error("Errore save:", err);
            caricaPostSalvati();
        });
    };

    // Funzione dummy per la cancellazione (non si possono cancellare post di altri da qui)
    const handleDeleteClick = () => {
        console.warn("L'eliminazione dei post salvati non è gestita qui");
    };

    if (loading) {
        return (
            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '40px' }}>
                <p>Caricamento post salvati...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: viewMode === 'grid' ? '800px' : '600px', margin: '0 auto', transition: 'max-width 0.3s ease' }}>

            {/* Header */}
            <div className="saved-posts-page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', padding: '0 16px', marginTop: '16px' }}>

                {/* Titolo pagina */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Bookmark size={28} color="var(--color-primary)" />
                    <h1 style={{ margin: 0, color: 'var(--color-text-main)', fontSize: '1.8rem' }}>Post Salvati</h1>
                </div>

                {posts.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', background: 'var(--color-bg-card)', padding: '4px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>

                        {/* Bottone per la visualizzazione a griglia */}
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{
                                background: viewMode === 'grid' ? 'var(--color-primary)' : 'transparent',
                                color: viewMode === 'grid' ? 'white' : 'var(--color-text-muted)',
                                border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                            }}
                        >
                            <Grid3X3 size={20} />
                        </button>

                        {/* Bottone per la visualizzazione a lista */}
                        <button
                            onClick={() => setViewMode('list')}
                            style={{
                                background: viewMode === 'list' ? 'var(--color-primary)' : 'transparent',
                                color: viewMode === 'list' ? 'white' : 'var(--color-text-muted)',
                                border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                            }}
                        >
                            <List size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Visualizzazione dei post */}
            {posts.length === 0 ? (
                <div className="empty-garden" style={{ margin: '0 16px' }}>
                    <Bookmark size={48} color="var(--color-border)" style={{ marginBottom: '16px' }} />
                    <h3>Nessun post salvato</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>I post che salvi appariranno qui. <br /> Clicca sull'icona del segnalibro sotto un post per salvarlo.</p>
                </div>
            ) : viewMode === 'list' ? (
                <PostList
                    posts={posts}
                    onToggleLike={handleToggleLike}
                    onDeletePost={handleDeleteClick}
                    onToggleSave={handleToggleSave}
                    onCommentUpdate={caricaPostSalvati}
                />
            ) : (
                <div className="profile-grid-section">
                    <div className="profile-post-grid">
                        {posts.map((post, index) => (
                            <div
                                key={post.id}
                                className="profile-post-thumb"
                                onClick={() => setSelectedPostIndex(index)}
                            >
                                <img src={post.urlphoto} alt={post.title} />
                                <div className="post-thumb-overlay">
                                    <span><Heart size={12} /> {post.likesCount}</span>
                                    <span><MessageCircle size={12} /> {post.commentsCount || 0}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MODALE PER VISUALIZZAZIONE GRID */}
            {selectedPostIndex !== null && viewMode === 'grid' && (
                <div className="profile-post-modal-overlay" onClick={() => setSelectedPostIndex(null)}>
                    <div
                        className="profile-post-modal-scroll"
                        ref={modalScrollRef}
                        onClick={e => e.stopPropagation()}
                    >
                        {posts.map((post, _index) => (
                            <div key={post.id} className="profile-modal-post">
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
                                    onLike={handleToggleLike}
                                    onSave={handleToggleSave}
                                    onCommentUpdate={caricaPostSalvati}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
