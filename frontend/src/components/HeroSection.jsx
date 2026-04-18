import React, { useState, useEffect, useRef } from 'react';
import { PlayCircle, ArrowRightSquare , Sparkles, X, Brain, Music, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Mascot from './Mascot';
import TargetCursor from './reactbits/TargetCursor';
import CircularText from './reactbits/CircularText';
import ScrollStack, { ScrollStackItem } from './reactbits/ScrollStack'; 
import HeroEasterBlocks from './reactbits/HeroEasterBlocks';


const HeroSection = ({ onStart }) => {
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
              Đừng để <span className="text-main_text/60 font-light ">âu lo</span> <br />
              <span className="pl-24 inline-block ">
              lấn át <span className="text-transparent bg-clip-text bg-gradient-to-r  from-secondary/80 to-secondary drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">giai điệu sống</span>
              </span>
            </h1>

            <div className="flex flex-col gap-3 py-2">
                <div className="flex items-center gap-3 text-main_text/80"> <span className="text-sm ">Sàng lọc tâm lý với câu hỏi <b>DASS-21</b></span></div>
                <div className="flex items-center gap-3 text-main_text/80"> <span className="text-sm">áp dụng quy tắc <b>ISO</b> giúp điều hòa cảm xúc của bạn</span> </div>
                <div className="flex items-center gap-3 text-main_text/80"> <span className="text-sm">Nghe nhạc <b>thư giãn</b>, viết nhật ký <b>riêng tư</b> và tâm sự với <b>Chatbot</b></span></div>
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
              <motion.span className="relative z-10 font-out-text tracking-wider">Bắt đầu</motion.span>
            </motion.button>

              <button 
                onClick={() => setShowDemo(true)}
                className="cursor-target px-4 py-3 bg-transparent border border-white/20 hover:bg-white/5 rounded-2xl text-white font-medium text-lg transition-all flex items-center gap-3 group"
              >
                <PlayCircle className="w-6 h-6 text-main_text/80 group-hover:text-white transition-colors" />
                <span className="font-out-text text-main_text/80 group-hover:text-white transition-colors">Tìm hiểu</span>
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
                    <h2 className="text-3xl font-bold text-white font-out-text">MindMelody hoạt động như nào?</h2>
                    <p className="text-gray-400 mt-2">Cuộn xuống để xem từng bước</p>
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
                                <h3 className="text-3xl md:text-2xl font-bold text-main_text mb-4">1. Sàng lọc tâm lý</h3>
                                <div className="w-[50%] flex flex-col gap-3">
                                    <p className="text-base text-gray-300 leading-relaxed">
                                        Bạn sẽ trò chuyện với AI Mascot qua một bài test DASS-21 ngắn gọn. Kết quả này giúp đo lường chính xác mức độ Căng thẳng, Lo âu và Trầm cảm của bạn ở thời điểm hiện tại.
                                    </p>
                                    <p className="text-sm text-secondary/80 leading-relaxed font-medium">
                                        * Bạn cần đăng nhập với thông tin cơ bản để hệ thống có thể gợi ý chuẩn xác nhất.
                                    </p>
                                </div>
                            </div>

                            <div className="absolute top-5 left-45 w-[100%] h-[100%] rounded-[32px] border-1 border-white/10 overflow-hidden z-20 group">
                                <img src="/steps/step1.png" alt="Step 1" className="w-full h-full object-cover" />
                            </div>

                        </ScrollStackItem>

                        <ScrollStackItem itemClassName="relative max-w-4xl mx-auto !h-[450px] !p-0 bg-transparent border-none shadow-none flex items-center justify-center overflow-visible">
                            
                            <div className="absolute bottom-20 -left-50 w-[75%] h-[85%] bg-main_background/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-10 z-10 shadow-lg flex flex-col">
                                <h3 className="text-3xl md:text-2xl font-bold text-main_text mb-4">2. Tạo danh sách nhạc</h3>
                                <div className="w-[50%] flex flex-col gap-3">
                                    <p className="text-base text-gray-300 leading-relaxed">
                                        Hệ thống áp dụng nguyên lý ISO, bắt đầu bằng những bài hát có nhịp điệu đồng điệu với nỗi buồn của bạn, sau đó từ từ kéo nhịp điệu và năng lượng lên cao dần để cải thiện tâm trạng.
                                    </p>
                                </div>
                            </div>

                            <div className="absolute top-5 left-45 w-[100%] h-[100%] rounded-[32px] border-1 border-white/10 overflow-hidden z-20 group">
                                <img src="/steps/step2.png" alt="Step 2" className="w-full h-full object-cover" />
                            </div>

                        </ScrollStackItem>

                        <ScrollStackItem itemClassName="relative max-w-4xl mx-auto !h-[450px] !p-0 bg-transparent border-none shadow-none flex items-center justify-center overflow-visible">
                            
                            <div className="absolute bottom-20 -left-50 w-[75%] h-[85%] bg-main_background/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-10 z-10 shadow-lg flex flex-col">
                                <h3 className="text-3xl md:text-2xl font-bold text-main_text mb-4">3. Lắng nghe & Giải tỏa</h3>
                                <div className="w-[50%] flex flex-col gap-3">
                                    <p className="text-base text-gray-300 leading-relaxed">
                                        Đắm chìm trong không gian âm nhạc tùy chỉnh. Bạn có thể vừa nghe nhạc, vừa viết nhật ký cảm xúc, kết hợp trò chuyện với Chatbot AI được thiết kế riêng như một người bạn đồng hành.
                                    </p>
                                </div>
                            </div>

                            <div className="absolute top-5 left-45 w-[100%] h-[100%] rounded-[32px] border-1 border-white/10 overflow-hidden z-20 group">
                                <img src="/steps/step3.png" alt="Step 3" className="w-full h-full object-cover" />
                            </div>

                        </ScrollStackItem>

                        <ScrollStackItem itemClassName="relative max-w-4xl mx-auto !h-[450px] !p-0 bg-transparent border-none shadow-none flex items-center justify-center overflow-visible">
                            
                            <div className="absolute bottom-20 -left-50 w-[75%] h-[85%] bg-main_background/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-10 z-10 shadow-lg flex flex-col">
                                <h3 className="text-3xl md:text-2xl font-bold text-main_text mb-4">4. Theo dõi tiến trình</h3>
                                <div className="w-[50%] flex flex-col gap-3">
                                    <p className="text-base text-gray-300 leading-relaxed">
                                        Truy cập trang cá nhân của bạn để theo dõi hành trình chữa lành. Từ các biểu đồ biến thiên cảm xúc DASS-21 cho tới phân tích thể loại nhạc bạn đã nghe.
                                    </p>
                                </div>
                            </div>

                            <div className="absolute top-5 left-45 w-[100%] h-[100%] rounded-[32px] border-1 border-white/10 overflow-hidden z-20 group">
                                <img src="/steps/step4.png" alt="Step 4" className="w-full h-full object-cover" />
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