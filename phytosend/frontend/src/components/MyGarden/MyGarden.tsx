import { useState, useEffect } from 'react';
import { Fence, Droplets, CalendarHeart, Trash2, Pencil, Check, X, Skull, Info, Image as ImageIcon } from 'lucide-react';
import './MyGarden.css';

interface PlantItem {
    id: number;
    plantName?: string;
    urlPhoto?: string; // Foto dell'ultimo post o della pianta
    purchaseDate: string;
    isDead?: boolean; // Flag per capire se è morta
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

export function MyGarden() {
    const [myPlants, setMyPlants] = useState<PlantItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingPlantId, setEditingPlantId] = useState<number | null>(null);
    const [editNameValue, setEditNameValue] = useState("");

    const [selectedPlant, setSelectedPlant] = useState<PlantItem | null>(null);
    const [deletePrompt, setDeletePrompt] = useState<number | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');

        fetch(`/api/utenti/${userId}/piante`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setMyPlants(data || []))
            .catch(err => console.error("Errore recupero giardino:", err))
            .finally(() => setLoading(false));
    }, []);

    // SALVATAGGIO NOME
    const handleSaveName = async (e: React.MouseEvent, plantId: number) => {
        e.stopPropagation(); // Evita di aprire la modale
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

    // ELIMINAZIONE / MORTE
    const handleDeleteAction = async (plantId: number, markAsDead: boolean) => {
        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');

        try {
            if (markAsDead) {
                // Endpoint da creare nel backend per segnare come morta
                await fetch(`/api/utenti/${userId}/piante/${plantId}/dead`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                // Aggiorna frontend istantaneamente
                setMyPlants(prev => prev.map(p => p.id === plantId ? { ...p, isDead: true } : p));
            } else {
                // Eliminazione fisica definitiva
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

    const alivePlants = myPlants.filter(p => !p.isDead);
    const deadPlants = myPlants.filter(p => p.isDead);

    // COMPONENTE CARD SINGOLA
    const PlantCard = ({ plant }: { plant: PlantItem }) => {
        const displayName = plant.card?.commonName || 'Pianta Sconosciuta';
        const nickname = plant.plantName || 'Nessun nickname';
        const imgUrl = plant.urlPhoto || plant.card?.urlDefaultPhoto || '/placeholder-plant.png';

        return (
            <div className={`garden-list-card ${plant.isDead ? 'dead-card' : ''}`} onClick={() => setSelectedPlant(plant)}>
                <div className="garden-card-top">
                    {/* FOTO (Sinistra) */}
                    <div className="garden-card-img" style={{ backgroundImage: `url(${imgUrl})` }}>
                        {plant.isDead && <div className="dead-overlay"><Skull size={24} /></div>}
                    </div>

                    {/* INFO (Destra) */}
                    <div className="garden-card-info">
                        <div className="garden-card-header">
                            <h3 className="common-name">{displayName}</h3>
                            <button
                                className="delete-icon-btn"
                                onClick={(e) => { e.stopPropagation(); setDeletePrompt(plant.id); }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="garden-card-nickname">
                            {editingPlantId === plant.id ? (
                                <div className="edit-inline" onClick={e => e.stopPropagation()}>
                                    <input autoFocus value={editNameValue} onChange={e => setEditNameValue(e.target.value)} className="edit-input-small" />
                                    <button className="icon-btn ok" onClick={(e) => handleSaveName(e, plant.id)}><Check size={14} /></button>
                                    <button className="icon-btn no" onClick={() => setEditingPlantId(null)}><X size={14} /></button>
                                </div>
                            ) : (
                                <div className="view-inline">
                                    <span className="nick-text">"{nickname}"</span>
                                    {!plant.isDead && (
                                        <button className="edit-pencil-btn" onClick={(e) => {
                                            e.stopPropagation(); setEditingPlantId(plant.id); setEditNameValue(plant.plantName || '');
                                        }}>
                                            <Pencil size={12} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* EVENTI CURA (Sotto) */}
                <div className="garden-card-events">
                    <Droplets size={14} /> Prossima irrigazione: {plant.card?.waterFrequencyDays || 'Regolare'}
                </div>
            </div>
        );
    };

    return (
        <div className="my-garden-page">
            <header className="garden-header">
                <div className="header-title">
                    <Fence size={36} className="header-icon" />
                    <h1>Il mio Giardino</h1>
                </div>
            </header>

            <div className="garden-content">
                {loading ? (
                    <p style={{ textAlign: 'center' }}>Caricamento giardino in corso...</p>
                ) : myPlants.length === 0 ? (
                    <div className="empty-garden">
                        <Fence size={56} className="empty-icon" />
                        <h2>Il tuo giardino è vuoto</h2>
                    </div>
                ) : (
                    <div className="garden-lists-container">
                        {/* PIANTE VIVE */}
                        {alivePlants.length > 0 && (
                            <div className="alive-section">
                                <div className="list-grid">
                                    {alivePlants.map(plant => <PlantCard key={plant.id} plant={plant} />)}
                                </div>
                            </div>
                        )}

                        {/* PIANTE MORTE */}
                        {deadPlants.length > 0 && (
                            <div className="dead-section">
                                <h3><Skull size={18} /> Il cimitero delle piante</h3>
                                <div className="list-grid">
                                    {deadPlants.map(plant => <PlantCard key={plant.id} plant={plant} />)}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODALE SCELTA ELIMINAZIONE */}
            {deletePrompt !== null && (
                <div className="modal-overlay" onClick={() => setDeletePrompt(null)}>
                    <div className="delete-dialog" onClick={e => e.stopPropagation()}>
                        <h3>Rimuovi Pianta</h3>
                        {/* Cerchiamo la pianta nell'array per capire se è viva o morta */}
                        {(() => {
                            const plantToDelete = myPlants.find(p => p.id === deletePrompt);

                            return (
                                <>
                                    <p>
                                        {plantToDelete?.isDead
                                            ? "Vuoi eliminare definitivamente questa pianta dal tuo cimitero?"
                                            : "Vuoi eliminare questa pianta definitivamente o dichiararne il decesso per tenerla come ricordo?"}
                                    </p>
                                    <div className="delete-actions">
                                        {/* Mostra il bottone "Morta" SOLO se la pianta è ancora viva */}
                                        {!plantToDelete?.isDead && (
                                            <button className="btn-dead" onClick={() => handleDeleteAction(deletePrompt, true)}>
                                                <Skull size={16} /> È Morta
                                            </button>
                                        )}
                                        <button className="btn-delete" onClick={() => handleDeleteAction(deletePrompt, false)}>
                                            <Trash2 size={16} /> Elimina Definitivamente
                                        </button>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* MODALE SCHEDA DETTAGLIO PIANTA */}
            {selectedPlant && (
                <div className="modal-overlay" onClick={() => setSelectedPlant(null)}>
                    <div className="plant-detail-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={() => setSelectedPlant(null)}><X size={24} /></button>

                        <div className="detail-header" style={{ backgroundImage: `url(${selectedPlant.urlPhoto || selectedPlant.card?.urlDefaultPhoto})` }}>
                            <div className="detail-header-content">
                                <h2>{selectedPlant.plantName || selectedPlant.card?.commonName}</h2>
                                <p><i>{selectedPlant.card?.scientificName}</i></p>
                            </div>
                        </div>

                        <div className="detail-body">
                            <div className="detail-section">
                                <h4><Info size={16} /> Scheda Botanica</h4>
                                <ul>
                                    <li><strong>Famiglia:</strong> {selectedPlant.card?.family}</li>
                                    <li><strong>Esposizione:</strong> {selectedPlant.card?.exposure}</li>
                                    <li><strong>Terreno:</strong> {selectedPlant.card?.soil}</li>
                                    <li><strong>Concimazione:</strong> {selectedPlant.card?.fertilization}</li>
                                </ul>
                            </div>

                            <div className="detail-section">
                                <h4><CalendarHeart size={16} /> Eventi Cura & Timeline</h4>
                                <div className="timeline-placeholder">
                                    <div className="timeline-item">Acquistata / Aggiunta il {new Date(selectedPlant.purchaseDate).toLocaleDateString()}</div>
                                    <div className="timeline-item">Irrigazione consigliata: {selectedPlant.card?.waterFrequencyDays}</div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4><ImageIcon size={16} /> Post Collegati</h4>
                                <p className="text-muted">I post in cui hai taggato questa pianta appariranno qui.</p>
                            </div>
                        </div>

                        <div className="detail-footer">
                            <button className="btn-delete-full" onClick={() => { setDeletePrompt(selectedPlant.id); }}>
                                <Trash2 size={18} /> Rimuovi o Segna Morta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}