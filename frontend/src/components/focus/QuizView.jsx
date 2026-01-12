import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react'; 
import GooeyNav from '../reactbits/GooeyNav';
import { DASS21_QUESTIONS, ANSWERS } from '../../utils/dass21_data';

// to show and choose questions
const QuizView = ({ onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); 

  const currentQuestion = DASS21_QUESTIONS[currentIndex];

  const handleAnswerSelect = (selectedIndex) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: selectedIndex }));

    if (currentIndex < DASS21_QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onFinish(answers);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const gooeyItems = ANSWERS.map(ans => ({
    label: ans.label,
    href: "#"
  }));

  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col items-center justify-center relative">
      
      {currentIndex > 0 && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleBack}
          className="absolute top-0 left-0 flex items-center gap-2 text-gray-400 hover:text-white transition-colors p-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Câu trước</span>
        </motion.button>
      )}

      {/* Progress Bar */}
      <div className="w-full h-4 bg-white/10 rounded-full mb-12 mt-8">
        <motion.div 
          className="h-full bg-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / DASS21_QUESTIONS.length) * 100}%` }}
        />
      </div>

      {/* Questions */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentIndex} //
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="text-center mb-16"
        >
          <span className="text-white-400 text-sm font-bold tracking-widest uppercase mb-4 block">
            Câu hỏi {currentIndex + 1} / {DASS21_QUESTIONS.length}
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight min-h-[100px] flex items-center justify-center">
            {currentQuestion.text}
          </h2>
        </motion.div>
      </AnimatePresence>

      {/* Answers (Gooey Nav) */}
      <div className="relative w-full flex justify-center">
        <GooeyNav 
          className = "border border-white/10 rounded-3xl"
          key={currentIndex} 
          items={gooeyItems} 
          onSelect={handleAnswerSelect} 
          initialActiveIndex={null} 
          particleColors={[1, 2, 3, 4]} // --color-1, --color-2...
        />
      </div>

    </div>
  );
};

export default QuizView;