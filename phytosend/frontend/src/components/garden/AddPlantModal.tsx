import { useEffect } from 'react';
import { X, Loader, Plus } from 'lucide-react';
import type { PlantSuggestion } from '../../types';

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
