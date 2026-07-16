import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { NotificationData } from '../../types';
import { NotificationDropdown } from './NotificationDropdown';
import { NotificationSidebar } from './NotificationSidebar';
import './Notifications.css';

/**
 * COMPONENTE NOTIFICATION BELL
 * Componente "Smart" della Navbar. Gestisce il contatore delle notifiche non lette 
 * tramite Polling HTTP (ogni 30s) e funge da trigger per Dropdown (Ultime) o Sidebar (Tutte).
 * Intercetta eventi globali ('notifications-updated') per sincronizzazioni cross-component.
 */
export function NotificationBell() {
    // ==========================================
    // 1. useState
    // ==========================================

    const [unreadCount, setUnreadCount] = useState(0); // Contatore delle notifiche non lette
    const [recentNotifications, setRecentNotifications] = useState<NotificationData[]>([]); // Ultime notifiche da mostrare nel dropdown
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Stato di apertura del dropdown
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Stato di apertura della sidebar delle notifiche
    const bellRef = useRef<HTMLDivElement>(null); // Riferimento al bottone per gestire il click outside

    const userId = localStorage.getItem('phytosend_userId'); // ID utente recuperato da localStorage
    const token = localStorage.getItem('phytosend_token'); // Token recuperato da localStorage
    const navigate = useNavigate(); // Navigazione tra pagine
    const location = useLocation(); // Posizione corrente
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768; // Verifica se dispositivo mobile
    const isActive = location.pathname === '/notifiche'; // Indica se la pagina corrente è quella delle notifiche

    // ==========================================
    // 2. useCallback
    // ==========================================

    // Fetch contatore non lette
    const fetchUnreadCount = useCallback(async () => {
        if (!userId || !token) return;
        try {
            const res = await fetch(`/api/notifications/count?userId=${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.count || 0);
            }
        } catch {
            // Silenzioso — il polling non deve causare problemi
        }
    }, [userId, token]);

    // Fetch ultime 5 notifiche (on-demand quando si apre il dropdown)
    const fetchRecentNotifications = useCallback(async () => {
        if (!userId || !token) return;
        try {
            const res = await fetch(`/api/notifications/recent?userId=${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data: NotificationData[] = await res.json();
                setRecentNotifications(data);
            }
        } catch {
            // Silenzioso
        }
    }, [userId, token]);

    // ==========================================
    // 3. useEffect
    // ==========================================

    // Chiude il dropdown se si clicca fuori
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isDropdownOpen && bellRef.current && !bellRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    // POLLING ARCHITECTURE:
    // Effettua una chiamata HTTP ogni 30 secondi (30000ms) per mantenere aggiornato
    // il badge delle notifiche non lette, garantendo all'utente un feedback quasi in tempo reale
    // senza sovraccaricare il server (come avverrebbe con WebSocket o delay più brevi).
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    // Ascolta gli aggiornamenti delle notifiche in tempo reale da altre pagine per aggiornare il contatore
    useEffect(() => {
        window.addEventListener('notifications-updated', fetchUnreadCount);
        return () => window.removeEventListener('notifications-updated', fetchUnreadCount);
    }, [fetchUnreadCount]);

    // Quando si apre il dropdown, fetch le notifiche recenti
    useEffect(() => {
        if (isDropdownOpen) {
            fetchRecentNotifications();
        }
    }, [isDropdownOpen, fetchRecentNotifications]);

    // ==========================================
    // 4. FUNZIONI HANDLER
    // ==========================================

    // Segna una notifica come letta
    const handleMarkAsRead = async (notificationId: number) => {
        if (!token) return;
        try {
            await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Aggiorna lo stato locale
            setRecentNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch {
            // Silenzioso
        }
    };

    // Segna tutte come lette
    const handleMarkAllAsRead = async () => {
        if (!userId || !token) return;
        try {
            await fetch(`/api/notifications/read-all?userId=${userId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setRecentNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch {
            // Silenzioso
        }
    };

    // Toggle dropdown
    const handleBellClick = () => {
        if (isMobile) {
            navigate('/notifiche');
        } else {
            if (isSidebarOpen) return;
            setIsDropdownOpen(!isDropdownOpen);
        }
    };

    // Apri sidebar (desktop) o naviga (mobile)
    const handleOpenSidebar = () => {
        if (isMobile) {
            // Su mobile si naviga alla pagina tramite react-router-dom
            navigate('/notifiche');
        } else {
            setIsSidebarOpen(true);
        }
    };

    return (
        <>
            <div className="notification-bell-container" ref={bellRef}>
                <button
                    className={`navbar-icon-btn notification-bell-btn ${isDropdownOpen || isActive ? 'active' : ''}`}
                    onClick={handleBellClick}
                    title="Notifiche"
                >
                    <Bell size={22} />
                    {unreadCount > 0 && (
                        <span className="notification-badge">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                    <span className="icon-label">Notifiche</span>
                </button>

                <NotificationDropdown
                    isOpen={isDropdownOpen}
                    onClose={() => setIsDropdownOpen(false)}
                    onOpenSidebar={handleOpenSidebar}
                    notifications={recentNotifications}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
                />
            </div>

            <NotificationSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
            />
        </>
    );
}
