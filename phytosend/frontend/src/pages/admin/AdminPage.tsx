import { useState, useEffect } from 'react';
import { LayoutDashboard, DatabaseBackup, Loader, Server, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { apiFetch } from '../../api';
import './AdminPage.css';

/**
 * COMPONENTE ADMIN PANEL
 * Dashboard riservata agli amministratori per gestire l'applicazione e il database.
 * L'accesso a questa rotta è protetto sia sul frontend (nel Router) che sul backend (Spring Security).
 */
export function AdminPanel() {
    const [totalPlants, setTotalPlants] = useState<number | null>(null);
    const [isFetchingStats, setIsFetchingStats] = useState(false);
    const [isReloading, setIsReloading] = useState(false);

    // ==========================================
    // GESTIONE MODALE GLOBALE DEL PANNELLO
    // ==========================================
    // Un unico stato racchiude tutta la configurazione del popup, che può comportarsi
    // sia da Alert (solo tasto OK) che da Confirm (Annulla / Conferma).
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

    // ==========================================
    // POLLING DELLE STATISTICHE
    // ==========================================
    const fetchDashboardData = async () => {
        const token = localStorage.getItem('phytosend_token');
        setIsFetchingStats(true);
        try {
            const response = await apiFetch('/api/admin/stats', {
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
        // POLLING: Chiede al server lo stato aggiornato ogni 5 secondi.
        // Utile ad esempio per vedere in tempo reale le piante inserite dagli utenti.
        const dataInterval = setInterval(fetchDashboardData, 5000);
        return () => clearInterval(dataInterval); // Cleanup vitale per evitare memory leaks alla distruzione del componente
    }, []);

    // Blocco dello scroll del body quando la modale dell'admin panel è aperta
    useEffect(() => {
        if (modalConfig.isOpen) {
            document.body.classList.add('admin-modal-open');
        } else {
            document.body.classList.remove('admin-modal-open');
        }
        return () => {
            document.body.classList.remove('admin-modal-open');
        };
    }, [modalConfig.isOpen]);

    // ==========================================
    // GESTORE AZIONI GENERICHE (COMMAND PATTERN)
    // ==========================================
    // Questa funzione permette di chiamare qualsiasi endpoint admin (es. ricarica catalogo)
    // passandogli la funzione set per aggiornare lo stato di caricamento corretto, 
    // permettendo il riutilizzo del codice per futuri bottoni della dashboard.
    const handleAction = async (endpoint: string, setLoadingState: (val: boolean) => void, successMsg: string) => {
        const token = localStorage.getItem('phytosend_token');
        setLoadingState(true);
        try {
            const response = await apiFetch(endpoint, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Leggiamo .text() e non .json() perché alcuni endpoint admin (es. /reload-catalog) 
            // restituiscono stringhe di conferma semplici invece di JSON formattati.
            const responseText = await response.text();

            if (response.ok) {
                showPopup('Operazione Completata', responseText || successMsg, 'success');
                fetchDashboardData(); // Aggiorna subito i counter a schermo
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

                {/* CARD 2: Sincronizzazione Database */}
                <div className="admin-card">
                    <div className="admin-card-header"><DatabaseBackup size={24} /> Sincronizza Catalogo</div>
                    <p>Aggiorna il database locale con le ultime schede botaniche dal file <strong>data.sql</strong>. <br />I nuovi dati verranno aggiunti senza sovrascrivere o eliminare i tuoi progressi.</p>
                    <button
                        className="admin-btn"
                        onClick={() => setModalConfig({
                            isOpen: true,
                            type: 'confirm',
                            title: 'Sincronizzazione Catalogo',
                            message: 'Vuoi aggiornare il catalogo botanico caricando eventuali nuove informazioni?',
                            icon: 'info',
                            onConfirm: () => { closePopup(); handleAction('/api/admin/reload-catalog', setIsReloading, 'Sincronizzazione avviata con successo!'); }
                        })}
                        disabled={isReloading}
                        style={{ marginTop: 'auto' }}
                    >
                        {isReloading ? <><Loader size={18} className="spin" /> Sincronizzazione in corso...</> : <><DatabaseBackup size={18} /> Avvia Sincronizzazione</>}
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
