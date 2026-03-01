import React, { useState, useRef  } from 'react';
import { PlayCircle, Activity, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Mascot from './Mascot';


const Particle = ({ x, y }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1, x , y }}
    exit={{ opacity: 0, scale: 0.5 }}
    transition={{ duration: 0.5 }}
    className="absolute w-0.5 h-0.5 bg-[#fff]/90 rounded-full shadow-lg"
  />
);


const HeroSection = ({ onStart }) => {
  const [isHovering, setIsHovering] = useState(false);
  const btnRef = useRef(null);

  return (
    <section className="relative z-10 w-full min-h-screen flex items-center justify-center px-4 md:px-6 py-30">
      
      {/* (GLASS CONTAINER)
      className="relative w-full max-w-7xl bg-white/40000 border border-white/20 rounded-3xl p-8 md:p-12 overflow-hidden shadow-[0_0_50px_rgba(79,70,229,0.1)]"
      */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-7xl max-h-[500px] border border-white/20 rounded-3xl  p-4 md:p-12  overflow-hidden "
      >
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none rounded-3xl">
           <div className="absolute -top-[50%] -left-[20%] w-[70%] h-[70%] bg-gray-500/20 rounded-full blur-[100px]"></div>
           <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] bg-gray-500/10 rounded-full blur-[100px]"></div>
        </div>
      

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT: TEXT & BUTTONS */}
          <div className="text-left space-y-8 ">
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2  px-4 py-2 rounded-full bg-white/5 border border-white/10 text-main_text text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              <span>Welcome to my universe</span>
            </motion.div>

            <h1 className="text-4xl font-out-text md:text-5xl font-bold leading-tight text-main_text">
              Đừng để âu lo <br />
              <span className="text-transparent font-out-text bg-clip-text bg-gradient-to-r from-secondary to-main_text ">
                Lấn át giai điệu sống
              </span>
            </h1>

            <p className="text-lg text-gray-300 leading-relaxed max-w-xl -mt-5 ">
              Một không gian an toàn để bạn lắng nghe chính mình. Hệ thống sử dụng thang đo <b>DASS-21</b> và <b>Nguyên tắc Iso</b> để tìm ra liều thuốc tinh thần dành riêng cho bạn.
            </p>

            <div className="flex flex-wrap gap-4 relative">
              
              <motion.button 
                ref={btnRef} 
                layoutId="focus-container" 
                onClick={onStart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setIsHovering(true)}
                onHoverEnd={() => setIsHovering(false)}
                className="group relative px-6 py-4 bg-primary/90 hover:bg-primary rounded-2xl text-white font-bold text-lg transition-all shadow-lg hover:shadow-white/30 flex items-center gap-3 overflow-hidden cursor-pointer"
          >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 "></div>
                
                <motion.div layoutId="btn-icon" className="relative z-10">
                    <Activity className="w-5 h-5" />
                </motion.div>
                <motion.span layoutId="btn-text" className="relative z-10 font-out-text ">Bắt đầu! </motion.span>
                  
              </motion.button>
              {/* --------------------------------------- */}
              <AnimatePresence>
                  {isHovering && Array.from({ length: 12 }).map((_, i) => { 
                    const rect = btnRef.current ? btnRef.current.getBoundingClientRect() : { width: 150, height: 50 }; 
                    const x = Math.random() * rect.width - rect.width/2 + 68; 
                    const y = Math.random() * rect.height - rect.height/2 + 32; 
                    return <Particle key={i} x={x} y={y} />; 
                  })}
              </AnimatePresence>
              <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-medium text-lg transition-all backdrop-blur-sm flex items-center gap-3 cursor-pointer">
                <PlayCircle className="w-5 h-5 " />
                <span className="font-out-text">Xem Demo</span>
              </button>
            </div>
          </div>

          {/* RIGHT: MASCOT */}
          {/*<div className="relative h-[400px] flex items-center justify-center border-2 border-dashed border-white/10 rounded-2xl bg-white/5"> */}
          <div className="relative h-[400px] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="w-40 h-40 relative z-20">
              <Mascot status="idle" className="w-full h-full -translate-x-2 -translate-y-6" />
            </div>
            </div>
            
            <div className="absolute w-64 h-64 border border-white/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
            <div className="absolute w-48 h-48 border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
          </div>

        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;

