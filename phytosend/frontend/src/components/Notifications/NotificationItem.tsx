import { Heart, MessageCircle, Reply, Droplets, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Notifications.css';

export interface NotificationData {
    id: number;
    actorId?: number;
    actorName?: string;
    actorProfilePhotoUrl?: string;
    type: 'LIKE_POST' | 'COMMENT' | 'REPLY' | 'LIKE_COMMENT' | 'CARE_WATER';
    referenceId?: number;
    secondaryReferenceId?: number;
    postAuthorId?: number;
    message: string;
    read: boolean;
    createdAt: string;
}

interface NotificationItemProps {
    notification: NotificationData;
    onMarkAsRead: (id: number) => void;
    onCompleteCareEvent?: (eventId: number, notificationId: number) => void;
    onClose?: () => void;
}

/**
 * Componente singola notifica — usato sia nel Dropdown che nella Sidebar.
 * Mostra avatar, messaggio, timestamp, pallino non letta, e azione rapida per CARE_WATER.
 */
export function NotificationItem({ notification, onMarkAsRead, onCompleteCareEvent, onClose }: NotificationItemProps) {
    const navigate = useNavigate();

    // Icona in base al tipo di notifica
    const getIcon = () => {
        switch (notification.type) {
            case 'LIKE_POST':
            case 'LIKE_COMMENT':
                return <Heart size={16} fill="var(--color-error)" color="var(--color-error)" />;
            case 'COMMENT':
                return <MessageCircle size={16} color="var(--color-primary)" />;
            case 'REPLY':
                return <Reply size={16} color="var(--color-primary)" />;
            case 'CARE_WATER':
                return <Droplets size={16} color="#4fc3f7" />;
            default:
                return <MessageCircle size={16} />;
        }
    };

    // Timestamp relativo ("2 min fa", "1 ora fa", etc.)
    const getRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMin < 1) return 'Adesso';
        if (diffMin < 60) return `${diffMin} min fa`;
        if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'ora' : 'ore'} fa`;
        if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'giorno' : 'giorni'} fa`;
        return date.toLocaleDateString('it-IT');
    };

    // Iniziali dell'attore per l'avatar fallback
    const getInitials = () => {
        if (!notification.actorName) return '🌱';
        return notification.actorName.charAt(0).toUpperCase();
    };

    // Navigazione contestuale
    const handleClick = () => {
        // Segna come letta
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }

        // Chiudi dropdown/sidebar
        onClose?.();

        switch (notification.type) {
            case 'LIKE_POST':
                if (notification.referenceId && notification.postAuthorId) {
                    navigate(`/profile/${notification.postAuthorId}?openPost=${notification.referenceId}&openLikes=true&likeUserId=${notification.actorId}`);
                }
                break;

            case 'COMMENT':
                if (notification.referenceId && notification.postAuthorId) {
                    navigate(`/profile/${notification.postAuthorId}?openPost=${notification.referenceId}&openComments=true&commentId=${notification.secondaryReferenceId}`);
                }
                break;

            case 'REPLY':
            case 'LIKE_COMMENT':
                if (notification.referenceId && notification.postAuthorId) {
                    navigate(`/profile/${notification.postAuthorId}?openPost=${notification.referenceId}&openComments=true&commentId=${notification.secondaryReferenceId}`);
                }
                break;

            case 'CARE_WATER':
                if (notification.referenceId) {
                    navigate(`/my-garden?plantId=${notification.referenceId}`);
                }
                break;
        }
    };

    // Azione rapida: completa evento cura
    const handleCompleteCareEvent = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (notification.secondaryReferenceId && onCompleteCareEvent) {
            onCompleteCareEvent(notification.secondaryReferenceId, notification.id);
        }
    };

    return (
        <div
            className={`notification-item ${!notification.read ? 'unread' : ''}`}
            onClick={handleClick}
        >
            {/* Pallino non letta */}
            {!notification.read && <div className="notification-unread-dot" />}

            {/* Avatar attore */}
            <div className="notification-avatar">
                {notification.actorProfilePhotoUrl ? (
                    <img src={notification.actorProfilePhotoUrl} alt="" className="notification-avatar-img" />
                ) : (
                    <span className="notification-avatar-fallback">{getInitials()}</span>
                )}
                <div className="notification-type-icon">{getIcon()}</div>
            </div>

            {/* Contenuto */}
            <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">{getRelativeTime(notification.createdAt)}</span>
            </div>

            {/* Azione rapida per CARE_WATER */}
            {notification.type === 'CARE_WATER' && !notification.read && onCompleteCareEvent && (
                <button
                    className="notification-quick-action"
                    onClick={handleCompleteCareEvent}
                    title="Segna come fatto"
                >
                    <Check size={16} />
                </button>
            )}
        </div>
    );
}
