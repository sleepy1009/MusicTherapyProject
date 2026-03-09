import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, Music, AlertOctagon, ArrowRight, ArrowLeft, CheckCircle2, Star } from 'lucide-react';
import ParticlesBackground from '../components/reactbits/ParticlesBackground';

const MUSIC_GENRES =[
  { id: 'pop', label: 'Pop' },
  { id: 'lofi', label: 'Lofi & Chill' },
  { id: 'acoustic', label: 'Acoustic' },
  { id: 'classical', label: 'Cổ điển' },
  { id: 'piano', label: 'Piano Không Lời' },
  { id: 'ambient', label: 'Ambient / Không gian' },
  { id: 'edm', label: 'EDM / Dance' },
  { id: 'rock', label: 'Rock' },
  { id: 'rap', label: 'Rap / Hip-hop' },
  { id: 'jazz', label: 'Jazz' },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState(20);
  const[likedGenres, setLikedGenres] = useState([]);
  const [dislikedGenres, setDislikedGenres] = useState([]);

  const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  const[isHovered, setIsHovered] = useState(false);
  const [starExitCoords, setStarExitCoords] = useState({ x: -100, y: 0 });

  useEffect(() => {
    const savedName = localStorage.getItem('displayName');
    if (savedName) setDisplayName(savedName);
  },[]);

  const handleMouseEnter = () => {
    if (step === 1 && !displayName.trim()) return;
    setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    const randomX = (Math.random() - 0.5) * 300; 
    const randomY = (Math.random() - 0.5) * 200; 
    setStarExitCoords({ x: randomX, y: randomY });
  };

  const handleToggleGenre = (genreId, type) => {
    if (type === 'like') {
      setDislikedGenres(prev => prev.filter(id => id !== genreId));
      setLikedGenres(prev => 
        prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]
      );
    } else {
      setLikedGenres(prev => prev.filter(id => id !== genreId));
      setDislikedGenres(prev => 
        prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]
      );
    }
  };

  const handleNext = () => {
    if (step === 1 && !displayName.trim()) return; 
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleFinish = async () => {
    const userProfile = {
      display_name: displayName,
      age: age,
      music_preferences: { liked_genres: likedGenres, disliked_genres: dislikedGenres }
    };

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    try {
      const response = await fetch(`${API}/users/me/`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(userProfile)
      });

      if (response.ok) {
        localStorage.setItem('displayName', displayName);
        navigate('/');
      }
    } catch (error) {
      console.error("Lỗi cập nhật profile:", error);
    }
  };

  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 100 : -100, opacity: 0 })
  };

  const StarEffect = () => (
    <div className="absolute top-1/2 left-[calc(50%-60px)] -translate-y-1/2 z-10 pointer-events-none">
        <motion.div
        initial={{ x: -150, y: 0, opacity: 0 }} 
        animate={
            isHovered 
            ? { x: 96, y: 0, opacity: 1, scale: 1 } 
            : { x: starExitCoords.x, y: starExitCoords.y, opacity: 0, scale: 0.5 } 
        }
        transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
        className="relative flex items-center justify-center"
        >
        <motion.div 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: isHovered ? 1 : 0, width: isHovered ? '40px' : '0px' }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="absolute right-2 h-[2px] bg-gradient-to-r from-transparent via-yellow-200 to-yellow-400 blur-[1px] rounded-full"
        />
        <div className="absolute w-6 h-6 bg-yellow-400/50 blur-md rounded-full animate-pulse" />
        <Star className="w-5 h-5 text-yellow-300 relative z-10 drop-shadow-[0_0_8px_rgba(253,224,71,0.9)]" fill="currentColor" />
        </motion.div>
    </div>
  );

  return (
    <div className="relative w-full flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-12 overflow-hidden mt-12 mb-16">
      <div className="absolute inset-0 z-0">
        <ParticlesBackground
          particleCount={500} particleSpread={10} speed={0.1} 
          particleColors={['#ffffff', '#bfff51ff', '#ff7676ff']} 
          moveParticlesOnHover={true} particleHoverFactor={1}
          alphaParticles={true} particleBaseSize={100} sizeRandomness={1}
          cameraDistance={20} disableRotation={false} className="w-full h-full"
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl px-4">
        
        {/* progress bar */}
        <div className="mb-4 px-8">
            <div className="flex justify-between mb-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-500 ${
                        step >= i ? 'bg-[#41A67E] text-white shadow-[0_0_15px_rgba(65,166,126,0.5)]' : 'bg-white/40 text-gray-400'
                    }`}>
                        {i}
                    </div>
                ))}
            </div>
            <div className="h-1 w-full bg-white/30 rounded-full relative overflow-hidden">
                <motion.div 
                    className="absolute top-0 left-0 h-full bg-[#41A67E]"
                    initial={{ width: '33%' }}
                    animate={{ width: `${(step / 3) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        </div>

        {/* CARD  */}
        <motion.div 
          layout
          className="w-full bg-[#F3F4F4]/15 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_0_12px_rgba(255,255,255,0.15)] overflow-hidden"
        >
            <AnimatePresence mode="wait" custom={step}>
              
              {step === 1 && (
                <motion.div 
                  key="step1" custom={1} variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="p-8 md:p-12"
                >
                  <div className="text-center mb-10">
                    <motion.h2 
                        className="text-3xl font-bold font-out-text font-heading mb-2 text-transparent bg-clip-text bg-[length:200%_auto]"
                        style={{ backgroundImage: 'linear-gradient(90deg, #75ae88, #d7d9e5, #cbf4d8)' }}
                        animate={{ backgroundPosition:["0% center", "200% center"] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    >
                        Làm quen nhé!
                    </motion.h2>
                    <p className="text-main_text font-medium">MindMelody nên gọi bạn là gì?</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Tên hiển thị</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 z-10" />
                        <input 
                          type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full bg-white/80 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-black placeholder-gray-500 focus:outline-none focus:border-[#41A67E] transition-colors"
                          placeholder="Ví dụ: Hiếu"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Độ tuổi của bạn</label>
                      <div className="relative flex items-center gap-4">
                        <Calendar className="w-5 h-5 text-gray-500 absolute left-4 z-10" />
                        <input 
                          type="number" min="10" max="100" value={age} onChange={(e) => setAge(parseInt(e.target.value) || '')}
                          className="w-full bg-white/80 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-black placeholder-gray-500 focus:outline-none focus:border-[#41A67E] transition-colors"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-2">*Tuổi tác giúp AI gợi ý nhịp độ âm nhạc phù hợp hơn với nhịp tim.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2" custom={1} variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="p-8 md:p-10"
                >
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#41A67E]/20 text-[#41A67E] mb-4 ">
                        <Music className="w-6 h-6" />
                    </div>
                    <motion.h2 
                        className="text-3xl font-bold font-out-text font-heading mb-2 text-transparent bg-clip-text bg-[length:200%_auto]"
                        style={{ backgroundImage: 'linear-gradient(90deg, #75ae88, #edf0ff, #cbf4d8)' }}
                        animate={{ backgroundPosition: ["0% center", "200% center"] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    >
                        Vùng An Toàn
                    </motion.h2>
                    <p className="text-main_text font-medium">Chọn những thể loại nhạc giúp bạn cảm thấy thư giãn nhất.</p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3">
                    {MUSIC_GENRES.map((genre) => {
                      const isSelected = likedGenres.includes(genre.id);
                      return (
                        <motion.button
                          key={genre.id} onClick={() => handleToggleGenre(genre.id, 'like')}
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          className={`px-5 py-2.5 rounded-full border transition-all text-sm font-medium ${
                            isSelected ? 'bg-[#66D0BC] border-[#66D0BC] text-white shadow-[0_0_15px_rgba(65,166,126,0.4)]' : 'bg-white/60 border-white/40 text-gray-700 hover:bg-white/90'
                          }`}
                        >
                          {genre.label}
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3" custom={1} variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="p-8 md:p-10"
                >
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#e78989]/20 text-[#e78989] mb-4">
                        <AlertOctagon className="w-6 h-6" />
                    </div>
                    <motion.h2 
                        className="text-3xl font-bold font-out-text font-heading mb-2 text-transparent bg-clip-text bg-[length:200%_auto]"
                        style={{ backgroundImage: 'linear-gradient(90deg, #ff7c7c, #e5d7d7, #f4dccb)' }}
                        animate={{ backgroundPosition:["0% center", "200% center"] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    >
                        Vùng Cần Tránh
                    </motion.h2>
                    <p className="text-main_text font-medium">Có thể loại nhạc nào khiến bạn đau đầu hay khó chịu không?</p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3">
                    {MUSIC_GENRES.map((genre) => {
                      const isSelected = dislikedGenres.includes(genre.id);
                      const isDisabled = likedGenres.includes(genre.id); 

                      return (
                        <motion.button
                          key={genre.id} onClick={() => !isDisabled && handleToggleGenre(genre.id, 'dislike')}
                          whileHover={!isDisabled ? { scale: 1.05 } : {}} whileTap={!isDisabled ? { scale: 0.95 } : {}}
                          className={`px-5 py-2.5 rounded-full border transition-all text-sm font-medium ${
                            isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-200/50 border-gray-300/50 text-gray-400'
                              : isSelected ? 'bg-rose-500 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]' 
                                : 'bg-white/60 border-white/40 text-gray-700 hover:bg-white/90'
                          }`}
                        >
                          {genre.label}
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-4 border-t border-white/20 bg-black/30 flex items-center justify-between">
                <button 
                  onClick={handleBack}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${
                    step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-500 hover:text-white/90'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại
                </button>

                {step < 3 ? (
                  <button 
                    onClick={handleNext}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    disabled={step === 1 && !displayName.trim()}
                    className={`group relative flex items-center justify-center gap-2 px-8 mr-4 py-2.5 bg-[#41A67E] hover:bg-[#66D0BC]/80 text-white font-bold rounded-full transition-all duration-300 overflow-hidden shadow-lg shadow-[#41A67E]/20 ${
                        step === 1 && !displayName.trim() ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <span className={`relative z-20 font-out-text flex items-center gap-2 transition-transform duration-500 ${step === 1 && !displayName.trim() ? '' : 'group-hover:-translate-x-2'}`}>
                        Tiếp tục 
                        <ArrowRight className={`w-4 h-4 transition-all duration-500 ${step === 1 && !displayName.trim() ? '' : 'group-hover:opacity-0 group-hover:translate-x-5'}`} />
                    </span>
                    <StarEffect />
                  </button>
                ) : (
                  <button 
                    onClick={handleFinish}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="group relative flex items-center justify-center gap-2 px-8 mr-4 py-2.5 bg-[#41A67E] hover:bg-[#66D0BC]/80 text-white font-bold rounded-full transition-all duration-300 overflow-hidden shadow-lg shadow-[#41A67E]/20"
                  >
                    <span className="relative z-20 font-out-text flex items-center gap-2 transition-transform duration-500 group-hover:-translate-x-2">
                        
                        Hoàn tất
                        <CheckCircle2 className="w-4 h-4 transition-all duration-500 group-hover:opacity-0 group-hover:-translate-y-5 group-hover:scale-50" /> 
                    </span>
                    <StarEffect />
                  </button>
                )}
            </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Onboarding;