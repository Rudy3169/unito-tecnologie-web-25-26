import { useEffect, useState, useCallback, useRef } from 'react';
import { X, CheckCheck } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import type { NotificationData } from '../../types';
import './Notifications.css';

interface NotificationSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onMarkAsRead: (id: number) => void;
    onMarkAllAsRead: () => void;
}

/**
 * COMPONENTE NOTIFICATION SIDEBAR
 * Drawer laterale ("Offcanvas") per visualizzare lo storico completo delle notifiche su Desktop.
 * Implementa un caricamento paginato server-side per limitare la quantità di dati trasferiti (UX optimization).
 */
export function NotificationSidebar({
    isOpen,
    onClose,
    onMarkAsRead,
    onMarkAllAsRead
}: NotificationSidebarProps) {
    // ==========================================
    // 1. useState, useRef e useCallback
    // ==========================================

    const [notifications, setNotifications] = useState<NotificationData[]>([]); // Lista delle notifiche
    const [page, setPage] = useState(0); // Pagina corrente per la paginazione
    const [hasMore, setHasMore] = useState(true); // Flag per sapere se ci sono altre notifiche da caricare
    const [loading, setLoading] = useState(false); // Stato di caricamento
    const [isVisible, setIsVisible] = useState(false); // Stato per gestire l'animazione CSS
    const sidebarRef = useRef<HTMLDivElement>(null); // Riferimento al div della sidebar per il click outside

    const userId = localStorage.getItem('phytosend_userId');
    const token = localStorage.getItem('phytosend_token');

    const fetchNotifications = useCallback(async (pageNum: number, reset = false) => {
        if (!userId || !token) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/notifications?userId=${userId}&page=${pageNum}&size=20`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const items: NotificationData[] = data.content || [];

                if (reset) {
                    setNotifications(items);
                } else {
                    setNotifications(prev => [...prev, ...items]);
                }

                setHasMore(!data.last);
                setPage(pageNum);
            }
        } catch (err) {
            console.error('[NotificationSidebar] Errore fetch:', err);
        } finally {
            setLoading(false);
        }
    }, [userId, token]);

    // ==========================================
    // 2. useEffect
    // ==========================================

    // Carica notifiche quando la sidebar si apre
    useEffect(() => {
        if (isOpen) {
            fetchNotifications(0, true);
            requestAnimationFrame(() => setIsVisible(true));
        } else {
            setIsVisible(false);
        }
    }, [isOpen, fetchNotifications]);

    // Chiudi cliccando fuori
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    // ==========================================
    // 3. FUNZIONI HANDLER
    // ==========================================

    // Aggiorna la notifica locale quando viene segnata come letta
    const handleMarkAsRead = (id: number) => {
        onMarkAsRead(id);
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    // Aggiorna le notifiche locali quando vengono tutte segnate come lette
    const handleMarkAllAsRead = () => {
        onMarkAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay scuro */}
            <div className={`notification-sidebar-overlay ${isVisible ? 'visible' : ''}`} onClick={onClose} />

            {/* Sidebar */}
            <div ref={sidebarRef} className={`notification-sidebar ${isVisible ? 'visible' : ''}`}>
                {/* Header */}
                <div className="notification-sidebar-header">
                    <h2>Notifiche</h2>
                    <div className="notification-sidebar-actions">
                        <button
                            className="notification-sidebar-mark-all"
                            onClick={handleMarkAllAsRead}
                            title="Segna tutte come lette"
                        >
                            <CheckCheck size={18} />
                        </button>
                        <button className="notification-sidebar-close" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Lista notifiche */}
                <div className="notification-sidebar-list">
                    {notifications.length === 0 && !loading ? (
                        <div className="notification-empty">
                            <span className="notification-empty-icon">🔔</span>
                            <p>Nessuna notifica</p>
                        </div>
                    ) : (
                        <>
                            {notifications.map(n => (
                                <NotificationItem
                                    key={n.id}
                                    notification={n}
                                    onMarkAsRead={handleMarkAsRead}
                                    onClose={onClose}
                                />
                            ))}
                            {hasMore && (
                                <button
                                    className="notification-load-more"
                                    onClick={() => fetchNotifications(page + 1)}
                                    disabled={loading}
                                >
                                    {loading ? 'Caricamento...' : 'Carica altre'}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
