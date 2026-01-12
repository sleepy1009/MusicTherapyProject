import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TextType from '../reactbits/TextType';
import GooeyNav from '../reactbits/GooeyNav';

// introduction and start button
const IntroView = ({ onComplete }) => {
  const [showButton, setShowButton] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      {/* Animation TextType */}
      <div className="text-2xl md:text-3xl font-light text-gray-200 leading-relaxed min-h-[120px]">
        <TextType
          text={[
            "Chào bạn, mình là AI trợ lý tâm lý.",
            "Mình sẽ hỏi bạn 21 câu hỏi ngắn.",
            "Hãy trả lời thật lòng nhé..."
          ]}
          typingSpeed={15}
          deletingSpeed={10}
          pauseDuration={2000}
          loop={false} // run one time
          cursorCharacter="_"
          onSentenceComplete={(text, index) => {
            // when run to last text(index = 2), show button
            if (index === 2) setShowButton(true);
          }}
        />
      </div>

      {showButton && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onComplete}
          className="-mt-10 px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        >
          Bắt đầu trả lời
        </motion.button>
      )}
    </div>
  );
};

export default IntroView;