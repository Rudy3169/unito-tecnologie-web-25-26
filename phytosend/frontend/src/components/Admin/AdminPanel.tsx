import { useState, useEffect } from 'react';
import { LayoutDashboard, CloudDownload, DatabaseBackup, Loader, Server, AlertTriangle, CheckCircle, Info, Clock } from 'lucide-react';
import './AdminPanel.css';

export function AdminPanel() {
    const MAX_DAILY_PAGES = 10; // Limite di sicurezza (300 piante)

    const [totalPlants, setTotalPlants] = useState<number | null>(null);
    const [importedToday, setImportedToday] = useState<number>(0);
    const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

    const [isFetchingStats, setIsFetchingStats] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isReloading, setIsReloading] = useState(false);


    const [pagesToImport, setPagesToImport] = useState<number>(1);
    const [timeLeftToMidnight, setTimeLeftToMidnight] = useState<string>('');

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
                setImportedToday(data.importedToday || 0);
                setApiStatus(data.perenualOnline ? 'online' : 'offline');
            } else {
                setApiStatus('offline');
            }
        } catch (error) {
            setApiStatus('offline');
        } finally {
            setIsFetchingStats(false);
        }
    };

    // Timer per Mezzanotte e Auto-Aggiornamento Statistiche
    useEffect(() => {
        fetchDashboardData();

        // Calcolo Timer Mezzanotte
        const timer = setInterval(() => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0); // Prossima mezzanotte
            const diff = midnight.getTime() - now.getTime();

            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeftToMidnight(`${h}h ${m}m ${s}s`);
        }, 1000);

        // Aggiorna le statistiche ogni 5 secondi
        const dataInterval = setInterval(fetchDashboardData, 5000);

        return () => {
            clearInterval(timer);
            clearInterval(dataInterval);
        };
    }, []);

    const handleAction = async (endpoint: string, setLoadingState: (val: boolean) => void, successMsg: string) => {
        const token = localStorage.getItem('phytosend_token');
        setLoadingState(true);
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                showPopup('Operazione Avviata', `${successMsg}\n\nL'operazione sta procedendo in background.`, 'success');
                fetchDashboardData();
            } else {
                showPopup('Errore del Server', `Si è verificato un errore: ${response.status}`, 'warning');
            }
        } catch (error) {
            showPopup('Errore', 'Impossibile contattare il server.', 'warning');
        } finally {
            setLoadingState(false);
        }
    };

    // Calcolo Pagine Rimaste
    const pagesUsed = Math.floor(importedToday / 30);
    const pagesRemaining = Math.max(0, MAX_DAILY_PAGES - pagesUsed);
    const limitReached = pagesRemaining <= 0;

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h2><LayoutDashboard size={32} /> Command Center</h2>
                <div className="api-status-badge">
                    <div className={`status-dot ${apiStatus}`}></div>
                    <span>API Perenual: {apiStatus === 'checking' ? 'Verifica...' : apiStatus.toUpperCase()}</span>
                </div>
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

                {/* CARD 2: Importazione con Quota - VISIBILE SOLO SE L'API E' ONLINE */}
                {apiStatus == 'online' && (
                    <div className="admin-card">
                        <div className="admin-card-header"><CloudDownload size={24} /> Importa Piante</div>
                        <p>Per non bloccare l'API di traduzione, hai un limite di <strong>{MAX_DAILY_PAGES} pagine al giorno</strong>.</p>

                        <div style={{ background: limitReached ? '#fee2e2' : '#f0fdf4', padding: '12px', borderRadius: '8px', marginBottom: '15px', border: `1px solid ${limitReached ? '#fca5a5' : '#bbf7d0'}`, textAlign: 'center' }}>
                            {limitReached ? (
                                <span style={{ color: '#dc2626', fontWeight: 'bold' }}>Quota giornaliera esaurita</span>
                            ) : (
                                <span style={{ color: '#166534', fontWeight: 'bold' }}>Pagine rimaste oggi: {pagesRemaining}</span>
                            )}
                        </div>

                        {!limitReached ? (
                            <>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px' }}>Quante scaricarne ora?</label>
                                    <input
                                        type="number" min="1" max={pagesRemaining}
                                        value={pagesToImport > pagesRemaining ? pagesRemaining : pagesToImport}
                                        onChange={(e) => setPagesToImport(Number(e.target.value))}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                                    />
                                </div>

                                <button
                                    className="admin-btn"
                                    onClick={() => handleAction(`/api/admin/import-plants?pages=${pagesToImport}`, setIsImporting, `Importazione di ${pagesToImport} pagine avviata!`)}
                                    disabled={isImporting}
                                    style={{ marginTop: 'auto' }}
                                >
                                    {isImporting ? <><Loader size={18} className="spin" /> Download...</> : `Avvia Download`}
                                </button>
                            </>
                        ) : (
                            <button
                                className="admin-btn danger"
                                disabled={true}
                                style={{
                                    marginTop: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px',
                                    padding: '10px',
                                    opacity: 0.8
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                                    <Clock size={18} /> Limite Raggiunto
                                </div>
                                <span style={{ fontSize: '0.85rem', fontWeight: 'normal' }}>
                                    Riprova tra: {timeLeftToMidnight}
                                </span>
                            </button>
                        )}
                    </div>
                )}

                {/* CARD 3: Ripristino Database */}
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