import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Home, Search, User, LogOut, Settings } from 'lucide-react';
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

    const isActive = (path: string) => location.pathname === path ? 'active' : '';

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim() || searchType === 'users' || searchType === 'plants') {
            navigate(`/search?q=${encodeURIComponent(query.trim())}&type=${searchType}`);
        }
    };


    const handleLogout = () => {
        localStorage.removeItem('phytosend_role');
        localStorage.removeItem('phytosend_token');
        localStorage.removeItem('phytosend_userId');
        window.location.reload();
    };

    return (
        <>
            {/* ── DESKTOP: Top Navbar ── */}
            <header className="navbar">
                {/* Logo */}
                <a href="/" className="navbar-logo">
                    <picture>
                        <source srcSet={logoDark} media="(prefers-color-scheme: dark)" />
                        <img src={logoLight} alt="PhytoSend" className="navbar-logo-img" />
                    </picture>
                </a>

                {/* Search form */}
                <form className="navbar-search" onSubmit={handleSearch}>
                    <div className="search-wrapper">
                        <select
                            className="navbar-search-select"
                            value={searchType}
                            onChange={e => setSearchType(e.target.value)}
                        >
                            <option value="plants">Piante</option>
                            <option value="users">Utenti</option>
                        </select>
                        <div className="search-divider"></div>
                        <Search size={16} className="navbar-search-icon" />
                        <input
                            type="text"
                            className="navbar-search-input"
                            placeholder={searchType === 'plants' ? "Cerca nel catalogo..." : "Cerca utenti..."}
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                        />
                    </div>
                </form>

                {/* Icone destra */}
                <nav className="navbar-nav">
                    {/* Home icon */}
                    <a href="/" className={`navbar-icon-btn ${isActive('/')}`} title="Home">
                        <Home size={22} />
                    </a>

                    {/* Admin icon */}
                    {userRole === 'ADMIN' && (
                        <Link to="/admin" className={`navbar-icon-btn ${isActive('/admin')}`} title="Admin">
                            <Settings size={22} />
                        </Link>
                    )}

                    {/* Logout button */}
                    <button className="navbar-icon-btn" onClick={handleLogout} title="Esci">
                        <LogOut size={22} />
                    </button>

                    {/* Avatar profilo */}
                    <Link to="/profile" className={`navbar-avatar ${isActive('/profile')}`} title="Profilo">
                        <User size={18} />
                    </Link>
                </nav>
            </header>

            {/* ── MOBILE: Header ── */}
            <header className="mobile-header">
                <a href="/" className="navbar-logo">
                    <picture>
                        <source srcSet={logoDark} media="(prefers-color-scheme: dark)" />
                        <img src={logoLight} alt="PhytoSend" className="navbar-logo-img" />
                    </picture>
                </a>
                <form className="navbar-search" onSubmit={handleSearch}>
                    <Search size={15} className="navbar-search-icon" />
                    <input
                        type="text"
                        className="navbar-search-input"
                        placeholder="Cerca piante..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                </form>
            </header>

            {/* ── MOBILE: Bottom Tab Bar ── */}
            <nav className="bottom-nav">
                <Link to="/" className={`bottom-nav-item ${isActive('/')}`}>
                    <Home size={22} />
                </Link>
                {userRole === 'ADMIN' && (
                    <Link to="/admin" className={`bottom-nav-item ${isActive('/admin')}`}>
                        <Settings size={22} />
                    </Link>
                )}
                <Link to="/profile" className={`bottom-nav-item ${isActive('/profile')}`}>
                    <User size={22} />
                </Link>
                <button className="bottom-nav-item" onClick={handleLogout}>
                    <LogOut size={22} />
                </button>
            </nav>
        </>
    );
}
