import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import './SearchPage.css';

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
        <div className="search-page">
            <div className="search-page-header">
                <h2><Users size={28} /> Esplora la Community</h2>
                <p>Tutti gli utenti iscritti a PhytoSend</p>
            </div>
            {users.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }}>Nessun utente trovato.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {users.map(user => (
                        <li key={user.id} className="user-card">
                            <div className="user-card-avatar">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-card-info">
                                <div className="user-card-name">{user.name} {user.surname}</div>
                                <div className="user-card-email">{user.email}</div>
                            </div>
                            <span className="user-card-role">{user.role}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
