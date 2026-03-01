import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import PlayerView from './pages/PlayerView';
import './styles/galaxy.css'; 

function App() {
  return (
    <Router>
      <div className="min-h-screen galaxy-bg font-sans flex flex-col text-white">
        <Header />
        
        <main className="flex-grow"> 
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/player" element={<PlayerView />} />
          </Routes>
        </main>
        
        {/* ẩn Footer ở trang Player sau này để tối ưu không gian, 
            nhưng tạm thời cứ giữ nguyên cấu trúc này */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;