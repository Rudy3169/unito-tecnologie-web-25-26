import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Settings, Grid3X3, Camera, Heart, MessageCircle, Fence, Trash2, Pencil, AlertTriangle, ArrowLeft, ChevronUp, Eye } from 'lucide-react';
import { PostCard } from '../Feed/PostCard';
import { ProfileSettings } from './ProfileSettings';
import type { PostProps } from '../Feed/PostCard';
import { apiFetch } from '../../utils/apiFetch';
import { WarningModal } from '../Common/WarningModal';
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
    const [showLargePhoto, setShowLargePhoto] = useState(false);
    const [isLargePhotoVisible, setIsLargePhotoVisible] = useState(false);
    const [avatarTransform, setAvatarTransform] = useState<{ x: number; y: number; scale: number } | null>(null);
    const [postToDelete, setPostToDelete] = useState<number | null>(null);
    const [warningModal, setWarningModal] = useState<{ isOpen: boolean; title?: string; message: string; type?: 'warning' | 'error' }>({
        isOpen: false,
        message: '',
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const modalScrollRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HTMLDivElement>(null);

    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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

    const openLargePhoto = () => {
        if (!avatarRef.current) return;
        const rect = avatarRef.current.getBoundingClientRect();
        
        const screenX = window.innerWidth / 2;
        const screenY = window.innerHeight / 2;
        
        const avatarX = rect.left + rect.width / 2;
        const avatarY = rect.top + rect.height / 2;
        
        const deltaX = avatarX - screenX;
        const deltaY = avatarY - screenY;
        
        const targetSize = Math.min(window.innerWidth * 0.8, 400);
        const scale = rect.width / targetSize;
        
        setAvatarTransform({
            x: deltaX,
            y: deltaY,
            scale: scale
        });
        
        setShowLargePhoto(true);
        
        setTimeout(() => {
            setIsLargePhotoVisible(true);
        }, 15);
    };

    const closeLargePhoto = () => {
        setIsLargePhotoVisible(false);
        setTimeout(() => {
            setShowLargePhoto(false);
            setAvatarTransform(null);
        }, 300);
    };

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

    // Gestione della classe body per la visualizzazione della modale del post su mobile
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

    // Gestione della classe body per la visualizzazione della modale impostazioni
    useEffect(() => {
        if (showSettings) {
            document.body.classList.add('settings-modal-open');
        } else {
            document.body.classList.remove('settings-modal-open');
        }
        return () => {
            document.body.classList.remove('settings-modal-open');
        };
    }, [showSettings]);

    // Gestione della classe body per la visualizzazione della foto profilo grande
    useEffect(() => {
        if (showLargePhoto) {
            document.body.classList.add('large-photo-modal-open');
        } else {
            document.body.classList.remove('large-photo-modal-open');
        }
        return () => {
            document.body.classList.remove('large-photo-modal-open');
        };
    }, [showLargePhoto]);

    // Ascolta l'evento globale per chiudere la modale (es. dal pulsante indietro dell'header mobile)
    useEffect(() => {
        const handleCloseModal = () => setSelectedPostIndex(null);
        window.addEventListener('close-post-modal', handleCloseModal);
        return () => {
            window.removeEventListener('close-post-modal', handleCloseModal);
        };
    }, []);

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
                setWarningModal({
                    isOpen: true,
                    title: 'Errore eliminazione',
                    message: 'Impossibile eliminare il post. Riprova più tardi.',
                    type: 'error'
                });
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

    // Estraiamo i parametri per i like se presenti
    const searchParams = new URLSearchParams(location.search);
    const openLikes = searchParams.get('openLikes') === 'true';
    const highlightLikeUserId = searchParams.get('likeUserId') ? Number(searchParams.get('likeUserId')) : undefined;

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
            {!isOwnProfile && (
                <button
                    className="back-to-profile-btn"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={18} /> Indietro
                </button>
            )}
            {/* ═══ HEADER PROFILO ═══ */}
            <div className="profile-header-card">
                <div className="profile-avatar-wrapper">
                    <div
                        ref={avatarRef}
                        className={`profile-avatar ${user?.profilePhotoUrl ? 'editable' : (isOwnProfile ? 'editable' : '')}`}
                        onClick={() => {
                            if (!user) return;
                            if (user.profilePhotoUrl) {
                                if (isOwnProfile) {
                                    setShowPhotoMenu(!showPhotoMenu);
                                } else {
                                    openLargePhoto();
                                }
                            } else if (isOwnProfile) {
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
                                    openLargePhoto();
                                }}
                            >
                                <Eye size={16} />
                                <span>Visualizza foto</span>
                            </button>
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
                        {/* Sticky Header Bar in stile Instagram Mobile */}
                        <div className="modal-sticky-header">
                            <button className="modal-back-btn" onClick={() => setSelectedPostIndex(null)} aria-label="Indietro">
                                <ArrowLeft size={22} />
                            </button>
                            <span className="modal-header-title">Post</span>
                            <div style={{ width: '34px' }} /> {/* Spacer per allineamento simmetrico */}
                        </div>

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
                                    defaultOpenLikes={new URLSearchParams(location.search).get('openPost') === String(post.id) && openLikes}
                                    highlightCommentId={new URLSearchParams(location.search).get('openPost') === String(post.id) ? (new URLSearchParams(location.search).get('commentId') ? Number(new URLSearchParams(location.search).get('commentId')) : undefined) : undefined}
                                    highlightLikeUserId={new URLSearchParams(location.search).get('openPost') === String(post.id) ? highlightLikeUserId : undefined}
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
            <WarningModal
                isOpen={warningModal.isOpen}
                onClose={() => setWarningModal(prev => ({ ...prev, isOpen: false }))}
                title={warningModal.title}
                message={warningModal.message}
                type={warningModal.type}
            />

            {showScrollTop && (
                <button className="scroll-to-top-btn" onClick={scrollToTop} aria-label="Torna in cima">
                    <ChevronUp size={24} />
                </button>
            )}

            {/* Pop-up per visualizzare la foto profilo grande */}
            {showLargePhoto && user?.profilePhotoUrl && (
                <div 
                    className={`large-photo-overlay ${isLargePhotoVisible ? 'visible' : ''}`} 
                    onClick={closeLargePhoto}
                >
                    <div 
                        className="large-photo-container" 
                        onClick={(e) => e.stopPropagation()}
                        style={
                            !isLargePhotoVisible && avatarTransform
                                ? {
                                      transform: `translate(${avatarTransform.x}px, ${avatarTransform.y}px) scale(${avatarTransform.scale})`,
                                      opacity: 0,
                                  }
                                : {
                                      transform: 'translate(0, 0) scale(1)',
                                      opacity: 1,
                                  }
                        }
                    >
                        <img 
                            src={user.profilePhotoUrl} 
                            alt="Foto profilo grande" 
                            className="large-photo-img" 
                        />
                        <button 
                            className="close-large-photo-btn"
                            onClick={closeLargePhoto}
                            aria-label="Chiudi"
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
