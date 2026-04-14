import { useState, type FormEvent } from 'react';
import './CreatePostForm.css';

interface CreatePostFormProps {
    onPostCreated: () => void;
}

export function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

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


    return (
        <div className="create-post-form">
            <h3>Condividi la natura 🌿</h3>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Titolo"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="URL Immagine (opzionale)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                />
                <textarea
                    placeholder="Scrivi un pensiero verde..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    required
                />
                {errorMsg && <p className="error-message">{errorMsg}</p>}
                <button type="submit" className="submit-post-btn">Pubblica</button>
            </form>
        </div>
    );
}
