import { useEffect, useState } from 'react';
import { NotificationItem } from './NotificationItem';
import type { NotificationData } from './NotificationItem';
import './Notifications.css';

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenSidebar: () => void;
    notifications: NotificationData[];
    onMarkAsRead: (id: number) => void;
    onCompleteCareEvent: (eventId: number, notificationId: number) => void;
    onMarkAllAsRead: () => void;
}

/**
 * Dropdown delle notifiche — mostra le ultime 5 notifiche.
 * Appare sotto la campanella nella navbar.
 */
export function NotificationDropdown({
    isOpen,
    onClose,
    onOpenSidebar,
    notifications,
    onMarkAsRead,
    onCompleteCareEvent,
    onMarkAllAsRead
}: NotificationDropdownProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Piccolo delay per l'animazione
            requestAnimationFrame(() => setIsVisible(true));
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            <div className={`notification-dropdown ${isVisible ? 'visible' : ''}`}>
                <div className="notification-dropdown-header">
                    <h3>Notifiche</h3>
                    {notifications.some(n => !n.read) && (
                        <button className="notification-mark-all-btn" onClick={onMarkAllAsRead}>
                            Segna tutte come lette
                        </button>
                    )}
                </div>

                <div className="notification-dropdown-list">
                    {notifications.length === 0 ? (
                        <div className="notification-empty">
                            <span className="notification-empty-icon">🔔</span>
                            <p>Nessuna notifica</p>
                        </div>
                    ) : (
                        notifications.map(n => (
                            <NotificationItem
                                key={n.id}
                                notification={n}
                                onMarkAsRead={onMarkAsRead}
                                onCompleteCareEvent={onCompleteCareEvent}
                                onClose={onClose}
                            />
                        ))
                    )}
                </div>

                {notifications.length > 0 && (
                    <button
                        className="notification-view-all-btn"
                        onClick={() => {
                            onClose();
                            onOpenSidebar();
                        }}
                    >
                        Vedi tutte
                    </button>
                )}
            </div>
        </>
    );
}
