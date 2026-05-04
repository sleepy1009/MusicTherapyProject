import React from 'react';
import { motion } from 'framer-motion';
import { Heart, RefreshCw } from 'lucide-react';
import { usePlayer } from './PlayerContext';
import { useDominantColor } from './CenterVisualizer'; 

const PlaylistSidebar = () => {
    const { 
        playlistData, currentIndex, setCurrentIndex, isPlaying, 
        devMode, mode, handleToggleLike, handleOpenSwap 
    } = usePlayer();

    const activeColor = useDominantColor(playlistData[currentIndex]?.image || playlistData[currentIndex]?.cover);

    return (
        <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
            {playlistData.map((song, idx) => {
                const isActive = idx === currentIndex;
                
                const dynamicStyle = isActive ? {
                    backgroundColor: `${activeColor}22`, 
                    borderColor: activeColor,
                    boxShadow: `0 4px 15px ${activeColor}11`
                } : {};

                return (
                <div 
                    key={idx} 
                    style={dynamicStyle}
                    className={`flex items-center p-2 rounded-xl transition-all border ${isActive ? '' : 'hover:bg-white/5 border-transparent'}`}
                >
                    <div className="flex-1 flex items-center gap-3 cursor-pointer min-w-0 pr-2" onClick={() => setCurrentIndex(idx)}>
                        <div className="relative w-11 h-11 rounded-lg flex-shrink-0 overflow-hidden shadow-md">
                            <img src={song.image || song.cover} alt={song.title} className={`w-full h-full object-cover transition-all ${isActive && isPlaying ? 'scale-110' : ''}`} />
                            
                            {isActive && isPlaying && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                                    <div className="flex items-end gap-0.5 h-3.5">
                                        <motion.div className="w-0.5 rounded-full" style={{ backgroundColor: activeColor }} animate={{ height: [3,10,3] }} transition={{ repeat: Infinity, duration: 0.5 }} />
                                        <motion.div className="w-0.5 rounded-full" style={{ backgroundColor: activeColor }} animate={{ height: [3,14,3] }} transition={{ repeat: Infinity, duration: 0.6 }} />
                                        <motion.div className="w-0.5 rounded-full" style={{ backgroundColor: activeColor }} animate={{ height: [3,8,3] }} transition={{ repeat: Infinity, duration: 0.4 }} />
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${isActive ? 'text-main_text' : 'text-main_text/60'}`}>
                                {song.title}
                            </p>
                            <p className={`text-xs truncate ${isActive ? 'text-main_text/60' : 'text-main_text/40'}`}>
                                {song.artist}
                            </p>

                            {devMode && (
                                <p className="text-[10px] text-red-400/80 font-mono mt-1">
                                    [Val: {song.valence} | Eng: {song.energy} | BPM: {song.tempo} | Phase: {song.phase || Math.ceil((idx + 1)/(playlistData.length/7))}]
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="w-20 flex-shrink-0 border-l border-white/10 pl-2">
                        {mode === 'liked' ? (
                            <button onClick={(e) => { e.stopPropagation(); handleToggleLike(song, idx); }}
                                className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium transition-all ${song.isLiked ? 'text-rose-400' : 'text-gray-400'}`}>
                                <Heart className={`w-3.5 h-3.5 ${song.isLiked ? 'fill-current' : ''}`} />
                                {song.isLiked ? 'Đã thích' : 'thích'}
                            </button>
                        ) : (
                            <button onClick={(e) => { e.stopPropagation(); handleOpenSwap(idx); }}
                                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-[#8CE4FF] text-xs font-medium transition-colors">
                                <RefreshCw className="w-3.5 h-3.5" /> Đổi bài
                            </button>
                        )}
                    </div>
                </div>
                );
            })}
        </div>
    );
};

export default PlaylistSidebar;