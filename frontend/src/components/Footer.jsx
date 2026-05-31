import React from 'react';
import { Facebook, Mail, Phone, MapPin, Github } from 'lucide-react'; 
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const Footer = () => {
  const { pathname } = useLocation();
  
  const hideTextRoutes =['/player', '/onboarding', '/profile'];
  const hideText = hideTextRoutes.some(route => pathname.startsWith(route));

  const lowerMoonRoutes = ['/player', '/profile'];
  const isMoonLowered = lowerMoonRoutes.some(route => pathname.startsWith(route));

  return (
    <motion.footer 
      initial={{ opacity: 0, y: 200, scale: 1  }} 
      animate={{ opacity: 1, y: 0, scale: 1 }} 
      transition={{ duration: 2.6, ease: "easeOut" }}
      className="w-full relative z-20 pt-30 pb-10 bg-gradient-to-b from-transparent via-black/10 to-black text-gray-300 "
    >
      
      <motion.div 
        initial={{ x: "-50%", y: 0 }}
        animate={{ 
            x: "-50%", 
            y: isMoonLowered ? 16 : 0 
        }}
        transition={{ 
            type: "spring", stiffness: 100, damping: 20 
        }}
        //  -translate-x-1/2 to  x: "-50%"
        className="absolute left-1/2 -top-24 md:-top-44 pointer-events-none drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]"
      >
        <img src="/moon2.png" alt="Moon" className="w-48 md:w-190 opacity-90" aria-hidden="true" />
      </motion.div>

      
      <div className={`container mx-auto px-12 relative z-10 transition-opacity duration-300 ${
        hideText ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          
          <div className="space-y-4">
            <h3 className="text-2xl font-out-text font-bold text-white tracking-wider">MindMelody</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              Hệ thống gợi ý âm nhạc cá nhân hóa hỗ trợ điều chỉnh cảm xúc dựa trên trạng thái tâm lý và Nguyên lý ISO.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-out-text font-semibold text-white">Khám phá</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">Về MindMelody</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cơ sở y khoa (ISO & DASS-21)</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Hướng dẫn sử dụng</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Quyền riêng tư & Bảo mật dữ liệu</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-out-text font-semibold text-white">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-center md:justify-start gap-3">
                <MapPin className="w-4 h-4 text-white " />
                <span>flower for algernon OwO, i'll update this if needed or when I have the correct information</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3">
                <Mail className="w-4 h-4 text-white" />
                <span>algernon</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3">
                <Github className="w-4 h-4 text-white" />
                <span>algernon</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3">
                <Phone className="w-4 h-4 text-white" />
                <span>algernon</span>
              </li>
            </ul>
          </div>
          
        </div>
      </div>
      
      <div className="mt-8 pt-8 border-t border-white/10 text-center text-xs opacity-50">
          © {new Date().getFullYear()} MindMelody Project. All rights reserved.
      </div>
      
    </motion.footer>
  );
};

export default Footer;