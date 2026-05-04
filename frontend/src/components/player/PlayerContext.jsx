import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../ToastContext';

const PlayerContext = createContext();
export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children, initialPlaylist, mode, initialSessionId }) => {
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
        console.warn("KÍCH HOẠT QUY TRÌNH SOS");
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            const res = await fetch(`${API}/users/therapy-playlist/?force_mode=sos`, {
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
            console.error("Lỗi kích hoạt SOS:", err);
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
            console.log(`📊 AI Feedback: Đã báo cáo [${action}] cho bài hát ${trackId}`);
        } catch (e) { console.error("Lỗi gửi feedback:", e); }
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
                            "Mẹo nhỏ: Tuân thủ thứ tự bài hát sẽ giúp hiệu quả trị liệu tốt nhất. Nếu giai điệu này không hợp, hãy dùng tính năng Đổi bài (Swap) ở danh sách phát thay vì Bỏ qua nhé!", 
                            12000 
                        );
                        localStorage.setItem('has_shown_skip_guidance', 'true');
                    }
                    
                    console.log(`⏱️ Đưa bài ${trackToReport} vào Map chờ phạt (5s)...`);
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
                const songContext = currentSong?.title ? `${currentSong.title} - ${currentSong.artist}` : 'Đang không rõ';
                const systemInstruction = "Người dùng vừa bỏ qua (skip) nhạc liên tục 3 lần. Hãy chủ động hỏi thăm một cách tinh tế, tự nhiên. Hỏi xem họ đang bồn chồn trong lòng, hay do nhạc chưa hợp gu. Đi thẳng vào vấn đề, TUYỆT ĐỐI KHÔNG CHÀO HỎI LẠI.";

                try {
                    const res = await fetch(`${API}/users/chat/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ 
                            content: systemInstruction, 
                            current_song: songContext,
                            current_track_id: currentSong?.id, 
                            is_system_event: true 
                        })
                    });
                    
                    if (res.ok) {
                        toast.info("MindMelody vừa gửi cho bạn một lời nhắn...");
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
            console.log(`Đã HỦY lệnh phạt Skip cho bài ${currentSong.id} (Do quay lại)`);
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
            console.error("Lỗi lưu swap:", error);
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
        fetchDiary,
        triggerEmergencySOS,
        showPlaylistDebug, setShowPlaylistDebug,
        showPostMood, setShowPostMood,
        sessionId
    };

    return (
        <PlayerContext.Provider value={value}>
            {children}
        </PlayerContext.Provider>
    );
};