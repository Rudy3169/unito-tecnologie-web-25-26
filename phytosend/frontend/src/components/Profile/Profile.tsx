import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Settings, Grid3X3, Camera } from 'lucide-react';
import { PostCard } from '../Feed/PostCard';
import { ProfileSettings } from './ProfileSettings';
import type { PostProps } from '../Feed/PostCard';
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
}

export function Profile() {
    const { userId: paramUserId } = useParams<{ userId: string }>();

    // L'ID dell'utente corrente (chi è loggato)
    const currentUserId = localStorage.getItem('phytosend_userId');
    const token = localStorage.getItem('phytosend_token');

    // Se c'è un parametro nella URL, mostriamo quel profilo, altrimenti il nostro
    const profileUserId = paramUserId || currentUserId;
    const isOwnProfile = profileUserId === currentUserId;

    const [user, setUser] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<PostProps[]>([]);
    const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [loading, setLoading] = useState(true);

    const modalScrollRef = useRef<HTMLDivElement>(null);

    // Funzione per caricare i dati del profilo
    const loadProfile = () => {
        if (!profileUserId) return;

        // 1. Carica dati utente
        fetch(`/api/utenti/${profileUserId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : null)
            .then(data => setUser(data))
            .catch(err => console.error("Errore caricamento profilo:", err));

        // 2. Carica i post dell'utente
        fetch(`/api/social/posts/user/${profileUserId}?utenteId=${currentUserId}`, {
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
        setLoading(true);
        loadProfile();
    }, [profileUserId]);

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

        fetch(`/api/social/posts/${postId}/like?utenteId=${userId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => loadProfile());
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
                <div className="profile-avatar">
                    <span>{user.name?.charAt(0)?.toUpperCase()}{user.surname?.charAt(0)?.toUpperCase()}</span>
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
                                <div className="thumb-overlay">
                                    <span>❤️ {post.likesCount ?? 0}</span>
                                    <span>💬 {post.commentsCount ?? 0}</span>
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
                                    likesCount={post.likesCount}
                                    isLikedByMe={post.isLikedByMe}
                                    commentsCount={post.commentsCount}
                                    onLike={handleToggleLike}
                                    onCommentUpdate={loadProfile}
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
        </div>
    );
}
