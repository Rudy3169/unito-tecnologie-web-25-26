import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { HomeFeed } from './pages/home/HomePage';
import { SearchPage } from './pages/search/SearchPage';
import { PlantDetail } from './pages/plant/PlantDetailPage';
import { Profile } from './pages/profile/ProfilePage';
import { MyGarden } from './pages/garden/MyGardenPage';
import { NotificationPage } from './pages/notifications/NotificationPage';
import { SavedPosts } from './pages/saved-posts/SavedPostsPage';
import { AdminPanel } from './pages/admin/AdminPage';
import { GlobalLoading } from './components/common/GlobalLoading';
import './styles/App.css';

function App() {
    const navigate = useNavigate();

    // Recupera il ruolo salvato in precedenza per mantenere l'utente loggato anche dopo un refresh
    const savedRole = localStorage.getItem('phytosend_role') as 'USER' | 'ADMIN' | null;

    // ==========================================
    // STATI GLOBALI DELL'APP
    // ==========================================

    // Stato di Autenticazione
    const [userRole, setUserRole] = useState<'USER' | 'ADMIN' | null>(savedRole);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(savedRole !== null);

    /**
     * Funzione chiamata dal LoginPage al momento del login effettuato con successo.
     * Salva il ruolo, aggiorna lo stato e reindirizza l'utente alla Home.
     */
    const handleLogin = (role: 'USER' | 'ADMIN') => {
        localStorage.setItem('phytosend_role', role);
        setIsLoggedIn(true);
        setUserRole(role);
        navigate('/');
    };

    // Stato di connettività col Server
    const [isBackendReady, setIsBackendReady] = useState<boolean>(false);
    const [isTakingLong, setIsTakingLong] = useState<boolean>(false); // Mostra un messaggio extra se ci mette troppo

    // ==========================================
    // PING DEL BACKEND (WAITING FOR SPRING BOOT)
    // ==========================================
    // Blocca l'UI con un loader finché il backend non risponde.
    useEffect(() => {
        let isMounted = true; // evita memory leak in caso di refresh forzato
        let attempts = 0;

        const checkBackend = async () => {
            try {
                // Fetch a un endpoint qualsiasi. La chiamata passa tramite il proxy di Vite.
                const res = await fetch('/api/social/posts?page=0&size=1');

                // Se il server Spring non è ancora su, il proxy di Vite restituisce solitamente un errore 5xx.
                if (res.status >= 500) {
                    throw new Error('Backend not reachable (Proxy Error)');
                }

                // Se Vite non trova il proxy configurato, potrebbe rispondere lui stesso con il suo index.html come fallback.
                // Vogliamo scartare questo caso verificando che non sia HTML.
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('text/html')) {
                    throw new Error('Backend not reachable (Vite HTML Fallback)');
                }

                // Se arriviamo qui, il backend è vivo. Anche un 401 (Unauthorized) o 403 significa che Spring è attivo.
                if (isMounted) {
                    setIsBackendReady(true);
                }
            } catch (error) {
                // Rete non pronta: Il server si sta ancora avviando. Riprova.
                attempts++;
                if (attempts > 13 && isMounted) {
                    setIsTakingLong(true); // Dopo circa 26 secondi cambia il testo della schermata
                }
                if (isMounted) {
                    setTimeout(checkBackend, 2000); // Ritenta la fetch tra 2 secondi
                }
            }
        };

        checkBackend(); // Avvia la prima fetch

        return () => {
            isMounted = false; // Cleanup per prevenire memory leak in caso di refresh forzato
        };
    }, []);

    // ==========================================
    // RENDERING CONDIZIONALE PRINCIPALE
    // ==========================================

    // Se il backend non è ancora raggiungibile, mostra la schermata di caricamento globale
    if (!isBackendReady) {
        return <GlobalLoading isTakingLong={isTakingLong} />;
    }

    // Se il backend è pronto ma l'utente non è loggato, costringilo sulla pagina di Login
    if (!isLoggedIn) {
        return <LoginPage onLoginSuccess={handleLogin} />;
    }

    // L'utente è loggato ed il backend è pronto -> Mostra l'applicazione completa
    return (
        <div className="app-layout">
            {/* Sidebar di navigazione globale, visibile in ogni rotta */}
            <Sidebar userRole={userRole} />

            {/* Contenitore principale dove React Router inietterà dinamicamente le varie Pagine in base all'URL */}
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<HomeFeed />} />
                    <Route path="/search" element={<SearchPage />} />

                    {/* Rotte Dinamiche: I path params (come :plantId o :userId) possono essere letti dai componenti figli */}
                    <Route path="/plant/:plantId" element={<PlantDetail />} />

                    {/* Le route possono avere versioni con o senza parametri dinamici per gestire sia "il mio profilo" che "profilo di un altro" */}
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/:userId" element={<Profile />} />

                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/my-garden" element={<MyGarden />} />
                    <Route path="/garden/:userId" element={<MyGarden />} />
                    <Route path="/saved-posts" element={<SavedPosts />} />
                    <Route path="/notifiche" element={<NotificationPage />} />
                </Routes>
            </main>

            {/* Badge copyright fisso in basso a destra */}
            <footer className="copyright-badge">© 2026 PhytoSend</footer>
        </div>
    );

}

export default App;
