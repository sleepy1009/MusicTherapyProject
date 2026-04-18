import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, BookOpen, Music } from 'lucide-react';
import { usePlayer } from './PlayerContext';

export const useDominantColor = (imageUrl) => {
    const [color, setColor] = useState('#ffffff');

    useEffect(() => {
        if (!imageUrl) return;
        let isMounted = true;
        const img = new Image();
        img.crossOrigin = "Anonymous"; 
        img.src = imageUrl;
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 1; canvas.height = 1;
                ctx.drawImage(img, 0, 0, 1, 1);
                const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
                
                // Boost sáng để tạo hiệu ứng Neon Glow đẹp hơn
                const max = Math.max(r, g, b);
                const boost = max < 120 ? (150 / (max || 1)) : 1.2; 
                
                if (isMounted) setColor(`rgb(${Math.min(r * boost, 255)}, ${Math.min(g * boost, 255)}, ${Math.min(b * boost, 255)})`);
            } catch (e) { if (isMounted) setColor('#ffffff'); }
        };
        img.onerror = () => { if (isMounted) setColor('#ffffff'); };
        return () => { isMounted = false; };
    }, [imageUrl]);

    return color;
};

export const MarqueeText = ({ text, className, active = true }) => {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const [isOverflow, setIsOverflow] = useState(false);
    const [duration, setDuration] = useState(10);

    useEffect(() => {
        const checkOverflow = () => {
            if (!containerRef.current || !textRef.current) return;

            // Tạm thời clone element để đo width thật mà không bị animation ảnh hưởng
            const clone = textRef.current.cloneNode(true);
            clone.style.cssText = 'position:absolute;visibility:hidden;animation:none;white-space:nowrap;width:max-content';
            document.body.appendChild(clone);
            const textWidth = clone.scrollWidth;
            document.body.removeChild(clone);

            const containerWidth = containerRef.current.clientWidth;

            if (textWidth > containerWidth) {
                setIsOverflow(true);
                setDuration(Math.max(textWidth / 20, 12));
            } else {
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
        <div
            ref={containerRef}
            className={`w-full overflow-hidden flex ${!isOverflow ? 'justify-center' : ''} ${className}`}
        >
            <div
                ref={textRef}
                className={`whitespace-nowrap flex items-center w-max ${isOverflow && active ? 'animate-marquee' : ''}`}
                style={{ animationDuration: `${duration}s` }}
            >
                <span style={{ paddingRight: isOverflow && active ? GAP : 0 }}>
                    {text}
                </span>
                {isOverflow && active && (
                    <span style={{ paddingRight: GAP }}>{text}</span>
                )}
            </div>
        </div>
    );
};
const CenterVisualizer = () => {
    const { 
        currentSong, isPlaying, devMode, setDevMode,
        showChat, setShowChat, rightPanelMode, setRightPanelMode 
    } = usePlayer();

    const [clickCount, setClickCount] = useState(0);
    const [currentTip, setCurrentTip] = useState(0);
    const [hasClickedChat, setHasClickedChat] = useState(false);
    const [hasClickedPlaylist, setHasClickedPlaylist] = useState(false);
    const [hasClickedDiary, setHasClickedDiary] = useState(false);

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

    return (
        <div className="flex-1 flex flex-col items-center relative">
            {/* Inject CSS cho hiệu ứng Marquee */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
                .animate-marquee { animation-name: marquee; animation-timing-function: linear; animation-iteration-count: infinite; }
            `}} />

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
                
                <motion.button onClick={() => { setShowChat(!showChat); setHasClickedChat(true); }} className="absolute top-4 left-4 p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors z-20 cursor-pointer group"
                    animate={{ scale: !hasClickedChat ? [1, 1.15, 1] : 1 }} transition={{ scale: !hasClickedChat ? { repeat: Infinity, duration: 2 } : { duration: 0.3 } }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    {!hasClickedChat && <div className="absolute inset-0 rounded-full bg-indigo-400/30 blur-lg animate-pulse" />}
                    <MessageSquare className={`w-5 h-5 ${showChat ? 'text-indigo-400' : 'text-indigo-400/30'} relative z-10`} />
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

                <div onClick={handleSecretClick} 
                     className="w-56 h-56 md:w-72 md:h-72 rounded-full bg-black/50 border-4 border-white/10 overflow-hidden relative group cursor-pointer transition-shadow duration-1000"
                     style={{ boxShadow: isPlaying ? `0 0 48px -4px ${dominantColor}` : '0 0 20px rgba(255,255,255,0.05)' }}
                >
                    <img src={currentSong.image || currentSong.cover} alt="Playing" className={`w-full h-full object-cover transition-all duration-1000 ${isPlaying ? 'opacity-90 scale-105' : 'opacity-40 grayscale-[30%]'}`} />
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
                    <MarqueeText 
                        text={currentSong.title} 
                        active={isPlaying}
                        className="text-2xl font-bold text-white tracking-wider mb-1" 
                    />
                    <MarqueeText 
                        text={currentSong.artist} 
                        active={isPlaying}
                        className="text-sm text-gray-400 font-light" 
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default CenterVisualizer;