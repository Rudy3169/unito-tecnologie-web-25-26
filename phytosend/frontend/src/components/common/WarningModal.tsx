import { useEffect } from 'react';
import { X, AlertTriangle, AlertCircle } from 'lucide-react';
import './WarningModal.css';

interface WarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    type?: 'warning' | 'error';
}

export function WarningModal({ isOpen, onClose, title, message, type = 'warning' }: WarningModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('warning-modal-open');
        } else {
            document.body.classList.remove('warning-modal-open');
        }
        return () => {
            document.body.classList.remove('warning-modal-open');
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const Icon = type === 'error' ? AlertCircle : AlertTriangle;
    const colorClass = type === 'error' ? 'modal-icon-error' : 'modal-icon-warning';

    return (
        <div className="warning-modal-overlay" onClick={onClose}>
            <div className="warning-modal-container" onClick={e => e.stopPropagation()}>
                <button className="warning-close-btn" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="warning-modal-content">
                    <div className={`warning-icon-wrapper ${colorClass}`}>
                        <Icon size={32} />
                    </div>
                    <h3>{title || (type === 'error' ? 'Errore' : 'Attenzione')}</h3>
                    <p className="modal-message">{message}</p>
                </div>

                <div className="warning-modal-footer">
                    <button className={`warning-confirm-btn ${colorClass}`} onClick={onClose}>
                        Ho capito
                    </button>
                </div>
            </div>
        </div>
    );
}
