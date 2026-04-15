import { useState, useEffect } from 'react';
import { Users, Leaf } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import './SearchPage.css';

interface UserResult {
    id: number;
    name: string;
    surname: string;
    email: string;
    role: string;
}

interface PlantResult {
    id: number;
    commonName: string;
    scientificName: string;
    family: string;
    urlDefaultPhoto?: string;
}

export function SearchPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'plants'; // "plants" o "users"

    const [users, setUsers] = useState<UserResult[]>([]);
    const [plants, setPlants] = useState<PlantResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('phytosend_token');
        setLoading(true);

        if (type === 'users') {
            fetch('/api/utenti', { headers: { 'Authorization': `Bearer ${token}` } })
                .then(res => res.json())
                .then(data => {
                    const allUsers = data.content ?? [];
                    const filtered = query
                        ? allUsers.filter((u: UserResult) =>
                            `${u.name} ${u.surname}`.toLowerCase().includes(query.toLowerCase())
                        )
                        : allUsers;
                    setUsers(filtered);
                })
                .finally(() => setLoading(false));

        } else if (type === 'plants') {
            fetch(`/api/catalogo/ricerca?q=${encodeURIComponent(query)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setPlants(data ?? []))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }

    }, [query, type]);

    return (
        <div className="search-page">
            <div className="search-page-header">
                <h2>
                    {type === 'users' ? <Users size={28} /> : <Leaf size={28} />}
                    {type === 'users' ? " Esplora la Community" : " Catalogo Botanico"}
                </h2>
                <p>
                    Risultati per: <strong>{query || "Tutti"}</strong>
                </p>
            </div>

            {loading ? (
                <p>Caricamento in corso...</p>
            ) : type === 'users' ? (
                /* ─── RENDER RISULTATI UTENTI ─── */
                users.length === 0 ? (
                    <p className="no-results">Nessun utente trovato.</p>
                ) : (
                    <ul className="user-list">
                        {users.map(user => (
                            <li key={user.id} className="user-card">
                                <div className="user-card-avatar">{user.name.charAt(0).toUpperCase()}</div>
                                <div className="user-card-info">
                                    <div className="user-card-name">{user.name} {user.surname}</div>
                                    <div className="user-card-email">{user.email}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )
            ) : (
                /* ─── RENDER RISULTATI PIANTE (CATALOGO) ─── */
                plants.length === 0 ? (
                    <p className="no-results">Nessuna pianta trovata nel catalogo.</p>
                ) : (
                    <div className="plants-grid">
                        {plants.map(plant => (
                            <div key={plant.id} className="plant-card">
                                <div className="plant-card-img"
                                    style={{
                                        backgroundImage: `url(${plant.urlDefaultPhoto || '/placeholder-plant.png'})`,
                                        height: '150px', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px'
                                    }}>
                                </div>
                                <div className="plant-card-body" style={{ padding: '12px 0' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{plant.commonName || plant.scientificName}</h3>
                                    <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                                        {plant.scientificName}
                                    </p>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>Fam: {plant.family}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
