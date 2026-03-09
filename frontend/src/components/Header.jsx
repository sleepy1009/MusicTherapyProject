import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, User, LogOut, Phone, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [userName, setUserName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userAvatar, setUserAvatar] = useState('/icon002.png'); 

  const location = useLocation();
  const navigate = useNavigate();

  const updateUserInfo = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const displayName = localStorage.getItem('displayName') || sessionStorage.getItem('displayName');
    const email = localStorage.getItem('email') || sessionStorage.getItem('email');
    const avatar = localStorage.getItem('avatar') || sessionStorage.getItem('avatar');
    const userName = localStorage.getItem('username') || sessionStorage.getItem('username');
    
    if (token) {
      setIsLoggedIn(true);
      setDisplayName(displayName || 'Khách');
      setUserName(userName || '');
      setUserEmail(email || '');
      setUserAvatar(avatar || '/icon002.png'); 
    } else {
      setIsLoggedIn(false);
      setDisplayName('');
      setUserName('');
      setUserEmail('');
      setUserAvatar('/icon002.png');
    }
  };

  useEffect(() => {
    updateUserInfo();

    window.addEventListener('profileUpdated', updateUserInfo);
    
    return () => {
        window.removeEventListener('profileUpdated', updateUserInfo);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setIsLoggedIn(false);
    setShowUserMenu(false);
    navigate('/'); 
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20, scale: 1  }} 
      animate={{ opacity: 1, y: 0, scale: 1 }} 
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed w-full z-50 top-0 transition-all duration-300 backdrop-blur-xs border-b border-white/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* --- LEFT: LOGO --- */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className=" relative w-12 h-12 bg-transition rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <img src="/icon002.png" alt="Icon" className="w-12 h-12 shadow-[0px_-5px_10px_rgba(255,255,255,0.25)] rounded-full " />
            </div>
            <div className="flex flex-col">
              <span className="font-out-text font-bold text-xl text-main_text tracking-wide">
                MindMelody
              </span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                Mental Health AI
              </span>
            </div>

            <button 
                className="hidden md:flex items-center gap-2 text-rose-400 hover:text-rose-300 transition-colors text-sm font-medium px-3 py-1.5 rounded-full border border-rose-500/30 hover:bg-rose-500/10 cursor-pointer"
                title="Hỗ trợ khẩn cấp"
            >
                <Phone className="w-4 h-4" />
                <span>SOS</span>
            </button>
          </Link>

          {/* --- RIGHT: ACTIONS --- */}
          <div className="flex items-center gap-6">
            
            {!isLoggedIn ? (
              <div className="flex items-center gap-4">
                <Link 
                  to="/login"
                  className="text-gray-300 hover:text-white font-medium text-sm transition-colors cursor-pointer"
                >
                  Đăng nhập
                </Link>
                <Link 
                  to="/register"
                  className="bg-main_text text-black px-5 py-2.5 rounded-full font-bold text-sm hover:bg-gray-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] flex items-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  Đăng ký
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center max-w-[200px]  gap-3 p-1 pr-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                >
                  <img src={userAvatar} alt="Avatar" className="w-8 h-8 rounded-full bg-gray-700 object-cover" />
                  <span className="text-sm text-white font-medium hidden md:block truncate">{displayName}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: -40, scale: 1 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-42 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1"
                    >
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-sm text-white font-bold truncate">{displayName}</p>
                        <p className="text-xs text-gray-400 truncate">{userName}</p>
                      </div>
                      
                      <Link 
                        to="/profile" 
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <User className="w-4 h-4" /> Trang cá nhân
                      </Link>
                      
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Đăng xuất
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;