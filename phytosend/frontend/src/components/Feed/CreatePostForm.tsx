import { useState, type FormEvent } from 'react';
import { PenLine, ImagePlus, Camera, X } from 'lucide-react';
import './CreatePostForm.css';

interface CreatePostFormProps {
    onPostCreated: () => void;
    isOpen: boolean;
    onClose: () => void;
}

export function CreatePostForm({ onPostCreated, isOpen, onClose }: CreatePostFormProps) {
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const localUrl = URL.createObjectURL(file);
            setImageUrl(localUrl);
            setPreviewUrl(localUrl);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');

        const response = await fetch(`/api/social/posts?utenteId=${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: title,
                description: caption,
                urlphoto: imageUrl
            })
        });

        if (response.ok) {
            onPostCreated();
            setTitle('');
            setCaption('');
            setImageUrl('');
        }
        else {
            setErrorMsg('Errore nella pubblicazione. Riprova!');
        }
    };

    if (!isOpen) return null;


    return (
        <div className="create-post-overlay" onClick={onClose}>
            <div className="create-post-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="create-post-header">
                    <h3><PenLine size={18} /> Condividi la tua pianta</h3>
                    <button className="create-post-close" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="create-post-body">
                    <input
                        type="text"
                        placeholder="Titolo del post"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Racconta qualcosa sulla tua pianta..."
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        required
                    />
                    {/* Anteprima immagine */}
                    {previewUrl && (
                        <img src={previewUrl} alt="Anteprima" className="post-preview-img" />
                    )}
                    {/* Pulsanti foto */}
                    <div className="photo-actions">
                        <label htmlFor="file-gallery" className="photo-btn">
                            <ImagePlus size={18} /> Allega foto
                        </label>
                        <input
                            id="file-gallery"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        <label htmlFor="file-camera" className="photo-btn">
                            <Camera size={18} /> Scatta foto
                        </label>
                        <input
                            id="file-camera"
                            type="file"
                            accept="image/*"
                            capture="environment"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="form-actions">
                        {errorMsg && <p className="error-message">{errorMsg}</p>}
                        <button type="submit" className="submit-post-btn">
                            <PenLine size={15} /> Pubblica
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
