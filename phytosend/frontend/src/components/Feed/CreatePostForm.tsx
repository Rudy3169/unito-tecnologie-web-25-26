import { useState, type FormEvent } from 'react';
import type { PostProps } from './PostCard';
import './CreatePostForm.css';

interface CreatePostFormProps {
    // Questa è la funzione che il Genitore ci passa per poter comunicare con lui
    onPostCreated: (newPost: PostProps) => void;
}

export function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
    const [caption, setCaption] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        console.log("1. Pulsante premuto! Sto creando il post...");

        // Costruiamo il nuovo post "finto" (presto questo invierà una chiamata POST con fetch al backend)
        const newPost: PostProps = {
            id: Date.now(), // ID temporaneo univoco generato dal tempo
            username: "IlTuoProfilo",
            location: "A casa",
            imageUrl: imageUrl || "https://images.unsplash.com/photo-1466692476877-3aa0a2788685?auto=format&fit=crop&q=80&w=800", // Immagine natura default se stringa vuota
            caption: caption,
            likesCount: 0
        };

        // Inviamo il post al genitore HomeFeed!
        onPostCreated(newPost);

        // Svuotiamo il form
        setCaption('');
        setImageUrl('');
    };

    return (
        <div className="create-post-form">
            <h3>Condividi la natura 🌿</h3>
            <form onSubmit={handleSubmit}>
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
                <button type="submit" className="submit-post-btn">Pubblica</button>
            </form>
        </div>
    );
}
