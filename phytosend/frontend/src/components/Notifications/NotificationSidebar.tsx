import { useEffect, useState, useCallback, useRef } from 'react';
import { X, CheckCheck } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import type { NotificationData } from './NotificationItem';
import './Notifications.css';

interface NotificationSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onMarkAsRead: (id: number) => void;
    onCompleteCareEvent: (eventId: number, notificationId: number) => void;
    onMarkAllAsRead: () => void;
}

/**
 * Sidebar laterale destra (drawer) per lo storico completo delle notifiche.
 * Si apre con un'animazione slide-in da destra.
 * Supporta caricamento paginato ("Carica altre").
 */
export function NotificationSidebar({
    isOpen,
    onClose,
    onMarkAsRead,
    onCompleteCareEvent,
    onMarkAllAsRead
}: NotificationSidebarProps) {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

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
                                    onCompleteCareEvent={onCompleteCareEvent}
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
