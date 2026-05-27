import { useState, type FormEvent } from 'react';
import { X, Save } from 'lucide-react';
import { apiFetch } from '../../api';
import { WarningModal } from '../Common/WarningModal';
import type { UserProfile } from '../../types';

interface ProfileSettingsProps {
    user: UserProfile;
    onClose: () => void;
    onSaved: () => void;
}

export function ProfileSettings({ user, onClose, onSaved }: ProfileSettingsProps) {
    const [name, setName] = useState(user.name || '');
    const [surname, setSurname] = useState(user.surname || '');
    const [bio, setBio] = useState(user.bio || '');
    const [city, setCity] = useState(user.city || '');
    const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
    const [saving, setSaving] = useState(false);
    const [warningModal, setWarningModal] = useState<{ isOpen: boolean; title?: string; message: string; type?: 'warning' | 'error' }>({
        isOpen: false,
        message: '',
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !surname.trim()) {
            setWarningModal({
                isOpen: true,
                title: 'Campi obbligatori',
                message: 'Nome e Cognome non possono essere vuoti. Inserisci i tuoi dati per continuare.',
                type: 'warning'
            });
            return;
        }

        setSaving(true);

        const token = localStorage.getItem('phytosend_token');

        try {
            const response = await apiFetch(`/api/utenti/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, surname, bio, city, phoneNumber })
            });

            if (response.ok) {
                onSaved();
            } else {
                setWarningModal({
                    isOpen: true,
                    title: 'Errore salvataggio',
                    message: 'Non è stato possibile salvare le modifiche. Riprova più tardi.',
                    type: 'error'
                });
            }
        } catch {
            setWarningModal({
                isOpen: true,
                title: 'Errore di rete',
                message: 'Impossibile contattare il server. Controlla la tua connessione.',
                type: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="profile-settings-overlay" onClick={onClose}>
            <div className="profile-settings-modal" onClick={e => e.stopPropagation()}>
                <div className="settings-header">
                    <h3>Modifica Profilo</h3>
                    <button className="comment-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="settings-form">
                    <div className="settings-field">
                        <label>Nome</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Il tuo nome"
                        />
                    </div>

                    <div className="settings-field">
                        <label>Cognome</label>
                        <input
                            type="text"
                            value={surname}
                            onChange={e => setSurname(e.target.value)}
                            placeholder="Il tuo cognome"
                        />
                    </div>

                    <div className="settings-field">
                        <label>Bio</label>
                        <textarea
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            placeholder="Racconta qualcosa di te..."
                            maxLength={300}
                            rows={3}
                        />
                        <span className="char-count">{bio.length}/300</span>
                    </div>

                    <div className="settings-field">
                        <label>Città</label>
                        <input
                            type="text"
                            value={city}
                            onChange={e => setCity(e.target.value)}
                            placeholder="La tua città"
                        />
                    </div>

                    <div className="settings-field">
                        <label>Telefono</label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={e => setPhoneNumber(e.target.value)}
                            placeholder="+39 ..."
                        />
                    </div>


                    <button type="submit" className="settings-save-btn" disabled={saving}>
                        <Save size={16} />
                        {saving ? 'Salvataggio...' : 'Salva Modifiche'}
                    </button>
                </form>
            </div>
            <WarningModal
                isOpen={warningModal.isOpen}
                onClose={() => setWarningModal(prev => ({ ...prev, isOpen: false }))}
                title={warningModal.title}
                message={warningModal.message}
                type={warningModal.type}
            />
        </div>
    );
}
