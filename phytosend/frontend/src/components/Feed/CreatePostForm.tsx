import { useState, useEffect, useRef, type FormEvent } from 'react';
import { ImagePlus, Camera, X, Check, Loader, Sprout, Fence, Plus } from 'lucide-react';
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

    // Nuovi stati per la gestione del Giardino vs Nuova Pianta
    const [postMode, setPostMode] = useState<'new' | 'garden'>('new');
    const [myPlants, setMyPlants] = useState<any[]>([]);
    const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
    const [selectedBotanicalCardId, setSelectedBotanicalCardId] = useState<number | null>(null);
    const [addToGarden, setAddToGarden] = useState(true);


    // Stato per Autocompletamento (Nuova pianta)
    const [suggestions, setSuggestions] = useState<PlantSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Reset e caricamento piante utente
    useEffect(() => {
        if (isOpen) {
            const token = localStorage.getItem('phytosend_token');
            const userId = localStorage.getItem('phytosend_userId');

            // Carica il giardino dell'utente
            fetch(`/api/utenti/${userId}/piante`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setMyPlants(data || []))
                .catch(err => console.error("Errore caricamento giardino:", err));
        } else {
            // Reset form
            setTitle(''); setCaption(''); setImageUrl(''); setPreviewUrl('');
            setErrorMsg(''); setSuggestions([]); setShowSuggestions(false);
            setSelectedPlantId(null); setSelectedBotanicalCardId(null); setPostMode('new');
        }
    }, [isOpen]);

    // Autocompletamento: Debounced Fetch
    useEffect(() => {
        if (postMode !== 'new' || !title.trim() || title.length < 2) {
            setSuggestions([]); setShowSuggestions(false); setIsSearching(false);
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
                console.error('Errore ricerca piante:', err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [title, postMode]);

    // Funzione per caricare l'immagine
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            const MAX_SIZE = 800;
            let { width, height } = img;
            const size = Math.min(width, height);
            const startX = (width - size) / 2;
            const startY = (height - size) / 2;
            const finalSize = Math.min(size, MAX_SIZE);

            const canvas = document.createElement('canvas');
            canvas.width = finalSize; canvas.height = finalSize;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, startX, startY, size, size, 0, 0, finalSize, finalSize);

            const base64 = canvas.toDataURL('image/jpeg', 0.8);
            setImageUrl(base64); setPreviewUrl(base64);
            URL.revokeObjectURL(objectUrl);
        };
        img.src = objectUrl;
    };

    // Funzione per selezionare una pianta dal catalogo
    const handleSelectSuggestion = (suggestion: PlantSuggestion) => {
        setTitle(suggestion.commonName);
        setSelectedBotanicalCardId(suggestion.id);
        setShowSuggestions(false);
    };

    // Funzione per selezionare una pianta dal giardino
    const handleSelectFromGarden = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const pId = Number(e.target.value);
        setSelectedPlantId(pId);
        const selected = myPlants.find(p => p.id === pId);
        if (selected) setTitle(selected.card?.commonName || 'Pianta dal giardino');
    };

    // Funzione per inviare il post
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

        // Costruiamo il payload rispettando il PostCreateDto
        const payload = {
            title: title,
            description: caption,
            urlphoto: imageUrl,
            botanicalCardId: postMode === 'new' ? selectedBotanicalCardId : null,
            plantId: postMode === 'garden' ? selectedPlantId : null,
            addToGarden: addToGarden
        };

        try {
            const response = await fetch(`/api/social/posts?utenteId=${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                onPostCreated();
                onClose();
            } else {
                setErrorMsg(`Errore: controlla di aver selezionato una pianta valida. (${response.status})`);
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
            <div className={`create-post-modal ${previewUrl ? 'has-photo' : 'no-photo'}`} onClick={e => e.stopPropagation()}>
                <div className="create-post-header">
                    <h3>{previewUrl ? 'Dettagli Post' : 'Nuovo Post'}</h3>
                    <button className="create-post-close" onClick={onClose}><X size={20} /></button>
                </div>

                {!previewUrl ? (
                    <div className="create-post-initial">
                        <label htmlFor="file-gallery-big" className="big-photo-btn">
                            <ImagePlus size={48} strokeWidth={1.5} />
                            <span>Carica foto dalla galleria</span>
                        </label>
                        <input id="file-gallery-big" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="create-post-split">
                        <div className="split-left">
                            <img src={previewUrl} alt="Anteprima" className="post-preview-img-large" />
                            <div className="photo-actions-small">
                                <label htmlFor="file-gallery-change" className="photo-btn-small">Cambia Foto</label>
                                <input id="file-gallery-change" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                            </div>
                        </div>

                        <div className="split-right">
                            {/* SELETTORE MODALITA' */}
                            <div className="post-mode-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                <button type="button"
                                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: postMode === 'new' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', background: postMode === 'new' ? 'rgba(30, 94, 75, 0.1)' : 'transparent', color: postMode === 'new' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                                    onClick={() => { setPostMode('new'); setSelectedPlantId(null); setTitle(''); }}>
                                    <Sprout size={16} style={{ marginBottom: '-3px', marginRight: '4px' }} /> Nuova Pianta
                                </button>
                                <button type="button"
                                    // 1. Disabilita il click se non ci sono piante
                                    disabled={myPlants.length === 0}
                                    // 2. Mostra un piccolo messaggio al passaggio del mouse
                                    title={myPlants.length === 0 ? "Aggiungi prima una pianta al tuo giardino!" : ""}
                                    style={{
                                        flex: 1,
                                        padding: '8px',
                                        borderRadius: '8px',
                                        border: postMode === 'garden' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                        background: postMode === 'garden' ? 'rgba(30, 94, 75, 0.1)' : 'transparent',
                                        color: postMode === 'garden' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                        // 3. Rende il tasto semi-trasparente e col cursore di divieto se vuoto
                                        opacity: myPlants.length === 0 ? 0.5 : 1,
                                        cursor: myPlants.length === 0 ? 'not-allowed' : 'pointer'
                                    }}
                                    onClick={() => { setPostMode('garden'); setSelectedBotanicalCardId(null); setTitle(''); }}>
                                    <Fence size={16} style={{ marginBottom: '-3px', marginRight: '4px' }} /> Dal Giardino
                                </button>
                            </div>

                            <div className="form-group" ref={dropdownRef}>
                                <label>{postMode === 'new' ? 'Cerca nel Catalogo' : 'Seleziona dal tuo Giardino'}</label>

                                {postMode === 'new' ? (
                                    <div className="input-with-icon">
                                        <input
                                            type="text" value={title}
                                            onChange={(e) => { setTitle(e.target.value); setShowSuggestions(true); }}
                                            required placeholder="Es. Monstera" className="search-input" autoComplete="off"
                                        />
                                        {isSearching && <Loader size={16} className="spin search-spinner" />}
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
                                ) : (
                                    <select required className="search-input" value={selectedPlantId || ''} onChange={handleSelectFromGarden}>
                                        <option value="" disabled>-- Scegli una pianta --</option>
                                        {myPlants.map(plant => (
                                            <option key={plant.id} value={plant.id}>
                                                {plant.card?.commonName || 'Pianta Sconosciuta'} (Aggiunta il {new Date(plant.purchaseDate).toLocaleDateString()})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* NUOVO BOTTONE: Visibile solo se ha selezionato una pianta dal catalogo */}
                            {postMode === 'new' && selectedBotanicalCardId && (
                                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setAddToGarden(!addToGarden)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '6px 14px', borderRadius: '20px',
                                            background: addToGarden ? 'var(--color-primary)' : 'transparent',
                                            color: addToGarden ? 'white' : 'var(--color-text-muted)',
                                            border: `1px solid ${addToGarden ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                            cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem', fontWeight: 500
                                        }}
                                    >
                                        {addToGarden ? <Check size={16} /> : <Plus size={16} />}
                                        {addToGarden ? 'Nel tuo Giardino' : 'Aggiungi al Giardino'}
                                    </button>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.2 }}>
                                        {addToGarden ? 'Verrà creata la scheda di cura' : 'Solo post (non verrà salvata)'}
                                    </span>
                                </div>
                            )}

                            <div className="form-group flex-grow">
                                <label>Descrizione</label>
                                <textarea
                                    placeholder="Scrivi qualcosa sulla tua pianta..."
                                    value={caption} onChange={(e) => setCaption(e.target.value)} required className="caption-textarea"
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