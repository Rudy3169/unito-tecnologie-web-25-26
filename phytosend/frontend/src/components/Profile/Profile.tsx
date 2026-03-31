import './Profile.css';

interface ProfileProps {
    userRole: 'USER' | 'ADMIN' | null;
}

export function Profile({ userRole }: ProfileProps) {
    return (
        <div className="profile-container">
            <div className="profile-avatar">🌿</div>
            <h2>Il Tuo Giardino Personale</h2>

            {/* Mostriamo un tag diverso a seconda di chi ha fato l'accesso */}
            <span className={`role-badge ${userRole === 'ADMIN' ? 'role-admin' : 'role-user'}`}>
                Ruolo: {userRole}
            </span>

            <p style={{ marginTop: '2rem', color: 'var(--color-text-muted)' }}>
                Da qui in futuro potrai gestire i semi piantati e vedere la crescita della tua foresta virtuale!
            </p>
        </div>
    );
}
