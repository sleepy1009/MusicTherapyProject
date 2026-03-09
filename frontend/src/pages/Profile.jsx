import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, BarChart2, BookOpen, Headphones, ChevronLeft, ChevronRight, LogOut, Edit3, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ParticlesBackground from '../components/reactbits/ParticlesBackground';
import TabInfo from '../components/profile/TabInfo';
import TabStats from '../components/profile/TabStats';
import TabDiary from '../components/profile/TabDiary';
import TabTherapy from '../components/profile/TabTherapy';

const AVAILABLE_AVATARS = [
  '/avatars/av6.png',
  '/avatars/av5.png',
  '/avatars/av2.png',
  '/avatars/av0.png',
  '/avatars/av4.png',
  '/avatars/av1.png',
  '/avatars/av3.png',
];

const Profile = () => {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); 
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const [userData, setUserData] = useState({
    name: '',
    email: '...',
    age: '',
    avatar: AVAILABLE_AVATARS[0],
    likedGenres: [],
    dislikedGenres: []
  });

  const menuItems = [
    { id: 'info', icon: User, label: 'Thông tin cá nhân' },
    { id: 'stats', icon: BarChart2, label: 'Thống kê & Biểu đồ' },
    { id: 'diary', icon: BookOpen, label: 'Nhật ký cảm xúc' },
    { id: 'therapy', icon: Headphones, label: 'Góc Nghe Nhạc (Therapy)' },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
          navigate('/login'); // Chưa đăng nhập thì đuổi ra login
          return;
      }

      try {
        const res = await fetch(`${API}/users/me/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const loadedAvatar = data.avatar || AVAILABLE_AVATARS[0];
          setUserData({
            name: data.display_name || data.username,
            email: data.email,
            age: data.age || '',
            avatar: loadedAvatar,
            likedGenres: data.music_preferences?.liked_genres || [],
            dislikedGenres: data.music_preferences?.disliked_genres || []
          });
          const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
            storage.setItem('avatar', loadedAvatar);
            storage.setItem('email', data.email);
            storage.setItem('displayName', data.display_name || data.username);
            window.dispatchEvent(new Event('profileUpdated'));
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
      }
    };
    fetchProfile();
  }, [navigate, API]);

  const handleSaveProfile = async (updatedData) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    try {
        const res = await fetch(`${API}/users/me/`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                display_name: updatedData.name,
                age: updatedData.age,
                music_preferences: {
                    liked_genres: updatedData.likedGenres,
                    disliked_genres: updatedData.dislikedGenres
                }
            })
        });

        if (res.ok) {
            const data = await res.json();
            setUserData(prev => ({
                ...prev,
                name: data.display_name || data.username,
                age: data.age,
                likedGenres: data.music_preferences?.liked_genres || [],
                dislikedGenres: data.music_preferences?.disliked_genres || []
            }));
            
            const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
            storage.setItem('displayName', data.display_name || data.username);
            window.dispatchEvent(new Event('profileUpdated'));
        }
    } catch (err) {
        console.error("Lỗi lưu dữ liệu:", err);
        alert("Có lỗi xảy ra khi lưu dữ liệu!");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };

  const handleAvatarChange = async (newAvatar) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    try {
        const res = await fetch(`${API}/users/me/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ avatar: newAvatar }) 
        });

        if (!res.ok) {
            console.error("Backend từ chối lưu avatar!");
            return;
        }

        setUserData(prev => ({ ...prev, avatar: newAvatar }));
        setShowAvatarModal(false);

        const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
        storage.setItem('avatar', newAvatar);
        window.dispatchEvent(new Event('profileUpdated'));
    } catch (error) {
        console.error(error);
    }
  };

  return (
    <div className="profile-container relative w-full flex-1 flex flex-col min-h-[calc(100vh-64px)] pt-24 pb-12 px-4 md:px-8 overflow-hidden text-main_text">
      <div className="absolute inset-0 z-0">
        <ParticlesBackground
          particleCount={500} particleSpread={10} speed={0.1} 
          particleColors={['#ffffff', '#bfff51ff', '#ff7676ff']} 
          moveParticlesOnHover={true} particleHoverFactor={1}
          alphaParticles={true} particleBaseSize={100} sizeRandomness={1}
          cameraDistance={20} disableRotation={false} className="w-full h-full"
        />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto h-[calc(100vh-140px)] flex gap-6">
        
        <motion.div
          animate={{ width: isCollapsed ? 88 : 280 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="h-full bg-[#F3F4F4]/10  border border-white/20 rounded-3xl flex flex-col relative shadow-[0_0_20px_rgba(255,255,255,0.05)] overflow-hidden flex-shrink-0"
        >
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute top-6 right-[-14px] bg-[#41A67E] hover:bg-[#66D0BC] p-1.5 rounded-full text-white z-20 transition-all shadow-lg"
            style={{ right: isCollapsed ? '50%' : '16px', transform: isCollapsed ? 'translateX(50%)' : 'none', top: isCollapsed ? '16px' : '24px' }}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          <div className={`flex flex-col items-center border-b border-white/10 transition-all duration-300 ${isCollapsed ? 'p-4 pt-14' : 'p-4'}`}>
            <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
                <motion.img 
                    animate={{ width: isCollapsed ? 48 : 80, height: isCollapsed ? 48 : 80 }}
                    src={userData.avatar} alt="Avatar" 
                    className="rounded-full object-cover  border-2 border-white/20 bg-black/50 shadow-lg group-hover:border-[#41A67E] transition-colors"
                />
                {!isCollapsed && (
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Edit3 className="w-5 h-5 text-white" />
                    </div>
                )}
            </div>
            
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-center mt-4 overflow-hidden">
                  <h3 className="text-lg font-bold font-out-text text-white tracking-wide">{userData.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{userData.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 py-6 px-3 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id} onClick={() => setActiveTab(item.id)} title={isCollapsed ? item.label : ""}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-[#41A67E]/20 text-[#66D0BC] border border-[#41A67E]/30 shadow-[0_0_10px_rgba(65,166,126,0.2)]' : 'text-main_text/90 hover:bg-white/5 hover:text-white border border-transparent '
                  }`}
                > 
                  <Icon className={`w-6 h-6 flex-shrink-0 pl-1 ${isActive ? 'text-[#66D0BC]' : ''}`} />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="font-medium font-out-text whitespace-nowrap text-sm">
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-white/10">
            <button onClick={handleLogout} title={isCollapsed ? "Đăng xuất" : ""} className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium text-sm">Đăng xuất</span>}
            </button>
          </div>
        </motion.div>

        <motion.div layout className="flex-1 h-full bg-[#F3F4F4]/10  border border-white/20 rounded-3xl p-6 md:p-8 relative shadow-[0_0_20px_rgba(255,255,255,0.05)] overflow-y-auto custom-scrollbar">
            {activeTab === 'info' && <TabInfo userData={userData} onEditAvatar={() => setShowAvatarModal(true)} onSaveProfile={handleSaveProfile} />}
            
            {activeTab === 'stats' && <TabStats />}
            {activeTab === 'diary' && <TabDiary />}
            {activeTab === 'therapy' && <TabTherapy />}
        </motion.div>
      </div>

      <AnimatePresence>
        {showAvatarModal && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowAvatarModal(false)}
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()} 
                    className="w-full max-w-2xl bg-[#1a1c23] border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                >
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <h3 className="text-xl font-bold text-white">Chọn Ảnh Đại Diện</h3>
                        <button onClick={() => setShowAvatarModal(false)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-8 grid grid-cols-3 md:grid-cols-4 gap-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {AVAILABLE_AVATARS.map((avatar, index) => {
                            const isSelected = userData.avatar === avatar;
                            return (
                                <motion.div 
                                    key={index} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAvatarChange(avatar)}
                                    className={`relative cursor-pointer aspect-square rounded-2xl overflow-hidden border-4 transition-all duration-300 ${
                                        isSelected ? 'border-[#66D0BC] shadow-[0_0_20px_rgba(102,208,188,0.4)]' : 'border-transparent bg-white/5 hover:border-white/20'
                                    }`}
                                >
                                    <img src={avatar} alt={`Avatar ${index}`} className="w-full h-full object-cover" />
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-6 h-6 bg-[#66D0BC] rounded-full flex items-center justify-center text-black shadow-lg">
                                            <Check className="w-4 h-4 font-bold" />
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
      <style dangerouslySetInnerHTML={{__html: `
        .profile-container .custom-scrollbar {
          /* Firefox */
          scrollbar-width: thin;
          scrollbar-color: transparent transparent; /* thumb và track trong suốt */
        }

        /* Chrome, Safari, Opera */
        .profile-container .custom-scrollbar::-webkit-scrollbar {
          width: 12px; 
        }

        .profile-container .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; 
        }

        .profile-container .custom-scrollbar::-webkit-scrollbar-thumb {
          background: transparent; 
        }

    `}} />
    </div>
  );
};

export default Profile;