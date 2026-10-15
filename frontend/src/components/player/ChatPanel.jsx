import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, Plus, MessageSquare, Trash2, AlertCircle, PanelLeftClose, PanelLeftOpen, Book, CheckCheck } from 'lucide-react';
import { usePlayer } from './PlayerContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../ToastContext';
import { useConfirm } from '../ConfirmContext';
import { useTranslation } from 'react-i18next';

// value is what the backend stores (mood_before / mood_after); key picks the translated label
const moodOptions = [
    { value: 1, key: 'normal' },
    { value: 2, key: 'mild' },
    { value: 3, key: 'moderate' },
    { value: 4, key: 'severe' },
    { value: 5, key: 'verySevere' }
];
// English labels are sent to the AI so the hidden prompts stay language-neutral
const MOOD_LABELS_EN = { normal: 'Normal', mild: 'Mild', moderate: 'Moderate', severe: 'Severe', verySevere: 'Very severe' };
// Titles a new chat session gets by default (the DB default is Vietnamese)
const DEFAULT_SESSION_TITLES = ['', 'Cuộc trò chuyện mới', 'New conversation'];

const ChatPanel = () => {
    const { t, i18n } = useTranslation();
    const { 
        API, playerTarget, triggerEmergencySOS, fetchDiary, currentSong,
        showPreMood, setShowPreMood, showPostMood, setShowPostMood,
        sessionId, unreadCount, setUnreadCount
    } = usePlayer();

    
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const toast = useToast();
    const { confirm } = useConfirm();
    
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [justSummarized, setJustSummarized] = useState(false);
    
    //const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const messagesEndRef = useRef(null);


    const userAvatar = localStorage.getItem('avatar') || sessionStorage.getItem('avatar') || '/avatars/av6.png';

    const fetchSessions = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            const res = await fetch(`${API}/users/chat/sessions/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
                if (data.length > 0 && !currentSessionId) setCurrentSessionId(data[0].id);
            }
        } catch (err) { console.error("Failed to fetch sessions:", err); }
    };

    const fetchMessages = async (sessionId) => {
        if (!sessionId) {
            setMessages([{ id: 'welcome', sender: 'BOT', textKey: 'chat.welcomeNoSession' }]);
            return;
        }
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            const res = await fetch(`${API}/users/chat/?session_id=${sessionId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data.length > 0 ? data : [{ 
                    id: 'welcome', sender: 'BOT', textKey: 'chat.welcomeEmptySession' 
                }]);
            }
        } catch (err) { console.error("Failed to fetch messages:", err); }
    };

    useEffect(() => { fetchSessions(); }, []);
    useEffect(() => { fetchMessages(currentSessionId); }, [currentSessionId]);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

    
    useEffect(() => {
        if (isSidebarOpen) setUnreadCount(0);
    }, [isSidebarOpen]);

    // (Pre-Mood)
    useEffect(() => {
        if (showPreMood && messages.length > 0) {
            const hasPreMsg = messages.some(m => m.id === 'sys-pre-mood');
            if (!hasPreMsg) {
                setMessages(prev => [...prev, {
                    id: 'sys-pre-mood', sender: 'BOT',
                    textKey: 'chat.preMoodPrompt',
                    isSystemPrompt: true, moodType: 'before'
                }]);
            }
        }
    }, [showPreMood, messages.length]);

    // (Post-Mood)
    useEffect(() => {
        if (showPostMood && messages.length > 0) {
            const hasPostMsg = messages.some(m => m.id === 'sys-post-mood');
            if (!hasPostMsg) {
                setMessages(prev => [...prev, {
                    id: 'sys-post-mood', sender: 'BOT',
                    textKey: 'chat.postMoodPrompt',
                    isSystemPrompt: true, moodType: 'after'
                }]);
            }
        }
    }, [showPostMood, messages.length]);

    const handleMoodSubmit = async (moodValue, moodKey, type) => {
        setMessages(prev => prev.filter(m => !m.isSystemPrompt));
        if (type === 'before') setShowPreMood(false);
        if (type === 'after') setShowPostMood(false);

        setMessages(prev => [...prev, { id: Date.now(), sender: 'USER', textKey: 'chat.currentMood', moodKey }]);
        setIsLoading(true);

        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const payload = type === 'before' ? { mood_before: moodValue } : { mood_after: moodValue };

        try {
            if (sessionId) {
                await fetch(`${API}/users/session-mood/${sessionId}/`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
            }

            const moodLabelEn = MOOD_LABELS_EN[moodKey];
            const hiddenPrompt = type === 'before'
                ? `The user just reported their stress level at the start of the session as "${moodLabelEn}". Send ONE short sentence encouraging them to enjoy the music.`
                : `The user reported their stress level at the end of the session as "${moodLabelEn}". Give brief encouragement and wrap up the session.`;
            
            const songContext = currentSong?.title ? `${currentSong.title} - ${currentSong.artist}` : '';

            const res = await fetch(`${API}/users/chat/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ 
                    content: hiddenPrompt, 
                    session_id: currentSessionId, 
                    is_system_event: true,
                    lang: i18n.language,
                    current_song: songContext,
                    current_track_id: currentSong?.id
                })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, data.reply]);
            }
        } catch (err) {} finally { setIsLoading(false); }
    };


    const handleCreateSession = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            const res = await fetch(`${API}/users/chat/sessions/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const newSess = await res.json();
                setSessions([newSess, ...sessions]);
                setCurrentSessionId(newSess.id);
                setMessages([{ id: 'welcome', sender: 'BOT', textKey: 'chat.newSessionStarted' }]);
            }
        } catch (err) { console.error("Failed to create session:", err); }
    };

    const handleDeleteSession = async (e, id) => {
        e.stopPropagation();
        
        const isConfirmed = await confirm({
            title: t('chat.deleteConfirm.title'),
            message: t('chat.deleteConfirm.message'),
            confirmText: t('chat.deleteConfirm.confirm'),
            cancelText: t('chat.deleteConfirm.cancel'),
            type: "danger" 
        });

        if (!isConfirmed) return;

        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            const res = await fetch(`${API}/users/chat/sessions/${id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const newSessions = sessions.filter(s => s.id !== id);
                setSessions(newSessions);
                toast.success(t('chat.toast.deleted'));
                if (currentSessionId === id) {
                    setCurrentSessionId(newSessions.length > 0 ? newSessions[0].id : null);
                }
            }
        } catch (err) { 
            console.error("Failed to delete session:", err); 
            toast.error(t('chat.toast.deleteFailed'));
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;
        const userMsg = input.trim();
        setInput('');
        setIsLoading(true);
        setMessages(prev => [...prev, { id: Date.now(), sender: 'USER', content: userMsg }]);

        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            const songContext = currentSong?.title ? `${currentSong.title} - ${currentSong.artist}` : '';

            const res = await fetch(`${API}/users/chat/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ 
                    content: userMsg,
                    lang: i18n.language, 
                    session_id: currentSessionId,
                    current_song: songContext,
                    current_track_id: currentSong?.id
                })
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, data.reply]);
                
                if (data.session_title) {
                    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, title: data.session_title } : s));
                }

                if (data.is_emergency) {
                    triggerEmergencySOS();
                }

                if (!isSidebarOpen) {
                    setUnreadCount(prev => prev + 1);
                }
            }
        } catch (err) {
            setMessages(prev => [...prev, { sender: 'BOT', textKey: 'chat.connectionError' }]);
            toast.error(t('chat.toast.aiConnection'));
        } finally { setIsLoading(false); }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isLoading && input.trim()) handleSendMessage();
        }
    };

    const handleEmergency = (type) => {
        if (type === 'panic') {
            setMessages(prev => [...prev, {
                id: Date.now(), sender: 'BOT',
                textKey: 'chat.panicReply'
            }]);
            triggerEmergencySOS(); 
        }
    }

    const handleManualSummary = async () => {
        if (!currentSessionId || isSummarizing) return;
        
        setIsSummarizing(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        try {
            const res = await fetch(`${API}/users/chat/summarize/`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ session_id: currentSessionId, lang: i18n.language })
            });

            if (res.ok) {
                setJustSummarized(true);
                toast.success(t('chat.toast.summarySaved'));
                setTimeout(() => setJustSummarized(false), 3000); 
                
                fetchDiary(); 
            } else {
                const err = await res.json();
                toast.error(t(`errors.${err.code}`, { defaultValue: err.error || t('chat.toast.summaryFailed') }));
            }
        } catch (error) {
            console.error("Summarize error:", error);
        } finally {
            setIsSummarizing(false);
        }
    };

    // Client-made messages carry a textKey so they re-translate when the language changes.
    // Server messages (AI replies, history) keep their stored content.
    const renderContent = (msg) => {
        if (!msg.textKey) return msg.content;
        return t(msg.textKey, msg.moodKey ? { mood: t(`chat.mood.${msg.moodKey}`) } : undefined);
    };

    return (
        <div className="flex h-full w-full bg-black/20 overflow-hidden relative">
            
            <AnimatePresence initial={false}>
                {isSidebarOpen && (
                    <motion.div 
                        initial={{ width: 0, opacity: 0 }} animate={{ width: 200, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="border-r border-white/10 flex flex-col bg-white/10 backdrop-blur-md z-20 flex-shrink-0 absolute h-full md:relative"
                    >
                        <div className="p-3 border-b border-white/10 flex items-center gap-3">
                            <button 
                                onClick={() => setIsSidebarOpen(false)} 
                                className="p-2 text-main_text/90 hover:text-main_text bg-[#41A67E] hover:scale-110 rounded-xl transition-colors"
                                title={t('chat.closeList')}
                            >
                                <PanelLeftClose size={14} />
                            </button>
                            <button 
                                onClick={handleCreateSession}
                                className="px-4 py-2 ml-6 bg-white/5 hover:bg-white/10 hover:text-[#66D0BC] hover:scale-105 border border-main_text/30 rounded-xl text-main_text/60 text-[11px] font-medium flex items-center justify-center gap-2 transition-all"
                            >
                                <Plus size={14} /> {t('chat.newSession')}
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                            {sessions.map(s => (
                                <div 
                                    key={s.id} onClick={() => setCurrentSessionId(s.id)}
                                    className={`group px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${currentSessionId === s.id ? 'bg-white/10 border-r-2 border-[#66D0BC]' : 'hover:bg-white/5'}`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                                        <MessageSquare size={14} className={currentSessionId === s.id ? 'text-[#66D0BC]' : 'text-gray-500'} />
                                        <span className={`text-[12px] truncate ${currentSessionId === s.id ? 'text-white' : 'text-gray-400'}`}>
                                            {DEFAULT_SESSION_TITLES.includes(s.title) ? t('chat.newSessionTitle') : s.title}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={(e) => handleDeleteSession(e, s.id)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-1 transition-all"
                                        title={t('chat.deleteSession')}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 flex flex-col relative min-w-0">
                <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/5 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {!isSidebarOpen && (
                            <button 
                                onClick={() => setIsSidebarOpen(true)} 
                                className="p-2 text-main_text/90 hover:text-main_text bg-[#41A67E] hover:scale-110 rounded-lg transition-colors"
                                title={t('chat.openList')}
                            >
                                <PanelLeftOpen size={14} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white/20"></span>
                                    </span>
                                )}
                            </button>
                        )}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#66D0BC] animate-pulse shadow-[0_0_8px_#66D0BC]" />
                                <span className="text-sm font-bold font-out-text text-main_text/90 hidden sm:block">{t('chat.assistantTitle')}</span>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleManualSummary}
                                disabled={isSummarizing || !currentSessionId}
                                title={t('chat.summarizeTooltip')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                                    justSummarized 
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                    : 'bg-white/5 text-main_text/60 border border-main_text/30 hover:bg-white/10 hover:text-[#66D0BC]'
                                }`}
                            >
                                {isSummarizing ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : justSummarized ? (
                                    <CheckCheck size={14} />
                                ) : (
                                    <Book size={14} />
                                )}
                                {isSummarizing ? t('chat.summarizing') : justSummarized ? t('chat.summarized') : t('chat.summarize')}
                            </motion.button>
                        </div>
                    </div>

                    <button 
                        onClick={() => handleEmergency('panic')} 
                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] sm:text-[11px] font-medium hover:bg-rose-500/20 transition-all shadow-sm"
                    >
                        <AlertCircle size={16} /> <span className="hidden sm:inline">{t('chat.help')}</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
                    {messages.map((msg, idx) => (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={idx} className={`flex gap-3 ${msg.sender === 'USER' ? 'flex-row-reverse' : ''}`}>
                            <img 
                                src={msg.sender === 'USER' ? userAvatar : '/mascot/robot-idle.gif'} 
                                className={`w-9 h-9 rounded-full border-2 object-cover shadow-md ${msg.sender === 'USER' ? 'border-[#41A67E]/50' : 'border-[#9ED3DC]/50 bg-black/40'}`}
                                alt={msg.sender}
                                onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                            />
                            <div className={`max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-2xl text-[13px] md:text-sm leading-relaxed shadow-lg  ${
                                msg.sender === 'USER' ? 'bg-[#41A67E]/80 text-white rounded-tr-none' : 'bg-white/10 text-gray-200 border border-white/5 rounded-tl-none backdrop-blur-sm'
                            }`}>
                                {renderContent(msg)}
                                {msg.isSystemPrompt && (
                                    <div className="mt-4 flex flex-col gap-2 w-full border-t border-white/10 pt-4">
                                        <div className="flex justify-center gap-2 w-full">
                                            {moodOptions.slice(0, 2).map(opt => (
                                                <button key={opt.value} onClick={() => handleMoodSubmit(opt.value, opt.key, msg.moodType)}
                                                    className="flex-1 py-2 px-1 bg-white/5 hover:bg-[#41A67E] border border-white/20 hover:border-[#41A67E] rounded-xl text-[11px] font-medium text-white transition-all text-center">
                                                    {t(`chat.mood.${opt.key}`)}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex justify-center gap-2 w-full">
                                            {moodOptions.slice(2, 5).map(opt => (
                                                <button key={opt.value} onClick={() => handleMoodSubmit(opt.value, opt.key, msg.moodType)}
                                                    className="flex-1 py-2 px-1 bg-white/5 hover:bg-[#41A67E] border border-white/20 hover:border-[#41A67E] rounded-xl text-[11px] font-medium text-white transition-all text-center">
                                                    {t(`chat.mood.${opt.key}`)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3">
                            <img src="/mascot/robot-run.gif" className="w-9 h-9 rounded-full border-2 border-[#9ED3DC]/50 bg-black/40" alt="bot" />
                            <div className="px-4 py-3 bg-white/5 border border-white/5 rounded-2xl rounded-tl-none flex items-center gap-2">
                                <Loader2 size={14} className="animate-spin text-[#9ED3DC]" />
                                <span className="text-xs text-gray-400 font-out-text">{t('chat.listening')}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-3 md:p-4 bg-white/5 border-t border-white/10 flex-shrink-0 transition-all duration-300">
                    <div className="relative flex items-end gap-2">
                        <textarea
                            value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                            placeholder={t('chat.placeholder')}
                            className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-[#41A67E]/50 transition-all resize-none custom-scrollbar"
                            rows="1" style={{ minHeight: '46px', maxHeight: '120px' }}
                        />
                        <button 
                            onClick={handleSendMessage} disabled={!input.trim() || isLoading}
                            className={`p-3 rounded-xl transition-all h-[46px] w-[46px] flex items-center justify-center flex-shrink-0 ${input.trim() && !isLoading ? 'bg-[#41A67E] text-white shadow-[0_0_15px_rgba(65,166,126,0.3)] hover:bg-[#66D0BC]' : 'bg-white/5 text-gray-500'}`}
                        >
                            <Send size={18} className={input.trim() && !isLoading ? 'ml-1' : ''} />
                        </button>
                    </div>

                    <div className={`overflow-hidden transition-all duration-300 ease-in-out flex justify-center ${input.trim() ? 'max-h-0 opacity-0 mt-0' : 'max-h-10 opacity-60 mt-2'}`}>
                        <p className="text-[10px] text-center text-gray-400 font-medium tracking-wide flex items-center gap-1">
                            <AlertCircle size={10} /> {t('chat.disclaimer')}
                        </p>
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
            `}} />
        </div>
    );
};

export default ChatPanel;