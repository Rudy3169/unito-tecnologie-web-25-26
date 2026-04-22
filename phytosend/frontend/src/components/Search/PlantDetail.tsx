import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Droplets, Flower2, Sprout, FlaskConical, Leaf } from 'lucide-react';
import './PlantDetail.css';

interface BotanicalCard {
    id: number;
    commonName: string;
    scientificName: string;
    family: string;
    exposure?: string;
    irrigation?: string;
    waterFrequencyDays?: string;
    fertilization?: string;
    soil?: string;
    urlDefaultPhoto?: string;
    createdAt?: string;
}

export function PlantDetail() {
    const { plantId } = useParams<{ plantId: string }>();
    const navigate = useNavigate();
    const token = localStorage.getItem('phytosend_token');

    const [plant, setPlant] = useState<BotanicalCard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!plantId) return;

        fetch(`/api/catalogo/${plantId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error('Pianta non trovata');
                return res.json();
            })
            .then(data => setPlant(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [plantId]);

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

    // Costruiamo le info di cura come array per un rendering dinamico
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
                <ArrowLeft size={18} /> Catalogo
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
