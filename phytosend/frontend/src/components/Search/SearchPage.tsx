import { useState, useEffect } from 'react';

interface UserResult {
    id: number;
    name: string;
    surname: string;
    email: string;
    role: string;
}

export function SearchPage() {
    const [users, setUsers] = useState<UserResult[]>([]);

    useEffect(() => {
        const token = localStorage.getItem('phytosend_token');

        fetch('/api/utenti', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error(`Errore: ${res.status}`);
                return res.json();
            })
            .then(data => setUsers(data.content ?? []))
            .catch(err => console.error("Errore caricamento utenti:", err));
    }, []);

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
            <h2>🌍 Esplora la Community</h2>
            <p>Tutti gli utenti iscritti a PhytoSend:</p>

            {users.length === 0 ? (
                <p>Nessun utente trovato.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {users.map(user => (
                        <li key={user.id} style={{
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '0.5rem'
                        }}>
                            <strong>{user.name} {user.surname}</strong>
                            <br />
                            <small>{user.email} — {user.role}</small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
