import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { HomeFeed } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { PlantDetail } from './pages/PlantDetailPage';
import { Profile } from './pages/ProfilePage';
import { MyGarden } from './pages/MyGardenPage';
import { NotificationPage } from './pages/NotificationPage';
import { SavedPosts } from './pages/SavedPostsPage';
import { AdminPanel } from './pages/AdminPage';
import { GlobalLoading } from './components/common/GlobalLoading';
import './styles/App.css';

function App() {
    const navigate = useNavigate();
    const savedRole = localStorage.getItem('phytosend_role') as 'USER' | 'ADMIN' | null;

    const [userRole, setUserRole] = useState<'USER' | 'ADMIN' | null>(savedRole);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(savedRole !== null);

    const handleLogin = (role: 'USER' | 'ADMIN') => {
        localStorage.setItem('phytosend_role', role);
        setIsLoggedIn(true);
        setUserRole(role);
        navigate('/');
    };

    const [isBackendReady, setIsBackendReady] = useState<boolean>(false);
    const [isTakingLong, setIsTakingLong] = useState<boolean>(false);

    useEffect(() => {
        let isMounted = true;
        let attempts = 0;

        const checkBackend = async () => {
            try {
                // Fetch to any endpoint through the Vite proxy.
                const res = await fetch('/api/social/posts?page=0&size=1');

                // Vite proxy usually returns 5xx (502, 503, 504) if the backend is down.
                if (res.status >= 500) {
                    throw new Error('Backend not reachable (Proxy Error)');
                }

                // A volte, se il proxy fallisce, Vite potrebbe restituire la sua pagina index.html di fallback.
                // Spring Boot restituirà sempre JSON (sia in caso di successo che di errore 401/403).
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('text/html')) {
                    throw new Error('Backend not reachable (Vite HTML Fallback)');
                }

                // If we reach here, it means the server responded.
                // Note: even if it's 401 Unauthorized, it means the server is running.
                if (isMounted) {
                    setIsBackendReady(true);
                }
            } catch (error) {
                // Network error: Server is still starting.
                attempts++;
                if (attempts > 13 && isMounted) {
                    setIsTakingLong(true); // After ~26 seconds show taking long message
                }
                if (isMounted) {
                    setTimeout(checkBackend, 2000); // Retry after 2 seconds
                }
            }
        };

        checkBackend();

        return () => {
            isMounted = false;
        };
    }, []);

    if (!isBackendReady) {
        return <GlobalLoading isTakingLong={isTakingLong} />;
    }

    if (!isLoggedIn) {
        return <LoginPage onLoginSuccess={handleLogin} />;
    }

    return (
        <div className="app-layout">
            <Sidebar userRole={userRole} />

            <main className="main-content">
                <Routes>
                    <Route path="/" element={<HomeFeed />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/plant/:plantId" element={<PlantDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/:userId" element={<Profile />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/my-garden" element={<MyGarden />} />
                    <Route path="/garden/:userId" element={<MyGarden />} />
                    <Route path="/saved-posts" element={<SavedPosts />} />
                    <Route path="/notifiche" element={<NotificationPage />} />
                </Routes>
            </main>

            {/* Badge copyright fisso */}
            <footer className="copyright-badge">© 2026 PhytoSend</footer>
        </div>
    );

}

export default App;
