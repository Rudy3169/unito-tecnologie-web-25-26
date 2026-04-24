import { useState, useEffect } from 'react';
import { Fence, Plus, Droplets, CalendarHeart } from 'lucide-react';
import './MyGarden.css';

interface PlantItem {
    id: number;
    purchaseDate: string;
    card: {
        commonName: string;
        scientificName: string;
        urlDefaultPhoto: string;
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
                        <p>Aggiungi la tua prima pianta creando un post e collegandola a una scheda botanica!</p>
                    </div>
                ) : (
                    <div className="plants-grid">
                        {myPlants.map(plant => (
                            <div key={plant.id} className="garden-plant-card">
                                <div className="garden-plant-img" style={{ backgroundImage: `url(${plant.card?.urlDefaultPhoto || '/placeholder-plant.png'})` }}>
                                    <div className="garden-plant-date">
                                        <CalendarHeart size={14} /> {new Date(plant.purchaseDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="garden-plant-info">
                                    <h3>{plant.card?.commonName || 'Pianta Sconosciuta'}</h3>
                                    <p className="scientific-name">{plant.card?.scientificName}</p>

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