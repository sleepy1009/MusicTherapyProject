import React from 'react';
import { motion } from 'framer-motion';
import Mascot from '../Mascot';

const TypingIndicator = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="flex w-full mb-6 justify-start"
    >
      <div className="w-10 h-10 mr-3 flex-shrink-0">
         <div className="w-full h-full rounded-full bg-indigo-500/20 border border-white/10 overflow-hidden p-1">
             <Mascot status="listening" className="w-full h-full" />
         </div>
      </div>

      <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
        {[0, 1, 2].map((dot) => (
          <motion.div
            key={dot}
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: dot * 0.2, // Chấm sau nhún trễ hơn chấm trước
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default TypingIndicator;