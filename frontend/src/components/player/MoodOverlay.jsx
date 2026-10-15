import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Frown, Smile, Wind, Loader2 } from 'lucide-react';
import { usePlayer } from './PlayerContext';
import { useTranslation } from 'react-i18next';

const MoodOverlay = ({ isVisible, type = 'before', onSubmit }) => {
    const { t } = useTranslation();
    const [moodValue, setMoodValue] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const sliderRef = useRef(null);
    
    useEffect(() => {
        if (isVisible) {
            setMoodValue(5);
            setIsSubmitting(false);
        }
    }, [isVisible]);

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            onSubmit(moodValue);
        }, 1000);
    };

    const getMoodGradient = (value) => {
        const hue = Math.min(120, Math.max(0, (value - 1) * 13.33));
        return `linear-gradient(90deg, hsl(${hue}, 70%, 50%), hsl(${hue}, 70%, 60%))`;
    };

    const getOverlayOpacity = (value) => {
        return 0.4 + (10 - value) * 0.03;
    };

    const getMoodFeedback = (value) => {
        if (value <= 3) return { text: t('moodOverlay.feedback.veryStressed'), emoji: "😣" };
        if (value <= 5) return { text: t('moodOverlay.feedback.slightlyTired'), emoji: "😫" };
        if (value <= 7) return { text: t('moodOverlay.feedback.normal'), emoji: "🙂" };
        if (value <= 9) return { text: t('moodOverlay.feedback.relaxed'), emoji: "😌" };
        return { text: t('moodOverlay.feedback.peaceful'), emoji: "🧘‍♀️" };
    };

    const buttonVariants = {
        initial: { scale: 1 },
        hover: { 
            scale: 1.03,
            transition: { duration: 0.2 }
        },
        tap: { scale: 0.97 }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ 
                        opacity: 1,
                        transition: { duration: 0.5 }
                    }}
                    exit={{ 
                        opacity: 0,
                        transition: { duration: 0.4, ease: "easeOut" }
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ 
                        background: `rgba(0, 0, 0, ${getOverlayOpacity(moodValue)})`
                    }}
                >
                    <motion.div
                        ref={sliderRef}
                        initial={{ y: 40, opacity: 0, scale: 0.95 }}
                        animate={{ 
                            y: 0, 
                            opacity: 1,
                            scale: 1,
                            transition: { delay: 0.1, duration: 0.4, ease: "backOut" }
                        }}
                        exit={{ 
                            y: 40, 
                            opacity: 0,
                            scale: 0.95,
                            transition: { duration: 0.3 }
                        }}
                        className="w-[400px] h-[450px] max-w-md mx-4 bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 mt-16"
                    >
                        <div className="p-6 relative">
                            <motion.div
                                className="absolute inset-0 opacity-5 pointer-events-none"
                                style={{ 
                                    background: getMoodGradient(moodValue),
                                    filter: 'blur(40px)'
                                }}
                                animate={{ opacity: [0.1, 0.2, 0.1] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />
                            
                            <motion.h3 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xl font-bold text-white mb-2 text-center leading-tight font-sans"
                            >
                                {type === 'before' 
                                    ? t('moodOverlay.titleBefore') 
                                    : t('moodOverlay.titleAfter')}
                            </motion.h3>
                            
                            <motion.p 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                                className="text-sm text-white/60 mb-8 text-center max-w-[320px] mx-auto"
                            >
                                {type === 'before' 
                                    ? t('moodOverlay.subBefore') 
                                    : t('moodOverlay.subAfter')}
                            </motion.p>

                            {!isSubmitting ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1, transition: { delay: 0.2 } }}
                                >
                                    <div className="relative mb-10 mt-2">
                                        <div className="flex justify-between text-xs text-white/50 mb-3 px-1">
                                            <div className="flex items-center gap-1.5">
                                                <Frown className="w-4 h-4" />
                                                <span>{t('moodOverlay.stressed')}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span>{t('moodOverlay.relaxed')}</span>
                                                <Smile className="w-4 h-4" />
                                            </div>
                                        </div>
                                        
                                        <div className="relative h-2.5 bg-white/15 rounded-full overflow-hidden">
                                            <motion.div 
                                                className="absolute top-0 left-0 h-full"
                                                style={{ 
                                                    background: getMoodGradient(moodValue),
                                                    width: '100%'
                                                }}
                                            />
                                            
                                            <motion.div 
                                                className="absolute top-0 left-0 h-full"
                                                style={{ background: 'rgba(255,255,255,0.15)' }}
                                                animate={{ width: `${(moodValue / 10) * 100}%` }}
                                                transition={{ duration: 0.4, ease: "easeOut" }}
                                            />
                                            
                                            <motion.div 
                                                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full shadow-xl border-2 border-white/20"
                                                style={{ 
                                                    left: `calc(${(moodValue / 10) * 100}% - 28px)`,
                                                    background: 'white'
                                                }}
                                                animate={{ 
                                                    scale: [1, 1.1, 1],
                                                    boxShadow: [
                                                        `0 0 0 0 rgba(${parseInt((moodValue-1)*13.33)}, 180, 100, 0.3)`,
                                                        `0 0 0 12px rgba(${parseInt((moodValue-1)*13.33)}, 180, 100, 0.2)`,
                                                        `0 0 0 0 rgba(${parseInt((moodValue-1)*13.33)}, 180, 100, 0.3)`
                                                    ]
                                                }}
                                                transition={{ 
                                                    scale: { duration: 0.6, repeat: Infinity, ease: "easeOut" },
                                                    boxShadow: { duration: 2, repeat: Infinity }
                                                }}
                                            >
                                                <motion.div 
                                                    className="w-full h-full rounded-full"
                                                    style={{ background: getMoodGradient(moodValue) }}
                                                />
                                            </motion.div>
                                            
                                            <input 
                                                type="range" 
                                                min="1" max="10" step="1"
                                                value={moodValue}
                                                onChange={(e) => setMoodValue(parseInt(e.target.value))}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                aria-label={t('moodOverlay.ariaLabel')}
                                                aria-valuetext={`${getMoodFeedback(moodValue).text} (${moodValue}/10)`}
                                            />
                                        </div>
                                    </div>

                                    <motion.div 
                                        key={moodValue}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="text-center mb-8 min-h-[36px] flex flex-col items-center justify-center"
                                    >
                                        <div className="text-4xl mb-1">
                                            {getMoodFeedback(moodValue).emoji}
                                        </div>
                                        <div className="text-lg font-medium" style={{ background: getMoodGradient(moodValue), WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                            {getMoodFeedback(moodValue).text} 
                                        </div>
                                    </motion.div>

                                    <motion.button
                                        variants={buttonVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                        onClick={handleSubmit}
                                        className=" px-4 py-4 bg-white/10 ml-20 backdrop-blur-sm text-white font-medium rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 relative overflow-hidden group"
                                        style={{ 
                                            background: `linear-gradient(135deg, ${getMoodGradient(moodValue).replace('linear-gradient(90deg, ', '').replace(')', '')}, rgba(255,255,255,0.1))`
                                        }}
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {type === 'before' ? t('moodOverlay.start') : t('moodOverlay.finish')}
                                        </span>
                                        <motion.div
                                            className="absolute inset-0 bg-white/5"
                                            initial={{ x: '-100%' }}
                                            whileHover={{ x: '100%' }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                        />
                                    </motion.button>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ scale: 0.5 }}
                                    animate={{ 
                                        scale: 1,
                                        transition: { type: 'spring', damping: 10 }
                                    }}
                                    className="w-20 h-20 rounded-full bg-gradient-to-br from-[#41A67E] to-[#66D0BC] flex items-center justify-center mx-auto my-8 shadow-[0_0_30px_rgba(65,166,126,0.4)]"
                                >
                                    <Check className="w-10 h-10 text-white" strokeWidth={2.5} />
                                </motion.div>
                            )}
                            
                            {isSubmitting && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center text-white/60 text-sm flex items-center justify-center gap-2"
                                >
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t('moodOverlay.saving')}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MoodOverlay;