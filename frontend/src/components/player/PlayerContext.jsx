import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../ToastContext';
import { useTranslation } from 'react-i18next';

const PlayerContext = createContext();
export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children, initialPlaylist, mode, initialSessionId }) => {
    const { t, i18n } = useTranslation();
    const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

    const [skipCount, setSkipCount] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();
    

    const toast = useToast();
    const [unreadCount, setUnreadCount] = useState(0);
    
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

    const [showPlaylistDebug, setShowPlaylistDebug] = useState(false);
    const [showPostMood, setShowPostMood] = useState(false);

    const skipTimeoutsRef = useRef(new Map());

    const hasAskedPostMood = useRef(false);

    const currentSong = playlistData[currentIndex] || {};

    const [showPreMood, setShowPreMood] = useState(mode === 'therapy');

    useEffect(() => {
        if (showPreMood) {
            setUnreadCount(prev => prev + 1);
        }
    }, []);

    useEffect(() => {
        setCurrentTime(0);
    }, [currentIndex]);

    useEffect(() => {
        let interval;
        if (isPlaying && playerTarget) {
            interval = setInterval(async () => {
                try {
                    const time = await playerTarget.getCurrentTime();
                    setCurrentTime(time);
                } catch (e) { }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, playerTarget]);

    const togglePlay = () => {
        if (!playerTarget) return;
        isPlaying ? playerTarget.pauseVideo() : playerTarget.playVideo();
    };

    const triggerEmergencySOS = async () => {
        console.warn("Triggering emergency SOS flow");
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            const res = await fetch(`${API}/users/therapy-playlist/?force_mode=sos&lang=${i18n.language}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                const sosTracks = data.recommended_tracks;
                
                setPlaylistData(sosTracks);
                setCurrentIndex(0);
                
                if (playerTarget && sosTracks.length > 0 && sosTracks[0].youtube_id) {
                    playerTarget.loadVideoById(sosTracks[0].youtube_id);
                    setIsPlaying(true);
                }
            }
        } catch (err) {
            console.error("SOS trigger error:", err);
        }
    };

    const reportFeedback = async (trackId, action) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            await fetch(`${API}/users/music-feedback/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ track_id: trackId, action: action, session_id: sessionId })
            });
            console.log(`AI feedback: reported [${action}] for track ${trackId}`);
        } catch (e) { console.error("Failed to send feedback:", e); }
    };

    const handleNext = () => {
        if (currentSong) {
            let completionRate = 0;
            if (duration > 0) {
                completionRate = (currentTime / duration) * 100;
            }

            const trackToReport = currentSong.id;

            if (mode === 'therapy') {
                if (completionRate < 40) {
                    setSkipCount(prev => prev + 1);

                    if (!localStorage.getItem('has_shown_skip_guidance')) {
                        toast.info(
                            t('player.skipTip'), 
                            12000 
                        );
                        localStorage.setItem('has_shown_skip_guidance', 'true');
                    }
                    
                    console.log(`Queued track ${trackToReport} for the skip penalty (5s)...`);
                    const timeoutId = setTimeout(() => {
                        reportFeedback(trackToReport, 'SKIPPED');
                        skipTimeoutsRef.current.delete(trackToReport);
                    }, 5000);
                    
                    skipTimeoutsRef.current.set(trackToReport, timeoutId);
                } 
                else if (completionRate > 80) {
                    reportFeedback(trackToReport, 'COMPLETED');
                    setSkipCount(0);
                }
            }
        }

        if (currentIndex < playlistData.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else { 
            playerTarget?.pauseVideo(); 
            playerTarget?.seekTo(0); 
            if (mode === 'therapy' && !hasAskedPostMood.current) {
                setShowPostMood(true);
                setUnreadCount(prev => prev + 1);
                hasAskedPostMood.current = true;
            }
        }
    };

    useEffect(() => {
        if (showChat) setUnreadCount(0);
    }, [showChat]);

    useEffect(() => {
        if (skipCount >= 3) {
            const triggerProactiveBot = async () => {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const songContext = currentSong?.title ? `${currentSong.title} - ${currentSong.artist}` : '';
                const systemInstruction = "The user just skipped the music 3 times in a row. Proactively check in with them in a subtle, natural way. Ask whether they are feeling restless inside, or whether the music simply does not suit their taste. Get straight to the point and DO NOT GREET AGAIN.";

                try {
                    const res = await fetch(`${API}/users/chat/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ 
                            content: systemInstruction, 
                            current_song: songContext,
                            current_track_id: currentSong?.id, 
                            is_system_event: true,
                            lang: i18n.language
                        })
                    });
                    
                    if (res.ok) {
                        toast.info(t('player.proactiveToast'));
                        setUnreadCount(prev => prev + 1); 
                    }
                } catch (err) { console.error(err); }
            };

            triggerProactiveBot();
            setSkipCount(0); 
        }
    }, [skipCount, currentSong]);

    const handlePrev = () => {
        if (currentSong && skipTimeoutsRef.current.has(currentSong.id)) {
            clearTimeout(skipTimeoutsRef.current.get(currentSong.id));
            skipTimeoutsRef.current.delete(currentSong.id);
            console.log(`Cancelled the skip penalty for track ${currentSong.id} (user went back)`);
        }

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
        } catch (e) { console.error("Failed to sync like:", e); }
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

    const handleConfirmSwap = async (selectedTrack) => {
        setSwapState(prev => ({ ...prev, loading: true }));
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const oldTrack = playlistData[swapState.trackIndex];

        try {
            if (sessionId) {
                const response = await fetch(`${API}/users/swap-confirm/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        session_id: sessionId,
                        old_track_id: oldTrack.id,
                        new_track_data: {
                            id: selectedTrack.id, title: selectedTrack.title, artist: selectedTrack.artist,
                            image: selectedTrack.image, youtube_id: selectedTrack.youtube_id,
                            duration: selectedTrack.duration, valence: selectedTrack.valence,
                            energy: selectedTrack.energy, tempo: selectedTrack.tempo
                        },
                        order_index: swapState.trackIndex + 1 
                    })
                });
                if (!response.ok) throw new Error("API Swap Failed");
            }

            const newPlaylist = [...playlistData];
            newPlaylist[swapState.trackIndex] = { ...selectedTrack, phase: oldTrack.phase };
            setPlaylistData(newPlaylist);

            navigate(location.pathname, {
                replace: true, 
                state: { ...location.state, playlist: newPlaylist }
            });

            setSwapState({ isOpen: false, trackIndex: null, options: [], loading: false });
            if (currentIndex === swapState.trackIndex) {
                if (playerTarget) playerTarget.loadVideoById(selectedTrack.youtube_id);
                setCurrentTime(0);
                setIsPlaying(true);
            }
        } catch (error) {
            console.error("Failed to save swap:", error);
            setSwapState(prev => ({ ...prev, loading: false }));
        }
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
        } catch (err) { console.error("Failed to fetch diary:", err); }
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
        fetchDiary,
        triggerEmergencySOS,
        showPlaylistDebug, setShowPlaylistDebug,
        showPreMood, setShowPreMood,
        showPostMood, setShowPostMood,
        sessionId, unreadCount, setUnreadCount
    };

    return (
        <PlayerContext.Provider value={value}>
            {children}
        </PlayerContext.Provider>
    );
};