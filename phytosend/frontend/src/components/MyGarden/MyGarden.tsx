import { useState, useEffect } from 'react';
import { Fence, Droplets, CalendarHeart, Trash2, Sprout, Pencil, Check, X } from 'lucide-react'; import './MyGarden.css';

interface PlantItem {
    id: number;
    plantName?: string;
    purchaseDate: string;
    card: {
        commonName: string;
        scientificName: string;
        urlDefaultPhoto: string;
        exposure?: string;
        waterFrequencyDays?: string;
    };
}

export function MyGarden() {
    const [myPlants, setMyPlants] = useState<PlantItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingPlantId, setEditingPlantId] = useState<number | null>(null);
    const [editNameValue, setEditNameValue] = useState("");

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

    // FUNZIONE DI ELIMINAZIONE PIANTA
    const handleDeletePlant = async (plantId: number) => {
        const confirmDelete = window.confirm("Sei sicuro di voler estirpare questa pianta dal tuo giardino? Questa azione eliminerà anche gli eventi di cura programmati.");
        if (!confirmDelete) return;

        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');

        try {
            const response = await fetch(`/api/utenti/${userId}/piante/${plantId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok || response.status === 204) {
                // Rimuove visivamente la pianta
                setMyPlants(prev => prev.filter(p => p.id !== plantId));
            } else {
                alert("Si è verificato un errore durante l'eliminazione.");
            }
        } catch (error) {
            console.error("Errore di rete", error);
            alert("Errore di connessione al server.");
        }
    };

    // FUNZIONE DI RINOMINA PIANTA
    const handleSaveName = async (plantId: number) => {
        const token = localStorage.getItem('phytosend_token');
        const userId = localStorage.getItem('phytosend_userId');

        try {
            const response = await fetch(`/api/utenti/${userId}/piante/${plantId}/name`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newName: editNameValue })
            });

            if (response.ok) {
                // Aggiorna visivamente la card istantaneamente
                setMyPlants(prev => prev.map(p =>
                    p.id === plantId ? { ...p, plantName: editNameValue } : p
                ));
                setEditingPlantId(null); // Chiudi la modalità modifica
            }
        } catch (error) {
            console.error("Errore modifica nome", error);
        }
    };

    return (
        <div className="my-garden-page">
            <header className="garden-header">
                <div className="header-title">
                    <Fence size={36} className="header-icon" />
                    <h1>Il mio Giardino</h1>
                </div>
                <p>La tua collezione personale di piante certificate Phytosend.</p>
            </header>

            <div className="garden-content">
                {loading ? (
                    <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Curando il tuo giardino... (Caricamento in corso)</p>
                ) : myPlants.length === 0 ? (
                    <div className="empty-garden">
                        <Fence size={56} className="empty-icon" />
                        <h2>Il tuo giardino è ancora vuoto</h2>
                        <p>Aggiungi la tua prima pianta creando un post e selezionando "Aggiunta al Giardino"!</p>
                    </div>
                ) : (
                    <div className="plants-grid">
                        {myPlants.map(plant => {
                            // LOGICA DISPLAY NOME: Se ha un soprannome usa quello, altrimenti usa il nome comune
                            const displayName = plant.plantName || plant.card?.commonName || 'Pianta Sconosciuta';
                            // Se ha un soprannome, come sottotitolo mostriamo il nome comune, altrimenti quello scientifico
                            const subtitle = plant.plantName ? plant.card?.commonName : plant.card?.scientificName;

                            return (
                                <div key={plant.id} className="garden-plant-card">
                                    <div className="garden-plant-img" style={{ backgroundImage: `url(${plant.card?.urlDefaultPhoto || '/placeholder-plant.png'})` }}>
                                        {/* ... (Data e Bottone Cestino invariati) ... */}
                                    </div>
                                    <div className="garden-plant-info">

                                        {/* NUOVO BLOCCO NOME MODIFICABILE */}
                                        <div className="garden-name-container">
                                            {editingPlantId === plant.id ? (
                                                <div className="edit-name-mode">
                                                    <input
                                                        autoFocus
                                                        value={editNameValue}
                                                        onChange={e => setEditNameValue(e.target.value)}
                                                        className="edit-name-input"
                                                        placeholder="Nuovo nome..."
                                                    />
                                                    <button className="confirm-name-btn" onClick={() => handleSaveName(plant.id)}><Check size={16} /></button>
                                                    <button className="cancel-name-btn" onClick={() => setEditingPlantId(null)}><X size={16} /></button>
                                                </div>
                                            ) : (
                                                <div className="view-name-mode">
                                                    <h3>{displayName}</h3>
                                                    <button
                                                        className="edit-pencil-btn"
                                                        onClick={() => {
                                                            setEditingPlantId(plant.id);
                                                            setEditNameValue(plant.plantName || '');
                                                        }}
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="scientific-name">{subtitle}</p>

                                        <div className="plant-quick-stats">
                                            <div className="stat-item">
                                                <Droplets size={14} /> {plant.card?.waterFrequencyDays || "Irrigazione regolare"}
                                            </div>
                                            <div className="stat-item">
                                                <Sprout size={14} /> Specie certificata
                                            </div>
                                        </div>

                                        <div className="garden-plant-actions">
                                            <button className="care-btn water">
                                                <Droplets size={16} /> Annaffia
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}