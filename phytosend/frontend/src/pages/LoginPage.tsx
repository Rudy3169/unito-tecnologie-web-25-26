import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react'; // <-- Importate le due icone!
import { WarningModal } from '../components/common/WarningModal';
import './LoginPage.css';

// Il tuo fantastico logo
import logoLight from '../assets/logo/PhytoSend/logo & scritta/v2 verde scuro.png';
import logoDark from '../assets/logo/PhytoSend/logo & scritta/v2 bianco.png';

interface LoginPageProps {
    onLoginSuccess: (role: 'USER' | 'ADMIN') => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Nuovo stato: Mostrare o nascondere la password?
    const [showPassword, setShowPassword] = useState(false);
    const [isDarkMode] = useState(() => {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    });
    const [warningModal, setWarningModal] = useState<{ isOpen: boolean; title?: string; message: string; type?: 'warning' | 'error' }>({
        isOpen: false,
        message: '',
    });

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();

        try {
            // Utilizziamo di nuovo il proxy relativo perché alcune versioni del browser bloccano nativamente
            // le richieste cross-origin (CORS) dirette senza preflight request.
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                // Il tuo server Spring ha detto "Login Corretto!" e ci ha restituito il Token e l'Utente
                const data = await response.json();

                // Salviamo le cose fondamentali per le chiamate future (Token e Id Utente)
                localStorage.setItem('phytosend_token', data.token);
                localStorage.setItem('phytosend_userId', data.user.id.toString());

                // Leggiamo il ruolo restituito da Java (che sarà "ADMIN", "PRO", o "BASE" come hai definito tu)
                // e per non dover riscrivere tutto il routing lo mappiamo al nostro sistema basilare
                const mappedRole = data.user.role === 'ADMIN' ? 'ADMIN' : 'USER';

                onLoginSuccess(mappedRole);
            } else {
                setWarningModal({
                    isOpen: true,
                    title: 'Accesso negato',
                    message: 'Credenziali errate o account non trovato. Verifica i dati e riprova!',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error("Errore di connessione al server:", error);
            setWarningModal({
                isOpen: true,
                title: 'Server non raggiungibile',
                message: 'Il server PhytoSend sembra essere spento o irraggiungibile. Riprova più tardi.',
                type: 'error'
            });
        }
    };


    return (
        <div className="login-container">
            <div className="login-image-side">
                <div className="login-quote">
                    <h2>Riconnettiti<br />con la natura.</h2>
                    <p>Entra a far parte della community più verde del web.</p>
                </div>
            </div>

            <div className="login-form-side">
                <div className="login-box">
                    <img src={isDarkMode ? logoDark : logoLight} alt="PhytoSend" className="login-logo" />
                    <h1>Bentornato</h1>
                    <p>Inserisci le tue credenziali per accedere al tuo giardino.</p>

                    <form className="auth-form" onSubmit={handleLogin}>
                        <div className="input-group">
                            <label>Email</label>
                            <div className="email-input-wrapper">
                                <input
                                    type="email"
                                    placeholder="es. mario@botanica.it"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div className="password-input-wrapper">
                                {/* L'attributo type cambia dinamicamente a seconda che l'utente abbia cliccato o no l'occhio */}
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                                >
                                    {/* Se showPassword è vero mostriamo l'Occhio sbarrato, sennò l'Occhio normale */}
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="login-btn">Accedi a PhytoSend</button>
                    </form>
                    {/* Finto invito alla registrazione (come da indicazioni del Prof) */}
                    <div className="register-link">
                        Non hai ancora un account?
                        <a onClick={() => setWarningModal({ isOpen: true, title: 'Registrazioni disabilitate', message: 'Accedi con un account predefinito', type: 'warning' })}>
                            Unisciti ora
                        </a>
                    </div>

                </div>
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
