import { useState } from 'react';

export function AdminPanel() {
    const [importMsg, setImportMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleImportPlants = async () => {
        const token = localStorage.getItem('phytosend_token');
        setIsLoading(true);
        setImportMsg('');

        try {
            const response = await fetch('/api/admin/import-plants?pages=2', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const msg = await response.text();
                setImportMsg('✅ ' + msg);
            } else {
                setImportMsg('❌ Errore durante l\'importazione: ' + response.status);
            }
        } catch (err) {
            setImportMsg('❌ Impossibile contattare il server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
            <h2>⚙️ Pannello Amministratore</h2>

            <section style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1.5rem', marginTop: '1rem' }}>
                <h3>📦 Importa Piante da Perenual API</h3>
                <p>Clicca per importare nuove schede botaniche nel database.</p>

                <button
                    onClick={handleImportPlants}
                    disabled={isLoading}
                    style={{ padding: '0.75rem 1.5rem', cursor: 'pointer' }}
                >
                    {isLoading ? 'Importazione in corso...' : 'Avvia Importazione'}
                </button>

                {importMsg && (
                    <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{importMsg}</p>
                )}
            </section>
        </div>
    );
}
