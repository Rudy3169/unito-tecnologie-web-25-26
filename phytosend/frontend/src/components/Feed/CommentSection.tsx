import { useState, type FormEvent, useEffect } from 'react';
import { MessageCircle, X, Send, AlertCircle } from 'lucide-react';
import './CommentSection.css';

interface Comment {
    id: number;
    text: string;
    authorName: string;
}

interface CommentSectionProps {
    postId: number;
    isOpen: boolean;
    onClose: () => void;
}

export function CommentSection({ postId, isOpen, onClose }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [errorMsg, setErrorMsg] = useState('');


    useEffect(() => {
        if (!isOpen) return;  // carica solo quando il modal si apre

        const token = localStorage.getItem('phytosend_token');

        fetch(`/api/social/posts/${postId}/commenti`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                setComments(data.map((c: { id: number; testo?: string; text?: string; author?: { name?: string } }) => ({
                    id: c.id,
                    text: c.testo ?? c.text ?? '',
                    authorName: c.author?.name ?? 'Utente'
                })));
            })
            .catch(err => console.error("Errore caricamento commenti:", err));
    }, [isOpen, postId]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (!newComment.trim()) {
            setErrorMsg('Il commento non può essere vuoto.');
            return;
        }

        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');

        try {
            const response = await fetch(
                `/api/social/posts/${postId}/commenti?utenteId=${userId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ testo: newComment })
                }
            );

            if (response.ok) {
                const created = await response.json();
                setComments([...comments, {
                    id: created.id,
                    text: newComment,
                    authorName: 'Tu'
                }]);
                setNewComment('');
            } else {
                setErrorMsg('Errore nell\'invio del commento.');
            }
        } catch {
            setErrorMsg('Impossibile contattare il server.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="comment-overlay" onClick={onClose}>
            <div className="comment-modal" onClick={e => e.stopPropagation()}>

                <div className="comment-modal-header">
                    <h3><MessageCircle size={18} /> Commenti</h3>
                    <button className="comment-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="comment-list">
                    {comments.length === 0 ? (
                        <p className="comment-empty">Nessun commento ancora. Sii il primo!</p>
                    ) : (
                        comments.map(c => (
                            <div key={c.id} className="comment-item">
                                <div className="comment-item-avatar">
                                    {c.authorName.charAt(0)}
                                </div>
                                <div className="comment-item-content">
                                    <strong>{c.authorName}</strong>
                                    <p>{c.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <form className="comment-form" onSubmit={handleSubmit}>
                    <input
                        className="comment-input"
                        type="text"
                        placeholder="Scrivi un commento..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                    />
                    <button type="submit" className="comment-submit-btn">
                        <Send size={14} /> Invia
                    </button>
                </form>

                {errorMsg && (
                    <p className="comment-error">
                        <AlertCircle size={14} /> {errorMsg}
                    </p>
                )}
            </div>
        </div>
    );
}
