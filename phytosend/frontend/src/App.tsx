import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar/Sidebar';
import { HomeFeed } from './components/Feed/HomeFeed';
import { LoginPage } from './components/Auth/LoginPage';
import { Profile } from './components/Profile/Profile';
import './styles/App.css';

function App() {
    // 1. Chiediamo subito al browser se eravamo già loggati da prima!
    const savedRole = localStorage.getItem('phytosend_role') as 'USER' | 'ADMIN' | null;

    // 2. Impostiamo lo stato iniziale basandoci su quello che abbiamo trovato
    const [userRole, setUserRole] = useState<'USER' | 'ADMIN' | null>(savedRole);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(savedRole !== null);

    const handleLogin = (role: 'USER' | 'ADMIN') => {
        // 3. Quando ci logghiamo, salviamo il ruolo nel ricordino del browser!
        localStorage.setItem('phytosend_role', role);
        setIsLoggedIn(true);
        setUserRole(role);
    };

    if (!isLoggedIn) {
        return <LoginPage onLoginSuccess={handleLogin} />;
    }

    return (
        <div className="app-container">
            <Sidebar userRole={userRole} />

            <main className="main-content">
                <Routes>
                    <Route path="/" element={<HomeFeed />} />
                    <Route path="/search" element={<h2>Pagina Ricerca...</h2>} />
                    <Route path="/create-post" element={<h2>Aggiungi un nuovo Post...</h2>} />
                    <Route path="/profile" element={<Profile userRole={userRole} />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
