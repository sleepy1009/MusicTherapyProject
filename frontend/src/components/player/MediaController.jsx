import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Shuffle, Repeat, Repeat1 } from 'lucide-react';
import { usePlayer } from './PlayerContext';

const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

// Repeat mode: 'off' -> 'all' -> 'one'
const REPEAT_MODES = ['off', 'all', 'one'];

const MediaController = () => {
    const {
        currentSong, currentIndex, playlistData, isPlaying, currentTime, duration,
        volume, setVolume, isMuted, setIsMuted, playerTarget, showLikeTooltip,
        togglePlay, handleNext, handlePrev, toggleMute, handleToggleLike, mode 
    } = usePlayer();

    const [isIdle, setIsIdle] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
    const progressBarRef = useRef(null);
    const volumeBarRef = useRef(null);

    // Tự động ẩn bar sau 3s không di chuột
    useEffect(() => {
        let timeout;
        const handleMouseMove = () => {
            setIsIdle(false);
            clearTimeout(timeout);
            timeout = setTimeout(() => setIsIdle(true), 3000);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => { window.removeEventListener('mousemove', handleMouseMove); clearTimeout(timeout); };
    }, []);

    const handleSeek = (e) => {
        if (!progressBarRef.current || !playerTarget) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const newTime = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration;
        playerTarget.seekTo(newTime);
    };

    const handleVolumeChange = (e) => {
        if (!volumeBarRef.current || !playerTarget) return;
        const rect = volumeBarRef.current.getBoundingClientRect();
        const newVolume = Math.round(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * 100);
        setVolume(newVolume);
        localStorage.setItem('playerVolume', newVolume); // LƯU LẠI ÂM LƯỢNG VÀO TRÌNH DUYỆT
        playerTarget.setVolume(newVolume);
        if (newVolume > 0) setIsMuted(false);
    };

    const cycleRepeat = () => {
        const next = REPEAT_MODES[(REPEAT_MODES.indexOf(repeatMode) + 1) % REPEAT_MODES.length];
        setRepeatMode(next);
    };

    const progressPercent = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

    return (
        <motion.div
            initial={{ y: 0 }}
            animate={{ y: isIdle ? "120%" : 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="fixed bottom-0 left-0 w-full h-24 bg-black/80 backdrop-blur-xl border-t border-white/20 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex items-center justify-between px-6 md:px-12 z-50"
        >
            {/* LEFT: Song info */}
            <div className="flex items-center gap-4 w-1/4">

                <div className="relative flex-shrink-0">
                    {isPlaying && (
                        <span className="absolute inset-0 rounded-lg animate-ping bg-primary/40 pointer-events-none" />
                    )}
                    <img
                        src={currentSong.image || currentSong.cover}
                        alt="Thumb"
                        className="w-12 h-12 rounded-lg object-cover relative z-10"
                    />
                </div>

                <div className="hidden md:block min-w-0">
                    <h4 className="text-white text-sm font-bold truncate">{currentSong.title}</h4>
                    <p className="text-gray-400 text-xs truncate">{currentSong.artist}</p>
                </div>

                {/* Like button */}
                <div className="relative flex items-center">
                    <motion.button
                        whileTap={{ scale: 1.5 }}
                        onClick={() => handleToggleLike(currentSong, currentIndex)}
                        className={`transition-colors ml-2 ${currentSong.isLiked ? 'text-rose-400' : 'text-gray-400 hover:text-rose-300'}`}
                    >
                        <Heart className={`w-5 h-5 ${currentSong.isLiked ? 'fill-current' : ''}`} />
                    </motion.button>
                    <AnimatePresence>
                        {showLikeTooltip && (
                            <motion.span
                                initial={{ opacity: 0, x: 0 }} animate={{ opacity: 1, x: 20 }} exit={{ opacity: 0, x: 40 }}
                                className="absolute left-full ml-4 text-rose-400 text-xs font-bold whitespace-nowrap pointer-events-none"
                            >
                                Đã thích!
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* CENTER: Controls + Progress */}
            <div className="flex-1 flex flex-col items-center max-w-md mx-auto">

                <div className="flex items-center gap-5 mb-2">

                    {mode === 'liked' && (
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsShuffle(p => !p)}
                            className={`transition-colors ${isShuffle ? 'text-[#41A67E]' : 'text-gray-500 hover:text-gray-300'}`}
                            title="Shuffle"
                        >
                            <Shuffle className="w-4 h-4" />
                        </motion.button>
                    )}

                    <motion.button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className={`transition-colors ${currentIndex === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white'}`}
                        whileHover={currentIndex > 0 ? { scale: 1.1 } : {}}
                        whileTap={currentIndex > 0 ? { scale: 0.9 } : {}}
                    >
                        <SkipBack className="w-5 h-5 fill-current" />
                    </motion.button>

                    <motion.button
                        onClick={togglePlay}
                        className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform"
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        {isPlaying
                            ? <Pause className="w-5 h-5 fill-current" />
                            : <Play className="w-5 h-5 fill-current translate-x-0.5" />
                        }
                    </motion.button>

                    <motion.button
                        onClick={handleNext}
                        disabled={currentIndex === playlistData.length - 1}
                        className={`transition-colors ${currentIndex === playlistData.length - 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white'}`}
                        whileHover={currentIndex < playlistData.length - 1 ? { scale: 1.1 } : {}}
                        whileTap={currentIndex < playlistData.length - 1 ? { scale: 0.9 } : {}}
                    >
                        <SkipForward className="w-5 h-5 fill-current" />
                    </motion.button>

                    {mode === 'liked' && (
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={cycleRepeat}
                            className={`transition-colors ${repeatMode !== 'off' ? 'text-[#41A67E]' : 'text-gray-500 hover:text-gray-300'}`}
                            title={repeatMode === 'off' ? 'Repeat off' : repeatMode === 'all' ? 'Repeat all' : 'Repeat one'}
                        >
                            {repeatMode === 'one'
                                ? <Repeat1 className="w-4 h-4" />
                                : <Repeat className="w-4 h-4" />
                            }
                        </motion.button>
                    )}
                </div>

                {/* Progress bar */}
                <div className="w-full flex items-center gap-3 text-xs text-gray-400 font-mono">
                    <span className="w-8 text-right">{formatTime(currentTime)}</span>
                    <div
                        className="flex-1 h-1.5 bg-white/10 rounded-full relative cursor-pointer group py-2"
                        ref={progressBarRef}
                        onClick={handleSeek}
                    >
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 bg-white/10 w-full rounded-full" />
                        <div
                            className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 bg-primary/90 rounded-full group-hover:bg-primary transition-colors"
                            style={{ width: `${progressPercent}%` }}
                        />
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 group-hover:w-3.5 group-hover:h-3.5 bg-white rounded-full shadow-md transition-all duration-150 pointer-events-none"
                            style={{ left: `calc(${progressPercent}% - 5px)` }}
                        />
                    </div>
                    <span className="w-8 text-left">{formatTime(duration)}</span>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 w-1/4">
                <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
                    {isMuted || volume === 0
                        ? <VolumeX className="w-5 h-5" />
                        : <Volume2 className="w-5 h-5" />
                    }
                </button>
                <div
                    className="w-20 h-1.5 bg-white/10 rounded-full relative cursor-pointer py-2 group"
                    ref={volumeBarRef}
                    onClick={handleVolumeChange}
                >
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 bg-white/10 w-full rounded-full" />
                    <div
                        className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 bg-white rounded-full group-hover:bg-primary transition-colors"
                        style={{ width: `${isMuted ? 0 : volume}%` }}
                    />
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-md pointer-events-none"
                        style={{ left: `calc(${isMuted ? 0 : volume}% - 5px)` }}
                    />
                </div>

                <div className="w-px h-5 bg-white/15 mx-1 flex-shrink-0" />

                <span className="text-[11px] text-gray-500 font-mono whitespace-nowrap">
                    {currentIndex + 1} / {playlistData.length}
                </span>
            </div>
        </motion.div>
    );
};

export default MediaController;