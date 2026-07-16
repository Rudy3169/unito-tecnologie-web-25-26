import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Home, Search, User, LogOut, Settings, Leaf, Menu, Bookmark, Sun, Moon, Fence, ArrowLeft, Grid3X3, List } from 'lucide-react';
import { NotificationBell } from '../notifications/NotificationBell';
import { apiFetch } from '../../api';
import logoLight from '../../assets/logo/PhytoSend/logo & scritta/v2 verde scuro.png';
import logoDark from '../../assets/logo/PhytoSend/logo & scritta/v2 bianco.png';
import logoMobileLight from '../../assets/logo/PhytoSend/logo/verde.png';
import logoMobileDark from '../../assets/logo/PhytoSend/logo/bianco.png';
import './Sidebar.css';

interface SidebarProps {
    userRole: 'USER' | 'ADMIN' | null;
}

/**
 * COMPONENTE SIDEBAR (E NAVBAR MOBILE)
 * Gestisce la navigazione principale, la ricerca unificata (Piante/Utenti), il cambio tema (Dark/Light Mode)
 * e l'accesso rapido al profilo.
 * Adotta un pattern ibrido: su schermi grandi si comporta da Top Navbar classica, 
 * mentre su Mobile si divide in Header superiore e Tab Bar inferiore per l'ergonomia del pollice.
 */
export function Sidebar({ userRole }: SidebarProps) {

    // ==========================================
    // 1. HOOK DI NAVIGAZIONE (REACT ROUTER)
    // ==========================================
    const location = useLocation();
    const navigate = useNavigate();

    // ==========================================
    // 2. useState
    // ==========================================

    // Ricerca
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState('plants');

    // Menu a tendina
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Tema (Dark / Light Mode)
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
        console.log("[PhytoSend Theme Debug] Initialized isDarkMode state. documentElement 'data-theme':", initialTheme);
        return initialTheme === 'dark';
    });

    // Foto profilo dell'utente corrente
    const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);

    // Modalità di visualizzazione dei Post Salvati (grid/list) per la comunicazione cross-component
    // Siccome il pulsante Grid/List dei "Post Salvati" su mobile si trova in questa Sidebar (Header),
    // ma la logica vera e propria sta dentro la pagina SavedPostsPage, usiamo un Event Listener
    // sul window object per sincronizzare i due componenti che non hanno un rapporto padre-figlio diretto.
    const [savedPostsViewMode, setSavedPostsViewMode] = useState<'grid' | 'list'>('grid');

    // ==========================================
    // 3. useRef
    // ==========================================
    const menuRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    // ==========================================
    // 4. useEffect
    // ==========================================

    // Carica la foto profilo dell'utente corrente (riesegue ad ogni cambio di pagina)
    useEffect(() => {
        const userId = localStorage.getItem('phytosend_userId');
        const token = localStorage.getItem('phytosend_token');
        if (!userId || !token) return;

        apiFetch(`/api/utenti/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.profilePhotoUrl) {
                    setProfilePhotoUrl(data.profilePhotoUrl);
                } else {
                    setProfilePhotoUrl(null);
                }
            })
            .catch(() => { });
    }, [location.pathname]);

    // Sincronizza lo stato della barra di ricerca con i parametri dell'URL
    useEffect(() => {
        if (location.pathname === '/search') {
            const searchParams = new URLSearchParams(location.search);
            const q = searchParams.get('q') || '';
            const type = searchParams.get('type') || 'plants';
            setQuery(q);
            setSearchType(type);
        } else {
            // Se usciamo dalla pagina di ricerca, possiamo anche resettare la query
            setQuery('');
        }
    }, [location.pathname, location.search]);

    // Comunicazione cross-component: ascolta gli eventi di sincronizzazione della modalità Post Salvati
    useEffect(() => {
        const handleSync = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail) {
                setSavedPostsViewMode(customEvent.detail);
            }
        };
        window.addEventListener('sync-saved-posts-view-mode', handleSync);
        // Appena la sidebar si monta, chiede alla pagina "quale modalità è attiva in questo momento?"
        window.dispatchEvent(new Event('request-saved-posts-view-mode'));
        return () => window.removeEventListener('sync-saved-posts-view-mode', handleSync); // Cleanup vitale
    }, []);

    // Chiusura menu se si clicca fuori
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
                mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ==========================================
    // 5. FUNZIONI HANDLER
    // ==========================================

    // Verifica se il percorso corrente è attivo (per evidenziare il pulsante nella Sidebar)
    const isActive = (path: string) => location.pathname === path ? 'active' : '';

    // Cambio tema Dark/Light: modifica l'attributo data-theme sul tag <html> (root)
    // e persiste la scelta nel localStorage per i futuri caricamenti di pagina
    const toggleTheme = () => {
        const newTheme = !isDarkMode ? 'dark' : 'light';
        setIsDarkMode(!isDarkMode);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('phytosend_theme', newTheme);
    };

    // Se l'utente clicca Home mentre è già sulla Home, ricarica la pagina (come Instagram/Twitter)
    const handleHomeClick = (e: React.MouseEvent) => {
        if (location.pathname === '/') {
            e.preventDefault();
            window.location.reload();
        }
    };

    // Gestisce l'invio del form di ricerca (premendo Invio)
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        navigate(`/search?q=${encodeURIComponent(query.trim())}&type=${searchType}`);
    };

    // Gestisce la digitazione nella barra di ricerca (ricerca live ad ogni carattere)
    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        navigate(`/search?q=${encodeURIComponent(val)}&type=${searchType}`);
    };

    // Gestisce il cambio del tipo di ricerca (piante ↔ utenti)
    const handleSearchTypeChange = () => {
        const newType = searchType === 'plants' ? 'users' : 'plants';
        setSearchType(newType);
        if (query.trim() !== '') {
            navigate(`/search?q=${encodeURIComponent(query.trim())}&type=${newType}`);
        }
    };

    // Cambia la modalità dei post salvati (grid/list) e notifica la pagina SavedPostsPage
    const toggleSavedPostsViewMode = (mode: 'grid' | 'list') => {
        setSavedPostsViewMode(mode);
        window.dispatchEvent(new CustomEvent('change-saved-posts-view-mode', { detail: mode }));
    };

    // Effettua il logout: pulisce il localStorage e reindirizza al Login
    const handleLogout = () => {
        localStorage.removeItem('phytosend_role');
        localStorage.removeItem('phytosend_token');
        localStorage.removeItem('phytosend_userId');
        window.location.href = '/';
    };

    // ==========================================
    // 6. FUNZIONE RENDER HELPER
    // ==========================================

    // Renderizza il menu a tendina (usato sia nella versione Desktop che Mobile)
    const renderDropdownMenu = (classNameStr: string) => (
        <div className={classNameStr}>
            <Link to="/saved-posts" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                <Bookmark size={18} />
                <span>Post Salvati</span>
            </Link>
            <button type="button" className="dropdown-item" onClick={toggleTheme}>
                {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                <span>Cambia Aspetto</span>
            </button>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item text-danger" onClick={handleLogout}>
                <LogOut size={18} />
                <span>Esci</span>
            </button>
        </div>
    );

    return (
        <>
            {/* ── DESKTOP: Top Navbar ── */}
            <header className="navbar">
                {/* Logo */}
                <Link to="/" className="navbar-logo" onClick={handleHomeClick}>
                    <img src={isDarkMode ? logoDark : logoLight} alt="PhytoSend" className="navbar-logo-img" />
                </Link>

                {/* Barra di ricerca */}
                <form className="navbar-search" onSubmit={handleSearch}>
                    <div className="search-wrapper">
                        <button
                            type="button"
                            className={`search-switcher-btn ${searchType}`}
                            onClick={handleSearchTypeChange}
                            title={searchType === 'plants' ? "Cerca Utenti" : "Cerca Piante"}
                        >
                            <span className="switcher-content" key={searchType}>
                                {searchType === 'plants' ? <User size={18} className="switcher-icon" /> : <Leaf size={18} className="switcher-icon" />}
                            </span>
                        </button>
                        <div className="search-divider"></div>
                        <Search size={16} className="navbar-search-icon" />
                        <input
                            type="text"
                            className="navbar-search-input"
                            placeholder={searchType === 'plants' ? "Cerca piante..." : "Cerca utenti..."}
                            value={query}
                            onChange={handleQueryChange}
                        />
                    </div>
                </form>

                <nav className="navbar-nav">
                    {/* Home */}
                    <Link to="/" className={`navbar-icon-btn ${isActive('/')}`} title="Home" onClick={handleHomeClick}>
                        <Home size={22} />
                        <span className="icon-label">Home</span>
                    </Link>

                    {/* Il mio Giardino */}
                    <Link to="/my-garden" className={`navbar-icon-btn ${isActive('/my-garden')}`} title="MyGarden">
                        <Fence size={22} />
                        <span className="icon-label">MyGarden</span>
                    </Link>

                    {/* Notifiche */}
                    <NotificationBell />

                    {/* Admin */}
                    {userRole === 'ADMIN' && (
                        <Link to="/admin" className={`navbar-icon-btn ${isActive('/admin')}`} title="Admin">
                            <Settings size={22} />
                            <span className="icon-label">Admin</span>
                        </Link>
                    )}

                    {/* Profilo */}
                    <Link to="/profile" className={`navbar-icon-btn ${isActive('/profile')}`} title="Profilo">
                        <div className="navbar-avatar-mini">
                            {profilePhotoUrl ? (
                                <img src={profilePhotoUrl} alt="Profilo" className="navbar-avatar-photo" />
                            ) : (
                                <User size={16} />
                            )}
                        </div>
                        <span className="icon-label">Profilo</span>
                    </Link>

                    {/* Bottone Menu Desktop */}
                    <div className="navbar-menu-container" ref={menuRef}>
                        <button
                            className={`navbar-icon-btn ${isMenuOpen ? 'active' : ''}`}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            title="Menu"
                        >
                            <Menu size={22} />
                            <span className="icon-label">Altro</span>
                        </button>
                        {isMenuOpen && renderDropdownMenu("navbar-dropdown-menu")}
                    </div>
                </nav>
            </header>

            {/* ── MOBILE: Header ── */}
            <header className="mobile-header">
                {/* Modal Mode Back Button */}
                <div className="mobile-header-back-container">
                    <button
                        type="button"
                        className="mobile-header-back-btn"
                        onClick={() => window.dispatchEvent(new Event('close-post-modal'))}
                        aria-label="Indietro"
                    >
                        <ArrowLeft size={22} />
                    </button>
                </div>
                {location.pathname !== '/saved-posts' && (
                    <span className="mobile-header-title">Post</span>
                )}

                {/* Back Button per Post Salvati */}
                {location.pathname === '/saved-posts' && (
                    <div className="mobile-saved-posts-back-container" style={{ display: 'flex', alignItems: 'center' }}>
                        <button
                            type="button"
                            className="mobile-header-back-btn"
                            onClick={() => navigate(-1)}
                            aria-label="Indietro"
                        >
                            <ArrowLeft size={22} />
                        </button>
                    </div>
                )}

                {location.pathname === '/notifiche' && (
                    <span className="mobile-header-title" style={{ display: 'block', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
                        Notifiche
                    </span>
                )}

                {location.pathname === '/saved-posts' && (
                    <span className="mobile-header-title" style={{ display: 'block', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                        Post salvati
                    </span>
                )}

                {/*Logo */}
                {location.pathname !== '/notifiche' && location.pathname !== '/saved-posts' && (
                    <Link to="/" className="navbar-logo" onClick={handleHomeClick}>
                        <img src={isDarkMode ? logoMobileDark : logoMobileLight} alt="PhytoSend" className="navbar-logo-img navbar-logo-mobile" />
                    </Link>
                )}

                {/*Barra di ricerca */}
                {location.pathname !== '/notifiche' && location.pathname !== '/saved-posts' && (
                    <form className="navbar-search" onSubmit={handleSearch}>
                        <div className="search-wrapper">
                            <button
                                type="button"
                                className={`search-switcher-btn ${searchType}`}
                                onClick={handleSearchTypeChange}
                                title={searchType === 'plants' ? "Cerca Utenti" : "Cerca Piante"}
                            >
                                <span className="switcher-content" key={searchType}>
                                    {searchType === 'plants' ? <User size={18} className="switcher-icon" /> : <Leaf size={18} className="switcher-icon" />}
                                </span>
                            </button>
                            <div className="search-divider"></div>
                            <Search size={15} className="navbar-search-icon" style={{ marginLeft: 0 }} />
                            <input
                                type="text"
                                className="navbar-search-input"
                                placeholder={searchType === 'plants' ? "Cerca piante..." : "Cerca utenti..."}
                                value={query}
                                onChange={handleQueryChange}
                            />
                        </div>
                    </form>
                )}

                {/* Switcher per Post Salvati su Mobile */}
                {location.pathname === '/saved-posts' && (
                    <div className="mobile-saved-posts-switcher" style={{ marginLeft: 'auto', display: 'flex', gap: '6px', background: 'var(--color-bg-card)', padding: '3px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                        <button
                            type="button"
                            onClick={() => toggleSavedPostsViewMode('grid')}
                            style={{
                                background: savedPostsViewMode === 'grid' ? 'var(--color-primary)' : 'transparent',
                                color: savedPostsViewMode === 'grid' ? 'white' : 'var(--color-text-muted)',
                                border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                            }}
                        >
                            <Grid3X3 size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => toggleSavedPostsViewMode('list')}
                            style={{
                                background: savedPostsViewMode === 'list' ? 'var(--color-primary)' : 'transparent',
                                color: savedPostsViewMode === 'list' ? 'white' : 'var(--color-text-muted)',
                                border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                            }}
                        >
                            <List size={16} />
                        </button>
                    </div>
                )}

                {/*Altro*/}
                {location.pathname !== '/saved-posts' && (
                    <div className="navbar-menu-container" ref={mobileMenuRef}>
                        <button
                            className={`navbar-icon-btn ${isMenuOpen ? 'active' : ''}`}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            title="Altro"
                            style={{ height: '56px', width: '46px', minWidth: '46px' }}
                        >
                            <Menu size={22} />
                        </button>
                        {isMenuOpen && renderDropdownMenu("navbar-dropdown-menu mobile-dropdown-menu-top")}
                    </div>
                )}
            </header>

            {/* ── MOBILE: Bottom Tab Bar ── */}
            <nav className="bottom-nav">
                {/* Home */}
                <Link to="/" className={`navbar-icon-btn ${isActive('/')}`} title="Home" onClick={handleHomeClick}>
                    <Home size={22} />
                    <span className="icon-label">Home</span>
                </Link>

                {/* Il mio Giardino */}
                <Link to="/my-garden" className={`navbar-icon-btn ${isActive('/my-garden')}`} title="MyGarden">
                    <Fence size={22} />
                    <span className="icon-label">MyGarden</span>
                </Link>

                {/* Admin */}
                {userRole === 'ADMIN' && (
                    <Link to="/admin" className={`navbar-icon-btn ${isActive('/admin')}`} title="Admin">
                        <Settings size={22} />
                        <span className="icon-label">Admin</span>
                    </Link>
                )}

                {/* Notifiche al posto di Altro */}
                <NotificationBell />

                {/* Profilo */}
                <Link to="/profile" className={`navbar-icon-btn ${isActive('/profile')}`} title="Profilo">
                    <div className="navbar-avatar-mini">
                        {profilePhotoUrl ? (
                            <img src={profilePhotoUrl} alt="Profilo" className="navbar-avatar-photo" />
                        ) : (
                            <User size={16} />
                        )}
                    </div>
                    <span className="icon-label">Profilo</span>
                </Link>

            </nav>
        </>
    );
}
