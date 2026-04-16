import { useState } from 'react';
import { Settings, Package, CheckCircle, XCircle, Loader, Database } from 'lucide-react';
import './AdminPanel.css';

export function AdminPanel() {
    const [importMsg, setImportMsg] = useState('');
    const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [isLoading, setIsLoading] = useState(false);

    const handleImportPlants = async () => {
        const token = localStorage.getItem('phytosend_token');
        setIsLoading(true);
        setImportMsg('');
        setImportStatus('idle');
        try {
            const response = await fetch('/api/admin/import-plants?pages=2', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const msg = await response.text();
                setImportMsg(msg);
                setImportStatus('success');
            } else {
                setImportMsg('Errore durante l\'importazione: ' + response.status);
                setImportStatus('error');
            }
        } catch {
            setImportMsg('Impossibile contattare il server.');
            setImportStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    const [reloadMsg, setReloadMsg] = useState('');
    const [reloadStatus, setReloadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [isReloading, setIsReloading] = useState(false);

    const handleReloadCatalog = async () => {
        const token = localStorage.getItem('phytosend_token');
        setIsReloading(true);
        setReloadMsg('');
        setReloadStatus('idle');
        try {
            const response = await fetch('/api/admin/reload-catalog', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const msg = await response.text();
                setReloadMsg(msg);
                setReloadStatus('success');
            } else {
                setReloadMsg("Errore durante il ripristino: " + response.status);
                setReloadStatus('error');
            }
        } catch {
            setReloadMsg("Impossibile contattare il server.");
            setReloadStatus('error');
        } finally {
            setIsReloading(false);
        }
    };
    return (
        <div className="admin-panel">
            <div className="admin-panel-header">
                <h2><Settings size={28} /> Pannello Admin</h2>
                <p>Gestione avanzata della piattaforma PhytoSend</p>
            </div>
            <div className="admin-card">
                <h3><Package size={20} /> Perenual API</h3>
                <p>Clicca per importare nuove schede botaniche nel database locale dall'API esterna Perenual.</p>
                <button
                    className="admin-btn"
                    onClick={handleImportPlants}
                    disabled={isLoading}
                >
                    {isLoading
                        ? <><Loader size={16} /> Importazione in corso...</>
                        : <> Avvia Importazione</>
                    }
                </button>
                {importMsg && (
                    <div className={`admin-feedback ${importStatus}`}>
                        {importStatus === 'success'
                            ? <CheckCircle size={16} />
                            : <XCircle size={16} />
                        }
                        {importMsg}
                    </div>
                )}
            </div>
            <div className="admin-card">
                <h3><Database size={20} /> Database</h3>
                <p>Ripulisce il catalogo e inserisce nuovamente le piante originali dal file dei dati.</p>
                <button
                    className="admin-btn"
                    onClick={handleReloadCatalog}
                    disabled={isReloading}
                    style={{ backgroundColor: '#2b5a2e' }}
                >
                    {isReloading
                        ? <><Loader size={16} /> Ripristino in corso...</>
                        : <> Ripristina</>
                    }
                </button>
                {reloadMsg && (
                    <div className={`admin-feedback ${reloadStatus}`}>
                        {reloadStatus === 'success'
                            ? <CheckCircle size={16} />
                            : <XCircle size={16} />
                        }
                        {reloadMsg}
                    </div>
                )}
            </div>
        </div>
    );
}
