import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Shuffle } from 'lucide-react';
import DecayCard from '../reactbits/DecayCard';
import PlaylistDock from './PlaylistDock';

// DỮ LIỆU GIẢ LẬP (SAU NÀY SẼ LẤY TỪ API BACKEND DỰA TRÊN SỞ THÍCH)
export const ISO_STEPS = [
  {
    id: 1,
    title: "",
    desc: "Hãy chọn bài hát phản ánh đúng nhất nỗi lòng hiện tại của bạn.",
    color: "from-[#77B1D4] to-[#90D5FF]",
    cards: [
      { id: '1a', title: "Midnight Rain", artist: "Taylor Swift", image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=800&auto=format&fit=crop",duration: "2:54",previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
      { id: '1b', title: "Glimpse of Us", artist: "Joji", image: "https://images.unsplash.com/photo-1516528387618-afa90b13e000?q=80&w=800&auto=format&fit=crop",duration: "2:54",previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
      { id: '1c', title: "Someone Like You", artist: "Adele", image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=800&auto=format&fit=crop",duration: "2:54",previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" }
    ]
  },
  {
    id: 2,
    title: "",
    desc: "Một chút nhịp điệu để xoa dịu và chuyển hướng tâm trạng.",
    color: "from-[#73abf5] to-[#6ba6ff]",
    cards: [
      { id: '2a', title: "Save Your Tears", artist: "The Weeknd", image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800&auto=format&fit=crop",duration: "2:54",previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
      { id: '2b', title: "Cold Heart", artist: "Elton John", image: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?q=80&w=800&auto=format&fit=crop",duration: "2:54",previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
      { id: '2c', title: "Stay", artist: "Justin Bieber", image: "https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=800&auto=format&fit=crop",duration: "2:54",previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" }
    ]
  },
  {
    id: 3,
    title: "",
    desc: "Tìm lại sự bình yên và ánh sáng nhẹ nhàng.",
    color: "from-[#FFB76C] to-[#FFF57E]",
    cards: [
      { id: '3a', title: "Flowers", artist: "Miley Cyrus", image: "https://images.unsplash.com/photo-1490750967868-58cb75065ed4?q=80&w=800&auto=format&fit=crop",duration: "2:54",previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
      { id: '3b', title: "As It Was", artist: "Harry Styles", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",duration: "2:54",previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
      { id: '3c', title: "Cruel Summer", artist: "Taylor Swift", image: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=800&auto=format&fit=crop",duration: "2:54",previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" }
    ]
  },
  {
    id: 4,
    title: "",
    desc: "Chào đón nguồn năng lượng tích cực mới.",
    color: "from-[#FFA4A4] to-[#FFBDBD]",
    cards: [
      { id: '4a', title: "Happy", artist: "Pharrell Williams", image: "https://images.unsplash.com/photo-1459749411177-287ce35e8b4f?q=80&w=800&auto=format&fit=crop",duration: "2:54",previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
      { id: '4b', title: "Can't Stop", artist: "Justin Timberlake", image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=800&auto=format&fit=crop",duration: "2:54",previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
      { id: '4c', title: "Uptown Funk", artist: "Bruno Mars", image: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=800&auto=format&fit=crop",duration: "2:54",previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" }
    ]
  }
];

const CardSelectionView = ({ 
  currentStep, 
  handleSelectCard, 
  handleBack, 
  handleShuffle, 
  displayedCards,
  stepData
}) => {
  
  // Component này giờ chỉ lo hiển thị UI bên trong cái hộp tím
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