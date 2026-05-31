import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, PlayCircle, Loader2 } from 'lucide-react';
import Mascot from '../Mascot';
import { calculateResult } from '../../utils/dassScoring';

const getColorByLevel = (level) => {
    switch(level) {
        case 'Bình thường': return '#38bdf8';
        case 'Nhẹ':         return '#fcd34d';
        case 'Vừa':         return '#fb923c';
        case 'Nặng':        return '#f472b6';
        case 'Rất nặng':    return '#c084fc';
        default:            return '#9ca3af'; 
    }
};

const Gauge = ({ label, data, isHighest }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const percent = Math.min(data.score / 42, 1);
    const offset = circumference - percent * circumference;
    const color = getColorByLevel(data.label);

    return (
        <div 
            className={`flex flex-col items-center p-6 rounded-[24px] transition-all duration-700 
            ${isHighest 
                ? 'bg-white/10 border border-white/20 scale-105 z-10' 
                : 'bg-white/5 border border-white/5 opacity-80 hover:opacity-100'}`}
            style={{
                boxShadow: isHighest ? `0 0 40px -10px ${color}60` : 'none'
            }}
        >
            <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                    <motion.circle
                        cx="64" cy="64" r={radius}
                        stroke={color} 
                        strokeWidth="8" 
                        fill="none"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <span className="text-3xl font-black font-out-text">{data.score}</span>
                </div>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">{label}</h3>
            <span 
                className="text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider" 
                style={{ backgroundColor: `${color}20`, color: color, border: `1px solid ${color}40` }}
            >
                {data.label}
            </span>
        </div>
    );
};

const ResultView = ({ answers, onLoginRequest, onContinue, onSaveSuccess }) => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const isLoggedIn = !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
    const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

    useEffect(() => {
        const timer = setTimeout(() => {
            const computed = calculateResult(answers);
            setResult(computed);
            setLoading(false);
        }, 2000); 
        return () => clearTimeout(timer);
    }, [answers]);

    const handleSaveResult = async () => {
        setIsSaving(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            const res = await fetch(`${API}/users/dass21/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    stress_score: result.S.score,
                    anxiety_score: result.A.score,
                    depression_score: result.D.score,
                    stress_level: result.S.label,
                    anxiety_level: result.A.label,
                    depression_level: result.D.label
                })
            });
            
            if (res.ok) {
                if (onSaveSuccess) onSaveSuccess();
                if (onContinue) onContinue();
            } else {
                console.error("Lỗi lưu DASS-21");
                setIsSaving(false);
            }
        } catch (err) {
            console.error(err);
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="w-24 h-24 mb-6">
                   <div className="w-full h-full rounded-full bg-[#9ED3DC]/10 border border-[#9ED3DC]/30 overflow-hidden p-2">
                       <Mascot status="run" className="w-full h-full opacity-80" />
                   </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">Đang phân tích cảm xúc...</h2>
                <p className="text-gray-400">MindMelody đang lượng hóa các chỉ số của bạn</p>
            </div>
        );
    }

    const isSOS = ['Nặng', 'Rất nặng'].includes(result.S.label) || 
                  ['Nặng', 'Rất nặng'].includes(result.A.label) || 
                  ['Nặng', 'Rất nặng'].includes(result.D.label);

    const scores = [result.D.score, result.A.score, result.S.score];
    const maxScore = Math.max(...scores);

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-full px-4 py-8 relative">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl w-full  p-8 md:p-12 shadow-2xl relative overflow-hidden"
            >
                

                {/* Header */}
                <div className="text-center mb-10 relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 mb-4 rounded-full bg-white/5 border border-white/10 p-2 shadow-inner">
                        <Mascot status={isSOS ? "listening" : "idle2"} className="w-full h-full drop-shadow-lg" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold font-out-text text-white mb-3 tracking-wide">
                        Kết quả DASS-21
                    </h2>
                    <p className="text-gray-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                        {isSOS 
                            ? "Chúng tôi nhận thấy bạn đang mang khá nhiều áp lực. Đừng lo lắng, hệ thống đã chuẩn bị một không gian trị liệu đặc biệt an toàn dành riêng cho bạn." 
                            : "Kết quả của bạn đã sẵn sàng. Hãy lưu lại hồ sơ để thuật toán của chúng tôi tạo nên lộ trình âm nhạc phù hợp nhất nhé."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative z-10">
                    <Gauge label="Trầm cảm" data={result.D} isHighest={result.D.score === maxScore && result.D.score > 0} />
                    <Gauge label="Lo âu" data={result.A} isHighest={result.A.score === maxScore && result.A.score > 0} />
                    <Gauge label="Căng thẳng" data={result.S} isHighest={result.S.score === maxScore && result.S.score > 0} />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10">
                    {isLoggedIn ? (
                        <button 
                            onClick={handleSaveResult} 
                            disabled={isSaving} 
                            className={`group relative px-8 py-4 font-extrabold text-base transition-all flex items-center gap-3 overflow-hidden border-2 
                                ${isSOS ? 'bg-purple-900/40 text-purple-200 border-purple-500/50 hover:bg-purple-800/60' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'} 
                                rounded-full w-full sm:w-auto justify-center disabled:opacity-50`}
                        >
                            {isSaving ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Đang thiết lập quỹ đạo...</>
                            ) : (
                                <>
                                    {isSOS ? <ShieldAlert className="w-5 h-5 text-purple-300" /> : <PlayCircle className="w-5 h-5 text-[#9ED3DC]" />}
                                    <span className="tracking-wider uppercase">
                                        {isSOS ? "Vào Không gian SOS" : "Lưu & Tiếp tục"}
                                    </span>
                                </>
                            )}
                        </button>
                    ) : (
                        <button 
                            onClick={onLoginRequest} 
                            className="px-8 py-4 bg-[#9ED3DC] text-black font-extrabold rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-[0_0_20px_-5px_#9ED3DC] w-full sm:w-auto uppercase tracking-wider"
                        >
                            <Lock className="w-5 h-5" /> Đăng nhập để kích hoạt
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ResultView;