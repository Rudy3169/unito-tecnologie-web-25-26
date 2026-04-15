import { useState } from 'react';
import { Settings, Package, CheckCircle, XCircle, Loader } from 'lucide-react';
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
    return (
        <div className="admin-panel">
            <div className="admin-panel-header">
                <h2><Settings size={28} /> Pannello Amministratore</h2>
                <p>Gestione avanzata della piattaforma PhytoSend</p>
            </div>
            <div className="admin-card">
                <h3><Package size={20} /> Importa Piante da Perenual API</h3>
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
        </div>
    );
}
