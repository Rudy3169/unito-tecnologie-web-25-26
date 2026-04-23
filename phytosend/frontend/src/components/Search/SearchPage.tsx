import { useState, useEffect, useRef, useCallback } from 'react';
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
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // FUNZIONE DI UTILITÀ: Controlla se la pianta è stata importata nelle ultime 12 ore
    const isNew = (dateString?: string) => {
        if (!dateString) return false;
        const importDate = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.abs(now.getTime() - importDate.getTime()) / 36e5;
        return diffInHours <= 12;
    };

    // Sensore che si accorge quando tocchi il fondo della pagina
    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading && plants.length === 0) return; // Non fa niente se sta già caricando
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(entries => {
            // Se l'ultimo elemento appare nello schermo e ci sono ancora piante nel DB, carica la prossima pagina
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observerRef.current.observe(node);
    }, [loading, hasMore]);

    // Azzera tutto quando scrivi qualcosa di nuovo nella barra di ricerca
    useEffect(() => {
        if (type === 'plants') {
            setPlants([]);
            setPage(0);
            setHasMore(true);
        }
    }, [query, type]);

    // Fa partire la richiesta quando cambia la query, il tab o scendi di pagina
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
            // Passiamo page e size al backend!
            fetch(`/api/catalogo/ricerca?q=${encodeURIComponent(query)}&page=${page}&size=15`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    setPlants(prevPlants => {
                        // Se è pagina 0 metti le nuove, altrimenti incollale in fondo a quelle vecchie
                        return page === 0 ? data.content : [...prevPlants, ...data.content];
                    });
                    setHasMore(!data.last); // data.last ci dice se il backend ha finito le piante
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [query, type, page]);

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

            {loading && plants.length === 0 && users.length === 0 ? (
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
                        {plants.map((plant, index) => {
                            // Controlla se questa è l'ultima pianta della lista sullo schermo
                            const isLastElement = index === plants.length - 1;
                            return (
                                <div
                                    key={`${plant.id}-${index}`}
                                    ref={isLastElement ? lastElementRef : null} // AGGIUNTO IL SENSORE QUI
                                    className="plant-card"
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
                            );
                        })}
                    </div>
                )
            )}
        </div>
    );
}