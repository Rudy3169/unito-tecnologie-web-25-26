import { useState, useEffect } from 'react';
// Aggiungi Sparkles agli import
import { Users, Leaf, Sparkles } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
    createdAt?: string; // <-- AGGIUNTO: per ricevere la data dal DB
}

export function SearchPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'plants';

    const [users, setUsers] = useState<UserResult[]>([]);
    const [plants, setPlants] = useState<PlantResult[]>([]);
    const [loading, setLoading] = useState(true);

    // FUNZIONE DI UTILITÀ: Controlla se la pianta è stata importata nelle ultime 12 ore
    const isNew = (dateString?: string) => {
        if (!dateString) return false;
        const importDate = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.abs(now.getTime() - importDate.getTime()) / 36e5;
        return diffInHours <= 12;
    };

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
                /* ... Render Utenti (rimane uguale) ... */
                users.length === 0 ? (
                    <p className="no-results">Nessun utente trovato.</p>
                ) : (
                    <ul className="user-list">
                        {users.map(user => (
                            <li key={user.id} className="user-card" onClick={() => navigate(`/profile/${user.id}`)} style={{ cursor: 'pointer' }}>
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
                /* ─── RENDER RISULTATI PIANTE AGGIORNATO ─── */
                plants.length === 0 ? (
                    <p className="no-results">Nessuna pianta trovata nel catalogo.</p>
                ) : (
                    <div className="plants-grid">
                        {plants.map(plant => (
                            <div
                                key={plant.id}
                                className="plant-card"
                                /* Pointer e la funzione onClick */
                                style={{ position: 'relative', cursor: 'pointer' }}
                                onClick={() => navigate(`/plant/${plant.id}`)}
                            >
                                <div className="plant-card-img"
                                    style={{
                                        backgroundImage: `url(${plant.urlDefaultPhoto || '/placeholder-plant.png'})`,
                                        height: '150px', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px'
                                    }}>
                                </div>
                                <div className="plant-card-body" style={{ padding: '12px 0' }}>
                                    {/* Layout Flex per mettere il badge a destra del titolo */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', flex: 1 }}>
                                            {plant.commonName || plant.scientificName}
                                        </h3>

                                        {/* BADGE NEW: Spunta solo se la pianta è recente */}
                                        {isNew(plant.createdAt) && (
                                            <span className="badge-new">
                                                <Sparkles size={12} /> NEW
                                            </span>
                                        )}
                                    </div>

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