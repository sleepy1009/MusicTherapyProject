import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, RefreshCw, PlayCircle, Loader2 } from 'lucide-react';

const PlaylistDock = ({ selectedCards, isFinished, onRestart, onStartListening }) => {
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = () => {
      setIsStarting(true);
      setTimeout(() => {
          onStartListening();
      }, 800); 
  };


  return (
    <motion.div 
      layout
      className={`
        bg-white/5 border border-white/20 rounded-3xl p-2 flex flex-col
        transition-all duration-700 ease-in-out
        ${isFinished 
            ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md h-auto z-50 shadow-[0_0_60px_-4px_rgba(158,211,220,0.4)]' 
            : 'absolute top-44 left-6 md:left-3 w-56 h-auto min-h-[250px] z-40'
        }
      `}
    >
      <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Music className="w-5 h-5 text-[#9ED3DC]" />
            {isFinished ? "Playlist Của Bạn" : "Đang Chọn..."}
          </h3>
          <span className="text-xs font-mono text-gray-400 bg-black/20 px-2 py-1 rounded">
            {selectedCards.length} / 7
          </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar max-h-[400px]">
        <AnimatePresence>
            {selectedCards.length === 0 && !isFinished && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="h-32 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-gray-500 text-xs text-center px-4"
                >
                    Chọn thẻ bài để thêm vào đây
                </motion.div>
            )}

            {selectedCards.map((card, index) => (
                <motion.div
                    key={card.id} 
                    layoutId={`card-${card.id}`} 
                    initial={{ opacity: 0, x: -20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    className="flex items-center gap-3 bg-black/20 p-2 rounded-xl border border-white/5 group hover:bg-white/10 transition-colors"
                >
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative">
                        <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-bold text-xs">#{index + 1}</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <h4 className="text-white text-sm font-medium truncate">{card.title}</h4>
                        <p className="text-gray-400 text-xs truncate">{card.artist}</p>
                    </div>

                    <div className="text-gray-500 text-xs pr-2">{card.duration}</div>
                </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {isFinished && (
         <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex gap-3"
         >
             <button 
                onClick={onRestart}
                disabled={isStarting}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
             >
                <RefreshCw className="w-4 h-4" /> Tạo lại
             </button>
             
             <button 
                onClick={handleStart}
                disabled={isStarting}
                className="flex-[2] py-3 bg-[#9ED3DC]/80 hover:bg-[#9ED3DC]/90 text-white rounded-xl text-sm font-bold shadow-sm shadow-[#9ED3DC]/30 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
             >
                {isStarting ? (
                    <><Loader2 className="w-5 h-5 animate-spin text-black" /> <span className="text-black">Đang chuẩn bị...</span></>
                ) : (
                    <><PlayCircle className="w-5 h-5 text-black" /> <span className="text-black">Bắt đầu nghe</span></>
                )}
             </button>
         </motion.div>
      )}
    </motion.div>
  );
};

export default PlaylistDock;