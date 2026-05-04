import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import PlayerView from './pages/PlayerView';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding'; 
import Profile from './pages/Profile';
import { ToastProvider } from './components/ToastContext';
import { ConfirmProvider } from './components/ConfirmContext';
import ConsentModal from './components/ConsentModal';
import './styles/galaxy.css'; 

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showConsent, setShowConsent] = useState(false);

  const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  const isPlayerPage = location.pathname === '/player';
  const isAuthPage = ['/login', '/register', '/onboarding'].includes(location.pathname);
  const isAccPage = ['/profile'].includes(location.pathname);


  const checkConsentStatus = async () => {
    if (isAuthPage) return; 

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API}/users/me/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.is_consented === false) {
          setShowConsent(true);
        }
      }
    } catch (err) {
      console.error("Lỗi kiểm tra Consent:", err);
    }
  };

  useEffect(() => {
    checkConsentStatus();
    window.addEventListener('checkConsent', checkConsentStatus);
    return () => window.removeEventListener('checkConsent', checkConsentStatus);
  }, [location.pathname]);

  const handleAcceptConsent = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    try {
      const res = await fetch(`${API}/users/me/`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ is_consented: true })
      });
      if (res.ok) {
        setShowConsent(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogoutConsent = () => {
    localStorage.clear();
    sessionStorage.clear();
    setShowConsent(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen galaxy-bg font-sans flex flex-col text-white">
      
      <Header />
      
      <main className={`flex-grow ${!isAuthPage && isAccPage ? 'pb-[48px] md:pb-[96px]' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/player" element={<PlayerView />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/Onboarding" element={<Onboarding />} />
          <Route path="/profile" element={<Profile /> } />
        </Routes>
      </main>
      
      {!isAuthPage && <Footer />}


      <ConsentModal 
        isOpen={showConsent} 
        onAccept={handleAcceptConsent} 
        onLogout={handleLogoutConsent} 
      />
    </div>
  );
};

function App() {
  return (
    <Router>
      <ToastProvider>
        <ConfirmProvider>
           <Layout />
          </ConfirmProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;