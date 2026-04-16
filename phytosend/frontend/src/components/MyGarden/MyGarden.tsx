import { useState } from 'react';
import { Fence, Plus } from 'lucide-react';
import './MyGarden.css';

export function MyGarden() {
    const [myPlants, setMyPlants] = useState([]);
    return (
        <div className="my-garden-page">
            <header className="garden-header">
                <div className="header-title">
                    {/* Effetto logo: una staccionata con vicino un piccolo germoglio o albero! */}
                    <Fence size={36} className="header-icon" />

                    <h1>Il mio Giardino</h1>
                </div>
                <p>La tua collezione personale di piante certificate Phytosend.</p>
            </header>
            <div className="garden-content">
                {myPlants.length === 0 ? (
                    <div className="empty-garden">
                        {/* Anche qui mettiamo la staccionata grande */}
                        <Fence size={56} className="empty-icon" />
                        <h2>Il tuo giardino è ancora vuoto</h2>
                        <p>Aggiungi la tua prima pianta collegandola a una scheda botanica!</p>
                        <button className="add-plant-btn">
                            <Plus size={18} /> Aggiungi Pianta
                        </button>
                    </div>
                ) : (
                    <div className="plants-grid">
                        <p>Le tue piante appariranno qui...</p>
                    </div>
                )}
            </div>
        </div>
    );
}