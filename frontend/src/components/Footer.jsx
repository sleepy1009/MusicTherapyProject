import React from 'react';
import { Facebook, Mail, Phone, MapPin, Github } from 'lucide-react'; 
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <motion.footer 
      initial={{ opacity: 0, y: 200, scale: 1  }} 
      animate={{ opacity: 1, y: 0, scale: 1 }} 
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full relative z-20  pt-30 pb-10 bg-gradient-to-b from-transparent via-black/10 to-black text-gray-300 "
    >
      
      <div className="absolute left-1/2 -translate-x-1/2 -top-24 md:-top-44 pointer-events-none drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]">
        <img src="/moon2.png" alt="Moon" className="w-48 md:w-190 opacity-90" aria-hidden="true" />
      </div>

      <div className="container mx-auto px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          
          <div className="space-y-4">
            <h3 className="text-2xl font-out-text font-bold text-white tracking-wider">MindMelody</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              Dự án nghiên cứu khoa học hỗ trợ chăm sóc sức khỏe tâm thần sinh viên thông qua liệu pháp âm nhạc và AI.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-out-text font-semibold text-white">Khám phá</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">Về chúng tôi</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Nguyên tắc Iso</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Sàng lọc DASS-21</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Chính sách bảo mật</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-out-text font-semibold text-white">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-center md:justify-start gap-3">
                <MapPin className="w-4 h-4 text-white " />
                <span>Đại học ABC, </span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3">
                <Mail className="w-4 h-4 text-white" />
                <span>contact@mindmelody.vn</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3">
                <Github className="w-4 h-4 text-white" />
                <span>github.com/project</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3">
                <Phone className="w-4 h-4 text-white" />
                <span>Number: 0123456789</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center text-xs opacity-50">
          © 2025 MindMelody Project. All rights reserved.
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;