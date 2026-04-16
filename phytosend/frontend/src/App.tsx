import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar/Sidebar';
import { HomeFeed } from './components/Feed/HomeFeed';
import { LoginPage } from './components/Auth/LoginPage';
import { Profile } from './components/Profile/Profile';
import { SearchPage } from './components/Search/SearchPage';
import { AdminPanel } from './components/Admin/AdminPanel';
import { MyGarden } from './components/MyGarden/MyGarden';
import './styles/App.css';

function App() {
    const savedRole = localStorage.getItem('phytosend_role') as 'USER' | 'ADMIN' | null;

    const [userRole, setUserRole] = useState<'USER' | 'ADMIN' | null>(savedRole);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(savedRole !== null);

    const handleLogin = (role: 'USER' | 'ADMIN') => {
        localStorage.setItem('phytosend_role', role);
        setIsLoggedIn(true);
        setUserRole(role);
    };

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
                    <Route path="/profile" element={<Profile userRole={userRole} />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/my-garden" element={<MyGarden />} />
                </Routes>
            </main>

            {/* Badge copyright fisso */}
            <footer className="copyright-badge">© 2026 PhytoSend</footer>
        </div>
    );

}

export default App;
