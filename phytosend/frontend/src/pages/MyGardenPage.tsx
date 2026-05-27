import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Sprout, Skull, Loader, ArrowLeft, ChevronUp } from 'lucide-react';
import type { PostProps } from '../types';
import { apiFetch } from '../api';
import './ProfilePage.css';
import { WarningModal } from '../components/common/WarningModal';
import './MyGardenPage.css';

import { PlantCard } from '../components/garden/PlantCard';
import { AddPlantModal } from '../components/garden/AddPlantModal';
import { DeletePlantModal } from '../components/garden/DeletePlantModal';
import { PlantDetailModal } from '../components/garden/PlantDetailModal';
import { PostsScrollModal } from '../components/garden/PostsScrollModal';
import type { PlantItem, PostItem, PlantSuggestion } from '../types';

// Funzione principale che gestisce il giardino personale
export function MyGarden() {
    const { userId: paramUserId } = useParams<{ userId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const currentUserId = localStorage.getItem('phytosend_userId');

    // Se c'è un parametro nella URL, mostriamo il giardino di quell'utente
    const gardenUserId = paramUserId || currentUserId;
    const isOwnGarden = !paramUserId || paramUserId === currentUserId;

    // Nome del proprietario del giardino (per quando visitiamo il giardino di un altro utente)
    const [ownerName, setOwnerName] = useState<string>('');

    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
    const [postToDelete, setPostToDelete] = useState<number | null>(null);
    const [warningModal, setWarningModal] = useState<{ isOpen: boolean; title?: string; message: string; type?: 'warning' | 'error' }>({
        isOpen: false,
        message: '',
    });
    const modalScrollRef = useRef<HTMLDivElement>(null);

    // Effetto per il caricamento iniziale del giardino
    useEffect(() => {
        window.scrollTo(0, 0);
        const token = localStorage.getItem('phytosend_token');

        setLoading(true);
        setMyPlants([]);
        setPlantPhotoMap({});
        setOwnerName('');

        // Se stiamo visitando il giardino di un altro utente, carichiamo il suo nome
        if (!isOwnGarden && gardenUserId) {
            apiFetch(`/api/utenti/${gardenUserId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data) setOwnerName(`${data.name} ${data.surname}`);
                })
                .catch(err => console.error("Errore caricamento nome proprietario:", err));
        }

        apiFetch(`/api/utenti/${gardenUserId}/piante`, {
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
        apiFetch(`/api/social/posts/user/${gardenUserId}?utenteId=${currentUserId}`, {
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
    }, [gardenUserId]);

    // Effetto per aprire automaticamente il popup della pianta se plantId è nella URL
    useEffect(() => {
        const plantIdParam = searchParams.get('plantId');
        if (plantIdParam && myPlants.length > 0) {
            const targetPlant = myPlants.find(p => p.id === Number(plantIdParam));
            if (targetPlant) {
                setSelectedPlant(targetPlant);
            }
        }
    }, [myPlants, searchParams]);

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
                const res = await apiFetch(`/api/catalogo/ricerca?q=${encodeURIComponent(searchQuery)}&page=0&size=5`, {
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

        apiFetch(`/api/social/posts/plant/${selectedPlant.id}?utenteId=${userId}`, {
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

        apiFetch(`/api/social/posts/${postId}/like?utenteId=${userId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        }).catch(console.error);
    };

    // Gestione save dalla modale post
    const handleToggleSave = (postId: number) => {
        const userId = localStorage.getItem('phytosend_userId');
        const token = localStorage.getItem('phytosend_token');

        setPlantPostCards(prev => prev.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    isSavedByMe: !post.isSavedByMe
                };
            }
            return post;
        }));

        apiFetch(`/api/social/posts/${postId}/save?utenteId=${userId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        }).catch(console.error);
    };

    // Gestione delete dalla modale post
    const handleDeletePost = async () => {
        if (postToDelete === null) return;
        const postId = postToDelete;
        const userId = localStorage.getItem('phytosend_userId');
        const token = localStorage.getItem('phytosend_token');

        try {
            const response = await apiFetch(`/api/social/posts/${postId}?utenteId=${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setPlantPostCards(prev => prev.filter(p => p.id !== postId));
                setPlantPosts(prev => prev.filter(p => p.id !== postId));
                setSelectedPostIndex(null);
            } else {
                setWarningModal({
                    isOpen: true,
                    title: 'Errore eliminazione',
                    message: 'Impossibile eliminare il post. Riprova più tardi.',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error("Errore eliminazione post", error);
        } finally {
            setPostToDelete(null);
        }
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
        if (!newPlantCardId) {
            setWarningModal({
                isOpen: true,
                title: 'Specie non valida!',
                message: 'Seleziona una specie valida dal catalogo botanico!',
                type: 'warning'
            });
            return;
        }

        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');

        try {
            const response = await apiFetch(`/api/utenti/${userId}/piante`, {
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
                setWarningModal({
                    isOpen: true,
                    title: 'Errore durante il salvataggio',
                    message: `Non è stato possibile aggiungere la pianta: ${errText}`,
                    type: 'error'
                });
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
            const response = await apiFetch(`/api/utenti/${userId}/piante/${plantId}/name`, {
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

    // Funzione per rimuovere il soprannome
    const handleRemoveNickname = async (e: React.MouseEvent, plantId: number) => {
        e.stopPropagation();
        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');

        try {
            const response = await apiFetch(`/api/utenti/${userId}/piante/${plantId}/name`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ newName: "" })
            });

            if (response.ok) {
                setMyPlants(prev => prev.map(p => p.id === plantId ? { ...p, plantName: "" } : p));
                if (selectedPlant?.id === plantId) {
                    setSelectedPlant(prev => prev ? { ...prev, plantName: "" } : null);
                }
            }
        } catch (error) {
            console.error("Errore rimozione soprannome", error);
        }
    };

    // Funzione per eliminare la pianta dal giardino o segnarla come morta
    const handleDeleteAction = async (plantId: number, markAsDead: boolean) => {
        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');

        try {
            if (markAsDead) {
                await apiFetch(`/api/utenti/${userId}/piante/${plantId}/dead`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setMyPlants(prev => prev.map(p => p.id === plantId ? { ...p, deathDate: new Date().toISOString() } : p));
            } else {
                const response = await apiFetch(`/api/utenti/${userId}/piante/${plantId}`, {
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

    return (
        <>
            <div className="my-garden-page">

                {/* Pulsante Vai al Profilo (visibile solo se visitiamo il giardino di un altro utente) */}
                {!isOwnGarden && (
                    <button
                        className="back-to-profile-btn"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={18} /> Indietro
                    </button>
                )}

                {/* Header della pagina del giardino */}
                <header className="garden-header">
                    <div className="header-title">
                        {isOwnGarden ? (
                            <h1>
                                <span className="garden-leaf-icon garden-leaf-left">🌿</span>
                                <span className="garden-title-text">Il mio Giardino</span>
                                <span className="garden-leaf-icon garden-leaf-right">🌿</span>
                            </h1>
                        ) : (
                            <h1>
                                <span className="garden-leaf-icon garden-leaf-left">🌿</span>
                                <span className="garden-title-text">
                                    Giardino di<br />
                                    <Link to={`/profile/${gardenUserId}`} className="garden-owner-link">
                                        {ownerName || 'Utente'}
                                    </Link>
                                </span>
                                <span className="garden-leaf-icon garden-leaf-right">🌿</span>
                            </h1>
                        )}
                    </div>
                    {/* Descrizione */}
                    <p className="garden-subtitle">{isOwnGarden ? 'La tua collezione personale di piante certificate Phytosend.' : `Esplora le piante di ${ownerName || 'questo utente'}.`}</p>
                    {/* Bottone Aggiungi Pianta nel header */}
                    {isOwnGarden && (
                        <button className="add-plant-btn garden-header-btn" onClick={() => setIsAddModalOpen(true)}>
                            <Plus size={18} /> Aggiungi Pianta
                        </button>
                    )}
                </header>

                {/* Contenuto del giardino */}
                <div className="garden-content">
                    {/* Indicatore di caricamento */}
                    {loading ? (
                        <div className="empty-garden">
                            <Loader size={36} className="spin" />
                            <p>Caricamento del giardino...</p>
                        </div>
                    ) : myPlants.length === 0 ? (
                        <div className="empty-garden">
                            <Sprout size={56} className="empty-icon" />
                            <h2>{isOwnGarden ? 'Il tuo giardino è ancora vuoto' : 'Questo giardino è ancora vuoto'}</h2>
                            <p>{isOwnGarden ? 'Aggiungi la tua prima pianta collegandola a una scheda botanica!' : `${ownerName || 'Questo utente'} non ha ancora aggiunto piante.`}</p>
                            {isOwnGarden && (
                                <button className="add-plant-btn" onClick={() => setIsAddModalOpen(true)}>
                                    <Plus size={18} /> Aggiungi Pianta
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="garden-lists-container">

                            {/* Sezione piante vive */}
                            {myPlants.filter(p => !p.deathDate).length > 0 && (
                                <div className="alive-section">
                                    <div className="list-grid">
                                        {myPlants.filter(p => !p.deathDate).map(plant => (
                                            <PlantCard
                                                key={plant.id}
                                                plant={plant}
                                                plantPhotoMap={plantPhotoMap}
                                                isOwnGarden={isOwnGarden}
                                                editingPlantId={editingPlantId}
                                                editNameValue={editNameValue}
                                                setEditingPlantId={setEditingPlantId}
                                                setEditNameValue={setEditNameValue}
                                                handleSaveName={handleSaveName}
                                                handleRemoveNickname={handleRemoveNickname}
                                                setDeletePrompt={setDeletePrompt}
                                                setSelectedPlant={setSelectedPlant}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Sezione piante morte */}
                            {myPlants.filter(p => p.deathDate).length > 0 && (
                                <div className="dead-section">
                                    <h3><Skull size={18} /> Il cimitero delle piante</h3>
                                    <div className="list-grid">
                                        {myPlants.filter(p => p.deathDate).map(plant => (
                                            <PlantCard
                                                key={plant.id}
                                                plant={plant}
                                                plantPhotoMap={plantPhotoMap}
                                                isOwnGarden={isOwnGarden}
                                                editingPlantId={editingPlantId}
                                                editNameValue={editNameValue}
                                                setEditingPlantId={setEditingPlantId}
                                                setEditNameValue={setEditNameValue}
                                                handleSaveName={handleSaveName}
                                                handleRemoveNickname={handleRemoveNickname}
                                                setDeletePrompt={setDeletePrompt}
                                                setSelectedPlant={setSelectedPlant}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <AddPlantModal
                isOpen={isAddModalOpen}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                newPlantCardId={newPlantCardId}
                setNewPlantCardId={setNewPlantCardId}
                newPlantName={newPlantName}
                setNewPlantName={setNewPlantName}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
                suggestions={suggestions}
                isSearching={isSearching}
                handleSelectSuggestion={handleSelectSuggestion}
                handleCloseModal={handleCloseModal}
                handleAddNewPlant={handleAddNewPlant}
            />

            <DeletePlantModal
                deletePrompt={deletePrompt}
                myPlants={myPlants}
                setDeletePrompt={setDeletePrompt}
                handleDeleteAction={handleDeleteAction}
            />

            <PlantDetailModal
                selectedPlant={selectedPlant}
                setSelectedPlant={setSelectedPlant}
                plantPosts={plantPosts}
                loadingPosts={loadingPosts}
                setPlantPostCards={setPlantPostCards}
                setSelectedPostIndex={setSelectedPostIndex}
                isOwnGarden={isOwnGarden}
                setDeletePrompt={setDeletePrompt}
                setMyPlants={setMyPlants}
            />

            <PostsScrollModal
                selectedPostIndex={selectedPostIndex}
                setSelectedPostIndex={setSelectedPostIndex}
                plantPostCards={plantPostCards}
                handleToggleLike={handleToggleLike}
                handleToggleSave={handleToggleSave}
                handleDeleteClick={setPostToDelete}
            />

            {/* POP-UP DI CONFERMA ELIMINAZIONE POST */}
            {postToDelete !== null && (
                <div className="comment-overlay" onClick={() => setPostToDelete(null)} style={{ zIndex: 9999 }}>
                    <div className="delete-modal" onClick={e => e.stopPropagation()}>
                        <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Skull color="var(--color-error)" size={24} /> Elimina Post
                        </h3>
                        <p style={{ marginBottom: '20px', color: 'var(--color-text-main)' }}>Sei sicuro di voler eliminare definitivamente questo post?</p>

                        <div className="delete-modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setPostToDelete(null)}
                                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-main)' }}
                            >
                                Annulla
                            </button>
                            <button
                                onClick={handleDeletePost}
                                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--color-error)', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Elimina
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <WarningModal
                isOpen={warningModal.isOpen}
                onClose={() => setWarningModal(prev => ({ ...prev, isOpen: false }))}
                title={warningModal.title}
                message={warningModal.message}
                type={warningModal.type}
            />

            {showScrollTop && (
                <button className="scroll-to-top-btn" onClick={scrollToTop} aria-label="Torna in cima">
                    <ChevronUp size={24} />
                </button>
            )}
        </>
    );
}