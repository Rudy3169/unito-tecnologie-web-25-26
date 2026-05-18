import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { NotificationData } from './NotificationItem';
import { NotificationDropdown } from './NotificationDropdown';
import { NotificationSidebar } from './NotificationSidebar';
import './Notifications.css';

/**
 * Componente campanella per la navbar.
 * Gestisce: badge con contatore non lette, polling ogni 30s,
 * dropdown delle ultime 5, sidebar per lo storico completo.
 */
export function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [recentNotifications, setRecentNotifications] = useState<NotificationData[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const bellRef = useRef<HTMLDivElement>(null);

    const userId = localStorage.getItem('phytosend_userId');
    const token = localStorage.getItem('phytosend_token');
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const isActive = location.pathname === '/notifiche';

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

    // Polling ogni 30 secondi per il contatore
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

    // Azione rapida: completa evento cura
    const handleCompleteCareEvent = async (eventId: number, notificationId: number) => {
        if (!token) return;
        try {
            const res = await fetch(`/api/notifications/care-events/${eventId}/complete`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                // Segna anche la notifica come letta
                handleMarkAsRead(notificationId);

                // Aggiorna la lista rimuovendo l'azione rapida visivamente
                setRecentNotifications(prev =>
                    prev.map(n =>
                        n.id === notificationId
                            ? { ...n, read: true, message: '✅ ' + n.message.replace('💧 ', '') + ' — Fatto!' }
                            : n
                    )
                );
            }
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
                    onCompleteCareEvent={handleCompleteCareEvent}
                    onMarkAllAsRead={handleMarkAllAsRead}
                />
            </div>

            <NotificationSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onMarkAsRead={handleMarkAsRead}
                onCompleteCareEvent={handleCompleteCareEvent}
                onMarkAllAsRead={handleMarkAllAsRead}
            />
        </>
    );
}
