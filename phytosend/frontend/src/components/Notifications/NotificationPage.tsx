import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationItem } from './NotificationItem';
import type { NotificationData } from './NotificationItem';
import './Notifications.css';

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
        } catch { /* silenzioso */ }
    };

    const handleCompleteCareEvent = async (eventId: number, notificationId: number) => {
        if (!token) return;
        try {
            const res = await fetch(`/api/notifications/care-events/${eventId}/complete`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                handleMarkAsRead(notificationId);
                setNotifications(prev =>
                    prev.map(n =>
                        n.id === notificationId
                            ? { ...n, read: true, message: '✅ ' + n.message.replace('💧 ', '') + ' — Fatto!' }
                            : n
                    )
                );
            }
        } catch { /* silenzioso */ }
    };

    return (
        <div className="notification-page">
            <div className="notification-page-header">
                <button className="notification-page-back" onClick={() => navigate(-1)}>
                    <ArrowLeft size={22} />
                </button>
                <h2>Notifiche</h2>
                <button
                    className="notification-page-mark-all"
                    onClick={handleMarkAllAsRead}
                    title="Segna tutte come lette"
                >
                    <CheckCheck size={20} />
                </button>
            </div>

            <div className="notification-page-list">
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
                                onCompleteCareEvent={handleCompleteCareEvent}
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
