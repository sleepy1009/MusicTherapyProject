import React, { useState, useEffect, useRef } from 'react';
import { PlayCircle, ArrowRightSquare , Sparkles, X, Brain, Music, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Mascot from './Mascot';
import TargetCursor from './reactbits/TargetCursor';
import CircularText from './reactbits/CircularText';
import ScrollStack, { ScrollStackItem } from './reactbits/ScrollStack'; 
import HeroEasterBlocks from './reactbits/HeroEasterBlocks';
import { useTranslation, Trans } from 'react-i18next';


const HeroSection = ({ onStart }) => {
  const { t, i18n } = useTranslation();

  // add steps image en ver
  const stepImg = (n) => (i18n.language === 'en' ? `/steps/step${n}-en.png` : `/steps/step${n}.png`);
  const stepImgFallback = (n) => (e) => { e.currentTarget.onerror = null; e.currentTarget.src = `/steps/step${n}.png`; };

  const [isHovering, setIsHovering] = useState(false);
  const [showDemo, setShowDemo] = useState(false); 
  const btnRef = useRef(null);

  const [mascotStatus, setMascotStatus] = useState("idle2");

    useEffect(() => {
    const interval = setInterval(() => {
        setMascotStatus(prev => prev === "idle2" ? "idle2" : "idle2"); //run
    }, 8000); 

    return () => clearInterval(interval);
    }, []);



  return (
    <section className="relative z-10 w-full min-h-screen flex items-center justify-center px-4 md:px-6 py-30">
      
      <TargetCursor targetSelector=".cursor-target" spinDuration={0} hoverDuration={0.2} hideDefaultCursor={true} />
    <HeroEasterBlocks />
      <motion.div 
        initial={{ opacity: 0, y: 20}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-7xl max-h-[500px] border border-white/20 rounded-3xl p-4 md:p-12 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none rounded-3xl">
           <div className="absolute -top-[50%] -left-[20%] w-[70%] h-[70%] bg-gray-500/20 rounded-full blur-[100px]"></div>
           <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] bg-gray-500/10 rounded-full blur-[100px]"></div>
        </div>
      
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">
          
          <div className="text-left space-y-6">
            <h1 className="text-5xl md:text-5xl font-black leading-[1.5] tracking-tight text-main_text font-out-text">
              {t('hero.line1a')} <span className="text-main_text/60 font-light ">{t('hero.line1b')}</span> <br />
              <span className="pl-24 inline-block ">
              {t('hero.line2a')} <span className="text-transparent bg-clip-text bg-gradient-to-r  from-secondary/80 to-secondary drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">{t('hero.line2b')}</span>
              </span>
            </h1>

            <div className="flex flex-col gap-3 py-2">
                <div className="flex items-center gap-3 text-main_text/80"> <span className="text-sm "><Trans i18nKey="hero.feature1" components={{ b: <b /> }} /></span></div>
                <div className="flex items-center gap-3 text-main_text/80"> <span className="text-sm"><Trans i18nKey="hero.feature2" components={{ b: <b /> }} /></span> </div>
                <div className="flex items-center gap-3 text-main_text/80"> <span className="text-sm"><Trans i18nKey="hero.feature3" components={{ b: <b /> }} /></span></div>
            </div>

            <div className="flex flex-wrap gap-5 relative pt-4">
              <motion.button 
              ref={btnRef} onClick={onStart}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="cursor-target group relative px-4 py-3 bg-main_text text-black font-extrabold text-lg transition-all flex items-center gap-3 overflow-hidden border-4 border-black/80 
                        [clip-path:polygon(0_0,100%_0,95%_75%,75%_100%,0_100%)]"
            >
              <motion.div className="relative z-10">
                <ArrowRightSquare className="w-6 h-6" />
              </motion.div>
              <motion.span className="relative z-10 font-out-text tracking-wider">{t('hero.start')}</motion.span>
            </motion.button>

              <button 
                onClick={() => setShowDemo(true)}
                className="cursor-target px-4 py-3 bg-transparent border border-white/20 hover:bg-white/5 rounded-2xl text-white font-medium text-lg transition-all flex items-center gap-3 group"
              >
                <PlayCircle className="w-6 h-6 text-main_text/80 group-hover:text-white transition-colors" />
                <span className="font-out-text text-main_text/80 group-hover:text-white transition-colors">{t('hero.learnMore')}</span>
              </button>
            </div>
          </div>

          <div className="relative h-[400px] flex items-center justify-center">
            <div
                className="text-center text-gray-500"
                onMouseEnter={() => setMascotStatus("run")}
                onMouseLeave={() => setMascotStatus("idle2")}
                style={{ zIndex: 20 }}
            >
                <div className="w-36 h-36 relative z-20 pointer-events-auto">
                <Mascot status={mascotStatus} className="w-full h-full drop-shadow-xl " />
                </div>
            </div>
            <div
                className="absolute z-30 pointer-events-auto"
                onMouseEnter={() => setMascotStatus("run")}
                onMouseLeave={() => setMascotStatus("idle2")}
            >
                <CircularText text="MindMelody ─ Music ─ Therapy ─ " onHover="speedUp" spinDuration={36} className="text-main_text scale-[1] md:scale-[1.4]" />
            </div>
            <div className="absolute w-[270px] h-[270px] border border-white/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
            <div className="absolute w-[200px] h-[200px] border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
            </div>

            {/*
            <div className="relative h-[400px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                <div className="w-36 h-36 relative z-20">
                    
                    <Mascot status={mascotStatus} className="w-full h-full drop-shadow-xl " />
                </div>
                </div>
                <div className="absolute z-30 pointer-events-auto">
                <CircularText text="MindMelody ─ Music ─ Therapy ─ " onHover="speedUp" spinDuration={36} className="text-main_text scale-[1] md:scale-[1.4]" />
                </div>                         
                <div className="absolute w-[270px] h-[270px] border border-white/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
                <div className="absolute w-[200px] h-[200px] border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
            </div>
            */}
             {/*⭒*/} {/*-translate-x-2 -translate-y-6*/}
            

        </div>
      </motion.div>

      {/* ================= MODAL DEMO SCROLL STACK ================= */}
      <AnimatePresence>
        {showDemo && (
            <motion.div 
                initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#0a0a0a] to-transparent z-50 pointer-events-none flex flex-col items-center justify-start pt-24">
                    <h2 className="text-3xl font-bold text-white font-out-text">{t('hero.demoTitle')}</h2>
                    <p className="text-gray-400 mt-2">{t('hero.demoSubtitle')}</p>
                </div>

                <div className="absolute top-6 right-8 z-[110] pt-16">
                    <button onClick={() => setShowDemo(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors shadow-lg">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 w-full h-full pt-10">
                    <ScrollStack useWindowScroll={false} itemDistance={200} blurAmount={4} className="h-screen w-full">
                        
                        <ScrollStackItem itemClassName="relative max-w-4xl mx-auto !h-[450px] !p-0 bg-transparent border-none shadow-none flex items-center justify-center overflow-visible">
                            
                            <div className="absolute bottom-20 -left-50 w-[75%] h-[85%] bg-main_background/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-10 z-10 shadow-lg flex flex-col">
                                <h3 className="text-3xl md:text-2xl font-bold text-main_text mb-4">{t('hero.steps.1.title')}</h3>
                                <div className="w-[50%] flex flex-col gap-3">
                                    <p className="text-base text-gray-300 leading-relaxed">
                                        {t('hero.steps.1.body')}
                                    </p>
                                    <p className="text-sm text-secondary/80 leading-relaxed font-medium">
                                        {t('hero.steps.1.note')}
                                    </p>
                                </div>
                            </div>

                            <div className="absolute top-5 left-45 w-[100%] h-[100%] rounded-[32px] border-1 border-white/10 overflow-hidden z-20 group">
                                <img src={stepImg(1)} onError={stepImgFallback(1)} alt="Step 1" className="w-full h-full object-cover" />
                            </div>

                        </ScrollStackItem>

                        <ScrollStackItem itemClassName="relative max-w-4xl mx-auto !h-[450px] !p-0 bg-transparent border-none shadow-none flex items-center justify-center overflow-visible">
                            
                            <div className="absolute bottom-20 -left-50 w-[75%] h-[85%] bg-main_background/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-10 z-10 shadow-lg flex flex-col">
                                <h3 className="text-3xl md:text-2xl font-bold text-main_text mb-4">{t('hero.steps.2.title')}</h3>
                                <div className="w-[50%] flex flex-col gap-3">
                                    <p className="text-base text-gray-300 leading-relaxed">
                                        {t('hero.steps.2.body')}
                                    </p>
                                </div>
                            </div>

                            <div className="absolute top-5 left-45 w-[100%] h-[100%] rounded-[32px] border-1 border-white/10 overflow-hidden z-20 group">
                                <img src={stepImg(2)} onError={stepImgFallback(2)} alt="Step 2" className="w-full h-full object-cover" />
                            </div>

                        </ScrollStackItem>

                        <ScrollStackItem itemClassName="relative max-w-4xl mx-auto !h-[450px] !p-0 bg-transparent border-none shadow-none flex items-center justify-center overflow-visible">
                            
                            <div className="absolute bottom-20 -left-50 w-[75%] h-[85%] bg-main_background/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-10 z-10 shadow-lg flex flex-col">
                                <h3 className="text-3xl md:text-2xl font-bold text-main_text mb-4">{t('hero.steps.3.title')}</h3>
                                <div className="w-[50%] flex flex-col gap-3">
                                    <p className="text-base text-gray-300 leading-relaxed">
                                        {t('hero.steps.3.body')}
                                    </p>
                                </div>
                            </div>

                            <div className="absolute top-5 left-45 w-[100%] h-[100%] rounded-[32px] border-1 border-white/10 overflow-hidden z-20 group">
                                <img src={stepImg(3)} onError={stepImgFallback(3)} alt="Step 3" className="w-full h-full object-cover" />
                            </div>

                        </ScrollStackItem>

                        <ScrollStackItem itemClassName="relative max-w-4xl mx-auto !h-[450px] !p-0 bg-transparent border-none shadow-none flex items-center justify-center overflow-visible">
                            
                            <div className="absolute bottom-20 -left-50 w-[75%] h-[85%] bg-main_background/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-10 z-10 shadow-lg flex flex-col">
                                <h3 className="text-3xl md:text-2xl font-bold text-main_text mb-4">{t('hero.steps.4.title')}</h3>
                                <div className="w-[50%] flex flex-col gap-3">
                                    <p className="text-base text-gray-300 leading-relaxed">
                                        {t('hero.steps.4.body')}
                                    </p>
                                </div>
                            </div>

                            <div className="absolute top-5 left-45 w-[100%] h-[100%] rounded-[32px] border-1 border-white/10 overflow-hidden z-20 group">
                                <img src={stepImg(4)} onError={stepImgFallback(4)} alt="Step 4" className="w-full h-full object-cover" />
                            </div>

                        </ScrollStackItem>
                    </ScrollStack>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default HeroSection;