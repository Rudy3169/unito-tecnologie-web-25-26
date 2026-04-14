import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, User, LogOut, Settings } from 'lucide-react';
import './Sidebar.css';

import logoImage from '../../assets/logo/PhytoSend/logo & scritta/v2 verde scuro.png';

interface SidebarProps {
    userRole: 'USER' | 'ADMIN' | null;
}

export function Sidebar({ userRole }: SidebarProps) {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path ? 'active' : '';

    return (
        <aside className="sidebar">
            <Link to="/" className="sidebar-logo-container">
                <img src={logoImage} alt="PhytoSend Logo" className="sidebar-logo" />
            </Link>

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

            <div style={{ flex: 1 }}></div>

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
