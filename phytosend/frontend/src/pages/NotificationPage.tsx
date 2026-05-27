import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationItem } from '../components/notifications/NotificationItem';
import type { NotificationData } from '../types';
import '../components/notifications/Notifications.css';

/**
 * Pagina notifiche fullscreen per mobile.
 * Raggiungibile dalla rotta /notifiche.
 */
export function NotificationPage() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const userId = localStorage.getItem('phytosend_userId');
    const token = localStorage.getItem('phytosend_token');

    const hasUnread = notifications.some(n => !n.read);

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
            console.error('[NotificationPage] Errore fetch:', err);
        } finally {
            setLoading(false);
        }
    }, [userId, token]);

    useEffect(() => {
        fetchNotifications(0, true);
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id: number) => {
        if (!token) return;
        try {
            await fetch(`/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
            window.dispatchEvent(new Event('notifications-updated'));
        } catch { /* silenzioso */ }
    };

    const handleMarkAllAsRead = async () => {
        if (!userId || !token) return;
        try {
            await fetch(`/api/notifications/read-all?userId=${userId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            window.dispatchEvent(new Event('notifications-updated'));
        } catch { /* silenzioso */ }
    };

    return (
        <div className="notification-page">
            <div className="notification-page-header">
                <button className="notification-page-back" onClick={() => navigate(-1)}>
                    <ArrowLeft size={22} />
                </button>
                <h2>Notifiche</h2>
                {hasUnread && (
                    <button
                        className="notification-page-mark-all"
                        onClick={handleMarkAllAsRead}
                        title="Segna tutte come lette"
                    >
                        <CheckCheck size={20} />
                    </button>
                )}
            </div>

            <div className="notification-page-list">
                {hasUnread && (
                    <div className="notification-mobile-actions">
                        <button onClick={handleMarkAllAsRead} className="notification-mobile-mark-all">
                            <CheckCheck size={16} />
                            <span>Segna tutte come lette</span>
                        </button>
                    </div>
                )}

                {notifications.length === 0 && !loading ? (
                    <div className="notification-empty notification-empty-page">
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
    );
}
