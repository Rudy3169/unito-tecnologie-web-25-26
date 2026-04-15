import { useState, useEffect } from 'react';
import { Leaf, Home, Sprout, Trash2 } from 'lucide-react';
import './Profile.css';

interface ProfileProps {
    userRole: 'USER' | 'ADMIN' | null;
}

interface Plant {
    id: number;
    name: string;
    urlPhoto?: string;
}

interface Garden {
    id: number;
    name: string;
}

export function Profile({ userRole }: ProfileProps) {
    const [garden, setGarden] = useState<Garden | null>(null);
    const [plants, setPlants] = useState<Plant[]>([]);
    const userId = localStorage.getItem('phytosend_userId');
    const token = localStorage.getItem('phytosend_token');
    useEffect(() => {
        if (!userId) return;
        fetch(`/api/gardens/user/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : null)
            .then(data => setGarden(data))
            .catch(err => console.error("Errore giardino:", err));
        fetch(`/api/utenti/${userId}/piante`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : [])
            .then(data => setPlants(data))
            .catch(err => console.error("Errore piante:", err));
    }, [userId]);
    const handleRemovePlant = async (plantId: number) => {
        const response = await fetch(`/api/utenti/${userId}/piante/${plantId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            setPlants(plants.filter(p => p.id !== plantId));
        }
    };
    return (
        <div className="profile-container">
            {/* Header profilo */}
            <div className="profile-header-card">
                <div className="profile-avatar">
                    <Leaf size={40} />
                </div>
                <div className="profile-header-info">
                    <h2>Il Tuo Profilo</h2>
                    <span className={`role-badge ${userRole === 'ADMIN' ? 'role-admin' : 'role-user'}`}>
                        {userRole}
                    </span>
                </div>
            </div>
            {/* Giardino */}
            {garden && (
                <div className="profile-section">
                    <div className="profile-section-title">
                        <Home size={18} /> {garden.name}
                    </div>
                </div>
            )}
            {/* Piante */}
            <div className="profile-section">
                <div className="profile-section-title">
                    <Sprout size={18} /> Le tue piante ({plants.length})
                </div>
                {plants.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                        Nessuna pianta nel giardino ancora.
                    </p>
                ) : (
                    plants.map(plant => (
                        <div key={plant.id} className="plant-item">
                            <span className="plant-item-name">
                                <Leaf size={16} color="var(--color-primary)" />
                                {plant.name}
                            </span>
                            <button
                                className="plant-remove-btn"
                                onClick={() => handleRemovePlant(plant.id)}
                            >
                                <Trash2 size={14} /> Rimuovi
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
