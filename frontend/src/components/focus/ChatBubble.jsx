import React from 'react';
import { motion } from 'framer-motion';
import Mascot from '../Mascot'; 

const ChatBubble = ({ message, isBot }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex w-full mb-6 ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      {/* AVATAR BOT */}
      {isBot && (
        <div className="w-10 h-10 mr-3 flex-shrink-0">
           <div className="w-full h-full rounded-full bg-indigo-500/20 border border-white/10 overflow-hidden p-1">
             <Mascot status="idle" className="w-full h-full" />
           </div>
        </div>
      )}

      {/* BONG BÓNG CHAT */}
      <div 
        className={`max-w-[80%] md:max-w-[70%] px-5 py-3 rounded-2xl text-base md:text-lg leading-relaxed shadow-md ${
          isBot 
            ? 'bg-white/10 border border-white/10 text-main_text rounded-tl-none' 
            : 'bg-primary/90 text-main_text rounded-tr-none' 
        }`}
      >
        {message}
      </div>

    </motion.div>
  );
};

export default ChatBubble;