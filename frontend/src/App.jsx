import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import PlayerView from './pages/PlayerView';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding'; 
import Profile from './pages/Profile';
import './styles/galaxy.css'; 

const Layout = () => {
  const location = useLocation();
  const isPlayerPage = location.pathname === '/player';
  const isAuthPage = ['/login', '/register', '/onboarding'].includes(location.pathname);
  const isAccPage = ['/profile'].includes(location.pathname);

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
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;