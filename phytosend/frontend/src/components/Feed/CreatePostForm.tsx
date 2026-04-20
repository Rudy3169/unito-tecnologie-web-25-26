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
        if (!file) return;

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            const MAX_SIZE = 800;
            let { width, height } = img;

            if (width > MAX_SIZE || height > MAX_SIZE) {
                if (width > height) {
                    height = Math.round(height * MAX_SIZE / width);
                    width = MAX_SIZE;
                } else {
                    width = Math.round(width * MAX_SIZE / height);
                    height = MAX_SIZE;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            const base64 = canvas.toDataURL('image/jpeg', 0.7);
            setImageUrl(base64);
            setPreviewUrl(base64);

            URL.revokeObjectURL(objectUrl);
        };

        img.src = objectUrl;
    };


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (!imageUrl) {
            setErrorMsg("L'immagine è obbligatoria per creare un post!");
            return;
        }

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
            onClose();
            setTitle('');
            setCaption('');
            setImageUrl('');
            setPreviewUrl('');
        }
        else {
            let msg = `Errore del server (${response.status})`;
            if (response.status === 413) msg = 'Errore 413: immagine troppo grande. Usa una foto più piccola.';
            else if (response.status === 403) msg = 'Errore 403: sessione scaduta, effettua di nuovo il login.';
            else if (response.status === 400) msg = 'Errore 400: dati non validi. Controlla titolo e descrizione.';
            else if (response.status === 500) msg = 'Errore 500: problema interno del server.';
            setErrorMsg(msg);
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
                        placeholder="Nome della pianta"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Scrivi qualcosa sulla tua pianta..."
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
