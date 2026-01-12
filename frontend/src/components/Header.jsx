import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, User, LogOut, Phone, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [showUserMenu, setShowUserMenu] = useState(false);

  const user = {
    name: "Creep",
    avatar: "/icon002.png" 
  };

  return (
    <header className="fixed w-full  z-50 top-0 transition-all duration-300  backdrop-blur-xs border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* --- LEFT: LOGO --- */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className=" relative w-12 h-12 bg-transition rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <img src="/icon002.png" alt="Icon" className="w-12 h-12 shadow-[0px_-5px_10px_rgba(255,255,255,0.25)] rounded-full " />
            </div>
            <div className="flex flex-col">
              <span className="font-out-text font-bold text-xl text-white tracking-wide">
                MindMelody
              </span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                Mental Health AI
              </span>
            </div>

            <button 
                className="hidden md:flex items-center gap-2 text-rose-400 hover:text-rose-300 transition-colors text-sm font-medium px-3 py-1.5 rounded-full border border-rose-500/30 hover:bg-rose-500/10"
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
                <button className="text-gray-300 hover:text-white font-medium text-sm transition-colors">
                  Đăng nhập
                </button>
                <button 
                  onClick={() => setIsLoggedIn(true)} 
                  className="bg-white text-black px-5 py-2.5 rounded-full font-bold text-sm hover:bg-gray-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Đăng ký
                </button>
              </div>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 p-1 pr-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                >
                  <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full bg-gray-700" />
                  <span className="text-sm text-white font-medium hidden md:block">{user.name}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-44 bg-[#E0E0E0]/10 border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1"
                    >
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-sm text-white font-bold">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">student@university.edu</p>
                      </div>
                      
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                        <User className="w-4 h-4" /> Hồ sơ sức khỏe
                      </Link>
                      
                      <button 
                        onClick={() => setIsLoggedIn(false)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
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
    </header>
  );
};

export default Header;