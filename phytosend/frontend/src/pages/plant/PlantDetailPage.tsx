import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Droplets, Flower2, Sprout, FlaskConical, Leaf } from 'lucide-react';
import { apiFetch } from '../../api';
import type { BotanicalCard } from '../../types';
import './PlantDetailPage.css';

/**
 * COMPONENTE PLANT DETAIL PAGE
 * Mostra la scheda botanica enciclopedica di una specifica pianta del catalogo.
 * Recupera l'ID della pianta direttamente dall'URL tramite React Router.
 */
export function PlantDetail() {
    // Estrae il parametro dinamico "plantId" definito nelle rotte di App.tsx
    const { plantId } = useParams<{ plantId: string }>();
    const navigate = useNavigate(); // Hook per la navigazione programmatica
    const token = localStorage.getItem('phytosend_token');

    // ==========================================
    // STATI DEL COMPONENTE
    // ==========================================
    const [plant, setPlant] = useState<BotanicalCard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // ==========================================
    // FETCH DEI DATI BOTANICI
    // ==========================================
    useEffect(() => {
        if (!plantId) return; // Evita chiamate a vuoto

        // Richiesta al backend per ottenere i dettagli della pianta
        apiFetch(`/api/catalogo/${plantId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error('Pianta non trovata');
                return res.json();
            })
            .then(data => setPlant(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false)); // Ferma il loader a prescindere dal risultato
    }, [plantId]); // Esegue questo effetto ogni volta che cambia l'ID nell'URL

    if (loading) {
        return (
            <div className="plant-detail-container">
                <div className="plant-detail-loading">Caricamento scheda botanica...</div>
            </div>
        );
    }

    if (error || !plant) {
        return (
            <div className="plant-detail-container">
                <div className="plant-detail-loading">
                    <p>{error || 'Pianta non trovata'}</p>
                    <button className="plant-back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={16} /> Torna indietro
                    </button>
                </div>
            </div>
        );
    }

    // ==========================================
    // NORMALIZZAZIONE DATI PER IL RENDER
    // ==========================================
    // Costruiamo un array di oggetti per renderizzare dinamicamente le icone e le etichette.
    // Usiamo il metodo .filter() per scartare in automatico tutte le proprietà 
    // che il backend non ci ha inviato.
    const careInfo = [
        { icon: <Sun size={20} />, label: 'Esposizione', value: plant.exposure },
        { icon: <Droplets size={20} />, label: 'Irrigazione', value: plant.irrigation },
        { icon: <Droplets size={20} />, label: 'Frequenza irrigazione', value: plant.waterFrequencyDays ? `Ogni ${plant.waterFrequencyDays} giorni` : 'Sconosciuto' },
        { icon: <FlaskConical size={20} />, label: 'Fertilizzazione', value: plant.fertilization },
        { icon: <Sprout size={20} />, label: 'Terreno', value: plant.soil },
    ].filter(item => item.value);

    return (
        <div className="plant-detail-container">
            {/* Bottone indietro */}
            <button className="plant-back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} /> Indietro
            </button>

            {/* Hero con immagine */}
            <div className="plant-hero">
                {plant.urlDefaultPhoto ? (
                    <img
                        src={plant.urlDefaultPhoto}
                        alt={plant.commonName}
                        className="plant-hero-img"
                    />
                ) : (
                    <div className="plant-hero-placeholder">
                        <Flower2 size={64} strokeWidth={1} />
                    </div>
                )}
                <div className="plant-hero-gradient" />
            </div>

            {/* Header info */}
            <div className="plant-info-card">
                <div className="plant-name-section">
                    <h1>{plant.commonName}</h1>
                    <p className="plant-scientific">{plant.scientificName}</p>
                    <span className="plant-family-badge">
                        <Leaf size={14} /> {plant.family}
                    </span>
                </div>
            </div>

            {/* Griglia cure */}
            {careInfo.length > 0 && (
                <div className="plant-care-section">
                    <h2 className="plant-section-title">
                        <Sprout size={20} /> Cura della pianta
                    </h2>
                    <div className="plant-care-grid">
                        {careInfo.map((info, index) => (
                            <div key={index} className="care-card">
                                <div className="care-icon">{info.icon}</div>
                                <div className="care-info">
                                    <span className="care-label">{info.label}</span>
                                    <span className="care-value">{info.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Se non ci sono info di cura */}
            {careInfo.length === 0 && (
                <div className="plant-no-care">
                    <p>Le informazioni di cura per questa pianta non sono ancora disponibili.</p>
                </div>
            )}
        </div>
    );
}
