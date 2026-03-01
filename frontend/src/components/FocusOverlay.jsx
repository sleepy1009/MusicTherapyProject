import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react'; 
import IntroView from './focus/IntroView';
import ChatView from './focus/ChatView';
import ResultView from './focus/ResultView';
import Mascot from './Mascot';
import CardSelectionView, { ISO_STEPS } from './focus/CardSelectionView'; 
import PlaylistDock from './focus/PlaylistDock';

const FocusOverlay = ({ onClose }) => {
  const [step, setStep] = useState('intro'); // intro -> chat -> result -> card-selection
  const [answers, setAnswers] = useState({});
  const [showConfirm, setShowConfirm] = useState(false); 

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCards, setSelectedCards] = useState([]);
  const [displayedCards, setDisplayedCards] = useState([]);
  const [isSelectionFinished, setIsSelectionFinished] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (step === 'card-selection' && currentStep < ISO_STEPS.length) {
       setDisplayedCards(ISO_STEPS[currentStep].cards.slice(0, 3));
    }
  }, [step, currentStep]);

  const handleSelectCard = (card) => {
    const newSelection = [...selectedCards, card];
    setSelectedCards(newSelection);

    if (currentStep < ISO_STEPS.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 500);
    } else {
      setTimeout(() => setIsSelectionFinished(true), 500);
    }
  };

  const handleBackCard = () => {
    if (currentStep > 0) {
        setCurrentStep(prev => prev - 1);
        setSelectedCards(prev => prev.slice(0, -1));
    }
  };

  const handleShuffleCard = () => {
      const shuffled = [...ISO_STEPS[currentStep].cards].sort(() => Math.random() - 0.5);
      setDisplayedCards(shuffled.slice(0, 3));
  };

  const handleRestartSelection = () => {
      setIsSelectionFinished(false);
      setSelectedCards(prev => prev.slice(0, -1));
      setCurrentStep(3); 
  };

  const handleChatFinish = (data) => {
    setAnswers(data); 
    setStep('result'); 
  };

  const handleLoginRequest = () => {
    const confirm = window.confirm("Giả lập: Bạn muốn Đăng nhập (OK) hay Đăng ký (Cancel)?");
    if(confirm) {
        alert("Đăng nhập thành công! Chuyển sang chọn thẻ bài...");
        setStep('card-selection'); 
    }
  };
  
  const handleGuestContinue = () => {
     const confirm = window.confirm("Bạn sẽ tiếp tục với tư cách Khách. Kết quả sẽ không được lưu. Tiếp tục?");
     if(confirm) {
        setStep('card-selection');
     }
  };

  const handleCloseRequest = () => {
    if (step === 'intro' || step === 'result') {
      onClose();
    } else {
      setShowConfirm(true);
    }
  };

  

  const handleStartListening = () => {
      onClose();
      navigate('/player', { state: { playlist: selectedCards } });
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      
      <button 
        onClick={handleCloseRequest}
        className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition text-white z-50"
      >
        <X className="w-6 h-6" />
      </button>

          <AnimatePresence>
                {showConfirm && (
                    <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 120, damping: 20, mass: 1 }}
                    className="absolute z-[60] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                                max-w-sm w-full text-center p-6 rounded-2xl
                                bg-black/20 border border-xl backdrop-blur-lg"           
                    >
                    <div className="flex justify-center mb-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 mr-2 rounded-full bg-secondary/10 text-[#FFD45A]">
                        <AlertCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#FFD45A] mt-2 mr-10"> Chú ý</h3>
                    </div>
                    <p className="text-l text-gray-200 mb-6">
                        Kết quả của bạn sẽ không được lưu. Bạn có chắc muốn thoát không?
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                        onClick={() => setShowConfirm(false)}
                        className="px-4 py-2 rounded-lg text-sm font-medium
                                    bg-[#2E6F40]/40 border border-white/30 text-main_text
                                    hover:bg-[#2E6F40]/96 transition focus:outline-none
                                    focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2"
                        >
                        Tiếp tục làm
                        </button>
                        <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium
                                    bg-red-600/50 text-main_text/90 hover:bg-red-700 transition
                                    focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-2"
                        >
                        Thoát luôn
                        </button>
                    </div>
                    </motion.div>
                )}
          </AnimatePresence>

      {/* MASCOT */}
      <div className="absolute top-10 left-10 md:left-14 z-[60] w-32 h-32 pointer-events-none">
        <Mascot 
          status={step === 'loading' ? 'thinking' : 'listening'} 
          className="w-full h-full" 
        />
      </div>

      {(step === 'card-selection' || isSelectionFinished) && (
          <PlaylistDock 
            selectedCards={selectedCards} 
            isFinished={isSelectionFinished} 
            onRestart={handleRestartSelection}
            onStartListening={handleStartListening}
          />
      )}

      {/* CONTAINER CHÍNH */}
      {!isSelectionFinished && (
        <motion.div
          layoutId="focus-container"
          animate={{
            borderColor: step === 'card-selection' ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,0.2)',
            borderWidth: step === 'card-selection' ? 0 : 1,
            boxShadow: step === 'card-selection' 
              ? '0 0 200px rgba(255, 255, 255, 0.15)' 
              : '0 0 0px rgba(255, 255, 255, 0)',
            backgroundColor: step === 'card-selection' ? 'rgba(255, 255, 255, 0)' : 'rgba(0,0,0,0.4)',
          }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="w-full max-w-5xl h-[80vh] border border-white/20 rounded-4xl overflow-hidden relative"
        >
        <div className="w-full h-full relative">

          {step === 'intro' && (
             <div className="w-full h-full p-8 md:p-12 flex flex-col justify-center">
                <IntroView onComplete={() => setStep('chat')} />
             </div>
          )}

          {step === 'chat' && <ChatView onFinish={handleChatFinish} />}

          {step === 'result' && (
            <div className="w-full h-full overflow-y-auto custom-scrollbar p-4 md:p-8">
               <ResultView 
                answers={answers} 
                onLoginRequest={handleLoginRequest}
                onContinue={handleGuestContinue}
              />
            </div>
          )}
          
          {step === 'card-selection' && (
                <CardSelectionView 
                    currentStep={currentStep}
                    stepData={ISO_STEPS[currentStep]}
                    displayedCards={displayedCards}
                    handleSelectCard={handleSelectCard}
                    handleBack={handleBackCard}
                    handleShuffle={handleShuffleCard}
                />
            )}

            

          {step === 'player' && (
            <div className="w-full h-full flex flex-col items-center justify-center text-white">
                <h2 className="text-3xl font-bold mb-4">Giao diện Nghe nhạc</h2>
                <p className="text-gray-400">Đang phát triển...</p>
                <button onClick={() => setStep('card-selection')} className="mt-4 px-4 py-2 bg-white/10 rounded-lg">
                    Quay lại test
                </button>
            </div>
          )}

          

        </div>
      </motion.div>
      )}
    </motion.div>
  );
};

export default FocusOverlay;