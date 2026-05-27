import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { WarningModal } from '../../components/common/WarningModal';
import './LoginPage.css';

import logoLight from '../../assets/logo/PhytoSend/logo & scritta/v2 verde scuro.png';
import logoDark from '../../assets/logo/PhytoSend/logo & scritta/v2 bianco.png';

interface LoginPageProps {
    onLoginSuccess: (role: 'USER' | 'ADMIN') => void;
}

/**
 * COMPONENTE LOGIN PAGE
 * Gestisce l'autenticazione dell'utente comunicando con l'endpoint `/api/auth/login`.
 * Include la logica per mostrare/nascondere la password e gestire messaggi di errore (modali).
 */
export function LoginPage({ onLoginSuccess }: LoginPageProps) {
    // ==========================================
    // STATI DEL COMPONENTE
    // ==========================================
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Toggle per la visibilità in chiaro della password

    // Rileva se il tema corrente è dark al mount, utile per decidere quale logo renderizzare
    const [isDarkMode] = useState(() => {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    });

    // Stato per la modale di errore/warning
    const [warningModal, setWarningModal] = useState<{ isOpen: boolean; title?: string; message: string; type?: 'warning' | 'error' }>({
        isOpen: false,
        message: '',
    });

    // ==========================================
    // LOGICA DI AUTENTICAZIONE
    // ==========================================
    const handleLogin = async (e: FormEvent) => {
        e.preventDefault(); // Evita il ricaricamento totale della pagina tipico dei form HTML nativi

        try {
            // Chiamata API di autenticazione al backend Spring Boot.
            // Passa attraverso il proxy di Vite per aggirare i blocchi CORS in sviluppo.
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                // Autenticazione riuscita: il backend restituisce un JWT (Token) e le info base dell'utente
                const data = await response.json();

                // Salvataggio dei dati cruciali di sessione nel localStorage, 
                // permettendo la persistenza dell'accesso anche chiudendo la scheda del browser.
                localStorage.setItem('phytosend_token', data.token);
                localStorage.setItem('phytosend_userId', data.user.id.toString());

                // Mappatura dei ruoli del backend (es. "BASE", "PRO", "ADMIN") in quelli semplificati del frontend
                const mappedRole = data.user.role === 'ADMIN' ? 'ADMIN' : 'USER';

                // Richiama la callback passata da App.tsx per sbloccare le rotte protette
                onLoginSuccess(mappedRole);
            } else {
                // Caso 401 Unauthorized o 403 Forbidden
                setWarningModal({
                    isOpen: true,
                    title: 'Accesso negato',
                    message: 'Credenziali errate o account non trovato. Verifica i dati e riprova!',
                    type: 'error'
                });
            }
        } catch (error) {
            // Caso in cui il server è irraggiungibile
            console.error("Errore di connessione al server:", error);
            setWarningModal({
                isOpen: true,
                title: 'Server non raggiungibile',
                message: 'Il server PhytoSend sembra essere spento o irraggiungibile. Riprova più tardi.',
                type: 'error'
            });
        }
    };

    // ==========================================
    // RENDER DELLA PAGINA
    // ==========================================
    return (
        <div className="login-container">
            {/* PANNELLO LATERALE (VISIVO): Mostrato solo su desktop, nascosto su mobile tramite CSS */}
            <div className="login-image-side">
                <div className="login-quote">
                    <h2>Riconnettiti<br />con la natura.</h2>
                    <p>Entra a far parte della community più verde del web.</p>
                </div>
            </div>

            {/* PANNELLO DEL FORM (INTERATTIVO) */}
            <div className="login-form-side">
                <div className="login-box">
                    {/* Renderizza il logo corretto basandosi sul tema estratto all'avvio */}
                    <img src={isDarkMode ? logoDark : logoLight} alt="PhytoSend" className="login-logo" />
                    <h1>Bentornato</h1>
                    <p>Inserisci le tue credenziali per accedere al tuo giardino.</p>

                    <form className="auth-form" onSubmit={handleLogin}>
                        {/* INPUT EMAIL */}
                        <div className="input-group">
                            <label>Email</label>
                            <div className="email-input-wrapper">
                                <input
                                    type="email"
                                    placeholder="es. mario@botanica.it"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required // Validazione HTML5 nativa
                                />
                            </div>
                        </div>

                        {/* INPUT PASSWORD */}
                        <div className="input-group">
                            <label>Password</label>
                            <div className="password-input-wrapper">
                                {/* L'attributo type cambia dinamicamente (da "password" a "text") in base allo stato showPassword */}
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                {/* Bottone integrato per togglare la visibilità della password */}
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* SUBMIT */}
                        <button type="submit" className="login-btn">Accedi a PhytoSend</button>
                    </form>

                    {/* FINTO LINK REGISTRAZIONE: Solo un placeholder per scopi didattici/dimostrativi */}
                    <div className="register-link">
                        Non hai ancora un account?
                        <a onClick={() => setWarningModal({ isOpen: true, title: 'Registrazioni disabilitate', message: 'Accedi con un account predefinito', type: 'warning' })}>
                            Unisciti ora
                        </a>
                    </div>
                </div>
            </div>

            {/* MODALE GLOBALE DEGLI AVVISI */}
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
