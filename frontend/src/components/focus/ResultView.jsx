import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, PlayCircle, Loader2 } from 'lucide-react';
import Mascot from '../Mascot';
import { calculateResult } from '../../utils/dassScoring';
import { useTranslation } from 'react-i18next';

// level is the language-neutral key from calculateResult (data.level)
const getColorByLevel = (level) => {
    switch(level) {
        case 'normal':   return '#38bdf8';
        case 'mild':     return '#fcd34d';
        case 'moderate': return '#fb923c';
        case 'severe':   return '#f472b6';
        case 'extreme':  return '#c084fc';
        default:         return '#9ca3af';
    }
};

const Gauge = ({ label, data, isHighest }) => {
    const { t } = useTranslation();
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const percent = Math.min(data.score / 42, 1);
    const offset = circumference - percent * circumference;
    const color = getColorByLevel(data.level);

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
                {t(`dass.levels.${data.level}`)}
            </span>
        </div>
    );
};

const ResultView = ({ answers, onLoginRequest, onContinue, onSaveSuccess }) => {
    const { t } = useTranslation();
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
                console.error("Failed to save DASS-21 result");
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
                <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">{t('result.analyzingTitle')}</h2>
                <p className="text-gray-400">{t('result.analyzingSub')}</p>
            </div>
        );
    }

    const isSOS = ['severe', 'extreme'].includes(result.S.level) ||
                  ['severe', 'extreme'].includes(result.A.level) ||
                  ['severe', 'extreme'].includes(result.D.level);

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
                        {t('result.title')}
                    </h2>
                    <p className="text-gray-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                        {isSOS 
                            ? t('result.descSos') 
                            : t('result.descNormal')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative z-10">
                    <Gauge label={t('dass.categories.depression')} data={result.D} isHighest={result.D.score === maxScore && result.D.score > 0} />
                    <Gauge label={t('dass.categories.anxiety')} data={result.A} isHighest={result.A.score === maxScore && result.A.score > 0} />
                    <Gauge label={t('dass.categories.stress')} data={result.S} isHighest={result.S.score === maxScore && result.S.score > 0} />
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
                                <><Loader2 className="w-5 h-5 animate-spin" /> {t('result.saving')}</>
                            ) : (
                                <>
                                    {isSOS ? <ShieldAlert className="w-5 h-5 text-purple-300" /> : <PlayCircle className="w-5 h-5 text-[#9ED3DC]" />}
                                    <span className="tracking-wider uppercase">
                                        {isSOS ? t('result.enterSos') : t('result.saveContinue')}
                                    </span>
                                </>
                            )}
                        </button>
                    ) : (
                        <button 
                            onClick={onLoginRequest} 
                            className="px-8 py-4 bg-[#9ED3DC] text-black font-extrabold rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-[0_0_20px_-5px_#9ED3DC] w-full sm:w-auto uppercase tracking-wider"
                        >
                            <Lock className="w-5 h-5" /> {t('result.loginToActivate')}
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ResultView;