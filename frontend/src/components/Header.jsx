import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, User, LogOut, Phone, AlertTriangle  } from 'lucide-react';
import { motion, AnimatePresence  } from 'framer-motion';

import { useToast } from './ToastContext'; 
import { useConfirm } from './ConfirmContext'; 

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, 
      delayChildren: 0.5 
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: 20, scale: 0.8 },
  visible: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }
};

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [displayName, setDisplayName] = useState('');
  const [userAvatar, setUserAvatar] = useState('/icon002.png'); 
  const [showSOS, setShowSOS] = useState(false);
  const sosButtonRef = useRef(null);
  
  const toast = useToast();
  const { confirm } = useConfirm();

  const location = useLocation();
  const navigate = useNavigate();

  const updateUserInfo = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const name = localStorage.getItem('displayName') || sessionStorage.getItem('displayName');
    const avatar = localStorage.getItem('avatar') || sessionStorage.getItem('avatar');
    
    if (token) {
      setIsLoggedIn(true);
      setDisplayName(name || 'Khách');
      setUserAvatar(avatar || '/icon002.png'); 
    } else {
      setIsLoggedIn(false);
      setDisplayName('');
      setUserAvatar('/icon002.png');
    }
  };

  const sosDropdownRef = useRef(null);

  useEffect(() => {
      const handleClickOutside = (e) => {
          if (
              sosDropdownRef.current && !sosDropdownRef.current.contains(e.target) &&
              sosButtonRef.current && !sosButtonRef.current.contains(e.target)
          ) {
              setShowSOS(false);
          }
      };

      if (showSOS) document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSOS]);

  useEffect(() => {
    updateUserInfo();
    window.addEventListener('profileUpdated', updateUserInfo);
    return () => window.removeEventListener('profileUpdated', updateUserInfo);
  }, [location.pathname]);

  const handleLogout = async () => {
    const isConfirmed = await confirm({
        title: "Đăng xuất?",
        message: "Bạn có chắc chắn muốn đăng xuất khỏi MindMelody không?",
        confirmText: "Đăng xuất",
        cancelText: "Hủy",
        type: "warning" 
    });

    if (!isConfirmed) return;

    localStorage.clear();
    sessionStorage.clear();
    setIsLoggedIn(false);
    navigate('/'); 

    toast.success("Đã đăng xuất thành công. Hẹn gặp lại bạn nhé!");
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed w-full z-50 top-0 transition-all duration-300 backdrop-blur-xs border-b border-white/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 bg-transition rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <img src="/icon002.png" alt="Icon" className="w-12 h-12 shadow-[0px_-5px_10px_rgba(255,255,255,0.25)] rounded-full " />
              </div>
              <div className="flex flex-col">
                <span className="font-out-text font-bold text-xl text-main_text tracking-wide">
                  MindMelody
                </span>
                <span className="text-[10px] text-main_text/60 uppercase tracking-widest">
                  M̵e̷n̷t̵a̴l̵ Health AI
                </span>
              </div>
            </Link>

                <button 
                  ref={sosButtonRef}
                  onClick={() => setShowSOS(true)}
                  className="hidden md:flex items-center gap-2 text-[#EB4C4C]/80 hover:text-[#EB4C4C] transition-colors text-sm font-medium px-3 py-1.5 rounded-full border border-[#EB4C4C]/30 hover:bg-[#EB4C4C]/10 cursor-pointer"
              >
                  <Phone size={16} className="animate-pulse" />
                  <span className="hidden sm:inline">SOS</span>
              </button>
            
          </div>

          <div className="flex items-center gap-4">
            {!isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-main_text hover:text-[#C9CDCF] text-sm font-medium transition-colors">Đăng nhập</Link>
                <Link to="/register" className="bg-white hover:bg-[#C9CDCF] text-black px-5 py-2 rounded-full font-bold text-sm transition-all shadow-lg flex items-center gap-2">
                  <LogIn size={16} /> Đăng ký
                </Link>
              </div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-3"
              >
                <motion.div variants={itemVariants} className="hidden md:block text-right max-w-[150px]">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-tighter"></p>
                  <p className="text-sm text-white font-bold font-out-text truncate leading-tight">{displayName}</p>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Link to="/profile" className="relative group block">
                    <motion.img 
                      whileHover={{ scale: 1.1, rotate: 5 }} 
                      src={userAvatar} 
                      alt="Avatar" 
                      className="w-10 h-10 rounded-full border border-white/20 object-cover group-hover:border-white transition-colors" 
                    />
                    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants} className="flex items-center bg-black border border-white/30 p-1 rounded-full backdrop-blur-xl shadow-2xl">
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      to="/profile"
                      className="hidden sm:flex justify-center bg-main_text min-w-[90px] gap-2 px-1 py-1 text-base font-bold font-out-text text-black hover:bg-[#C9CDCF] rounded-full transition-colors"
                    >
                      <span>Hồ sơ</span>
                    </Link>
                  </motion.div>

                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="flex items-center bg-white/5 gap-2 px-2 py-1 ml-1 text-sm font-bold font-out-text text-[#EB4C4C]/80 hover:text-[#EB4C4C]  rounded-full transition-colors cursor-pointer"
                  >
                    <span className="hidden sm:inline">Đăng xuất</span>
                  </motion.button>

                </motion.div>
              </motion.div>
            )}
          </div>

        </div>
      </div>

        <AnimatePresence>
          {showSOS && (
              <motion.div
                  ref={sosDropdownRef}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="absolute top-full left-44 mt-1 z-50 px-4"
              >
                  <div className="bg-zinc-900 border border-[#EB4C4C]/30 p-5 rounded-2xl w-[420px] shadow-2xl">
                      <p className="flex justify-center text-gray-300 text-sm mb-3">
                          Nếu cảm thấy tâm lý mình đang bất ổn, hãy liên hệ
                      </p>
                      <div className="space-y-2">
                          <a href="tel:02435765344" className="flex items-center justify-between p-3 bg-[#EB4C4C]/5 rounded-xl hover:bg-[#EB4C4C]/10 transition border border-[#EB4C4C]/10">
                              <span className="font-medium text-white text-sm">Viện SKTTQG</span>
                              <span className="text-rose-400 font-bold text-xs">(024) 3576 5344 hoặc 0984 104 115</span>
                          </a>
                          <a href="tel:0963061414" className="flex items-center justify-between p-3 bg-[#EB4C4C]/5 rounded-xl hover:bg-[#EB4C4C]/10 transition border border-[#EB4C4C]/10">
                              <span className="font-medium text-white text-sm">Đường dây nóng Ngày Mai</span>
                              <span className="text-rose-400 font-bold text-xs">096 306 1414</span>
                          </a>
                      </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;