import { useState, useEffect, useRef } from 'react';
import { Fence, Droplets, Plus, CalendarHeart, Trash2, Pencil, Check, X, Sprout, Skull, Info, Image as ImageIcon, Loader, Heart, MessageCircle } from 'lucide-react';
import { PostCard } from '../Feed/PostCard';
import type { PostProps } from '../Feed/PostCard';
import '../Profile/Profile.css';
import './MyGarden.css';

// Interfaccia base per un elemento del giardino
interface PlantItem {
    id: number;
    plantName?: string;
    urlPhoto?: string;
    purchaseDate: string;
    deathDate?: string;
    card: {
        commonName: string;
        scientificName: string;
        family: string;
        urlDefaultPhoto: string;
        exposure?: string;
        waterFrequencyDays?: string;
        fertilization?: string;
        soil?: string;
    };
}

// Interfaccia per i post associati a una pianta
interface PostItem {
    id: number;
    title: string;
    description: string;
    urlphoto?: string;
    URLPhoto?: string;
    creationDate: string;
    likesCount: number;
    commentsCount: number;
    author?: { username: string; profileImage?: string };
}

// Interfaccia per i risultati della ricerca
interface PlantSuggestion {
    id: number;
    commonName: string;
    scientificName: string;
    urlDefaultPhoto: string;
}

// Funzione principale che gestisce il giardino personale
export function MyGarden() {
    // Stati per la gestione delle piante nel giardino
    const [myPlants, setMyPlants] = useState<PlantItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Stati per l'aggiunta di una nuova pianta
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newPlantCardId, setNewPlantCardId] = useState("");
    const [newPlantName, setNewPlantName] = useState("");

    // Stati per la modifica del nome della pianta
    const [editingPlantId, setEditingPlantId] = useState<number | null>(null);
    const [editNameValue, setEditNameValue] = useState("");

    // Stati per la ricerca dinamica dal catalogo
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<PlantSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Stati per la selezione di una pianta e la gestione del prompt di eliminazione
    const [selectedPlant, setSelectedPlant] = useState<PlantItem | null>(null);
    const [deletePrompt, setDeletePrompt] = useState<number | null>(null);

    // Stati per i post associati alla pianta selezionata
    const [plantPosts, setPlantPosts] = useState<PostItem[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);

    // Mappa plantId -> foto dell'ultimo post (per le card nella lista)
    const [plantPhotoMap, setPlantPhotoMap] = useState<Record<number, string>>({});

    // Stati per la modale post scrollabile (stile Profile)
    const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
    const [plantPostCards, setPlantPostCards] = useState<PostProps[]>([]);
    const modalScrollRef = useRef<HTMLDivElement>(null);

    // Effetto per il caricamento iniziale del giardino
    useEffect(() => {
        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');

        fetch(`/api/utenti/${userId}/piante`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                const mappedPlants = data.map((p: any) => ({
                    ...p,
                    plantName: p.name,
                    isDead: p.deathDate !== null
                }));
                setMyPlants(mappedPlants);
            })
            .catch(err => console.error("Errore recupero giardino:", err))
            .finally(() => setLoading(false));

        // Carica i post dell'utente per costruire la mappa foto piante
        fetch(`/api/social/posts/user/${userId}?utenteId=${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : [])
            .then((posts: any[]) => {
                const photoMap: Record<number, string> = {};
                // I post sono già ordinati per data discendente, quindi il primo per ogni pianta è il più recente
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
    }, []);

    // Effetto per la ricerca dinamica dal catalogo
    useEffect(() => {
        if (!searchQuery.trim() || searchQuery.length < 2 || newPlantCardId !== "") {
            setSuggestions([]);
            setShowSuggestions(false);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const timeoutId = setTimeout(async () => {
            try {
                const token = localStorage.getItem('phytosend_token');
                const res = await fetch(`/api/catalogo/ricerca?q=${encodeURIComponent(searchQuery)}&page=0&size=5`, {
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
    }, [searchQuery, newPlantCardId]);

    // Effetto per caricare i post quando si seleziona una pianta
    useEffect(() => {
        if (!selectedPlant) {
            setPlantPosts([]);
            return;
        }

        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');
        setLoadingPosts(true);

        fetch(`/api/social/posts/plant/${selectedPlant.id}?utenteId=${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : [])
            .then(data => setPlantPosts(data || []))
            .catch(err => console.error('Errore caricamento post pianta:', err))
            .finally(() => setLoadingPosts(false));
    }, [selectedPlant]);

    // Quando cambia selectedPostIndex, scrolla al post selezionato
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

    // Gestione like dalla modale post
    const handleToggleLike = (postId: number) => {
        const userId = localStorage.getItem('phytosend_userId');
        const token = localStorage.getItem('phytosend_token');

        setPlantPostCards(prev => prev.map(post => {
            if (post.id === postId) {
                const isOraLiked = !post.isLikedByMe;
                return {
                    ...post,
                    isLikedByMe: isOraLiked,
                    likesCount: isOraLiked ? (post.likesCount ?? 0) + 1 : (post.likesCount ?? 0) - 1
                };
            }
            return post;
        }));

        fetch(`/api/social/posts/${postId}/like?utenteId=${userId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        }).catch(console.error);
    };

    // Funzione per gestire la selezione della pianta dalla tendina
    const handleSelectSuggestion = (suggestion: PlantSuggestion) => {
        setNewPlantCardId(suggestion.id.toString());
        setSearchQuery(suggestion.commonName);
        setShowSuggestions(false);
    };

    // Funzione per chiudere la modale e pulire i campi
    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setNewPlantCardId("");
        setNewPlantName("");
        setSearchQuery("");
        setSuggestions([]);
        setShowSuggestions(false);
    };

    // Funzione per aggiungere una nuova pianta al giardino
    const handleAddNewPlant = async () => {
        if (!newPlantCardId) return alert("Seleziona una specie botanica valida dalla tendina!");

        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');

        try {
            const response = await fetch(`/api/utenti/${userId}/piante`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    botanicalCardId: newPlantCardId,
                    plantName: newPlantName
                })
            });

            if (response.ok) {
                const addedPlant = await response.json();
                const newPlantMapped = {
                    ...addedPlant,
                    plantName: addedPlant.name,
                    isDead: false
                };

                setMyPlants(prev => [...prev, newPlantMapped]);
                handleCloseModal(); // Chiude e pulisce tutto
            } else {
                const errText = await response.text();
                alert("Errore dal Server: " + errText);
            }
        } catch (error) {
            console.error("Errore durante l'aggiunta", error);
        }
    };

    // Funzione per salvare il nome modificato della pianta
    const handleSaveName = async (e: React.MouseEvent, plantId: number) => {
        e.stopPropagation();
        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');

        try {
            const response = await fetch(`/api/utenti/${userId}/piante/${plantId}/name`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ newName: editNameValue })
            });

            if (response.ok) {
                setMyPlants(prev => prev.map(p => p.id === plantId ? { ...p, plantName: editNameValue } : p));
                setEditingPlantId(null);
                if (selectedPlant?.id === plantId) {
                    setSelectedPlant(prev => prev ? { ...prev, plantName: editNameValue } : null);
                }
            }
        } catch (error) {
            console.error("Errore modifica nome", error);
        }
    };

    // Funzione per eliminare la pianta dal giardino o segnarla come morta
    const handleDeleteAction = async (plantId: number, markAsDead: boolean) => {
        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');

        try {
            if (markAsDead) {
                await fetch(`/api/utenti/${userId}/piante/${plantId}/dead`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setMyPlants(prev => prev.map(p => p.id === plantId ? { ...p, deathDate: new Date().toISOString() } : p));
            } else {
                const response = await fetch(`/api/utenti/${userId}/piante/${plantId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok || response.status === 204) {
                    setMyPlants(prev => prev.filter(p => p.id !== plantId));
                }
            }
        } catch (error) {
            console.error("Errore azione delete", error);
        } finally {
            setDeletePrompt(null);
            if (selectedPlant?.id === plantId) setSelectedPlant(null);
        }
    };

    // Componente per visualizzare una singola pianta nel giardino
    const PlantCard = ({ plant }: { plant: PlantItem }) => {
        const displayName = plant.card?.commonName || 'Pianta Sconosciuta';
        const hasNickname = !!plant.plantName && plant.plantName.trim() !== '';
        // Usa la foto dell'ultimo post se disponibile, altrimenti la foto della scheda botanica
        const imgUrl = plantPhotoMap[plant.id] || plant.urlPhoto || plant.card?.urlDefaultPhoto || '/placeholder-plant.png';

        return (
            <div className={`garden-list-card ${plant.deathDate ? 'dead-card' : ''}`} onClick={() => setSelectedPlant(plant)}>
                <div className="garden-card-top">
                    {/* Immagine della pianta */}
                    <div className="garden-card-img" style={{ backgroundImage: `url(${imgUrl})` }}>
                        {plant.deathDate && <div className="dead-overlay"><Skull size={24} /></div>}
                    </div>
                    {/* Nome comune e nickname */}
                    <div className="garden-card-info">
                        {/* Nome comune e icona elimina */}
                        <div className="garden-card-header">
                            <h3 className="common-name">{displayName}</h3>
                            <button
                                className="delete-icon-btn"
                                onClick={(e) => { e.stopPropagation(); setDeletePrompt(plant.id); }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        {/* Nickname: solo se effettivamente inserito */}
                        {(hasNickname || editingPlantId === plant.id) && (
                            <div className="garden-card-nickname">
                                {editingPlantId === plant.id ? (
                                    <div className="edit-inline" onClick={e => e.stopPropagation()}>
                                        <input autoFocus value={editNameValue} onChange={e => setEditNameValue(e.target.value)} className="edit-input-small" />
                                        <button className="icon-btn ok" onClick={(e) => handleSaveName(e, plant.id)}><Check size={14} /></button>
                                        <button className="icon-btn no" onClick={() => setEditingPlantId(null)}><X size={14} /></button>
                                    </div>
                                ) : (
                                    <div className="view-inline">
                                        <span className="nick-text">"{plant.plantName}"</span>
                                        {!plant.deathDate && (
                                            <button className="edit-pencil-btn" onClick={(e) => {
                                                e.stopPropagation(); setEditingPlantId(plant.id); setEditNameValue(plant.plantName || '');
                                            }}>
                                                <Pencil size={12} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {/* Informazioni aggiuntive */}
                <div className="garden-card-events">
                    <Droplets size={14} /> Prossima irrigazione: {plant.card?.waterFrequencyDays || 'Regolare'}
                </div>
            </div>
        );
    };

    return (
        <div className="my-garden-page">
            {/* Header della pagina del giardino */}
            <header className="garden-header">
                <div className="header-title">
                    <Fence size={36} className="header-icon" />
                    <h1>Il mio Giardino</h1>
                </div>
                {/* Descrizione */}
                <p>La tua collezione personale di piante certificate Phytosend.</p>
            </header>

            {/* Contenuto del giardino */}
            <div className="garden-content">
                {/* Sezione vuota quando non ci sono piante */}
                {myPlants.length === 0 ? (
                    <div className="empty-garden">
                        <Sprout size={56} className="empty-icon" />
                        <h2>Il tuo giardino è ancora vuoto</h2>
                        <p>Aggiungi la tua prima pianta collegandola a una scheda botanica!</p>
                        <button className="add-plant-btn" onClick={() => setIsAddModalOpen(true)}>
                            <Plus size={18} /> Aggiungi Pianta
                        </button>
                    </div>
                ) : (
                    <div className="garden-lists-container">
                        {/* Bottone per aggiungere pianta */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-16px' }}>
                            <button className="add-plant-btn" style={{ marginTop: 0 }} onClick={() => setIsAddModalOpen(true)}>
                                <Plus size={18} /> Aggiungi Pianta
                            </button>
                        </div>

                        {/* Sezione piante vive */}
                        {myPlants.filter(p => !p.deathDate).length > 0 && (
                            <div className="alive-section">
                                <div className="list-grid">
                                    {myPlants.filter(p => !p.deathDate).map(plant => <PlantCard key={plant.id} plant={plant} />)}
                                </div>
                            </div>
                        )}
                        {/* Sezione piante morte */}
                        {myPlants.filter(p => p.deathDate).length > 0 && (
                            <div className="dead-section">
                                <h3><Skull size={18} /> Il cimitero delle piante</h3>
                                <div className="list-grid">
                                    {myPlants.filter(p => p.deathDate).map(plant => <PlantCard key={plant.id} plant={plant} />)}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Sezione di aggiunta pianta */}
                {isAddModalOpen && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="add-plant-dialog" onClick={e => e.stopPropagation()}>
                            <button className="close-modal-btn" onClick={handleCloseModal}><X size={24} /></button>
                            <h3>Aggiungi una Nuova Pianta</h3>

                            {/* Campo di ricerca */}
                            <div className="form-group" style={{ position: 'relative' }}>
                                <label>Cerca nel Catalogo Botanico *</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setNewPlantCardId("");
                                            setShowSuggestions(true);
                                        }}
                                        placeholder="Es. Monstera..."
                                        className="modal-input"
                                        style={{ width: '100%' }}
                                        autoComplete="off"
                                    />
                                    {isSearching && <Loader size={16} className="spin" style={{ position: 'absolute', right: '12px', color: 'var(--color-text-muted)' }} />}
                                </div>

                                {/* Tendina dei risultati */}
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

                            {/* Campo del soprannome */}
                            <div className="form-group">
                                <label>Soprannome (Facoltativo)</label>
                                <input
                                    type="text"
                                    placeholder="Es. Pina (la Monstera)"
                                    value={newPlantName}
                                    onChange={e => setNewPlantName(e.target.value)}
                                    className="modal-input"
                                />
                            </div>

                            {/* Bottone di conferma */}
                            <button className="confirm-add-btn" onClick={handleAddNewPlant}>
                                <Plus size={18} /> Salva nel Giardino
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modali di eliminazione e dettaglio */}
            {deletePrompt !== null && (
                <div className="modal-overlay" onClick={() => setDeletePrompt(null)}>
                    <div className="delete-dialog" onClick={e => e.stopPropagation()}>
                        <h3>Rimuovi Pianta</h3>
                        {(() => {
                            const plantToDelete = myPlants.find(p => p.id === deletePrompt);
                            return (
                                <>
                                    <p>{plantToDelete?.deathDate ? "Vuoi eliminare definitivamente questa pianta dal tuo cimitero?" : "Vuoi eliminare questa pianta definitivamente o dichiararne il decesso per tenerla come ricordo?"}</p>
                                    <div className="delete-actions">
                                        {!plantToDelete?.deathDate && (
                                            <button className="btn-dead" onClick={() => handleDeleteAction(deletePrompt, true)}><Skull size={16} /> È Morta</button>
                                        )}
                                        <button className="btn-delete" onClick={() => handleDeleteAction(deletePrompt, false)}><Trash2 size={16} /> Elimina Definitivamente</button>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Modale di dettaglio pianta */}
            {selectedPlant && (
                <div className="modal-overlay" onClick={() => setSelectedPlant(null)}>
                    <div className="plant-detail-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={() => setSelectedPlant(null)}><X size={24} /></button>

                        {/* Header con foto (ultimo post o scheda botanica) */}
                        <div className="detail-header" style={{ backgroundImage: `url(${(plantPosts.length > 0 ? (plantPosts[0].urlphoto || plantPosts[0].URLPhoto) : null) || selectedPlant.urlPhoto || selectedPlant.card?.urlDefaultPhoto})` }}>
                            <div className="detail-header-content">
                                {selectedPlant.deathDate && <span className="plant-status-badge dead-badge"><Skull size={12} /> Deceduta</span>}
                                {!selectedPlant.deathDate && <span className="plant-status-badge alive-badge"><Sprout size={12} /> In vita</span>}
                                <h2>{selectedPlant.plantName || selectedPlant.card?.commonName}</h2>
                                <p><i>{selectedPlant.card?.scientificName}</i></p>
                            </div>
                        </div>
                        <div className="detail-body">
                            {/* Scheda Botanica */}
                            <div className="detail-section">
                                <h4><Info size={16} /> Scheda Botanica</h4>
                                <ul>
                                    <li><strong>Famiglia:</strong> {selectedPlant.card?.family}</li>
                                    <li><strong>Esposizione:</strong> {selectedPlant.card?.exposure}</li>
                                    <li><strong>Terreno:</strong> {selectedPlant.card?.soil}</li>
                                    <li><strong>Concimazione:</strong> {selectedPlant.card?.fertilization}</li>
                                </ul>
                            </div>

                            {/* Timeline */}
                            <div className="detail-section">
                                <h4><CalendarHeart size={16} /> Timeline</h4>
                                <div className="timeline-placeholder">
                                    <div className="timeline-item">
                                        <span className="timeline-date">{new Date(selectedPlant.purchaseDate).toLocaleDateString()}</span>
                                        <span>Aggiunta al giardino</span>
                                    </div>
                                    {selectedPlant.deathDate && (
                                        <div className="timeline-item timeline-death">
                                            <span className="timeline-date">{new Date(selectedPlant.deathDate).toLocaleDateString()}</span>
                                            <span>Dichiarata morta</span>
                                        </div>
                                    )}
                                    <div className="timeline-item">
                                        <Droplets size={14} />
                                        <span>Irrigazione consigliata: {selectedPlant.card?.waterFrequencyDays || 'Regolare'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Galleria Post */}
                            <div className="detail-section">
                                <h4><ImageIcon size={16} /> Post ({plantPosts.length})</h4>
                                {loadingPosts ? (
                                    <div className="posts-loading"><Loader size={20} className="spin" /> Caricamento post...</div>
                                ) : plantPosts.length > 0 ? (
                                    <div className="plant-posts-grid">
                                        {plantPosts.map((post, index) => (
                                            <div key={post.id} className="plant-post-thumb" onClick={(e) => {
                                                e.stopPropagation();
                                                // Prepara i post come PostProps per il PostCard
                                                const cards: PostProps[] = plantPosts.map((p: any) => ({
                                                    id: p.id,
                                                    title: p.title,
                                                    description: p.description,
                                                    urlphoto: p.urlphoto || p.URLPhoto || '',
                                                    creationDate: p.creationDate,
                                                    author: p.author,
                                                    likesCount: p.likesCount ?? 0,
                                                    isLikedByMe: p.likedByMe ?? p.isLikedByMe ?? false,
                                                    commentsCount: p.commentsCount ?? 0,
                                                    onCommentUpdate: () => {},
                                                }));
                                                setPlantPostCards(cards);
                                                setSelectedPostIndex(index);
                                            }}>
                                                {(post.urlphoto || post.URLPhoto) ? (
                                                    <img src={(post.urlphoto || post.URLPhoto)!} alt={post.title} />
                                                ) : (
                                                    <div className="post-thumb-placeholder"><ImageIcon size={24} /></div>
                                                )}
                                                <div className="post-thumb-overlay">
                                                    <span><Heart size={12} /> {post.likesCount}</span>
                                                    <span><MessageCircle size={12} /> {post.commentsCount || 0}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted">Nessun post associato a questa pianta.</p>
                                )}
                            </div>
                        </div>

                        <div className="detail-footer">
                            <button className="btn-delete-full" onClick={() => { setDeletePrompt(selectedPlant.id); setSelectedPlant(null); }}><Trash2 size={18} /> {selectedPlant.deathDate ? 'Elimina definitivamente' : 'Rimuovi o segna come morta'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ MODALE POST SCROLLABILE (stile Profile) ═══ */}
            {selectedPostIndex !== null && (
                <div className="profile-post-modal-overlay" onClick={() => setSelectedPostIndex(null)}>
                    <div
                        className="profile-post-modal-scroll"
                        ref={modalScrollRef}
                        onClick={e => e.stopPropagation()}
                    >
                        {plantPostCards.map((post) => (
                            <div key={post.id} className="profile-modal-post">
                                <PostCard
                                    id={post.id}
                                    title={post.title}
                                    description={post.description}
                                    urlphoto={post.urlphoto}
                                    creationDate={post.creationDate}
                                    author={post.author}
                                    likesCount={post.likesCount}
                                    isLikedByMe={post.isLikedByMe}
                                    commentsCount={post.commentsCount}
                                    onLike={handleToggleLike}
                                    onCommentUpdate={() => {}}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}