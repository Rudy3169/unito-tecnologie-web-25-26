import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { Users, Leaf, Sparkles } from 'lucide-react';
import { useSearchParams, useNavigate, useNavigationType } from 'react-router-dom';
import { apiFetch } from '../../api';
import type { UserResult, PlantResult } from '../../types';
import './SearchPage.css';

// ==========================================
// CACHE IN MEMORIA
// ==========================================
// Usiamo una variabile fuori dal componente (nel modulo) per salvare lo stato della ricerca.
// A differenza degli state React, questa variabile non si azzera quando il componente viene distrutto.
// È una soluzione "leggera" per mantenere la posizione e i risultati quando l'utente clicca
// su una pianta e poi preme il tasto "Indietro" del browser.
interface SearchCache {
    query: string;
    type: string;
    plants: PlantResult[];
    page: number;
    hasMore: boolean;
    scrollY: number;
}
let moduleCache: SearchCache | null = null;

export function SearchPage() {
    // Hook per leggere query parameters dall'URL
    const [searchParams] = useSearchParams();

    // Hook per navigare tra le pagine
    const navigate = useNavigate();

    // Indica come l'utente è arrivato qui ('PUSH' = nuovo click, 'POP' = tasto Indietro, 'REPLACE' = redirect)
    const navigationType = useNavigationType();

    // Query parameters dall'URL
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'plants';

    // ==========================================
    // 1. useState, useRef e useCallback
    // ==========================================

    // Se l'utente preme "Indietro" (POP) e avevamo salvato una cache coerente con la URL attuale, la carichiamo.
    const cachedRef = useRef<SearchCache | null>(null);
    const restoredRef = useRef(false);

    // LOGICA DI RIPRISTINO CACHE (eseguita prima degli state che dipendono da essa)
    if (!restoredRef.current) {
        if (navigationType === 'POP' && moduleCache && moduleCache.query === query && moduleCache.type === type) {
            cachedRef.current = moduleCache;
        }
        moduleCache = null; // Svuotiamo la cache dopo averla consumata (o scartata) per non inquinare navigazioni future
        restoredRef.current = true;
    }

    const [users, setUsers] = useState<UserResult[]>([]); // Lista degli utenti trovati
    const [plants, setPlants] = useState<PlantResult[]>(cachedRef.current?.plants ?? []); // Lista delle piante trovate
    const [loading, setLoading] = useState(cachedRef.current ? false : true); // Indica se stiamo caricando
    const [page, setPage] = useState(cachedRef.current?.page ?? 0); // Pagina corrente
    const [hasMore, setHasMore] = useState(cachedRef.current?.hasMore ?? true); // Indica se ci sono altre pagine
    const [restoringScroll, setRestoringScroll] = useState(!!cachedRef.current); // Indica se stiamo ripristinando lo scroll

    const observerRef = useRef<IntersectionObserver | null>(null); // Sensore per infinite scroll
    const containerRef = useRef<HTMLDivElement>(null); // Ref al contenitore visivo per logica di flicker

    // Un "sensore" (IntersectionObserver) che viene agganciato all'ultimo elemento della lista.
    // Appena quell'elemento entra nello schermo visibile dell'utente (isIntersecting), incrementiamo la pagina.
    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading && plants.length === 0) return; // Non facciamo nulla se stiamo già caricando
        if (observerRef.current) observerRef.current.disconnect(); // Rimuove il sensore dal vecchio "ultimo elemento"

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1); // Triggera l'effetto che fa la fetch della pagina successiva
            }
        });

        if (node) observerRef.current.observe(node); // Aggancia il sensore al nuovo ultimo nodo
    }, [loading, hasMore]);

    // ==========================================
    // 2. useEffect e useLayoutEffect
    // ==========================================

    // RIPRISTINO DELLO SCROLL SENZA "FLICKER"
    // useLayoutEffect viene eseguito *dopo* che React ha calcolato il DOM, ma *prima* che il browser lo dipinga a schermo.
    // Questo ci permette di scorrere alla posizione salvata nascondendo momentaneamente la pagina, evitando il "salto" visivo.
    useLayoutEffect(() => {
        if (restoringScroll && cachedRef.current && plants.length > 0) {
            // Nascondiamo il div radice prima del rendering visivo
            if (containerRef.current) containerRef.current.style.visibility = 'hidden';

            // requestAnimationFrame garantisce che la scrollTo avvenga esattamente prima del prossimo "paint" del browser
            requestAnimationFrame(() => {
                window.scrollTo({ top: cachedRef.current!.scrollY, behavior: 'instant' as ScrollBehavior });

                // Ora che siamo nella posizione corretta, rendiamo tutto di nuovo visibile
                if (containerRef.current) containerRef.current.style.visibility = '';
                setRestoringScroll(false);
                cachedRef.current = null;
            });
        }
    }, [restoringScroll, plants]);

    // Azzera tutto quando scrivi qualcosa di nuovo nella barra di ricerca
    useEffect(() => {
        if (type === 'plants') {
            // Se abbiamo ripristinato dalla cache, non azzerare
            if (restoringScroll) return;
            setPlants([]);
            setPage(0);
            setHasMore(true);
        }
    }, [query, type]);

    // Fa partire la richiesta quando cambia la query, il tab o scendi di pagina
    useEffect(() => {
        // Se abbiamo ripristinato dalla cache, non ri-fetchare
        if (restoringScroll) return;

        const token = localStorage.getItem('phytosend_token');
        setLoading(true);
        if (type === 'users') {
            apiFetch('/api/utenti', { headers: { 'Authorization': `Bearer ${token}` } })
                .then(res => res.json())
                .then(data => {
                    const currentUserId = Number(localStorage.getItem('phytosend_userId'));
                    let allUsers = data.content ?? [];

                    // Rimuovi l'utente loggato
                    allUsers = allUsers.filter((u: UserResult) => u.id !== currentUserId);

                    // Ordina in ordine alfabetico
                    allUsers.sort((a: UserResult, b: UserResult) => {
                        const nameA = `${a.name} ${a.surname}`.toLowerCase();
                        const nameB = `${b.name} ${b.surname}`.toLowerCase();
                        return nameA.localeCompare(nameB);
                    });

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
            apiFetch(`/api/catalogo/ricerca?q=${encodeURIComponent(query)}&page=${page}&size=15`, {
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

    // ==========================================
    // 3. FUNZIONI HANDLER E UTILITY
    // ==========================================

    // Controlla se la pianta è stata importata nelle ultime 12 ore
    const isNew = (dateString?: string) => {
        if (!dateString) return false;
        const importDate = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.abs(now.getTime() - importDate.getTime()) / 36e5;
        return diffInHours <= 12;
    };

    return (
        <div ref={containerRef} className="search-page">
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
                                <div className="user-card-avatar">
                                    {user.profilePhotoUrl ? (
                                        <img src={user.profilePhotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                    ) : (
                                        user.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="user-card-info">
                                    <div className="user-card-name">{user.name} {user.surname}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )
            ) : (
                /* ─── RENDER RISULTATI PIANTE ─── */
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
                                    ref={isLastElement ? lastElementRef : null}
                                    className="plant-card"
                                    style={{ position: 'relative', cursor: 'pointer' }}
                                    onClick={() => {
                                        // Salva stato corrente nella cache in memoria prima di navigare
                                        moduleCache = { query, type, plants, page, hasMore, scrollY: window.scrollY };
                                        navigate(`/plant/${plant.id}`);
                                    }}
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
