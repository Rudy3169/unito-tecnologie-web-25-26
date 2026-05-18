import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Loader, Plus, Skull, Trash2, Sprout, Info, CalendarHeart, Droplets, Image as ImageIcon, Heart, MessageCircle, ArrowLeft } from 'lucide-react';
import { PostCard } from '../Feed/PostCard';
import type { PostProps } from '../Feed/PostCard';
import type { PlantItem, PlantSuggestion, PostItem } from './types';

interface AddPlantModalProps {
    isOpen: boolean;
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    newPlantCardId: string;
    setNewPlantCardId: (val: string) => void;
    newPlantName: string;
    setNewPlantName: (val: string) => void;
    showSuggestions: boolean;
    setShowSuggestions: (val: boolean) => void;
    suggestions: PlantSuggestion[];
    isSearching: boolean;
    handleSelectSuggestion: (s: PlantSuggestion) => void;
    handleCloseModal: () => void;
    handleAddNewPlant: () => void;
}

export function AddPlantModal({
    isOpen, searchQuery, setSearchQuery, setNewPlantCardId, newPlantName, setNewPlantName,
    showSuggestions, setShowSuggestions, suggestions, isSearching, handleSelectSuggestion, handleCloseModal, handleAddNewPlant
}: AddPlantModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('add-plant-modal-open');
        } else {
            document.body.classList.remove('add-plant-modal-open');
        }
        return () => {
            document.body.classList.remove('add-plant-modal-open');
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
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
    );
}


interface DeletePlantModalProps {
    deletePrompt: number | null;
    myPlants: PlantItem[];
    setDeletePrompt: (val: number | null) => void;
    handleDeleteAction: (id: number, markAsDead: boolean) => void;
}

export function DeletePlantModal({ deletePrompt, myPlants, setDeletePrompt, handleDeleteAction }: DeletePlantModalProps) {
    const [confirmAction, setConfirmAction] = useState<'dead' | 'delete' | null>(null);

    // Resetta lo stato di conferma quando la modale viene chiusa o riaperta
    useEffect(() => {
        if (deletePrompt === null) {
            setConfirmAction(null);
        }
    }, [deletePrompt]);

    // Blocco dello scroll del body quando la modale di eliminazione pianta è aperta
    useEffect(() => {
        if (deletePrompt !== null) {
            document.body.classList.add('delete-plant-modal-open');
        } else {
            document.body.classList.remove('delete-plant-modal-open');
        }
        return () => {
            document.body.classList.remove('delete-plant-modal-open');
        };
    }, [deletePrompt]);

    if (deletePrompt === null) return null;
    const plantToDelete = myPlants.find(p => p.id === deletePrompt);

    const handleConfirm = () => {
        if (confirmAction) {
            handleDeleteAction(deletePrompt, confirmAction === 'dead');
            setConfirmAction(null);
        }
    };

    return (
        <div className="modal-overlay" onClick={() => setDeletePrompt(null)}>
            <div className="delete-dialog" onClick={e => e.stopPropagation()}>
                {confirmAction !== null ? (
                    <div key="confirm-step">
                        <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0 0 12px 0' }}>
                            {confirmAction === 'dead' ? <Skull size={20} color="var(--color-text-main)" /> : <Trash2 size={20} color="var(--color-error)" />}
                            Conferma {confirmAction === 'dead' ? 'Decesso' : 'Eliminazione'}
                        </h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', margin: '0 0 24px 0', lineHeight: '1.5' }}>
                            {confirmAction === 'dead'
                                ? `Sei sicuro di voler dichiarare il decesso di "${plantToDelete?.plantName || plantToDelete?.card?.commonName}"? Verrà spostata nel cimitero delle piante per conservarne i ricordi.`
                                : `Sei sicuro di voler eliminare definitivamente "${plantToDelete?.plantName || plantToDelete?.card?.commonName}"? Questa azione è irreversibile.`
                            }
                        </p>
                        <div className="delete-actions-horizontal">
                            <button className="btn-cancel" onClick={() => setConfirmAction(null)}>Annulla</button>
                            <button className={confirmAction === 'dead' ? 'btn-dead' : 'btn-delete'} onClick={handleConfirm}>
                                {confirmAction === 'dead' ? 'Conferma' : 'Elimina'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div key="select-step">
                        <h3>Rimuovi Pianta</h3>
                        <p>{plantToDelete?.deathDate ? "Vuoi eliminare definitivamente questa pianta dal tuo cimitero?" : "Vuoi eliminare questa pianta definitivamente o dichiararne il decesso per tenerla come ricordo?"}</p>
                        <div className="delete-actions">
                            {!plantToDelete?.deathDate && (
                                <button className="btn-dead" onClick={() => setConfirmAction('dead')}><Skull size={16} /> È Morta</button>
                            )}
                            <button className="btn-delete" onClick={() => setConfirmAction('delete')}><Trash2 size={16} /> Elimina Definitivamente</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


interface PlantDetailModalProps {
    selectedPlant: PlantItem | null;
    setSelectedPlant: (val: PlantItem | null) => void;
    plantPosts: PostItem[];
    loadingPosts: boolean;
    setPlantPostCards: (cards: PostProps[]) => void;
    setSelectedPostIndex: (index: number | null) => void;
    isOwnGarden: boolean;
    setDeletePrompt: (id: number) => void;
}

export function PlantDetailModal({
    selectedPlant, setSelectedPlant, plantPosts, loadingPosts,
    setPlantPostCards, setSelectedPostIndex, isOwnGarden, setDeletePrompt
}: PlantDetailModalProps) {
    useEffect(() => {
        if (selectedPlant !== null) {
            document.body.classList.add('plant-detail-modal-open');
        } else {
            document.body.classList.remove('plant-detail-modal-open');
        }
        return () => {
            document.body.classList.remove('plant-detail-modal-open');
        };
    }, [selectedPlant]);

    if (!selectedPlant) return null;

    return (
        <div className="modal-overlay" onClick={() => setSelectedPlant(null)}>
            <div className="plant-detail-modal" onClick={e => e.stopPropagation()}>
                <button className="close-modal-btn" onClick={() => setSelectedPlant(null)}><X size={24} /></button>

                <div className="detail-header" style={{ backgroundImage: `url(${(plantPosts.length > 0 ? (plantPosts[0].urlphoto || plantPosts[0].URLPhoto) : null) || selectedPlant.urlPhoto || selectedPlant.card?.urlDefaultPhoto})` }}>
                    <div className="detail-header-content">
                        {selectedPlant.deathDate && <span className="plant-status-badge dead-badge"><Skull size={12} /> Deceduta</span>}
                        {!selectedPlant.deathDate && <span className="plant-status-badge alive-badge"><Sprout size={12} /> In vita</span>}
                        <h2>{selectedPlant.plantName || selectedPlant.card?.commonName}</h2>
                        <p><i>{selectedPlant.card?.scientificName}</i></p>
                    </div>
                </div>
                <div className="detail-body">
                    <div className="detail-section">
                        <h4>
                            {selectedPlant.card?.id ? (
                                <Link to={`/plant/${selectedPlant.card.id}`} className="scheda-botanica-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                    <Info size={16} /> Scheda Botanica
                                </Link>
                            ) : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                    <Info size={16} /> Scheda Botanica
                                </span>
                            )}
                        </h4>
                        <ul>
                            <li><strong>Famiglia:</strong> {selectedPlant.card?.family}</li>
                            <li><strong>Esposizione:</strong> {selectedPlant.card?.exposure}</li>
                            <li><strong>Terreno:</strong> {selectedPlant.card?.soil}</li>
                            <li><strong>Concimazione:</strong> {selectedPlant.card?.fertilization}</li>
                        </ul>
                    </div>

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
                            {!selectedPlant.deathDate && (
                                <div className="timeline-item">
                                    <Droplets size={14} />
                                    <span>Irrigazione consigliata: ogni {selectedPlant.card?.waterFrequencyDays || 'Regolare'} giorni</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="detail-section">
                        <h4><ImageIcon size={16} /> Post ({plantPosts.length})</h4>
                        {loadingPosts ? (
                            <div className="posts-loading"><Loader size={20} className="spin" /> Caricamento post...</div>
                        ) : plantPosts.length > 0 ? (
                            <div className="plant-posts-grid">
                                {plantPosts.map((post, index) => (
                                    <div key={post.id} className="plant-post-thumb" onClick={(e) => {
                                        e.stopPropagation();
                                        const cards: PostProps[] = plantPosts.map((p: any) => ({
                                            id: p.id,
                                            title: p.title,
                                            description: p.description,
                                            urlphoto: p.urlphoto || p.URLPhoto || '',
                                            creationDate: p.creationDate,
                                            author: p.author,
                                            plant: p.plant,
                                            likesCount: p.likesCount ?? 0,
                                            isLikedByMe: p.likedByMe ?? p.isLikedByMe ?? false,
                                            isSavedByMe: p.savedByMe ?? p.isSavedByMe ?? false,
                                            commentsCount: p.commentsCount ?? 0,
                                            onCommentUpdate: () => { },
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

                {isOwnGarden && (
                    <div className="detail-footer">
                        <button className="btn-delete-full" onClick={() => { setDeletePrompt(selectedPlant.id); setSelectedPlant(null); }}>
                            <Trash2 size={18} />
                            <span>
                                {selectedPlant.deathDate ? (
                                    'Elimina definitivamente'
                                ) : (
                                    <>
                                        Rimuovi o <br className="mobile-br" /> segna come morta
                                    </>
                                )}
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}


interface PostsScrollModalProps {
    selectedPostIndex: number | null;
    setSelectedPostIndex: (val: number | null) => void;
    plantPostCards: PostProps[];
    handleToggleLike: (postId: number) => void;
    handleToggleSave: (postId: number) => void;
    handleDeleteClick: (postId: number) => void;
}

export function PostsScrollModal({
    selectedPostIndex, setSelectedPostIndex, plantPostCards, handleToggleLike, handleToggleSave, handleDeleteClick
}: PostsScrollModalProps) {
    const modalScrollRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        if (selectedPostIndex === null) return;
        document.body.classList.add('post-modal-open');
        const handleCloseModal = () => setSelectedPostIndex(null);
        window.addEventListener('close-post-modal', handleCloseModal);
        return () => {
            document.body.classList.remove('post-modal-open');
            window.removeEventListener('close-post-modal', handleCloseModal);
        };
    }, [selectedPostIndex, setSelectedPostIndex]);

    if (selectedPostIndex === null) return null;

    return (
        <div className="profile-post-modal-overlay" onClick={() => setSelectedPostIndex(null)}>
            <div
                className="profile-post-modal-scroll"
                ref={modalScrollRef}
                onClick={e => e.stopPropagation()}
            >
                {/* Sticky Header Bar in stile Instagram Mobile */}
                <div className="modal-sticky-header">
                    <button className="modal-back-btn" onClick={() => setSelectedPostIndex(null)} aria-label="Indietro">
                        <ArrowLeft size={22} />
                    </button>
                    <span className="modal-header-title">Post</span>
                    <div style={{ width: '34px' }} /> {/* Spacer per allineamento simmetrico */}
                </div>

                {plantPostCards.map((post) => (
                    <div key={post.id} className="profile-modal-post">
                        <PostCard
                            id={post.id}
                            title={post.title}
                            description={post.description}
                            urlphoto={post.urlphoto}
                            creationDate={post.creationDate}
                            author={post.author}
                            plant={post.plant}
                            likesCount={post.likesCount}
                            isLikedByMe={post.isLikedByMe}
                            isSavedByMe={post.isSavedByMe}
                            commentsCount={post.commentsCount}
                            onLike={handleToggleLike}
                            onSave={handleToggleSave}
                            onDelete={handleDeleteClick}
                            onCommentUpdate={() => { }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
