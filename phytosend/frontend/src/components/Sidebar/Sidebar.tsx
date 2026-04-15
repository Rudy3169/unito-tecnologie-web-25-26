import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, User, LogOut, Settings } from 'lucide-react';
import logoLight from '../../assets/logo/PhytoSend/logo & scritta/v2 verde scuro.png';
import logoDark from '../../assets/logo/PhytoSend/logo & scritta/v2 bianco.png';
import './Sidebar.css';

interface SidebarProps {
    userRole: 'USER' | 'ADMIN' | null;
}

export function Sidebar({ userRole }: SidebarProps) {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path ? 'active' : '';

    return (
        <aside className="sidebar">
            <div className="sidebar-logo-container">
                <Link to="/">
                    <picture>
                        <source srcSet={logoDark} media="(prefers-color-scheme: dark)" />
                        <img src={logoLight} alt="PhytoSend" className="sidebar-logo" />
                    </picture>
                </Link>
            </div>

            <nav className="sidebar-nav">
                <Link to="/" className={`nav-item ${isActive('/')}`}>
                    <Home className="nav-icon" />
                    <span>Home</span>
                </Link>

                <Link to="/search" className={`nav-item ${isActive('/search')}`}>
                    <Search className="nav-icon" />
                    <span>Esplora Giardini</span>
                </Link>

                {userRole === 'ADMIN' && (
                    <Link to="/admin" className={`nav-item ${isActive('/admin')}`}>
                        <Settings className="nav-icon" style={{ color: 'var(--color-earth)' }} />
                        <span style={{ color: 'var(--color-earth)' }}>Pannello Admin</span>
                    </Link>
                )}

                <Link to="/profile" className={`nav-item ${isActive('/profile')}`}>
                    <User className="nav-icon" />
                    <span>Profilo</span>
                </Link>
            </nav>

            {/* Spacer */}
            <div style={{ flex: 1 }}></div>

            {/* Divisore */}
            <div className="sidebar-divider"></div>

            {/* Logout */}
            <button
                className="nav-item"
                style={{ width: '100%', textAlign: 'left' }}
                onClick={() => {
                    localStorage.removeItem('phytosend_role');
                    localStorage.removeItem('phytosend_token');
                    localStorage.removeItem('phytosend_userId');
                    window.location.reload();
                }}

            >
                <LogOut className="nav-icon" style={{ color: 'var(--color-error)' }} />
                <span style={{ color: 'var(--color-error)' }}>Esci</span>
            </button>
        </aside>
    );
}
