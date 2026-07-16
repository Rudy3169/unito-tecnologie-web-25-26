import React from 'react';
import { Skull, Droplets, Pencil, Check, X, Trash2, Plus } from 'lucide-react';
import type { PlantItem } from '../../types';

/**
 * COMPONENTE PLANT CARD
 * Rappresenta la singola essenza vegetale nel "MyGarden" dell'utente.
 * Supporta l'Inline Editing (modifica diretta senza cambiare pagina) per il soprannome 
 * e il calcolo dinamico UX-friendly dei giorni mancanti alla prossima irrigazione.
 */

interface PlantCardProps {
    plant: PlantItem; // Oggetto che rappresenta la pianta
    plantPhotoMap: Record<number, string>; // Mappa delle foto delle piante
    isOwnGarden: boolean; // Indica se il giardino è proprio
    editingPlantId: number | null; // ID della pianta in fase di modifica
    editNameValue: string; // Valore del nome della pianta in fase di modifica
    setEditingPlantId: (id: number | null) => void; // Funzione per impostare l'ID della pianta in fase di modifica
    setEditNameValue: (val: string) => void; // Funzione per impostare il nome della pianta in fase di modifica
    handleSaveName: (e: React.MouseEvent, id: number) => void; // Funzione per salvare il nome della pianta
    handleRemoveNickname: (e: React.MouseEvent, id: number) => void; // Funzione per rimuovere il soprannome
    setDeletePrompt: (id: number) => void; // Funzione per impostare l'eliminazione
    setSelectedPlant: (plant: PlantItem) => void; // Funzione per impostare la pianta selezionata
}

export function PlantCard({
    plant, // Oggetto che rappresenta la pianta
    plantPhotoMap, // Mappa delle foto delle piante
    isOwnGarden, // Indica se il giardino è proprio
    editingPlantId, // ID della pianta in fase di modifica
    editNameValue, // Valore del nome della pianta in fase di modifica
    setEditingPlantId, // Funzione per impostare l'ID della pianta in fase di modifica
    setEditNameValue, // Funzione per impostare il nome della pianta in fase di modifica
    handleSaveName, // Funzione per salvare il nome della pianta
    handleRemoveNickname, // Funzione per rimuovere il soprannome
    setDeletePrompt, // Funzione per impostare l'eliminazione
    setSelectedPlant // Funzione per impostare la pianta selezionata
}: PlantCardProps) {

    // Calcola il nome visualizzato (o soprannome o nome comune o sconosciuta)
    const displayName = plant.card?.commonName || 'Pianta Sconosciuta';
    // Controlla se la pianta ha un soprannome
    const hasNickname = !!plant.plantName && plant.plantName.trim() !== '';
    // Ottiene l'URL della foto della pianta o quella predefinita
    const imgUrl = plantPhotoMap[plant.id] || plant.urlPhoto || plant.card?.urlDefaultPhoto || '/placeholder-plant.png';

    // ==========================================
    // CALCOLO DATE LATO CLIENT (UX)
    // ==========================================
    // Invece di far calcolare stringhe statiche al server ("Tra 3 giorni"), 
    // confrontiamo la data di scadenza (UTC) con la mezzanotte locale del client.
    // Questo garantisce che se l'utente cambia fuso orario, il badge rimanga accurato.
    const getWateringText = () => {
        // Se non c'è una data di irrigazione, calcola la frequenza
        if (!plant.nextWateringDate) {
            const freq = plant.card?.waterFrequencyDays;
            if (freq) {
                const numFreq = parseInt(freq, 10);
                if (!isNaN(numFreq) && numFreq > 0) {
                    return `tra ${numFreq} giorn${numFreq === 1 ? 'o' : 'i'}`;
                }
            }
            return 'da pianificare';
        }

        // Data odierna (solo giorno, senza orario) per confronto
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Data di irrigazione (solo giorno, senza orario)
        const nextWatering = new Date(plant.nextWateringDate);
        nextWatering.setHours(0, 0, 0, 0);

        // Differenza in giorni
        const diffTime = nextWatering.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            return `tra ${diffDays} giorn${diffDays === 1 ? 'o' : 'i'}`;
        } else if (diffDays === 0) {
            return <strong style={{ color: '#0ea5e9' }}>Oggi</strong>;
        } else {
            const absDays = Math.abs(diffDays);
            return <strong style={{ color: '#ef4444' }}>In ritardo di {absDays} giorn{absDays === 1 ? 'o' : 'i'}</strong>;
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
