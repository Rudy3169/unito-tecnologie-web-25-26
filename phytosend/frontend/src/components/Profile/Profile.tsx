import { useState, useEffect } from 'react';
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
            <div className="profile-avatar">🌿</div>
            <h2>Il Tuo Giardino Personale</h2>

            <span className={`role-badge ${userRole === 'ADMIN' ? 'role-admin' : 'role-user'}`}>
                Ruolo: {userRole}
            </span>

            {garden && (
                <div style={{ marginTop: '1.5rem' }}>
                    <h3>🏡 {garden.name}</h3>
                </div>
            )}

            <div style={{ marginTop: '1.5rem' }}>
                <h3>🌱 Le tue piante ({plants.length})</h3>

                {plants.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Nessuna pianta nel giardino ancora!
                    </p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {plants.map(plant => (
                            <li key={plant.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.75rem',
                                border: '1px solid #ccc',
                                borderRadius: '8px',
                                marginBottom: '0.5rem'
                            }}>
                                <span>🌿 {plant.name}</span>
                                <button
                                    onClick={() => handleRemovePlant(plant.id)}
                                    style={{ color: 'red', cursor: 'pointer' }}
                                >
                                    Rimuovi
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
