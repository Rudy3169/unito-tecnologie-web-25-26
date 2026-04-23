import { useState, useEffect, useRef, type FormEvent } from 'react';
import { ImagePlus, Camera, X, Check, Loader } from 'lucide-react';
import './CreatePostForm.css';

interface CreatePostFormProps {
    onPostCreated: () => void;
    isOpen: boolean;
    onClose: () => void;
}

interface PlantSuggestion {
    id: number;
    commonName: string;
    scientificName: string;
    urlDefaultPhoto: string;
}

export function CreatePostForm({ onPostCreated, isOpen, onClose }: CreatePostFormProps) {
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Stato per Autocompletamento
    const [suggestions, setSuggestions] = useState<PlantSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Per gestire i click fuori dalla tendina
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Reset del form alla chiusura
    useEffect(() => {
        if (!isOpen) {
            setTitle('');
            setCaption('');
            setImageUrl('');
            setPreviewUrl('');
            setErrorMsg('');
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [isOpen]);

    // Autocompletamento: Debounced Fetch
    useEffect(() => {
        if (!title.trim() || title.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const timeoutId = setTimeout(async () => {
            try {
                const token = localStorage.getItem('phytosend_token');
                const res = await fetch(`/api/catalogo/ricerca?q=${encodeURIComponent(title)}&page=0&size=5`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data.content || []);
                    setShowSuggestions(true);
                }
            } catch (err) {
                console.error('Errore durante la ricerca delle piante:', err);
            } finally {
                setIsSearching(false);
            }
        }, 300); // 300ms di debounce

        return () => clearTimeout(timeoutId);
    }, [title]);

    // Gestione clic fuori dalla tendina
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            // Ridimensionamento Immagine come prima
            const MAX_SIZE = 800;
            let { width, height } = img;

            // Per lo split layout, croppiamo l'immagine in formato quadrato perfetto (1:1) come Instagram
            const size = Math.min(width, height);
            const startX = (width - size) / 2;
            const startY = (height - size) / 2;

            const finalSize = Math.min(size, MAX_SIZE);

            const canvas = document.createElement('canvas');
            canvas.width = finalSize;
            canvas.height = finalSize;
            const ctx = canvas.getContext('2d');

            ctx?.drawImage(img, startX, startY, size, size, 0, 0, finalSize, finalSize);

            const base64 = canvas.toDataURL('image/jpeg', 0.8);
            setImageUrl(base64);
            setPreviewUrl(base64);

            URL.revokeObjectURL(objectUrl);
        };

        img.src = objectUrl;
    };

    const handleSelectSuggestion = (suggestion: PlantSuggestion) => {
        setTitle(suggestion.commonName);
        setShowSuggestions(false);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (!imageUrl) {
            setErrorMsg("L'immagine è obbligatoria per creare un post!");
            return;
        }

        setIsLoading(true);
        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');

        try {
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
            } else {
                let msg = `Errore del server (${response.status})`;
                if (response.status === 413) msg = 'Errore 413: immagine troppo grande. Usa una foto più piccola.';
                else if (response.status === 403) msg = 'Errore 403: sessione scaduta, effettua di nuovo il login.';
                else if (response.status === 400) msg = 'Errore 400: dati non validi. Controlla titolo e descrizione.';
                else if (response.status === 500) msg = 'Errore 500: problema interno del server.';
                setErrorMsg(msg);
            }
        } catch (err) {
            setErrorMsg("Errore di rete. Controlla la connessione.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="create-post-overlay" onClick={onClose}>
            {/* Se non c'è foto, il modale è più stretto. Se c'è foto, si allarga per lo split. */}
            <div className={`create-post-modal ${previewUrl ? 'has-photo' : 'no-photo'}`} onClick={e => e.stopPropagation()}>

                <div className="create-post-header">
                    <h3>{previewUrl ? 'Dettagli Post' : 'Seleziona una Pianta'}</h3>
                    <button className="create-post-close" onClick={onClose}><X size={20} /></button>
                </div>

                {!previewUrl ? (
                    /* STATO 1: SCELTA FOTO (Vuoto, solo i due pulsantoni giganti) */
                    <div className="create-post-initial">
                        <label htmlFor="file-gallery-big" className="big-photo-btn">
                            <ImagePlus size={48} strokeWidth={1.5} />
                            <span>Carica foto dalla galleria</span>
                        </label>
                        <input id="file-gallery-big" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

                        <div className="divider">oppure</div>

                        <label htmlFor="file-camera-big" className="big-photo-btn outline">
                            <Camera size={48} strokeWidth={1.5} />
                            <span>Scatta una foto ora</span>
                        </label>
                        <input id="file-camera-big" type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileChange} />
                    </div>
                ) : (
                    /* STATO 2: FORM COMPLETO (Split Layout: a sinistra foto, a destra form) */
                    <form onSubmit={handleSubmit} className="create-post-split">
                        {/* Colonna Sinistra: Foto Quadrata */}
                        <div className="split-left">
                            <img src={previewUrl} alt="Anteprima" className="post-preview-img-large" />
                            <div className="photo-actions-small">
                                <label htmlFor="file-gallery-change" className="photo-btn-small">Cambia Foto</label>
                                <input id="file-gallery-change" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                            </div>
                        </div>

                        {/* Colonna Destra: Campi Form */}
                        <div className="split-right">
                            <div className="form-group" ref={dropdownRef}>
                                <label>Nome della Pianta</label>
                                <div className="input-with-icon">
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => {
                                            setTitle(e.target.value);
                                            setShowSuggestions(true);
                                        }}
                                        required
                                        className="search-input"
                                        autoComplete="off"
                                    />
                                    {isSearching && <Loader size={16} className="spin search-spinner" />}
                                </div>

                                {/* TENDINA AUTOCOMPLETAMENTO */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <ul className="autocomplete-dropdown">
                                        {suggestions.map((plant) => (
                                            <li key={plant.id} className="suggestion-item" onClick={() => handleSelectSuggestion(plant)}>
                                                <img src={plant.urlDefaultPhoto || '/placeholder.png'} alt={plant.commonName} className="suggestion-img" />
                                                <div className="suggestion-info">
                                                    <span className="suggestion-name">{plant.commonName}</span>
                                                    <span className="suggestion-scientific">{plant.scientificName}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="form-group flex-grow">
                                <label>Descrizione</label>
                                <textarea
                                    placeholder="Scrivi qualcosa sulla tua pianta..."
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    required
                                    className="caption-textarea"
                                />
                            </div>

                            <div className="form-actions-split">
                                {errorMsg && <p className="error-message">{errorMsg}</p>}
                                <button type="submit" className="submit-post-btn" disabled={isLoading}>
                                    {isLoading ? <Loader size={18} className="spin" /> : <><Check size={18} /> Pubblica Post</>}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
