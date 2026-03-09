import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, Mail, Headphones, Music, AlertOctagon, Edit3, Shield, Check, X, Save, PersonStanding   } from 'lucide-react';

const MUSIC_GENRES = {
  'pop': 'Pop', 'lofi': 'Lofi & Chill', 'acoustic': 'Acoustic', 
  'classical': 'Cổ điển', 'piano': 'Piano Không Lời', 'ambient': 'Ambient / Không gian',
  'edm': 'EDM / Dance', 'rock': 'Rock', 'rap': 'Rap / Hip-hop', 'jazz': 'Jazz'
};

const TabInfo = ({ userData, onEditAvatar, onSaveProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    likedGenres: [],
    dislikedGenres: []
  });

  useEffect(() => {
    setFormData({
      name: userData.name || '',
      age: userData.age || '',
      likedGenres: userData.likedGenres || [],
      dislikedGenres: userData.dislikedGenres || []
    });
  }, [userData]);

  const handleCancel = () => {
    setFormData({
      name: userData.name || '',
      age: userData.age || '',
      likedGenres: userData.likedGenres || [],
      dislikedGenres: userData.dislikedGenres || []
    });
    setIsEditing(false);
  };

  const handleSave = () => {
    onSaveProfile({
    ...formData,
    avatar: userData.avatar
  });
  setIsEditing(false);
  };

  // Logic Click 3 trạng thái: Thích -> Ghét -> Bình thường
  const handleGenreClick = (id) => {
    if (!isEditing) return;

    if (formData.likedGenres.includes(id)) {
        setFormData(prev => ({
            ...prev,
            likedGenres: prev.likedGenres.filter(g => g !== id),
            dislikedGenres: [...prev.dislikedGenres, id]
        }));
    } else if (formData.dislikedGenres.includes(id)) {
        setFormData(prev => ({
            ...prev,
            dislikedGenres: prev.dislikedGenres.filter(g => g !== id)
        }));
    } else {
        setFormData(prev => ({
            ...prev,
            likedGenres: [...prev.likedGenres, id]
        }));
    }
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} 
        className="w-full h-full text-white max-w-5xl mx-auto pb-10"
    >
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
           <h2 className="flex items-center gap-2 text-2xl font-bold font-out-text text-transparent bg-clip-text bg-gradient-to-r from-[#75ae88] to-[#cbf4d8]">
                <User  className="w-8 h-8 text-[#41A67E]" />
                Thông tin cá nhân
            </h2>
            <AnimatePresence mode="wait">
                {!isEditing ? (
                    <motion.button 
                        key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-sm text-white font-medium transition-colors"
                    >
                        <Edit3 className="w-4 h-4" /> Chỉnh sửa
                    </motion.button>
                ) : (
                    <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                        <button onClick={handleCancel} className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors">
                            Hủy
                        </button>
                        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-[#41A67E] hover:bg-[#66D0BC] text-black font-bold rounded-xl transition-colors shadow-[0_0_15px_rgba(65,166,126,0.3)]">
                            <Save className="w-4 h-4" /> Lưu thay đổi
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-16 ">
            {/* left Avatar */}
            <div className="flex flex-col items-center lg:items-start gap-6">
                <div className={`relative group ${isEditing ? 'cursor-pointer' : ''}`} 
                    onClick={() => isEditing && onEditAvatar()}
                    style={{ width: '80%', maxWidth: '164px', minWidth: '164px' }}>
                <div className={`w-full rounded-3xl overflow-hidden border-4 bg-black/50 shadow-xl transition-all duration-300
                                ${isEditing ? 'border-[#41A67E]' : 'border-white/10'}`}>
                    <img src={userData.avatar} alt="Avatar" className="w-full h-auto object-cover aspect-square" />
                </div>
                {isEditing && (
                    <div className="absolute inset-0 bg-black/60 rounded-3xl flex flex-col items-center justify-center gap-2 transition-opacity">
                    <Edit3 className="w-6 h-6 text-white" />
                    <span className="text-xs font-medium">Đổi Avatar</span>
                    </div>
                )}
                </div>

                {!isEditing && (
                <button className="w-full max-w-[160px] py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" /> Đổi mật khẩu
                </button>
                )}
            </div>

            {/* right */}
            <div className="space-y-8 w-full ">
                
                {/* 1. info */}
                <div className={`bg-white/5 border rounded-2xl backdrop-blur-xl p-6 space-y-5 transition-colors ${isEditing ? 'border-[#41A67E]/50' : 'border-white/10'}`}>
                    <h3 className="text-sm font-bold text-main_text uppercase tracking-widest flex items-center gap-2 mb-4">
                        <User className="w-4 h-4" /> Thông tin cơ bản
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">Tên hiển thị</label>
                            {isEditing ? (
                                <input 
                                    type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-black/40 border border-[#41A67E] rounded-lg px-4 py-2.5 text-sm font-medium text-white focus:outline-none"
                                />
                            ) : (
                                <div className="bg-black/30 border border-white/5 rounded-lg px-4 py-2.5 text-sm font-medium text-white">{formData.name}</div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">Độ tuổi</label>
                            {isEditing ? (
                                <input 
                                    type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})}
                                    className="w-full bg-black/40 border border-[#41A67E] rounded-lg px-4 py-2.5 text-sm font-medium text-white focus:outline-none"
                                />
                            ) : (
                                <div className="bg-black/30 border border-white/5 rounded-lg px-4 py-2.5 text-sm font-medium text-white flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" /> {formData.age} tuổi
                                </div>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs text-gray-400 mb-1.5">Email liên kết (Không thể đổi)</label>
                            <div className="bg-black/30 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-gray-400 flex items-center gap-2 opacity-70 cursor-not-allowed">
                                <Mail className="w-4 h-4 text-gray-400" /> {userData.email}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2.  */}
                <div className={`bg-white/5 border rounded-2xl backdrop-blur-xl mb-8 p-6 transition-colors ${isEditing ? 'border-[#41A67E]/50' : 'border-white/10'}`}>
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-bold text-main_text uppercase tracking-widest flex items-center gap-2">
                            <Headphones className="w-4 h-4" /> Thông tin âm nhạc
                        </h3>
                    </div>

                    {isEditing ? (
                        <div>
                            <p className="text-xs text-gray-400 mb-4 italic">
                                * Click để đổi trạng thái: <span className="text-[#66D0BC]">Thích</span> ➔ <span className="text-rose-400">Ghét</span> ➔ <span className="text-gray-400">Bình thường</span>
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {Object.entries(MUSIC_GENRES).map(([id, label]) => {
                                    const isLiked = formData.likedGenres.includes(id);
                                    const isDisliked = formData.dislikedGenres.includes(id);
                                    
                                    return (
                                        <motion.button
                                            key={id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={() => handleGenreClick(id)}
                                            className={`px-4 py-2 text-xs font-medium rounded-lg border transition-all ${
                                                isLiked ? 'bg-[#41A67E]/20 border-[#41A67E]/50 text-[#66D0BC]' : 
                                                isDisliked ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 
                                                'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                            }`}
                                        >
                                            {isLiked && <Music className="w-3 h-3 inline-block mr-1.5"/>}
                                            {isDisliked && <AlertOctagon className="w-3 h-3 inline-block mr-1.5"/>}
                                            {label}
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div>
                                <p className="text-xs text-gray-400 mb-2.5 flex items-center gap-1.5"><Music className="w-3.5 h-3.5 text-[#41A67E]"/> Vùng an toàn (Yêu thích):</p>
                                <div className="flex flex-wrap gap-2">
                                    {formData.likedGenres.map(id => (
                                        <span key={id} className="px-3 py-1.5 bg-[#41A67E]/20 border border-[#41A67E]/30 text-[#66D0BC] text-xs font-medium rounded-lg">
                                            {MUSIC_GENRES[id]}
                                        </span>
                                    ))}
                                    {formData.likedGenres.length === 0 && <span className="text-xs text-gray-600 italic">Chưa thiết lập</span>}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-2.5 flex items-center gap-1.5"><AlertOctagon className="w-3.5 h-3.5 text-rose-400"/> Cần tránh (Trigger):</p>
                                <div className="flex flex-wrap gap-2">
                                    {formData.dislikedGenres.map(id => (
                                        <span key={id} className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium rounded-lg">
                                            {MUSIC_GENRES[id]}
                                        </span>
                                    ))}
                                    {formData.dislikedGenres.length === 0 && <span className="text-xs text-gray-600 italic">Không có</span>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </motion.div>
  );
};

export default TabInfo;