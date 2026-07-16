import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationItem } from '../../components/notifications/NotificationItem';
import type { NotificationData } from '../../types';
import '../../components/notifications/Notifications.css';

/**
 * COMPONENTE NOTIFICATION PAGE
 * Mostra l'elenco delle notifiche in una vista a pagina intera.
 * Utilizzata principalmente su schermi piccoli (mobile) dove il dropdown della campanella risulterebbe scomodo.
 */
export function NotificationPage() {
    // ==========================================
    // 1. useState e useCallback
    // ==========================================

    const navigate = useNavigate(); // Hook per navigazione
    const [notifications, setNotifications] = useState<NotificationData[]>([]); // Lista notifiche
    const [page, setPage] = useState(0); // Pagina corrente
    const [hasMore, setHasMore] = useState(true); // Flag per altre notifiche disponibili
    const [loading, setLoading] = useState(false); // Stato caricamento

    const userId = localStorage.getItem('phytosend_userId');
    const token = localStorage.getItem('phytosend_token');

    // useCallback "memoizza" questa funzione, impedendo che venga ricreata ad ogni render di React,
    // ottimizzando l'esecuzione dell'useEffect sottostante.
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
                    setNotifications(items); // Sostituisce la lista (prima pagina)
                } else {
                    setNotifications(prev => [...prev, ...items]); // Appende i nuovi item alla lista (pagine successive)
                }

                setHasMore(!data.last); // `data.last` è fornito nativamente da Spring Data JPA (interfaccia Page)
                setPage(pageNum);
            }
        } catch (err) {
            console.error('[NotificationPage] Errore fetch:', err);
        } finally {
            setLoading(false);
        }
    }, [userId, token]);

    // ==========================================
    // 2. useEffect
    // ==========================================

    useEffect(() => {
        fetchNotifications(0, true);
    }, [fetchNotifications]);

    // ==========================================
    // 3. FUNZIONI HANDLER E UTILITY
    // ==========================================

    // Calcola se c'è almeno una notifica non letta (usato per mostrare/nascondere il tasto "Segna tutte come lette")
    const hasUnread = notifications.some(n => !n.read);

    const handleMarkAsRead = async (id: number) => {
        if (!token) return;
        try {
            await fetch(`/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Aggiornamento ottimistico: modifico lo stato locale istantaneamente per reattività UX
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
            // Emetto un evento globale per notificare il badge della campanella nella Sidebar/Navbar
            window.dispatchEvent(new Event('notifications-updated'));
        } catch { /* errore silenziato per non interrompere la UX in caso di problemi temporanei di rete */ }
    };

    const handleMarkAllAsRead = async () => {
        if (!userId || !token) return;
        try {
            await fetch(`/api/notifications/read-all?userId=${userId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            window.dispatchEvent(new Event('notifications-updated')); // Sincronizza lo stato globale
        } catch { /* silenzioso */ }
    };

    return (
        <div className="notification-page">
            {/** PAGINA NOTIFICHE - HEADER */}
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
                {/** PAGINA NOTIFICHE - AZIONI MOBILE*/}
                {hasUnread && (
                    <div className="notification-mobile-actions">
                        <button onClick={handleMarkAllAsRead} className="notification-mobile-mark-all">
                            <CheckCheck size={16} />
                            <span>Segna tutte come lette</span>
                        </button>
                    </div>
                )}

                {/** PAGINA NOTIFICHE - ELENCO NOTIFICHE O VUOTO*/}
                {notifications.length === 0 && !loading ? (
                    <div className="notification-empty notification-empty-page">
                        <span className="notification-empty-icon">🔔</span>
                        <p>Nessuna notifica</p>
                    </div>
                ) : (
                    <>
                        {/** PAGINA NOTIFICHE - NOTIFICHE */}
                        {notifications.map(n => (
                            <NotificationItem
                                key={n.id}
                                notification={n}
                                onMarkAsRead={handleMarkAsRead}
                            />
                        ))}
                        {/** PAGINA NOTIFICHE - CARICA PIU'*/}
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
