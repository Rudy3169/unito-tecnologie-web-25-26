import { useState, useEffect } from 'react';
import { Fence, Droplets, CalendarHeart, Trash2, Sprout } from 'lucide-react';
import './MyGarden.css';

interface PlantItem {
    id: number;
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
                        {myPlants.map(plant => (
                            <div key={plant.id} className="garden-plant-card">
                                <div className="garden-plant-img" style={{ backgroundImage: `url(${plant.card?.urlDefaultPhoto || '/placeholder-plant.png'})` }}>
                                    <div className="garden-plant-date">
                                        <CalendarHeart size={14} /> {new Date(plant.purchaseDate).toLocaleDateString()}
                                    </div>
                                    <button
                                        className="delete-plant-btn"
                                        onClick={() => handleDeletePlant(plant.id)}
                                        title="Rimuovi pianta"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="garden-plant-info">
                                    <h3>{plant.card?.commonName || 'Pianta Sconosciuta'}</h3>
                                    <p className="scientific-name">{plant.card?.scientificName}</p>

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
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}