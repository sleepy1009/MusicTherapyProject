import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import TextType from '../reactbits/TextType';
import GooeyNav from '../reactbits/GooeyNav';

// introduction and start button
const IntroView = ({ onComplete }) => {
  const { t, i18n } = useTranslation();
  const [showButton, setShowButton] = useState(false);

  // intro.lines is an array in the locale files
  const lines = t('intro.lines', { returnObjects: true });
  const lastIndex = Array.isArray(lines) ? lines.length - 1 : 0;

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center bg-transparent">
      {/* Animation TextType (key restarts the typing animation when the language changes) */}
      <div className="text-2xl md:text-3xl font-light text-gray-200 leading-relaxed min-h-[120px]">
        <TextType
          key={i18n.language}
          text={lines}
          typingSpeed={15}
          deletingSpeed={10}
          pauseDuration={2000}
          loop={false} // run one time
          cursorCharacter="_"
          onSentenceComplete={(text, index) => {
            // when the last line has been typed, show the button
            if (index === lastIndex) setShowButton(true);
          }}
        />
      </div>

      {showButton && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onComplete}
          className="-mt-10 px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-pointer"
        >
          {t('intro.start')}
        </motion.button>
      )}
    </div>
  );
};

export default IntroView;