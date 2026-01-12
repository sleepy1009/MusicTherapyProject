import React from 'react';
import { motion } from 'framer-motion';

const MASCOT_STATES = {
  idle: "/mascot/d.gif", 
  listening: "/mascot/d.gif", 
  thinking: "/mascot/d.gif", 
  happy: "/mascot/d.gif"
};

const Mascot = ({ status = 'idle', className = '' }) => {
  return (
    <motion.div 
      layoutId="mascot-container" 
      className={`relative z-50 ${className}`} 
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.img
        key={status} 
        src={MASCOT_STATES[status] || MASCOT_STATES.idle}
        alt="Mascot"
        className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default Mascot;