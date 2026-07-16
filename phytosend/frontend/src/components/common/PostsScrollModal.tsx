import { useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { PostCard } from '../feed/PostCard';
import type { PostProps } from '../../types';

/**
 * COMPONENTE POSTS SCROLL MODAL
 * Modale full-screen usata in Giardino e Profilo per scorrere i post verticalmente.
 * Ricrea un'esperienza utente (UX) mobile-first in puro stile "Instagram", 
 * agganciando l'apertura all'esatto post cliccato nella griglia.
 */

interface PostsScrollModalProps {
    selectedPostIndex: number | null; // Indice del post da visualizzare
    setSelectedPostIndex: (val: number | null) => void; // Funzione per impostare l'indice del post
    plantPostCards: PostProps[]; // Array di post da visualizzare
    handleToggleLike: (postId: number) => void; // Funzione per gestire il like
    handleToggleSave: (postId: number) => void; // Funzione per gestire il salvataggio
    handleDeleteClick: (postId: number) => void; // Funzione per gestire la cancellazione
    onCommentUpdate?: () => void; // Funzione per gestire l'aggiornamento dei commenti
    notificationPostId?: number | null; // ID del post da aprire tramite notifica
    defaultOpenComments?: boolean; // Flag per aprire i commenti di default
    defaultOpenLikes?: boolean; // Flag per aprire i like di default
    highlightCommentId?: number; // ID del commento da evidenziare
    highlightLikeUserId?: number; // ID dell'utente da evidenziare
}

export function PostsScrollModal({
    selectedPostIndex, setSelectedPostIndex, plantPostCards, handleToggleLike, handleToggleSave, handleDeleteClick,
    onCommentUpdate, notificationPostId, defaultOpenComments, defaultOpenLikes, highlightCommentId, highlightLikeUserId
}: PostsScrollModalProps) {
    const modalScrollRef = useRef<HTMLDivElement>(null);

    // ==========================================
    // AUTO-SCROLL (DOM MANIPULATION)
    // ==========================================
    // Quando la modale viene montata, usiamo un Timeout (per dare tempo al React di renderizzare i DOM nodes)
    // e invochiamo scrollIntoView() sul post selezionato, allineandolo all'inizio dello schermo ('start').
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

    // Gestisce la chiusura della modale
    useEffect(() => {
        if (selectedPostIndex === null) return;
        document.body.classList.add('post-modal-open');
        const handleCloseModal = () => setSelectedPostIndex(null);
        window.addEventListener('close-post-modal', handleCloseModal);
        return () => {
            document.body.classList.remove('post-modal-open');
            window.removeEventListener('close-post-modal', handleCloseModal);
        };
    }, [selectedPostIndex, setSelectedPostIndex]);

    if (selectedPostIndex === null) return null;

    return (
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

                {plantPostCards.map((post) => {
                    // Le props di notifica si applicano solo al post aperto tramite notifica
                    const isNotificationTarget = notificationPostId != null && post.id === notificationPostId;

                    return (
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
                                onDelete={handleDeleteClick}
                                onCommentUpdate={onCommentUpdate || (() => { })}
                                defaultOpenComments={isNotificationTarget && defaultOpenComments}
                                defaultOpenLikes={isNotificationTarget && defaultOpenLikes}
                                highlightCommentId={isNotificationTarget ? highlightCommentId : undefined}
                                highlightLikeUserId={isNotificationTarget ? highlightLikeUserId : undefined}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

