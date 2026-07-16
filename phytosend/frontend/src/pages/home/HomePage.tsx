import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { PenLine, AlertTriangle } from 'lucide-react';
import { PostList } from '../../components/feed/PostList';
import { CreatePostForm } from '../../components/feed/CreatePostForm';
import type { PostProps } from '../../types';
import { apiFetch } from '../../api';
import './HomePage.css';

/**
 * Interfaccia per la cache della Home.
 * Serve a memorizzare lo stato del feed quando l'utente naviga via dalla Home 
 * per poi ripristinarlo al suo ritorno.
 */
interface HomeFeedCache {
    posts: PostProps[]; // Lista dei post visualizzati nel feed
    page: number; // Pagina corrente richiesta al backend
    hasMore: boolean; // true se il server ha ancora post da inviare
    scrollY: number; // Posizione dello scroll all'uscita dalla Home
}

// Conserva i dati in memoria RAM finché non si fa un refresh forzato del browser.
let moduleCache: HomeFeedCache | null = null;

export function HomeFeed() {
    // Rileva il tipo di navigazione
    const navigationType = useNavigationType();

    // Riflettiamo la cache in un ref locale in modo da poterne leggere i valori in modo sincrono durante il montaggio.
    const cachedRef = useRef<HomeFeedCache | null>(null);
    const restoredRef = useRef(false); // Flag per evitare di ripristinare la cache più di una volta per render

    // Ripristino sincronizzato della cache SOLO se stiamo tornando indietro e la cache esiste
    if (!restoredRef.current) {
        if (navigationType === 'POP' && moduleCache) {
            cachedRef.current = moduleCache;
        }
        moduleCache = null; // Puliamo la cache globale per non usarla per navigazioni future non volute
        restoredRef.current = true;
    }

    // ==========================================
    // STATI DEL COMPONENTE (STATE MANAGEMENT)
    // ==========================================

    // Lista dei post visualizzati nel feed
    const [posts, setPosts] = useState<PostProps[]>(cachedRef.current?.posts ?? []);

    // Stato booleano per la visualizzazione del form di creazione di un nuovo post
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Memorizza l'ID del post che l'utente sta cercando di eliminare
    const [postToDelete, setPostToDelete] = useState<number | null>(null);

    // Stati per l'impaginazione e lo scroll infinito
    const [page, setPage] = useState(cachedRef.current?.page ?? 0); // Pagina corrente richiesta al backend
    const [hasMore, setHasMore] = useState(cachedRef.current?.hasMore ?? true); // true se il server ha ancora post da inviare
    const [loading, setLoading] = useState(false); // Flag di caricamento per mostrare un feedback visivo

    // Flag per gestire l'animazione invisibile di ripristino dello scroll
    const [restoringScroll, setRestoringScroll] = useState(!!cachedRef.current);

    // Riferimenti usati per catturare l'intersezione dello scroll
    const observerRef = useRef<IntersectionObserver | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // ==========================================
    // GESTIONE CACHE AL DISMOUNT
    // ==========================================

    // Refs utilizzati per avere sempre il valore più aggiornato degli stati
    const postsRef = useRef(posts);
    const pageRef = useRef(page);
    const hasMoreRef = useRef(hasMore);

    // Aggiorna il ref ogni volta che la lista dei post cambia
    useEffect(() => {
        postsRef.current = posts;
    }, [posts]);

    // Aggiorna il ref ogni volta che la pagina cambia
    useEffect(() => {
        pageRef.current = page;
    }, [page]);

    // Aggiorna il ref ogni volta che hasMore cambia
    useEffect(() => {
        hasMoreRef.current = hasMore;
    }, [hasMore]);

    const lastScrollY = useRef(0);

    // Monitora la posizione dello scroll in tempo reale per bypassare i reset automatici del router
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                lastScrollY.current = window.scrollY;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Salva lo stato del feed in cache al momento dell'unmount (navigazione verso altra pagina)
    useEffect(() => {
        return () => {
            moduleCache = {
                posts: postsRef.current,
                page: pageRef.current,
                hasMore: hasMoreRef.current,
                scrollY: lastScrollY.current
            };
        };
    }, []);

    // Ripristina la posizione di scroll all'altezza precedente prima che la pagina appaia
    useLayoutEffect(() => {
        if (restoringScroll && cachedRef.current && posts.length > 0) {
            if (containerRef.current) containerRef.current.style.visibility = 'hidden';

            requestAnimationFrame(() => {
                window.scrollTo({ top: cachedRef.current!.scrollY, behavior: 'instant' as ScrollBehavior });
                if (containerRef.current) containerRef.current.style.visibility = '';
                setRestoringScroll(false);
                cachedRef.current = null;
            });
        }
    }, [restoringScroll, posts]);

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

    // Trigger per il caricamento dei post
    useEffect(() => {
        if (restoringScroll) return;
        caricaPosts(page);
    }, [page]);

    // Gestisce l'aggiunta di un nuovo post
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
        <div ref={containerRef} style={{ maxWidth: '600px', margin: '0 auto' }}>
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

            {/* Footer con lo spinner per lo scroll infinito */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>
                    Caricamento nuovi post...
                </div>
            )}

            {/* Footer con lo stato di fine pagina */}
            {!hasMore && posts.length > 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)', marginBottom: '40px' }}>
                    Non ci sono altri post da mostrare.
                </div>
            )}

            {/* MODAL DI CONFERMA ELIMINAZIONE */}
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

