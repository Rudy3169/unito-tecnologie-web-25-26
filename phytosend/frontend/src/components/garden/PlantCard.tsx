import React from 'react';
import { Skull, Droplets, Pencil, Check, X, Trash2, Plus } from 'lucide-react';
import type { PlantItem } from '../../types';

interface PlantCardProps {
    plant: PlantItem;
    plantPhotoMap: Record<number, string>;
    isOwnGarden: boolean;
    editingPlantId: number | null;
    editNameValue: string;
    setEditingPlantId: (id: number | null) => void;
    setEditNameValue: (val: string) => void;
    handleSaveName: (e: React.MouseEvent, id: number) => void;
    handleRemoveNickname: (e: React.MouseEvent, id: number) => void;
    setDeletePrompt: (id: number) => void;
    setSelectedPlant: (plant: PlantItem) => void;
}

export function PlantCard({
    plant,
    plantPhotoMap,
    isOwnGarden,
    editingPlantId,
    editNameValue,
    setEditingPlantId,
    setEditNameValue,
    handleSaveName,
    handleRemoveNickname,
    setDeletePrompt,
    setSelectedPlant
}: PlantCardProps) {
    const displayName = plant.card?.commonName || 'Pianta Sconosciuta';
    const hasNickname = !!plant.plantName && plant.plantName.trim() !== '';
    const imgUrl = plantPhotoMap[plant.id] || plant.urlPhoto || plant.card?.urlDefaultPhoto || '/placeholder-plant.png';

    const getWateringText = () => {
        if (!plant.nextWateringDate) {
            return `tra ${plant.card?.waterFrequencyDays || 'Regolare'} giorni`;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const nextWatering = new Date(plant.nextWateringDate);
        nextWatering.setHours(0, 0, 0, 0);

        const diffTime = nextWatering.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            return `tra ${diffDays} giorni`;
        } else if (diffDays === 0) {
            return <strong style={{ color: '#0ea5e9' }}>Oggi</strong>;
        } else {
            return <strong style={{ color: '#ef4444' }}>In ritardo di {Math.abs(diffDays)} giorni</strong>;
        }
    };

    return (
        <div className={`garden-list-card ${plant.deathDate ? 'dead-card' : ''}`} onClick={() => setSelectedPlant(plant)}>
            <div className="garden-card-top">
                <div className="garden-card-img" style={{ backgroundImage: `url(${imgUrl})` }}>
                    {plant.deathDate && <div className="dead-overlay"><Skull size={24} /></div>}
                </div>
                <div className="garden-card-info">
                    <div className="garden-card-header">
                        <span className="garden-card-species">{displayName}</span>
                        {isOwnGarden && (
                            <button className="btn-icon-delete" onClick={(e) => { e.stopPropagation(); setDeletePrompt(plant.id); }} title="Elimina pianta">
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>

                    {editingPlantId === plant.id ? (
                        <div className="edit-name-inline" onClick={e => e.stopPropagation()}>
                            <input
                                autoFocus
                                className="edit-name-input"
                                value={editNameValue}
                                onChange={e => setEditNameValue(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSaveName(e as any, plant.id)}
                                placeholder="Soprannome..."
                            />
                            <div className="edit-actions-group">
                                <button className="btn-save-nick" onClick={e => handleSaveName(e, plant.id)} title="Salva">
                                    <Check size={16} />
                                </button>
                                <button className="btn-cancel-nick" onClick={() => setEditingPlantId(null)} title="Annulla">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {(hasNickname || isOwnGarden) && (
                                <div className="garden-card-nickname-row">
                                    {hasNickname ? (
                                        <div className="nickname-display">
                                            <span className="garden-card-nickname">{plant.plantName}</span>
                                            {isOwnGarden && (
                                                <div className="nickname-actions">
                                                    <button className="btn-mini-edit" onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditNameValue(plant.plantName || "");
                                                        setEditingPlantId(plant.id);
                                                    }} title="Modifica soprannome">
                                                        <Pencil size={12} />
                                                    </button>
                                                    <button className="btn-mini-remove" onClick={(e) => handleRemoveNickname(e, plant.id)} title="Rimuovi soprannome">
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <button className="add-nickname-btn" onClick={(e) => {
                                            e.stopPropagation();
                                            setEditNameValue("");
                                            setEditingPlantId(plant.id);
                                        }}>
                                            <Plus size={14} /> Aggiungi soprannome
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            {!plant.deathDate && (
                <div className="garden-card-events">
                    <Droplets size={14} /> Prossima irrigazione: {getWateringText()}
                </div>
            )}
        </div>
    );
}
