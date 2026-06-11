import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, BookOpen, Music } from 'lucide-react';
import { usePlayer } from './PlayerContext';
import MoodOverlay from './MoodOverlay';
import { useToast } from '../ToastContext';

const getHighResImage = (url) => {
    if (!url) return '/av0.png'; 
    if (url.includes('googleusercontent.com') || url.includes('ytimg.com')) {
        return url.replace(/=w\d+-h\d+.*/, '=w600-h600');
    }
    return url;
};

export const useDominantColor = (imageUrl) => { 
    const [color, setColor] = useState('#ffffff'); 
    
    useEffect(() => {
        if (!imageUrl) return;
        
        let isMounted = true;
        const img = new Image();
        const hash = Array.from(imageUrl).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const r = (hash % 100) + 50; 
        const g = ((hash * 2) % 100) + 100;
        const b = ((hash * 3) % 100) + 120;
        
        if (isMounted) setColor(`rgb(${r}, ${g}, ${b})`);

        return () => { isMounted = false; };
    }, [imageUrl]);
    
    return color;
};

export const MarqueeText = ({ text, className, active = true }) => { 
    const containerRef = useRef(null);
    const [isOverflow, setIsOverflow] = useState(false);
    const [duration, setDuration] = useState(10);

    useEffect(() => {
        const checkOverflow = () => {
            if (!containerRef.current) return;
            const container = containerRef.current;

            const measureSpan = document.createElement('span');
            measureSpan.style.cssText = 'position:absolute; visibility:hidden; white-space:nowrap; width:max-content;';
            measureSpan.innerText = text;

            container.appendChild(measureSpan);
            const textWidth = measureSpan.getBoundingClientRect().width;
            container.removeChild(measureSpan);

            const containerWidth = container.clientWidth;

            if (textWidth > containerWidth) { 
                setIsOverflow(true); 
                setDuration(Math.max(textWidth / 30, 8)); 
            } 
            else { 
                setIsOverflow(false); 
            }
        };

        checkOverflow();
        const observer = new ResizeObserver(checkOverflow);
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [text]);

    const GAP = '120px'; 

    return (
        <div ref={containerRef} className={`w-full overflow-hidden flex ${!isOverflow ? 'justify-center' : ''} ${className}`}>
            <motion.div 
                className="whitespace-nowrap flex items-center w-max"
                animate={isOverflow && active ? { x: [0, "-50%"] } : { x: 0 }}
                transition={{
                    duration: duration,
                    ease: "linear",
                    repeat: isOverflow && active ? Infinity : 0,
                    repeatType: "loop",
                    delay: 3,         
                    repeatDelay: 3    
                }}
            >
                <span style={{ paddingRight: isOverflow && active ? GAP : 0 }}>{text}</span>
                {isOverflow && active && <span style={{ paddingRight: GAP }}>{text}</span>}
            </motion.div>
        </div>
    );
};


const CenterVisualizer = () => {
    const { 
        API, mode, currentSong, isPlaying, devMode, setDevMode,
        showChat, setShowChat, rightPanelMode, setRightPanelMode, unreadCount,
        sessionId, showPostMood, setShowPostMood, togglePlay, playerTarget,
        showPlaylistDebug
    } = usePlayer();

    const toast = useToast();

    const [clickCount, setClickCount] = useState(0);
    const [currentTip, setCurrentTip] = useState(0);
    const [hasClickedChat, setHasClickedChat] = useState(false);
    const [hasClickedPlaylist, setHasClickedPlaylist] = useState(false);
    const [hasClickedDiary, setHasClickedDiary] = useState(false);

    //const [showPreMood, setShowPreMood] = useState(mode === 'therapy');

    const dominantColor = useDominantColor(currentSong.image || currentSong.cover);

    const tips = [
        "Hãy thử hít vào 4 giây, giữ 4 giây, thở ra 4 giây...",
        "Nhắm mắt lại và tập trung vào nhịp điệu của âm nhạc...",
        "Mọi căng thẳng rồi sẽ qua, bạn đang làm rất tốt.",
    ];

    useEffect(() => {
        const tipInterval = setInterval(() => setCurrentTip(prev => (prev + 1) % tips.length), 10000);
        return () => clearInterval(tipInterval);
    }, []);

    const handleSecretClick = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);
        if(newCount >= 5) { setDevMode(!devMode); setClickCount(0); }
    };

    const submitMoodToServer = async (moodValue, type) => {
        if (!sessionId) return;
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const payload = type === 'before' 
            ? { mood_before: moodValue } 
            : { mood_after: moodValue };

        try {
            await fetch(`${API}/users/session-mood/${sessionId}/`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });
            console.log(`Đã lưu ${type} mood: ${moodValue}`);
        } catch (error) {
            console.error("Lỗi lưu mood:", error);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center relative">
            

            <div className="h-10 w-full flex items-center justify-center mt-2 absolute -top-14">
                <AnimatePresence mode="wait">
                    <motion.p key={currentTip} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 1 }}
                        className="text-sm font-light text-gray-300 italic tracking-wider drop-shadow-md">
                        "{tips[currentTip]}"
                    </motion.p>
                </AnimatePresence>
            </div>

            <motion.div className="h-[500px] w-full flex flex-col items-center justify-center relative bg-white/5 border border-white/20 rounded-3xl p-8 max-w-[440px]"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.25, delay: 0.15 }}>

                {mode === 'therapy' && showPlaylistDebug && (
                    <motion.button 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => {
                            if (playerTarget) playerTarget.pauseVideo();
                            setShowPostMood(true);
                        }}
                        className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/50 rounded-full text-[9px] uppercase font-black tracking-tighter z-30 transition-all shadow-lg"
                    >
                        End Session (Secret)
                    </motion.button>
                )}
                
                <motion.button onClick={() => { setShowChat(!showChat); setHasClickedChat(true); }} className="absolute top-4 left-4 p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors z-20 cursor-pointer group"
                    animate={{ scale: !hasClickedChat ? [1, 1.15, 1] : 1 }} transition={{ scale: !hasClickedChat ? { repeat: Infinity, duration: 2 } : { duration: 0.3 } }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    {!hasClickedChat && <div className="absolute inset-0 rounded-full bg-primary/30 blur-lg animate-pulse" />}
                    <MessageSquare className={`w-5 h-5 ${showChat ? 'text-primary' : 'text-primary/30'} relative z-10`} />

                    {unreadCount > 0 && !showChat && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3 z-20">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400/90"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500/60 border-2 border-black/60"></span>
                        </span>
                    )}
                </motion.button>

                <div className="absolute top-4 right-4 flex flex-col gap-4 z-20">
                    <motion.button onClick={() => { setRightPanelMode(rightPanelMode === 'playlist' ? null : 'playlist'); setHasClickedPlaylist(true); }} className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors cursor-pointer relative"
                        animate={{ scale: !hasClickedPlaylist ? [1, 1.15, 1] : 1 }} transition={{ scale: !hasClickedPlaylist ? { repeat: Infinity, duration: 2 } : { duration: 0.3 } }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        {!hasClickedPlaylist && <div className="absolute inset-0 rounded-full bg-[#9ED3DC]/30 blur-lg animate-pulse" />}
                        <Music className={`w-5 h-5 ${rightPanelMode === 'playlist' ? 'text-[#9ED3DC]' : 'text-[#9ED3DC]/30'} relative z-10`} />
                    </motion.button>

                    <motion.button onClick={() => { setRightPanelMode(rightPanelMode === 'diary' ? null : 'diary'); setHasClickedDiary(true); }} className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors cursor-pointer relative"
                        animate={{ scale: !hasClickedDiary ? [1, 1.15, 1] : 1 }} transition={{ scale: !hasClickedDiary ? { repeat: Infinity, duration: 2 } : { duration: 0.3 } }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        {!hasClickedDiary && <div className="absolute inset-0 rounded-full bg-rose-400/30 blur-lg animate-pulse" />}
                        <BookOpen className={`w-5 h-5 ${rightPanelMode === 'diary' ? 'text-rose-400' : 'text-rose-400/30'} relative z-10`} />
                    </motion.button>
                </div>
                
                {/* 
                <MoodOverlay 
                    isVisible={showPreMood} 
                    type="before" 
                    onSubmit={async (val) => {
                        await submitMoodToServer(val, 'before');
                        setShowPreMood(false);
                        if (!isPlaying && playerTarget) togglePlay(); 
                    }} 
                />

                <MoodOverlay 
                    isVisible={showPostMood} 
                    type="after" 
                    onSubmit={async (val) => {
                        await submitMoodToServer(val, 'after');
                        setShowPostMood(false);
                        
                        setShowPlaylistDebug(false); 
                        
                        toast.success("NCKH: Đã lưu dữ liệu thực nghiệm thành công!");
                    }} 
                />
                */}

                <div onClick={handleSecretClick} 
                     className="w-56 h-56 md:w-72 md:h-72 rounded-full bg-black/50 border-4 border-white/10 overflow-hidden relative group cursor-pointer transition-shadow duration-1000"
                     style={{ boxShadow: isPlaying ? `0 0 24px -4px ${dominantColor}` : '0 0 20px rgba(255,255,255,0.05)' }}
                >
                    <img src={getHighResImage(currentSong.image || currentSong.cover)} alt="Playing" className={`w-full h-full object-cover transition-all duration-1000 ${isPlaying ? 'opacity-100 scale-100' : 'opacity-60 grayscale-[50%] scale-96'}`} />
                    {isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center gap-1.5 mix-blend-screen">
                            {[1,2,3,4,5,6,7].map(i => (
                                <motion.div key={i} className="w-2 rounded-full" 
                                    style={{ backgroundColor: dominantColor, boxShadow: `0 0 10px ${dominantColor}` }}
                                    animate={{ height: [10, Math.random() * 80 + 20, 10] }} 
                                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }} 
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center w-full max-w-[85%] overflow-hidden">
                    <MarqueeText text={currentSong.title} active={isPlaying} className="text-2xl font-bold text-main_text tracking-wider mb-1" />
                    <MarqueeText text={currentSong.artist} active={isPlaying} className="text-sm text-main_text/60 font-light" />
                </div>
            </motion.div>
        </div>
    );
};

export default CenterVisualizer;