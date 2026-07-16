import { useState, useEffect, useRef, type FormEvent } from 'react';
import { ImagePlus, X, Check, Loader, Sprout, Fence, Plus } from 'lucide-react';
import { apiFetch } from '../../api';
import { WarningModal } from '../common/WarningModal';
import './CreatePostForm.css';

// Interfaccia per le props del componente CreatePostForm
interface CreatePostFormProps {
    onPostCreated: () => void; // Funzione da chiamare quando il post è stato creato con successo
    isOpen: boolean; // Indica se la modale è aperta
    onClose: () => void; // Funzione da chiamare quando la modale viene chiusa
}

// Interfaccia per i suggerimenti delle piante
interface PlantSuggestion {
    id: number; // ID della pianta
    commonName: string; // Nome comune della pianta
    scientificName: string; // Nome scientifico della pianta
    urlDefaultPhoto: string; // URL dell'immagine di default della pianta
}

/**
 * COMPONENTE CREATE POST FORM
 * Modale "Smart" ad alta complessità che gestisce l'intero flusso di creazione di un post.
 * Include manipolazione di file lato client (Canvas API), 
 * pattern di "Typeahead" con debouncing per la ricerca nel DB,
 * e logica condizionale complessa (Nuova Pianta vs Pianta Esistente).
 */
export function CreatePostForm({ onPostCreated, isOpen, onClose }: CreatePostFormProps) {
    // ==========================================
    // 1. useState
    // ==========================================

    // State per i campi del post
    const [title, setTitle] = useState(''); // Titolo del post
    const [caption, setCaption] = useState(''); // Descrizione del post
    const [imageUrl, setImageUrl] = useState(''); // URL dell'immagine
    const [previewUrl, setPreviewUrl] = useState(''); // URL dell'anteprima
    const [isLoading, setIsLoading] = useState(false); // Stato di caricamento
    const [plantNickname, setPlantNickname] = useState(''); // Nickname della pianta
    // State per gestire la finestra modale di avviso
    const [warningModal, setWarningModal] = useState<{ isOpen: boolean; title?: string; message: string; type?: 'warning' | 'error' }>({
        isOpen: false,
        message: '',
    });

    // State per la gestione della modalità del post (nuova pianta o pianta dal giardino)
    const [postMode, setPostMode] = useState<'new' | 'garden'>('new'); // Modalità post
    const [myPlants, setMyPlants] = useState<any[]>([]); // Piante dell'utente
    const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null); // ID della pianta selezionata
    const [selectedBotanicalCardId, setSelectedBotanicalCardId] = useState<number | null>(null); // ID della botanical card selezionata
    const [addToGarden, setAddToGarden] = useState(false); // Aggiungi pianta al giardino

    // State per la ricerca piante nel giardino
    const [gardenSearchQuery, setGardenSearchQuery] = useState(''); // Query di ricerca nel giardino
    const [showGardenDropdown, setShowGardenDropdown] = useState(false); // Mostra dropdown del giardino

    // Mappa plantId -> foto dell'ultimo post (stessa logica di MyGarden)
    const [plantPhotoMap, setPlantPhotoMap] = useState<Record<number, string>>({}); // Mappa plantId -> foto dell'ultimo post

    // State per la ricerca di piante nel catalogo
    const [suggestions, setSuggestions] = useState<PlantSuggestion[]>([]); // Suggerimenti di piante
    const [showSuggestions, setShowSuggestions] = useState(false); // Mostra suggerimenti
    const [isSearching, setIsSearching] = useState(false); // Indica se sta cercando

    const dropdownRef = useRef<HTMLDivElement>(null);

    // ==========================================
    // 2. useEffect
    // ==========================================

    // Blocco dello scroll del body quando la modale di creazione post è aperta
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('create-post-modal-open');
        } else {
            document.body.classList.remove('create-post-modal-open');
        }
        return () => {
            document.body.classList.remove('create-post-modal-open');
        };
    }, [isOpen]);

    // Chiudi i dropdown quando si clicca fuori
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
                setShowGardenDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Gestione apertura modale
    useEffect(() => {
        if (isOpen) {
            const token = localStorage.getItem('phytosend_token');
            const userId = localStorage.getItem('phytosend_userId');

            apiFetch(`/api/utenti/${userId}/piante`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setMyPlants(data || []))
                .catch(err => console.error("Errore caricamento giardino:", err));

            // Carica i post dell'utente per costruire la mappa foto piante (stessa logica di MyGarden)
            apiFetch(`/api/social/posts/user/${userId}?utenteId=${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.ok ? res.json() : [])
                .then((posts: any[]) => {
                    const photoMap: Record<number, string> = {};
                    posts.forEach((p: any) => {
                        const pId = p.plantId;
                        const photo = p.urlphoto || p.URLPhoto;
                        if (pId && photo && !photoMap[pId]) {
                            photoMap[pId] = photo;
                        }
                    });
                    setPlantPhotoMap(photoMap);
                })
                .catch(err => console.error("Errore recupero post utente:", err));
        } else {
            setTitle(''); setCaption(''); setImageUrl(''); setPreviewUrl('');
            setSuggestions([]); setShowSuggestions(false);
            setSelectedPlantId(null); setSelectedBotanicalCardId(null); setPostMode('new');
            setAddToGarden(false); setPlantNickname(''); setGardenSearchQuery(''); setShowGardenDropdown(false);
            setPlantPhotoMap({});
        }
    }, [isOpen]);

    // Logica di ricerca (typeahead) con debouncing
    useEffect(() => {
        if (postMode !== 'new' || !title.trim() || title.length < 2 || selectedBotanicalCardId !== null) {
            setSuggestions([]);
            setShowSuggestions(false);
            setIsSearching(false);
            return;
        }

        // Usiamo un setTimeout (debouncing) di 300ms. Questo evita di lanciare una fetch 
        // per ogni singola lettera digitata (es. 'M', 'Mo', 'Mon', 'Mons'), 
        // risparmiando traffico di rete e carico sul database.
        setIsSearching(true);
        const timeoutId = setTimeout(async () => {
            try {
                const token = localStorage.getItem('phytosend_token');
                const res = await apiFetch(`/api/catalogo/ricerca?q=${encodeURIComponent(title)}&page=0&size=5`, {
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
    }, [title, postMode, selectedBotanicalCardId]);

    // ==========================================
    // ELABORAZIONE IMMAGINI LATO CLIENT (CANVAS API)
    // ==========================================
    // Per evitare di inviare payload enormi al server, prima di fare l'upload
    // effettuiamo un crop quadrato (1:1) e un ridimensionamento (max 800px) 
    // dell'immagine direttamente nel browser dell'utente, usando un <canvas> invisibile.
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

    // Selezione Pianta da Catalogo
    const handleSelectSuggestion = (suggestion: PlantSuggestion) => {
        setSelectedBotanicalCardId(suggestion.id);
        setTitle(suggestion.commonName);
        setShowSuggestions(false);
    };

    // Selezione Pianta dal Giardino (con dropdown visuale)
    const handleSelectFromGarden = (plant: any) => {
        setSelectedPlantId(plant.id);
        setTitle(plant.card?.commonName || 'Pianta dal giardino');
        setGardenSearchQuery(plant.card?.commonName || '');
        setShowGardenDropdown(false);
    };

    // Piante filtrate nel giardino: solo piante vive, con ricerca
    const filteredGardenPlants = myPlants.filter(p => {
        // Escludi piante morte
        if (p.deathDate) return false;
        if (!gardenSearchQuery.trim()) return true;
        const q = gardenSearchQuery.toLowerCase();
        const commonName = (p.card?.commonName || '').toLowerCase();
        const nickname = (p.name || '').toLowerCase();
        return commonName.includes(q) || nickname.includes(q);
    });

    // Gestione Invio Form
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!imageUrl) {
            setWarningModal({
                isOpen: true,
                title: 'Foto mancante',
                message: "L'immagine è obbligatoria per creare un post!",
                type: 'warning'
            });
            return;
        }

        if (postMode === 'new' && !selectedBotanicalCardId) {
            setWarningModal({
                isOpen: true,
                title: 'Specie non valida',
                message: "La pianta inserita non esiste nel catalogo botanico. Selezionane una dai suggerimenti.",
                type: 'warning'
            });
            return;
        }

        if (postMode === 'garden' && !selectedPlantId) {
            setWarningModal({
                isOpen: true,
                title: 'Pianta non valida',
                message: "La pianta inserita non esiste nel tuo giardino o non è stata selezionata correttamente.",
                type: 'warning'
            });
            return;
        }

        setIsLoading(true);
        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');

        const payload = {
            title: title,
            plantName: plantNickname,
            description: caption,
            urlPhoto: imageUrl,
            botanicalCardId: postMode === 'new' ? selectedBotanicalCardId : null,
            plantId: postMode === 'garden' ? selectedPlantId : null,
            addToGarden: addToGarden
        };

        try {
            const response = await apiFetch(`/api/social/posts?utenteId=${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                onPostCreated();
                onClose();
            } else {
                setWarningModal({
                    isOpen: true,
                    title: 'Errore pubblicazione',
                    message: `Controlla di aver selezionato una pianta valida. (Errore: ${response.status})`,
                    type: 'error'
                });
            }
        } catch (err) {
            setWarningModal({
                isOpen: true,
                title: 'Errore di rete',
                message: "Controlla la tua connessione internet e riprova.",
                type: 'error'
            });
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
                            <div className="post-mode-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                <button type="button"
                                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: postMode === 'new' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', background: postMode === 'new' ? 'rgba(30, 94, 75, 0.1)' : 'transparent', color: postMode === 'new' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                                    onClick={() => { setPostMode('new'); setSelectedPlantId(null); setTitle(''); setGardenSearchQuery(''); setShowGardenDropdown(false); }}>
                                    <Sprout size={16} style={{ marginBottom: '-3px', marginRight: '4px' }} /> Nuova Pianta
                                </button>
                                <button type="button"
                                    disabled={myPlants.filter(p => !p.deathDate).length === 0}
                                    title={myPlants.filter(p => !p.deathDate).length === 0 ? "Non hai piante vive nel tuo giardino!" : ""}
                                    style={{
                                        flex: 1, padding: '8px', borderRadius: '8px', border: postMode === 'garden' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                        background: postMode === 'garden' ? 'rgba(30, 94, 75, 0.1)' : 'transparent', color: postMode === 'garden' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                        opacity: myPlants.filter(p => !p.deathDate).length === 0 ? 0.5 : 1, cursor: myPlants.filter(p => !p.deathDate).length === 0 ? 'not-allowed' : 'pointer'
                                    }}
                                    onClick={() => { setPostMode('garden'); setSelectedBotanicalCardId(null); setTitle(''); setAddToGarden(false); setPlantNickname(''); }}>
                                    <Fence size={16} style={{ marginBottom: '-3px', marginRight: '4px' }} /> Dal Giardino
                                </button>
                            </div>

                            <div className="form-group" ref={dropdownRef}>
                                <label>{postMode === 'new' ? 'Cerca nel Catalogo' : 'Seleziona dal tuo Giardino'}</label>

                                {postMode === 'new' ? (
                                    <div className="input-with-icon">
                                        <input
                                            type="text" value={title}
                                            // FIX: Se l'utente riprende a scrivere, cancelliamo la selezione e riapriamo la ricerca
                                            onChange={(e) => {
                                                setTitle(e.target.value);
                                                setSelectedBotanicalCardId(null);
                                                setShowSuggestions(true);
                                            }}
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
                                    <div className="input-with-icon">
                                        <input
                                            type="text"
                                            value={gardenSearchQuery}
                                            onChange={(e) => {
                                                setGardenSearchQuery(e.target.value);
                                                setSelectedPlantId(null);
                                                setTitle('');
                                                setShowGardenDropdown(true);
                                            }}
                                            onFocus={() => setShowGardenDropdown(true)}
                                            required={!selectedPlantId}
                                            placeholder="Cerca tra le tue piante..."
                                            className="search-input"
                                            autoComplete="off"
                                        />
                                        {showGardenDropdown && (
                                            <ul className="autocomplete-dropdown">
                                                {filteredGardenPlants.length > 0 ? (
                                                    filteredGardenPlants.map(plant => (
                                                        <li key={plant.id} className="suggestion-item" onClick={() => handleSelectFromGarden(plant)}>
                                                            <img src={plantPhotoMap[plant.id] || plant.urlPhoto || plant.card?.urlDefaultPhoto || '/placeholder.png'} alt={plant.card?.commonName} className="suggestion-img" />
                                                            <div className="suggestion-info">
                                                                <span className="suggestion-name">{plant.card?.commonName || 'Pianta Sconosciuta'}</span>
                                                                <span className="suggestion-scientific">
                                                                    {plant.name ? `"${plant.name}" · ` : ''}
                                                                    Aggiunta il {new Date(plant.purchaseDate).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            {selectedPlantId === plant.id && <Check size={16} className="garden-check-icon" />}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="suggestion-item no-hover">
                                                        <span className="suggestion-scientific">Nessuna pianta trovata</span>
                                                    </li>
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* BOTTONE ANIMATO (Visibile solo se pianta nuova selezionata) */}
                            {postMode === 'new' && selectedBotanicalCardId && (
                                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button
                                        type="button"
                                        className={`animated-toggle-btn ${addToGarden ? 'active' : 'inactive'}`}
                                        onClick={() => setAddToGarden(!addToGarden)}
                                    >
                                        <span className="toggle-icon-wrapper">
                                            {addToGarden ? <Check size={16} /> : <Plus size={16} />}
                                        </span>
                                        <span>{addToGarden ? 'Aggiunta al Giardino' : 'Aggiungi al Giardino'}</span>
                                    </button>
                                </div>
                            )}

                            {/* Input Soprannome (Visibile solo se aggiungo al giardino) */}
                            {postMode === 'new' && selectedBotanicalCardId && addToGarden && (
                                <div className="nickname-field">
                                    <label className="nickname-label">
                                        <Sprout size={14} />
                                        Soprannome della pianta
                                    </label>
                                    <input
                                        type="text"
                                        placeholder='Es. "Pina" — facoltativo'
                                        value={plantNickname}
                                        onChange={(e) => setPlantNickname(e.target.value)}
                                        className="nickname-input"
                                    />
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
                                <button type="submit" className="submit-post-btn" disabled={isLoading}>
                                    {isLoading ? <Loader size={18} className="spin" /> : <><Check size={18} /> Pubblica Post</>}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
            <WarningModal
                isOpen={warningModal.isOpen}
                onClose={() => setWarningModal(prev => ({ ...prev, isOpen: false }))}
                title={warningModal.title}
                message={warningModal.message}
                type={warningModal.type}
            />
        </div>
    );
}