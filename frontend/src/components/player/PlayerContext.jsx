import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const PlayerContext = createContext();
export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children, initialPlaylist, mode, initialSessionId }) => {
    const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    
    const [playlistData, setPlaylistData] = useState(initialPlaylist || []);
    const [sessionId, setSessionId] = useState(initialSessionId);
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [playerTarget, setPlayerTarget] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(() => {
        const savedVolume = localStorage.getItem('playerVolume');
        return savedVolume !== null ? parseInt(savedVolume, 10) : 50;
    });
    const [isMuted, setIsMuted] = useState(false);
    
    const [showChat, setShowChat] = useState(false); 
    const [rightPanelMode, setRightPanelMode] = useState(null); 
    const [devMode, setDevMode] = useState(false);
    const [showLikeTooltip, setShowLikeTooltip] = useState(false);
    const [swapState, setSwapState] = useState({ isOpen: false, trackIndex: null, options: [], loading: false });

    const currentSong = playlistData[currentIndex] || {};

    useEffect(() => {
        setCurrentTime(0);
    }, [currentIndex]);

    useEffect(() => {
        let interval;
        if (isPlaying && playerTarget) {
            interval = setInterval(async () => {
                const time = await playerTarget.getCurrentTime();
                setCurrentTime(time);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, playerTarget]);

    const togglePlay = () => {
        if (!playerTarget) return;
        isPlaying ? playerTarget.pauseVideo() : playerTarget.playVideo();
    };

    const handleNext = () => {
        if (currentIndex < playlistData.length - 1) setCurrentIndex(prev => prev + 1);
        else { playerTarget?.pauseVideo(); playerTarget?.seekTo(0); }
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
        else playerTarget?.seekTo(0);
    };

    const toggleMute = () => {
        if (!playerTarget) return;
        if (isMuted) { playerTarget.unMute(); playerTarget.setVolume(volume); setIsMuted(false); } 
        else { playerTarget.mute(); setIsMuted(true); }
    };

    const handleToggleLike = async (track, index) => {
        const newPlaylist = [...playlistData];
        const isCurrentlyLiked = newPlaylist[index].isLiked;
        
        if (!isCurrentlyLiked) {
            setShowLikeTooltip(true);
            setTimeout(() => setShowLikeTooltip(false), 2000);
        }
        newPlaylist[index].isLiked = !isCurrentlyLiked;
        setPlaylistData(newPlaylist);

        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            await fetch(`${API}/users/like-track/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ track: track })
            });
        } catch (e) { console.error("Lỗi đồng bộ tim:", e); }
    };

    const handleOpenSwap = async (idx) => {
        const track = playlistData[idx];
        setSwapState({ isOpen: true, trackIndex: idx, options: [], loading: true });
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            const currentPhase = track.phase || Math.ceil((idx + 1) / (playlistData.length / 7));
            const res = await fetch(`${API}/users/swap-options/?current_track_id=${track.id}&phase=${currentPhase}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(res.ok) {
                const data = await res.json();
                setSwapState(prev => ({ ...prev, options: data.options, loading: false }));
            }
        } catch(e) { setSwapState(prev => ({ ...prev, loading: false })); }
    };

    const handleConfirmSwap = async (newTrack) => {
        const idx = swapState.trackIndex;
        const oldTrack = playlistData[idx];
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            const newPlaylist = [...playlistData];
            newPlaylist[idx] = newTrack;
            setPlaylistData(newPlaylist);
            setSwapState({ isOpen: false, trackIndex: null, options: [], loading: false });

            if(token && sessionId) {
                await fetch(`${API}/users/swap-confirm/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ session_id: sessionId, old_track_id: oldTrack.id, new_track_data: newTrack, order_index: idx + 1 })
                });
            }
        } catch(e) { console.error(e); }
    };


    const [diaryEntries, setDiaryEntries] = useState([]);
    const [diaryFilter, setDiaryFilter] = useState('all');
    const [diaryViewMode, setDiaryViewMode] = useState('list'); 
    const [currentDiaryEntry, setCurrentDiaryEntry] = useState(null);

    const fetchDiary = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            const res = await fetch(`${API}/users/diary/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDiaryEntries(data);
            }
        } catch (err) { console.error("Lỗi lấy nhật ký:", err); }
    };

    useEffect(() => {
        fetchDiary();
    }, [API]);

    const filteredDiaryEntries = React.useMemo(() => {
        if (diaryFilter === 'all') return diaryEntries;
        const now = new Date();
        return diaryEntries.filter(entry => {
            const entryDate = new Date(entry.created_at || entry.date);
            if (diaryFilter === 'week') {
                const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return entryDate >= sevenDaysAgo && entryDate <= now;
            }
            if (diaryFilter === 'month') {
                return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
            }
            return true;
        });
    }, [diaryEntries, diaryFilter]);

    const value = {
        API, mode, playlistData, currentSong, currentIndex, setCurrentIndex,
        isPlaying, setIsPlaying, currentTime, setCurrentTime, duration, setDuration,
        volume, setVolume, isMuted, setIsMuted, playerTarget, setPlayerTarget,
        showChat, setShowChat, rightPanelMode, setRightPanelMode,
        devMode, setDevMode, swapState, setSwapState, showLikeTooltip,
        togglePlay, handleNext, handlePrev, toggleMute,
        handleToggleLike, handleOpenSwap, handleConfirmSwap,
        diaryEntries, setDiaryEntries,
        diaryFilter, setDiaryFilter,
        diaryViewMode, setDiaryViewMode,
        currentDiaryEntry, setCurrentDiaryEntry,
        filteredDiaryEntries,
        fetchDiary
    };

    return (
        <PlayerContext.Provider value={value}>
            {children}
        </PlayerContext.Provider>
    );
};