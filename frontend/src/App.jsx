import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import './styles/galaxy.css'; 

function App() {
  return (
    <Router>
      <div className="min-h-screen galaxy-bg font-sans flex flex-col text-white">
        <Header />
        
        <main className="flex-grow"> 
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;