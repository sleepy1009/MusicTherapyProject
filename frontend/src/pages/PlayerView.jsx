import React, { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
        Play, Pause, SkipBack, SkipForward, Volume2, 
        MessageSquare, BookOpen, Heart,
        Music
      } from 'lucide-react';
import ParticlesBackground from '../components/reactbits/ParticlesBackground'; 

// chia ra cac file phu theo layout? is this stil working with flex dynamic?

const PlayerView = () => {
  // useState to save state for case

  // get data form previous page
  const location = useLocation();
  const playlist = location.state?.playlist || [];
  
  // handle case of tab
  const [showChat, setShowChat] = useState(false);
  const [rightPanelMode, setRightPanelMode] = useState(null);
  const [currentTip, setCurrentTip] = useState(0);
  const tips = [
    "Hãy thử hít vào 4 giây, giữ 4 giây, thở ra 4 giây...",
    "Nhắm mắt lại và tập trung vào nhịp điệu của âm nhạc...",
    "Mọi căng thẳng rồi sẽ qua, bạn đang làm rất tốt.",
  ];
  const [diaryTheme, setDiaryTheme] = useState('theme-1');
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const diaryThemes = [
    { id: 'theme-1', name: 'a', image: '/images/p0.png' },
    { id: 'theme-2', name: 'b', image: '/images/p1.jpg' },
    { id: 'theme-3', name: 'c', image: '/images/p2.jpg' },
  ];

  const [isIdle, setIsIdle] = useState(false); // show or hide media controller

  // signal on the icon to hint user click
  const [hasClickedChat, setHasClickedChat] = useState(false);
  const [hasClickedPlaylist, setHasClickedPlaylist] = useState(false);
  const [hasClickedDiary, setHasClickedDiary] = useState(false);
  const [hasClickedTheme, setHasClickedTheme] = useState(false);
  
  // when clicked icon, show chat tab and stop signal
  const handleChatToggle = () => {
    setShowChat(!showChat);
    setHasClickedChat(true);
  };

  const handlePlaylistToggle = () => {
    handleRightPanelToggle('playlist');
    setHasClickedPlaylist(true);
  };

  const handleDiaryToggle = () => {
    handleRightPanelToggle('diary');
    setHasClickedDiary(true);
  };

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 10000);
    return () => clearInterval(tipInterval);
  }, []);

  useEffect(() => {
    let timeout;
    const handleMouseMove = () => {
      setIsIdle(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsIdle(true), 3000); 
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  
  if (!playlist || playlist.length === 0) {
    return <Navigate to="/" replace />;
  }

  const currentSong = playlist[0];

  const handleRightPanelToggle = (mode) => {
    setRightPanelMode(rightPanelMode === mode ? null : mode);
  };

  // logic width
  const chatWidth = showChat && !rightPanelMode ? 720 : 480;
  const rightWidth = rightPanelMode && !showChat ? 600 : 480;

  return (
    <div className="relative w-full flex-1 pt-16 flex flex-col overflow-hidden">
      
      {/* Bg */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ParticlesBackground
          particleCount={500}
          particleSpread={10}
          speed={0.1} 
          particleColors={['#ffffff', '#bfff51ff', '#ff7676ff']} 
          moveParticlesOnHover={true}
          particleHoverFactor={1}
          alphaParticles={true}
          particleBaseSize={100}
          sizeRandomness={1}
          cameraDistance={20}
          disableRotation={false}
          className="w-full h-full"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col">
          
        {/* Tips space */}
        <div className="h-10 w-full flex items-center justify-center mt-2">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentTip}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 1 }}
              className="text-sm font-light text-gray-300 italic tracking-wider drop-shadow-md"
            >
              "{tips[currentTip]}"
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Main Layout  */}
        <div className="flex-1 flex w-full h-full relative p-4 px-8 gap-4 pb-28 items-center justify-center">
          
          {/* LEFT: Chat Panel*/}
          <div className="h-full">
            <AnimatePresence>
              {showChat ? (
                <motion.div 
                  initial={{ opacity: 0, width: 0, x: -50 }}
                  animate={{ opacity: 1, width: chatWidth, x: 0 }}
                  exit={{ opacity: 0, width: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="h-full min-h-[440px] bg-white/5 border border-white/20 rounded-3xl overflow-hidden flex flex-col backdrop-blur-sm flex-shrink-0"
                >
                  <motion.div 
                    className="p-4 border-b border-white/10 font-bold text-indigo-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    Chatbot Tâm Lý
                  </motion.div>
                  <motion.div 
                    className="flex-1 p-4 flex items-center justify-center text-gray-500 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    Vùng Chat (Sắp phát triển)
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* CENTER: VISUALIZER */}
          <motion.div 
            className="h-full flex-1 flex flex-col items-center justify-center relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.25, delay: 0.15 }}
          >
            
            <motion.div 
              className="w-full h-full flex flex-col items-center justify-center relative bg-white/5 border border-white/20 rounded-3xl p-8 max-w-[440px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              
              {/* Left Icon: Chat Toggle */}
              <motion.button 
                onClick={handleChatToggle}
                className="absolute top-4 left-4 p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors z-20 cursor-pointer group"
                initial={{ opacity: 0, x: -30 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  scale: !hasClickedChat ? [1, 1.15, 1] : 1,
                }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.4,
                  scale: !hasClickedChat ? { repeat: Infinity, duration: 2, delay: 0.5 } : { duration: 0.3 }
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Mở Chatbot Tâm Lý"
              >
                {!hasClickedChat && (
                  <motion.div 
                    className="absolute inset-0 rounded-full bg-indigo-400/30 blur-lg"
                    animate={{ 
                      opacity: [0.3, 0.7, 0.3],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}
                <MessageSquare 
                  className={`w-5 h-5 ${showChat ? 'text-indigo-400' : 'text-indigo-400/30'} relative z-10`}
                  aria-label="Chat icon"
                />
              </motion.button>

              {/* Right Icons: Playlist & Diary (Stacked) */}
              <motion.div 
                className="absolute top-4 right-4 flex flex-col gap-4 z-20"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <motion.button 
                  onClick={handlePlaylistToggle}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors cursor-pointer relative"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    scale: !hasClickedPlaylist ? [1, 1.15, 1] : 1,
                  }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.45,
                    scale: !hasClickedPlaylist ? { repeat: Infinity, duration: 2, delay: 0.5 } : { duration: 0.3 }
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="Mở Danh sách phát"
                >
                  {/* Glow Inside Icon */}
                  {!hasClickedPlaylist && (
                    <motion.div 
                      className="absolute inset-0 rounded-full bg-cyan-400/30 blur-lg"
                      animate={{ 
                        opacity: [0.3, 0.7, 0.3],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  )}
                  <Music 
                    className={`w-5 h-5 ${rightPanelMode === 'playlist' ? 'text-cyan-400' : 'text-cyan-400/30'} relative z-10`}
                    aria-label="Playlist icon"
                  />
                </motion.button>

                <motion.button 
                  onClick={handleDiaryToggle}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors cursor-pointer relative"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    scale: !hasClickedDiary ? [1, 1.15, 1] : 1,
                  }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.5,
                    scale: !hasClickedDiary ? { repeat: Infinity, duration: 2, delay: 0.5 } : { duration: 0.3 }
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="Mở Nhật Ký Cảm Xúc"
                >
                  {/* Glow Inside Icon */}
                  {!hasClickedDiary && (
                    <motion.div 
                      className="absolute inset-0 rounded-full bg-rose-400/30 blur-lg"
                      animate={{ 
                        opacity: [0.3, 0.7, 0.3],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  )}
                  <BookOpen 
                    className={`w-5 h-5 ${rightPanelMode === 'diary' ? 'text-rose-400' : 'text-rose-400/30'} relative z-10`}
                    aria-label="Diary icon"
                  />
                </motion.button>
              </motion.div>

              {/* Visualizer Circle */}
              <motion.div 
                className="w-56 h-56 md:w-72 md:h-72 rounded-full bg-black/50 border-4 border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.1)] overflow-hidden relative group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.25 }}
              >
                <img src={currentSong.image} alt="Playing" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center gap-1 mix-blend-overlay">
                  {[1,2,3,4,5,6,7].map(i => (
                    <motion.div 
                      key={i}
                      className="w-2 bg-white rounded-full shadow-[0_0_10px_white]"
                      animate={{ height: [10, Math.random() * 80 + 20, 10] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Song Info */}
              <motion.div 
                className="mt-6 text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
              >
                <h2 className="text-2xl font-bold text-white tracking-wider mb-1">{currentSong.title}</h2>
                <p className="text-sm text-gray-400 font-light">{currentSong.artist}</p>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* RIGHT: Panel (Playlist or Diary) */}
          <div className="h-full ">
            <AnimatePresence>
              {rightPanelMode ? (
                <motion.div 
                  initial={{ opacity: 0, width: 0, x: 50 }}
                  animate={{ opacity: 1, width: rightWidth, x: 0 }}
                  exit={{ opacity: 0, width: 0, x: 50 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="h-full min-h-[440px] bg-white/5 border border-white/20 rounded-3xl overflow-hidden flex flex-col backdrop-blur-sm flex-shrink-0"
                >
                  {/* Playlist Mode */}
                  {rightPanelMode === 'playlist' && (
                    <>
                      <motion.div 
                        className="p-4 border-b border-white/10 font-bold text-cyan-300 flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                      >
                        <Music size={18} />
                        Danh sách phát
                      </motion.div>
                      <motion.div 
                        className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        {playlist.map((song, idx) => (
                          <motion.div 
                            key={idx}
                            className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                              idx === 0 ? 'bg-white/10' : 'hover:bg-white/5'
                            }`}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + idx * 0.08, duration: 0.5 }}
                            whileHover={{ x: 5 }}
                          >
                            <img src={song.image} alt={song.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{song.title}</p>
                              <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </>
                  )}

                  {/* Diary Mode */}
                  {rightPanelMode === 'diary' && (
                    <>
                      <motion.div 
                        className="p-4 border-b border-white/10 font-bold text-rose-300 flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                      >
                        <BookOpen size={18} />
                        Nhật Ký Cảm Xúc
                        
                        {/* THEME ICON BUTTON */}
                        <div className="ml-auto relative">
                          <motion.button
                            onClick={() => {
                              setShowThemeMenu(!showThemeMenu);
                              setHasClickedTheme(true);
                            }}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer relative"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="Đổi chủ đề"
                            animate={{
                              scale: !hasClickedTheme ? [1, 1.15, 1] : 1,
                            }}
                            transition={{
                              scale: !hasClickedTheme ? { repeat: Infinity, duration: 2, delay: 0.5 } : { duration: 0.3 }
                            }}
                          >
                            {/* Glow Inside Icon */}
                            {!hasClickedTheme && (
                              <motion.div 
                                className="absolute inset-0 rounded-lg bg-rose-400/40 blur-lg"
                                animate={{ 
                                  opacity: [0.3, 0.7, 0.3],
                                  scale: [1, 1.2, 1]
                                }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                              />
                            )}
                            
                            <svg 
                              className="w-5 h-5 text-rose-300 relative z-10" 
                              fill="currentColor" 
                              viewBox="0 0 24 24"
                              aria-label="Theme icon"
                            >
                              <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 7 15.5 7 14 7.67 14 8.5s.67 1.5 1.5 1.5z"/>
                            </svg>
                          </motion.button>

                          {/* THEME MENU DROPDOWN */}
                          <AnimatePresence>
                            {showThemeMenu && (
                              <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute top-13 -right-5 bg-white/10 border border-white/20 rounded-xl p-3 space-y-2 z-50 min-w-[150px] backdrop-blur-sm"
                              >
                                <motion.div
                                  initial="hidden"
                                  animate="visible"
                                  variants={{
                                    hidden: { opacity: 0 },
                                    visible: {
                                      opacity: 1,
                                      transition: {
                                        staggerChildren: 0.1,
                                        delayChildren: 0.05,
                                      },
                                    },
                                  }}
                                  className="space-y-2"
                                >
                                  {diaryThemes.map((theme) => (
                                    <motion.button
                                      key={theme.id}
                                      onClick={() => {
                                        setDiaryTheme(theme.id);
                                        setShowThemeMenu(false);
                                      }}
                                      variants={{
                                        hidden: { opacity: 0, x: -20 },
                                        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
                                      }}
                                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-all ${
                                        diaryTheme === theme.id
                                          ? 'bg-rose-500/10 border border-rose-400'
                                          : 'hover:bg-white/10'
                                      }`}
                                      whileHover={{ x: 5, scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <motion.div 
                                        className="w-6 h-6 rounded border border-white/20"
                                        style={{
                                          backgroundImage: `url(${theme.image})`,
                                          backgroundSize: 'cover',
                                        }}
                                        whileHover={{ scale: 1.1 }}
                                      />
                                      <span className={diaryTheme === theme.id ? 'text-rose-300 font-medium' : 'text-gray-300'}>
                                        {theme.name}
                                      </span>
                                      {/*
                                      {diaryTheme === theme.id && (
                                        <motion.div
                                          className="ml-auto w-4 h-4 rounded-full bg-rose-400"
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                        />
                                      )}
                                        */}
                                    </motion.button>
                                  ))}
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>

                      {/* DIARY with Bg */}
                      <motion.div 
                        className="flex-1 p-4 flex items-center justify-center text-main_text text-sm relative overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        style={{
                          backgroundImage: `url(${diaryThemes.find(t => t.id === diaryTheme)?.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/40"></div>
                        
                        {/* Content */}
                        <div className="relative z-10">
                          Trang viết nhật ký (Sắp phát triển)
                        </div>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* MEDIA CONTROLLER - add features later(note) */}
      
      <motion.div 
        initial={{ y: 0 }}
        animate={{ y: isIdle ? "120%" : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="fixed bottom-0 left-0 w-full h-24 bg-black/80 backdrop-blur-xl border-t border-white/20 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex items-center justify-between px-6 md:px-12 z-50"
      >
        {/* Left: Info */}
        <motion.div 
          className="flex items-center gap-4 w-1/4"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <img src={currentSong.image} alt="Thumb" className="w-12 h-12 rounded-lg object-cover" />
          <div className="hidden md:block min-w-0">
            <h4 className="text-white text-sm font-bold truncate">{currentSong.title}</h4>
            <p className="text-gray-400 text-xs truncate">{currentSong.artist}</p>
          </div>
          <motion.button 
            className="text-gray-400 hover:text-rose-400 transition-colors ml-2"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Center: Controls & Timeline */}
        <motion.div 
          className="flex-1 flex flex-col items-center max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center gap-6 mb-2">
            <motion.button 
              className="text-gray-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </motion.button>
            <motion.button 
              className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
            >
              <Pause className="w-5 h-5 fill-current" />
            </motion.button>
            <motion.button 
              className="text-gray-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </motion.button>
          </div>
          
          <div className="w-full flex items-center gap-3 text-xs text-gray-400 font-mono">
            <span>0:45</span>
            <div className="flex-1 h-1.5 bg-white/10 rounded-full relative cursor-pointer group">
              <div className="absolute top-0 left-0 h-full w-[30%] bg-[#1E90FF] rounded-full group-hover:bg-[#1E90FF]/80 transition-colors"></div>
              <div className="absolute top-1/2 -translate-y-1/2 left-[70%] w-1.5 h-3 bg-red-400/80 rounded-full" title="Mốc hoàn thành"></div>
            </div>
            <span>{currentSong.duration}</span>
          </div>
        </motion.div>

        {/* Right: Volume */}
        <motion.div 
          className="flex items-center justify-end gap-3 w-1/4"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Volume2 className="w-5 h-5 text-gray-400" />
          <div className="w-20 h-1.5 bg-white/10 rounded-full">
            <div className="w-1/2 h-full bg-white rounded-full"></div>
          </div>
        </motion.div>
      </motion.div>

    </div>
  );
};

export default PlayerView;