import { useState, useEffect } from 'react';
import { LayoutDashboard, DatabaseBackup, Loader, Server, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import './AdminPanel.css';

export function AdminPanel() {
    const [totalPlants, setTotalPlants] = useState<number | null>(null);
    const [isFetchingStats, setIsFetchingStats] = useState(false);
    const [isReloading, setIsReloading] = useState(false);

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: 'alert' as 'alert' | 'confirm',
        title: '',
        message: '',
        icon: 'info' as 'info' | 'success' | 'warning',
        onConfirm: () => { }
    });

    const closePopup = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

    const showPopup = (title: string, message: string, icon: 'info' | 'success' | 'warning' = 'info') => {
        setModalConfig({ isOpen: true, type: 'alert', title, message, icon, onConfirm: closePopup });
    };

    const fetchDashboardData = async () => {
        const token = localStorage.getItem('phytosend_token');
        setIsFetchingStats(true);
        try {
            const response = await fetch('/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setTotalPlants(data.totalPlants);
            }
        } catch (error) {
            console.error("Errore recupero statistiche", error);
        } finally {
            setIsFetchingStats(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const dataInterval = setInterval(fetchDashboardData, 5000);
        return () => clearInterval(dataInterval);
    }, []);

    const handleAction = async (endpoint: string, setLoadingState: (val: boolean) => void, successMsg: string) => {
        const token = localStorage.getItem('phytosend_token');
        setLoadingState(true);
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const responseText = await response.text();
            
            if (response.ok) {
                showPopup('Operazione Completata', responseText || successMsg, 'success');
                fetchDashboardData();
            } else {
                showPopup('Errore del Server', `Si è verificato un errore: ${responseText}`, 'warning');
            }
        } catch (error) {
            showPopup('Errore', 'Impossibile contattare il server.', 'warning');
        } finally {
            setLoadingState(false);
        }
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h2><LayoutDashboard size={32} /> Command Center</h2>
                {/* Il badge dell'API esterna è stato rimosso */}
            </div>

            <div className="admin-grid">

                {/* CARD 1: Statistiche Database */}
                <div className="admin-card">
                    <div className="admin-card-header"><Server size={24} /> Stato Database</div>
                    <p>Contenuto attuale del tuo database locale PostgreSQL.</p>
                    <div className="stat-box">
                        <h4>{isFetchingStats && totalPlants === null ? <Loader className="spin" /> : totalPlants}</h4>
                        <span>Schede Botaniche</span>
                    </div>
                </div>

                {/* CARD 2: Ripristino Database */}
                <div className="admin-card">
                    <div className="admin-card-header"><DatabaseBackup size={24} /> Ripristino Database</div>
                    <p>Forza il ricaricamento del file <strong>data.sql</strong> per ripristinare i dati base del catalogo, utile in caso di dati corrotti o test.</p>
                    <button
                        className="admin-btn danger"
                        onClick={() => setModalConfig({
                            isOpen: true,
                            type: 'confirm',
                            title: 'Attenzione!',
                            message: 'Sei sicuro di voler ripristinare il database dal file SQL? Le modifiche ai dati base potrebbero essere sovrascritte.',
                            icon: 'warning',
                            onConfirm: () => { closePopup(); handleAction('/api/admin/reload-catalog', setIsReloading, 'Ripristino avviato con successo!'); }
                        })}
                        disabled={isReloading}
                        style={{ marginTop: 'auto' }}
                    >
                        {isReloading ? <><Loader size={18} className="spin" /> Ripristino in corso...</> : <><AlertTriangle size={18} /> Avvia Ripristino SQL</>}
                    </button>
                </div>
            </div>

            {/* Popup Modale */}
            {modalConfig.isOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="admin-modal-icon">
                            {modalConfig.icon === 'success' ? <CheckCircle size={48} color="#22c55e" /> : modalConfig.icon === 'warning' ? <AlertTriangle size={48} color="#dc2626" /> : <Info size={48} color="#3b82f6" />}
                        </div>
                        <h4>{modalConfig.title}</h4>
                        <p>{modalConfig.message}</p>
                        <div className="admin-modal-actions">
                            {modalConfig.type === 'confirm' && <button className="admin-btn cancel" onClick={closePopup}>Annulla</button>}
                            <button className={`admin-btn ${modalConfig.icon === 'warning' ? 'danger' : ''}`} onClick={modalConfig.onConfirm}>{modalConfig.type === 'confirm' ? 'Conferma' : 'OK, ho capito'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}