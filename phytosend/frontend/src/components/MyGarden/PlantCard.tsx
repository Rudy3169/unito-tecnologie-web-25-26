import React from 'react';
import { Skull, Droplets, Pencil, Check, X, Trash2 } from 'lucide-react';
import type { PlantItem } from './types';

interface PlantCardProps {
    plant: PlantItem;
    plantPhotoMap: Record<number, string>;
    isOwnGarden: boolean;
    editingPlantId: number | null;
    editNameValue: string;
    setEditingPlantId: (id: number | null) => void;
    setEditNameValue: (val: string) => void;
    handleSaveName: (e: React.MouseEvent, id: number) => void;
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
    setDeletePrompt,
    setSelectedPlant
}: PlantCardProps) {
    const displayName = plant.card?.commonName || 'Pianta Sconosciuta';
    const hasNickname = !!plant.plantName && plant.plantName.trim() !== '';
    const imgUrl = plantPhotoMap[plant.id] || plant.urlPhoto || plant.card?.urlDefaultPhoto || '/placeholder-plant.png';

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
                            <button className="btn-icon-delete" onClick={(e) => { e.stopPropagation(); setDeletePrompt(plant.id); }}>
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>

                    {editingPlantId === plant.id ? (
                        <div className="edit-name-inline" onClick={e => e.stopPropagation()}>
                            <input
                                autoFocus
                                value={editNameValue}
                                onChange={e => setEditNameValue(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSaveName(e as any, plant.id)}
                            />
                            <button className="btn-icon-save" onClick={e => handleSaveName(e, plant.id)}><Check size={16} /></button>
                            <button className="btn-icon-cancel" onClick={() => setEditingPlantId(null)}><X size={16} /></button>
                        </div>
                    ) : (
                        <div className="garden-card-nickname-row">
                            <span className="garden-card-nickname">{hasNickname ? plant.plantName : 'Senza nome'}</span>
                            {isOwnGarden && (
                                <button className="btn-icon-edit" onClick={(e) => {
                                    e.stopPropagation();
                                    setEditNameValue(plant.plantName || "");
                                    setEditingPlantId(plant.id);
                                }}>
                                    <Pencil size={14} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="garden-card-events">
                <Droplets size={14} /> Prossima irrigazione: tra {plant.card?.waterFrequencyDays || 'Regolare'} giorni
            </div>
        </div>
    );
}
