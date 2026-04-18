import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Shuffle } from 'lucide-react';
import DecayCard from '../reactbits/DecayCard';
import PlaylistDock from './PlaylistDock';


const CardSelectionView = ({ currentStep, handleSelectCard, handleBack, handleShuffle, displayedCards, stepData }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background trong hộp */}
      <motion.div 
        key={currentStep}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1 }}
        className={`absolute inset-0 bg-gradient-to-br ${stepData.color || 'from-gray-900'} blur-[100px] z-0 pointer-events-none `}
      />

      {/* Header Info */}
      <div className="relative z-10 text-center mb-6 mt-4 px-4 w-full max-w-3xl ">
        <motion.div
            key={`text-${currentStep}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            
            
            <p className="text-gray-300 text-lg font-light">
            {stepData.desc}
            </p>
        </motion.div>
      </div>

      {/* Action Bar */}
      <div className="relative z-20 flex items-center justify-between w-full max-w-4xl px-8 mb-14">
          <div className="w-24">
              {currentStep > 0 && (
                  <button onClick={handleBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
                      <ArrowLeft className="w-4 h-4" /> Quay lại
                  </button>
              )}
          </div>

          <button 
              onClick={handleShuffle}
              className="flex items-center gap-2 text-[#8CE4FF]/80 hover:text-[#8CE4FF] bg-white/5 hover:bg-white/10 px-4 py-2 mb-4 rounded-full border border-white/10 transition-all text-xs uppercase tracking-wider font-bold"
          >
              <Shuffle className="w-3 h-3" /> Đổi bài khác
          </button>
          
          <div className="w-24"></div> 
      </div>

      {/* Card Grid */}
      <div className="relative z-10 w-full max-w-7xl flex flex-wrap justify-center gap-8 px-4 pb-12">
          <AnimatePresence mode='wait'>
              <motion.div
                  key={currentStep + JSON.stringify(displayedCards)}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-wrap justify-center gap-6 md:gap-20"
              >
                  {displayedCards.map((card, index) => (
                      <motion.div
                          key={card.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                      >
                          <DecayCard 
                              width={210} 
                              height={280} 
                              {...card}
                              onClick={() => handleSelectCard(card)}
                          />
                      </motion.div>
                  ))}
              </motion.div>
          </AnimatePresence>
      </div>

    </div>
  );
};

export default CardSelectionView;