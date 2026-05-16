import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Home, Search, User, LogOut, Settings, Leaf, Menu, Bookmark, Sun, Moon, Fence } from 'lucide-react';
import { NotificationBell } from '../Notifications/NotificationBell';
import { apiFetch } from '../../utils/apiFetch';
import logoLight from '../../assets/logo/PhytoSend/logo & scritta/v2 verde scuro.png';
import logoDark from '../../assets/logo/PhytoSend/logo & scritta/v2 bianco.png';
import './Sidebar.css';

interface SidebarProps {
    userRole: 'USER' | 'ADMIN' | null;
}

export function Sidebar({ userRole }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState('plants');

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);

    // Carica la foto profilo dell'utente corrente
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

    const isActive = (path: string) => location.pathname === path ? 'active' : '';

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        navigate(`/search?q=${encodeURIComponent(query.trim())}&type=${searchType}`);
    };

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        navigate(`/search?q=${encodeURIComponent(val)}&type=${searchType}`);
    };

    const handleSearchTypeChange = () => {
        const newType = searchType === 'plants' ? 'users' : 'plants';
        setSearchType(newType);
    };

    const handleLogout = () => {
        localStorage.removeItem('phytosend_role');
        localStorage.removeItem('phytosend_token');
        localStorage.removeItem('phytosend_userId');
        window.location.href = '/';
    };

    const renderDropdownMenu = (classNameStr: string) => (
        <div className={classNameStr}>
            <Link to="/saved-posts" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                <Bookmark size={18} />
                <span>Post Salvati</span>
            </Link>
            <button className="dropdown-item" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
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
                <Link to="/" className="navbar-logo">
                    <picture>
                        <source srcSet={logoDark} media="(prefers-color-scheme: dark)" />
                        <img src={logoLight} alt="PhytoSend" className="navbar-logo-img" />
                    </picture>
                </Link>

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
                    <Link to="/" className={`navbar-icon-btn ${isActive('/')}`} title="Home">
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
                <Link to="/" className="navbar-logo">
                    <picture>
                        <source srcSet={logoDark} media="(prefers-color-scheme: dark)" />
                        <img src={logoLight} alt="PhytoSend" className="navbar-logo-img" />
                    </picture>
                </Link>
                <form className="navbar-search" onSubmit={handleSearch}>
                    <Search size={15} className="navbar-search-icon" />
                    <input
                        type="text"
                        className="navbar-search-input"
                        placeholder="Cerca piante..."
                        value={query}
                        onChange={handleQueryChange}
                    />
                </form>
            </header>

            {/* ── MOBILE: Bottom Tab Bar ── */}
            <nav className="bottom-nav">
                {/* Home */}
                <Link to="/" className={`bottom-nav-item ${isActive('/')}`}>
                    <Home size={22} />
                    <span className="icon-label">Home</span>
                </Link>

                {/* Admin */}
                {userRole === 'ADMIN' && (
                    <Link to="/admin" className={`bottom-nav-item ${isActive('/admin')}`}>
                        <Settings size={22} />
                        <span className="icon-label">Admin</span>
                    </Link>
                )}

                {/* Il mio Giardino */}
                <Link to="/my-garden" className={`bottom-nav-item ${isActive('/my-garden')}`}>
                    <Fence size={22} />
                    <span className="icon-label">MyGarden</span>
                </Link>

                {/* Notifiche */}
                <NotificationBell />

                {/* Profilo */}
                <Link to="/profile" className={`bottom-nav-item ${isActive('/profile')}`}>
                    <div className="navbar-avatar-mini">
                        {profilePhotoUrl ? (
                            <img src={profilePhotoUrl} alt="Profilo" className="navbar-avatar-photo" />
                        ) : (
                            <User size={16} />
                        )}
                    </div>
                    <span className="icon-label">Profilo</span>
                </Link>

                {/* Bottone Menu Mobile */}
                <div style={{ position: 'relative' }} ref={mobileMenuRef}>
                    <button className="bottom-nav-item" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <Menu size={22} />
                        <span className="icon-label">Altro</span>
                    </button>
                    {isMenuOpen && renderDropdownMenu("mobile-dropdown-menu")}
                </div>
            </nav>
        </>
    );
}
