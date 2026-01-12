import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react'; 
import IntroView from './focus/IntroView';
import QuizView from './focus/QuizView';
import Mascot from './Mascot';

// Handle focus file, make focus screen and follow step(intro, quiz, loading)

const FocusOverlay = ({ onClose }) => {
  const [step, setStep] = useState('intro'); 
  const [showConfirm, setShowConfirm] = useState(false); 

  const handleCloseRequest = () => {
    if (step === 'intro' || step === 'result') {
      onClose();
    } else {
      setShowConfirm(true);
    }
  };

  const handleQuizFinish = (results) => {
    console.log("Kết quả:", results);
    setStep('loading'); 
    setTimeout(() => {
        alert("Xong! (Result View coming soon)");
        onClose(); 
    }, 2000);
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 ">
      
      <button 
        onClick={handleCloseRequest}
        className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition text-white z-50"
      >
        <X className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {showConfirm && (
            <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 120, damping: 20, mass: 1 }}
            className="absolute z-[60] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                        max-w-sm w-full text-center p-6 rounded-2xl
                        bg-black/60 border border-blue-800/20
                        backdrop-blur-lg ring-1 ring-grey-800/20"
            >
            <div className="flex justify-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 mr-2 rounded-full bg-yellow-400/10 text-yellow-400">
                <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mt-2">Dừng câu hỏi</h3>
            </div>

            <p className="text-l text-gray-200 mb-6">
                Kết quả của bạn sẽ không được lưu. Bạn có chắc muốn thoát không?
            </p>

            <div className="flex gap-3 justify-center">
                <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium
                            bg-[#2E6F40]/40 border border-white/30 text-white
                            hover:bg-[#2E6F40]/96 transition focus:outline-none
                            focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2"
                >
                Tiếp tục làm
                </button>

                <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium
                            bg-red-600/50 text-white/90 hover:bg-red-700 transition
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-2"
                >
                Thoát luôn
                </button>
            </div>
            </motion.div>
        )}
        </AnimatePresence>

        <div className="absolute top-10 left-10 md:left-20 z-[60] w-32 h-32 pointer-events-none">
        <Mascot 
          status={step === 'loading' ? 'thinking' : 'listening'} 
          className="w-full h-full" 
        />
      </div>

      <motion.div
        layoutId="focus-container"
        className="w-full max-w-5xl h-[80vh] bg-white/4 border border-white/20 rounded-3xl overflow-hidden relative shadow-2xl backdrop-blur-xl"
      >
        <div className="w-full h-full p-8 md:p-12 overflow-y-auto custom-scrollbar">
          {step === 'intro' && <IntroView onComplete={() => setStep('quiz')} />}
          {step === 'quiz' && <QuizView onFinish={handleQuizFinish} />}
          {step === 'loading' && (
             <div className="flex items-center justify-center h-full text-white">
                <p className="animate-pulse">Đang phân tích cảm xúc...</p>
             </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FocusOverlay;