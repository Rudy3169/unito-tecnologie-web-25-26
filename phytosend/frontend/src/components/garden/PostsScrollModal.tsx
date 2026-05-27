import { useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { PostCard } from '../feed/PostCard';
import type { PostProps } from '../../types';

interface PostsScrollModalProps {
    selectedPostIndex: number | null;
    setSelectedPostIndex: (val: number | null) => void;
    plantPostCards: PostProps[];
    handleToggleLike: (postId: number) => void;
    handleToggleSave: (postId: number) => void;
    handleDeleteClick: (postId: number) => void;
}

export function PostsScrollModal({
    selectedPostIndex, setSelectedPostIndex, plantPostCards, handleToggleLike, handleToggleSave, handleDeleteClick
}: PostsScrollModalProps) {
    const modalScrollRef = useRef<HTMLDivElement>(null);

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

                {plantPostCards.map((post) => (
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
                            onCommentUpdate={() => { }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
