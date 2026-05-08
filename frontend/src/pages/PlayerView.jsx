import React, { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, BookOpen } from 'lucide-react';
import ParticlesBackground from '../components/reactbits/ParticlesBackground'; 
import YouTube from 'react-youtube';
import DiaryPanel from '../components/player/DiaryPanel';

import { PlayerProvider, usePlayer } from '../components/player/PlayerContext';
import SwapModal from '../components/player/SwapModal';
import CenterVisualizer from '../components/player/CenterVisualizer';
import PlaylistSidebar from '../components/player/PlaylistSidebar';
import MediaController from '../components/player/MediaController';
import ChatPanel from '../components/player/ChatPanel';
import { useToast } from '../components/ToastContext';

import { useDocumentTitle } from '../utils/useDocumentTitle';


const PlayerLayout = () => {
    const { 
        playlistData, currentSong, volume, isMuted,
        setIsPlaying, setDuration, setPlayerTarget, handleNext,
        showChat, rightPanelMode,
        showPlaylistDebug, setShowPlaylistDebug
    } = usePlayer();

    if (!playlistData || playlistData.length === 0) {
        return <Navigate to="/" replace />;
    }
    
    const title = currentSong?.title && currentSong?.artist
        ? `${currentSong.title} — ${currentSong.artist}`
        : 'Player';
    useDocumentTitle(title);


    const chatWidth = showChat && !rightPanelMode ? 778 : 486;  // 1.8 of R case | 1800px * 27%
    const rightWidth = rightPanelMode && !showChat ? 680 : 486; // 1.6 of R case | 1800px * 27%

    const toast = useToast();
    const [playlistHeaderClicks, setPlaylistHeaderClicks] = useState(0);

    const onReady = (event) => {
        setPlayerTarget(event.target);
        setDuration(event.target.getDuration());
        event.target.setVolume(volume);
        event.target.playVideo(); 
    };

    const onStateChange = (event) => {
        if (event.data === 1) { 
            setIsPlaying(true);
            setDuration(event.target.getDuration());
            event.target.setVolume(volume); 
            if (isMuted) event.target.mute();
        } 
        else if (event.data === 2) {
            setIsPlaying(false);
        }
        
        if (event.data === 0) {
            handleNext();
        }
    };

    const handlePlaylistHeaderClick = () => {
        const next = playlistHeaderClicks + 1;
        setPlaylistHeaderClicks(next);
        if (next >= 5) {
            setShowPlaylistDebug(true); 
            setPlaylistHeaderClicks(0);
            toast.info("Đã kích hoạt.");
        }
    };

    return (
        <div className="relative w-full flex-1 pt-16 flex flex-col overflow-hidden">
            {currentSong.youtube_id && (
                <div className="absolute w-[1px] h-[1px] opacity-0 pointer-events-none overflow-hidden z-[-1]">
                    <YouTube 
                        videoId={currentSong.youtube_id} 
                        opts={{ height: '1', width: '1', playerVars: { autoplay: 1, controls: 0, disablekb: 1 } }} 
                        onReady={onReady} onStateChange={onStateChange} 
                    />
                </div>
            )}

            <div className="absolute inset-0 z-0">
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

            <SwapModal />

            <div className="relative z-10 flex-1 flex w-full h-full p-16 px-8 gap-4 pb-28 items-center justify-center">
                
                <div className="h-[500px] flex items-center">
                    <AnimatePresence>
                        {showChat && (
                            <motion.div initial={{ opacity: 0, width: 0, x: -50 }} animate={{ opacity: 1, width: chatWidth, x: 0 }} exit={{ opacity: 0, width: 0, x: -50 }} transition={{ duration: 0.4, ease: "easeInOut" }}
                                className="h-full min-h-[440px] bg-white/5 border border-white/20 rounded-3xl overflow-hidden flex flex-col backdrop-blur-sm flex-shrink-0">
                                
                                <ChatPanel />
                                
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <CenterVisualizer />

                <div className="h-[500px] flex items-center">
                    <AnimatePresence>
                        {rightPanelMode && (
                            <motion.div initial={{ opacity: 0, width: 0, x: 50 }} animate={{ opacity: 1, width: rightWidth, x: 0 }} exit={{ opacity: 0, width: 0, x: 50 }} transition={{ duration: 0.4, ease: "easeInOut" }}
                                className="h-full min-h-[440px] bg-white/5 border border-white/20 rounded-3xl overflow-hidden flex flex-col backdrop-blur-sm flex-shrink-0">
                                
                                {rightPanelMode === 'playlist' && (
                                    <>
                                        <div 
                                            onClick={handlePlaylistHeaderClick}
                                            className="p-4 border-b border-white/10 font-out-text text-[#9ED3DC] flex items-center justify-between cursor-pointer select-none"
                                        >
                                            <div className="flex items-center gap-2"><Music size={18} /> Danh sách phát</div>
                                            
                                            {showPlaylistDebug && (
                                                <motion.button 
                                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                    className="text-[9px] bg-[#9ED3DC] text-black px-2 py-0.5 rounded font-bold uppercase tracking-tighter"
                                                >
                                                    NCKH Report
                                                </motion.button>
                                            )}
                                        </div>
                                        <PlaylistSidebar />
                                    </>
                                )}

                                {rightPanelMode === 'diary' && (
                                    <>
                                        <div className="p-4 border-b border-white/10 font-out-text text-rose-300 flex items-center gap-2">
                                            <BookOpen size={18} /> Nhật Ký Cảm Xúc
                                        </div>
                                        <DiaryPanel />
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            

            <MediaController />
        </div>
    );
};

const PlayerView = () => {
    const location = useLocation();
    const initialPlaylist = location.state?.playlist || [];
    const mode = location.state?.mode || 'therapy';
    const initialSessionId = location.state?.sessionId || null;

    return (
        <PlayerProvider initialPlaylist={initialPlaylist} mode={mode} initialSessionId={initialSessionId}>
            <PlayerLayout />
        </PlayerProvider>
    );
};

export default PlayerView;