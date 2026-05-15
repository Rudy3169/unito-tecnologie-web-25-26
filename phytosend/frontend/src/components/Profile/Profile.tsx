import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Settings, Grid3X3, Camera, Heart, MessageCircle, Fence, Trash2, Pencil, AlertTriangle } from 'lucide-react';
import { PostCard } from '../Feed/PostCard';
import { ProfileSettings } from './ProfileSettings';
import type { PostProps } from '../Feed/PostCard';
import { apiFetch } from '../../utils/apiFetch';
import './Profile.css';

interface UserProfile {
    id: number;
    name: string;
    surname: string;
    email: string;
    city?: string;
    phoneNumber?: string;
    bio?: string;
    birthDate?: string;
    role: string;
    postsCount: number;
    plantsCount: number;
    profilePhotoUrl?: string;
}

export function Profile() {
    const { userId: paramUserId } = useParams<{ userId: string }>();

    // L'ID dell'utente corrente (chi è loggato)
    const currentUserId = localStorage.getItem('phytosend_userId');
    const token = localStorage.getItem('phytosend_token');
    const navigate = useNavigate();
    const location = useLocation();

    // Se c'è un parametro nella URL, mostriamo quel profilo, altrimenti il nostro
    const profileUserId = paramUserId || currentUserId;
    const isOwnProfile = profileUserId === currentUserId;

    const [user, setUser] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<PostProps[]>([]);
    const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [showPhotoMenu, setShowPhotoMenu] = useState(false);
    const [postToDelete, setPostToDelete] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const modalScrollRef = useRef<HTMLDivElement>(null);

    // Funzione per caricare i dati del profilo
    const loadProfile = () => {
        if (!profileUserId) {
            // Se il browser non ha l'ID utente salvato, puliamo tutto e andiamo al login!
            localStorage.clear();
            window.location.href = '/';
            return;
        }

        // 1. Carica dati utente
        apiFetch(`/api/utenti/${profileUserId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                // Se il MIO profilo è stato cancellato (404), logout
                if (res.status === 404 && isOwnProfile) {
                    localStorage.clear();
                    window.location.href = '/';
                    return null;
                }
                return res.ok ? res.json() : null;
            })
            .then(data => setUser(data))
            .catch(err => console.error("Errore caricamento profilo:", err));

        // 2. Carica i post dell'utente
        apiFetch(`/api/social/posts/user/${profileUserId}?utenteId=${currentUserId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                setPosts(data.map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    urlphoto: p.urlphoto ?? p.URLPhoto ?? p.urlPhoto ?? '',
                    creationDate: p.creationDate,
                    author: p.author,
                    plant: p.plant,
                    likesCount: p.likesCount ?? 0,
                    isLikedByMe: p.likedByMe ?? p.isLikedByMe ?? false,
                    commentsCount: p.commentsCount ?? 0,
                    onCommentUpdate: () => { },
                })));
            })
            .catch(err => console.error("Errore caricamento post:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        setSelectedPostIndex(null);
        loadProfile();
    }, [profileUserId]);

    // Chiude il menu foto quando si clicca fuori
    useEffect(() => {
        if (!showPhotoMenu) return;
        const handleClick = () => setShowPhotoMenu(false);
        // Piccolo delay per evitare che il click di apertura lo chiuda subito
        const timer = setTimeout(() => document.addEventListener('click', handleClick), 0);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('click', handleClick);
        };
    }, [showPhotoMenu]);

    // Gestione like dai post in modale
    const handleToggleLike = (postId: number) => {
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
        }).catch(() => loadProfile());
    };

    // Funzione per salvare un post
    const handleToggleSave = (postId: number) => {
        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');

        setPosts(posts.map(post => {
            if (post.id === postId) {
                return { ...post, isSavedByMe: !post.isSavedByMe };
            }
            return post;
        }));

        apiFetch(`/api/social/posts/${postId}/save?utenteId=${userId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => loadProfile());
    };

    // Funzione per eliminare un post dal profilo
    const confirmDeletePost = async () => {
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
                setSelectedPostIndex(null); // Chiudiamo la modale del post se eravamo lì
            } else {
                alert("Errore: Impossibile eliminare il post.");
            }
        } catch (err) {
            console.error("Errore cancellazione:", err);
        } finally {
            setPostToDelete(null);
        }
    };

    // Quando un post viene aperto in modale, scrolla alla posizione corretta
    useEffect(() => {
        if (selectedPostIndex !== null && modalScrollRef.current) {
            // Piccolo delay per permettere al DOM di renderizzare
            setTimeout(() => {
                const postElements = modalScrollRef.current?.querySelectorAll('.profile-modal-post');
                if (postElements && postElements[selectedPostIndex]) {
                    postElements[selectedPostIndex].scrollIntoView({ behavior: 'auto', block: 'start' });
                }
            }, 50);
        }
    }, [selectedPostIndex]);

    // Gestione parametri URL (da notifiche)
    useEffect(() => {
        if (!loading && posts.length > 0) {
            const searchParams = new URLSearchParams(location.search);
            const openPostId = searchParams.get('openPost');
            
            if (openPostId) {
                const index = posts.findIndex(p => p.id === Number(openPostId));
                if (index !== -1 && selectedPostIndex !== index) {
                    setSelectedPostIndex(index);
                }
            }
        }
    }, [loading, posts, location.search]);

    if (loading) {
        return (
            <div className="profile-container">
                <div className="profile-loading">Caricamento profilo...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="profile-container">
                <div className="profile-loading">Utente non trovato</div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            {/* ═══ HEADER PROFILO ═══ */}
            <div className="profile-header-card">
                <div className="profile-avatar-wrapper">
                    <div
                        className={`profile-avatar ${isOwnProfile ? 'editable' : ''}`}
                        onClick={() => {
                            if (!isOwnProfile) return;
                            if (user.profilePhotoUrl) {
                                // Se ha già una foto, mostra il menu modifica/elimina
                                setShowPhotoMenu(!showPhotoMenu);
                            } else {
                                // Se non ha foto, apri direttamente la galleria
                                fileInputRef.current?.click();
                            }
                        }}
                    >
                        {user.profilePhotoUrl ? (
                            <img src={user.profilePhotoUrl} alt="Foto profilo" className="profile-avatar-img" />
                        ) : (
                            <span>{user.name?.charAt(0)?.toUpperCase()}{user.surname?.charAt(0)?.toUpperCase()}</span>
                        )}
                        {isOwnProfile && (
                            <div className="profile-avatar-overlay">
                                <Camera size={20} />
                            </div>
                        )}
                    </div>

                    {/* Input file nascosto */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            setUploadingPhoto(true);
                            setShowPhotoMenu(false);
                            const token = localStorage.getItem('phytosend_token');

                            try {
                                // 1. Upload del file
                                const formData = new FormData();
                                formData.append('file', file);

                                const uploadRes = await apiFetch('/api/upload/profile-photo', {
                                    method: 'POST',
                                    headers: { 'Authorization': `Bearer ${token}` },
                                    body: formData
                                });

                                if (!uploadRes.ok) throw new Error('Upload fallito');
                                const { url } = await uploadRes.json();

                                // 2. Se c'era una foto precedente, eliminala dal server
                                if (user.profilePhotoUrl?.startsWith('/uploads/')) {
                                    await apiFetch('/api/upload/profile-photo', {
                                        method: 'DELETE',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${token}`
                                        },
                                        body: JSON.stringify({ url: user.profilePhotoUrl })
                                    }).catch(() => { });
                                }

                                // 3. Aggiorna il profilo con il nuovo URL
                                await apiFetch(`/api/utenti/${user.id}`, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({ profilePhotoUrl: url })
                                });

                                loadProfile();
                            } catch (err) {
                                console.error('Errore upload foto profilo:', err);
                            } finally {
                                setUploadingPhoto(false);
                                // Reset dell'input per permettere ri-selezione dello stesso file
                                e.target.value = '';
                            }
                        }}
                    />

                    {/* Indicatore di caricamento */}
                    {uploadingPhoto && (
                        <div className="photo-uploading-indicator">
                            <div className="photo-uploading-spinner" />
                        </div>
                    )}

                    {/* Menu modifica/elimina foto */}
                    {showPhotoMenu && (
                        <div className="photo-action-menu">
                            <button
                                className="photo-action-item"
                                onClick={() => {
                                    setShowPhotoMenu(false);
                                    fileInputRef.current?.click();
                                }}
                            >
                                <Pencil size={16} />
                                <span>Modifica foto</span>
                            </button>
                            <button
                                className="photo-action-item danger"
                                onClick={async () => {
                                    setShowPhotoMenu(false);
                                    const token = localStorage.getItem('phytosend_token');

                                    try {
                                        // Elimina il file dal server
                                        if (user.profilePhotoUrl?.startsWith('/uploads/')) {
                                            await apiFetch('/api/upload/profile-photo', {
                                                method: 'DELETE',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': `Bearer ${token}`
                                                },
                                                body: JSON.stringify({ url: user.profilePhotoUrl })
                                            }).catch(() => { });
                                        }

                                        // Rimuovi l'URL dal profilo
                                        await apiFetch(`/api/utenti/${user.id}`, {
                                            method: 'PUT',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': `Bearer ${token}`
                                            },
                                            body: JSON.stringify({ profilePhotoUrl: '' })
                                        });

                                        loadProfile();
                                    } catch (err) {
                                        console.error('Errore eliminazione foto:', err);
                                    }
                                }}
                            >
                                <Trash2 size={16} />
                                <span>Elimina foto</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="profile-header-info">
                    <div className="profile-name-row">
                        <h2>{user.name} {user.surname}</h2>
                        {isOwnProfile && (
                            <button className="profile-settings-btn" onClick={() => setShowSettings(true)}>
                                <Settings size={20} />
                            </button>
                        )}
                    </div>

                    <span className={`role-badge ${user.role === 'ADMIN' ? 'role-admin' : user.role === 'PRO' ? 'role-pro' : 'role-user'}`}>
                        {user.role}
                    </span>

                    {user.city && (
                        <div className="profile-city">
                            <MapPin size={14} /> {user.city}
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ BIO ═══ */}
            {user.bio && (
                <div className="profile-bio-card">
                    <p>{user.bio}</p>
                </div>
            )}

            {/* ═══ STATISTICHE: Solo Post e Piante ═══ */}
            <div className="profile-stats">
                <div className="stat-item">
                    <span className="stat-number">{user.postsCount}</span>
                    <span className="stat-label">Post</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                    <span className="stat-number">{user.plantsCount}</span>
                    <span className="stat-label">Piante</span>
                </div>
            </div>

            {/* ═══ BOTTONE VISITA GIARDINO ═══ */}
            <button
                className="visit-garden-btn"
                onClick={() => navigate(isOwnProfile ? '/my-garden' : `/garden/${profileUserId}`)}
            >
                <Fence size={18} />
                {isOwnProfile ? 'Il mio Giardino' : 'Visita Giardino'}
            </button>

            {/* ═══ GRIGLIA POST ═══ */}
            <div className="profile-grid-section">
                <div className="profile-grid-header">
                    <Grid3X3 size={16} />
                    <span>Post</span>
                </div>

                {posts.length === 0 ? (
                    <div className="profile-no-posts">
                        <Camera size={48} strokeWidth={1} />
                        <p>{isOwnProfile ? 'Non hai ancora pubblicato nessun post' : 'Nessun post pubblicato'}</p>
                    </div>
                ) : (
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
                )}
            </div>

            {/* ═══ MODALE POST (Click su thumbnail) ═══ */}
            {selectedPostIndex !== null && (
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
                                    onDelete={setPostToDelete}
                                    onCommentUpdate={loadProfile}
                                    defaultOpenComments={new URLSearchParams(location.search).get('openPost') === String(post.id) && new URLSearchParams(location.search).get('openComments') === 'true'}
                                    highlightCommentId={new URLSearchParams(location.search).get('openPost') === String(post.id) ? (new URLSearchParams(location.search).get('commentId') ? Number(new URLSearchParams(location.search).get('commentId')) : undefined) : undefined}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══ MODALE IMPOSTAZIONI ═══ */}
            {showSettings && (
                <ProfileSettings
                    user={user}
                    onClose={() => setShowSettings(false)}
                    onSaved={() => {
                        setShowSettings(false);
                        loadProfile();
                    }}
                />
            )}

            {/* POP-UP DI CONFERMA ELIMINAZIONE POST */}
            {postToDelete !== null && (
                <div className="comment-overlay" onClick={() => setPostToDelete(null)} style={{ zIndex: 9999 }}>
                    <div className="delete-modal" onClick={e => e.stopPropagation()}>
                        <h3><AlertTriangle color="var(--color-error)" size={24} /> Elimina Post</h3>
                        <p>Sei sicuro di voler eliminare definitivamente questo post?</p>

                        <div className="delete-modal-actions">
                            <button className="cancel-btn" onClick={() => setPostToDelete(null)}>
                                Annulla
                            </button>
                            <button className="confirm-delete-btn" onClick={confirmDeletePost}>
                                Elimina
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
