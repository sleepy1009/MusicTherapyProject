import { useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react'; 
import IntroView from './focus/IntroView';
import ChatView from './focus/ChatView';
import ResultView from './focus/ResultView';
import Mascot from './Mascot';
import CardSelectionView from './focus/CardSelectionView'; 
import PlaylistDock from './focus/PlaylistDock';
import CheckpointView from './focus/CheckpointView';

import { useToast } from './ToastContext'; 
import { useConfirm } from './ConfirmContext';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const FocusOverlay = ({ onClose }) => {
  const [step, setStep] = useState('checking'); // checking -> checkpoint -> intro -> chat -> result -> loading-music -> card-selection
  const [answers, setAnswers] = useState({});
  const [showConfirm, setShowConfirm] = useState(false); 
  const [latestResult, setLatestResult] = useState(null);
  
  const [dynamicIsoSteps, setDynamicIsoSteps] = useState([]); 
  const [currentStep, setCurrentStep] = useState(0); // Từ 0 đến 6 (7 giai đoạn)
  const [selectedCards, setSelectedCards] = useState([]);
  const [displayedCards, setDisplayedCards] = useState([]);
  const [isSelectionFinished, setIsSelectionFinished] = useState(false);

  const [latestPlaylist, setLatestPlaylist] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const toast = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    const checkUserStatus = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) { 
            setStep('intro'); 
            return; 
        }

        try {
            const dassRes = await fetch(`${API}/users/dass21/`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!dassRes.ok) {
                setStep('intro');
                return;
            }
            const dassData = await dassRes.json();

            try {
                const sessionRes = await fetch(`${API}/users/sessions/`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (sessionRes.ok) {
                    const text = await sessionRes.text(); 
                    const sessionData = text ? JSON.parse(text) : null;
                    setLatestPlaylist(sessionData);
                }
            } catch (sessionErr) {
                console.error("Cảnh báo: Lỗi khi lấy Playlist cũ:", sessionErr);
            }

            if (location.state?.autoStartTherapy) {
                setStep('auto-start-trigger'); 
            } else if (location.state?.autoStartTest) {
                setStep('chat'); 
            } else if (dassData && dassData.length > 0) {
                setLatestResult(dassData[0]);
                setStep('checkpoint'); 
            } else {
                setStep('intro'); 
            }

        } catch (err) { 
            console.error("LỖI (checkUserStatus):", err);
            setStep('intro'); 
        }
    };
    checkUserStatus();
  }, []);

  useEffect(() => {
      if (step === 'auto-start-trigger') {
          fetchTherapyMusic();
      }
  }, [step]);

const fetchTherapyMusic = async (mode = 'auto') => {
      setStep('loading-music');
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      try {
          const res = await fetch(`${API}/users/therapy-playlist/?force_mode=${mode}`, { 
              headers: { 'Authorization': `Bearer ${token}` } 
          });
          const data = await res.json();
          
          if (data.is_sos) {
              setSelectedCards(data.recommended_tracks);
              setTimeout(() => {
                  handleStartListening(data.recommended_tracks);
              }, 500);
              return;
          }

          if (data.has_conflict) {
              toast.warning(data.conflict_message); 
          }

          const stepsFormat = [];
          const phaseInfos = [
              { desc: "Đồng điệu - Lắng nghe cảm xúc hiện tại của bạn.", color: "from-[#77B1D4] to-[#90D5FF]" },
              { desc: "Đồng điệu - Thả lỏng và chấp nhận mọi suy nghĩ.", color: "from-[#77B1D4] to-[#90D5FF]" },
              { desc: "Chuyển giao - Một chút nhịp điệu để xoa dịu.", color: "from-[#73abf5] to-[#6ba6ff]" },
              { desc: "Chuyển giao - Từ từ chuyển hướng tâm trạng.", color: "from-[#73abf5] to-[#6ba6ff]" },
              { desc: "Đích đến - Tìm lại sự bình yên trong tâm trí.", color: "from-[#FFB76C] to-[#FFF57E]" },
              { desc: "Đích đến - Ánh sáng nhẹ nhàng và hy vọng.", color: "from-[#FFA4A4] to-[#FFBDBD]" },
              { desc: "Đích đến - Chào đón nguồn năng lượng tích cực mới.", color: "from-[#FFA4A4] to-[#FFBDBD]" }
          ];

          for (let i = 1; i <= 7; i++) {
              const allPhaseCards = data.recommended_tracks.filter(t => t.phase === i);
              stepsFormat.push({
                  id: i, title: `Giai đoạn ${i}`, desc: phaseInfos[i-1].desc, color: phaseInfos[i-1].color,
                  allCards: allPhaseCards, 
                  shuffleIndex: 0, 
                  cards: allPhaseCards.slice(0, 3) 
              });
          }

          setDynamicIsoSteps(stepsFormat);
          setCurrentStep(0);
          setDisplayedCards(stepsFormat[0].cards.slice(0, 3));
          setStep('card-selection');
      } catch (err) {
          console.error(err);
          toast.error("Lỗi khi tạo playlist! Vui lòng thử lại.");
          setStep('intro');
      }
  };

  const handleSelectCard = (card) => {
    const newSelection = [...selectedCards, card];
    setSelectedCards(newSelection);

    if (currentStep < 6) { // 7 mốc -> index max = 6
      setTimeout(() => {
          setCurrentStep(prev => prev + 1);
          setDisplayedCards(dynamicIsoSteps[currentStep + 1].cards.slice(0, 3));
      }, 500);
    } else {
      setTimeout(() => setIsSelectionFinished(true), 500);
    }
  };

  const handleBackCard = () => {
    if (currentStep > 0) {
        const prev = currentStep - 1;
        setCurrentStep(prev);
        setSelectedCards(selectedCards.slice(0, -1));
        setDisplayedCards(dynamicIsoSteps[prev].cards.slice(0, 3));
    }
  };

  const handleShuffleCard = () => {
      setDynamicIsoSteps(prev => {
          const newSteps = [...prev];
          const stepData = newSteps[currentStep];
          
          const maxBatches = Math.floor(stepData.allCards.length / 3) || 1;
          stepData.shuffleIndex = (stepData.shuffleIndex + 1) % maxBatches;
          
          const startIdx = stepData.shuffleIndex * 3;
          stepData.cards = stepData.allCards.slice(startIdx, startIdx + 3);
          
          return newSteps;
      });
      
      const stepData = dynamicIsoSteps[currentStep];
      const startIdx = stepData.shuffleIndex * 3;
      setDisplayedCards(stepData.allCards.slice(startIdx, startIdx + 3));
  };

  const handleRestartSelection = () => {
      setIsSelectionFinished(false);
      setSelectedCards([]);
      setCurrentStep(0); 
      setDisplayedCards(dynamicIsoSteps[0].cards.slice(0, 3));
  };

const handleStartListening = async (overrideTracks = null) => {
      setStep('loading-music'); 
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const validOverride = Array.isArray(overrideTracks) ? overrideTracks : null;
      const tracksToProcess = validOverride || selectedCards;
      
      let finalPlaylist = tracksToProcess;

      try {
          const ytRes = await fetch(`${API}/users/youtube-links/`, {
              method: 'POST',
              headers: headers,
              body: JSON.stringify({ tracks: tracksToProcess })
          });

          if (ytRes.ok) {
              const ytData = await ytRes.json();
              finalPlaylist = ytData.enriched_tracks;
          }

          if (token) {
              await fetch(`${API}/users/sessions/`, {
                  method: 'POST',
                  headers: headers,
                  body: JSON.stringify({
                      dass_result_id: latestResult?.id,
                      tracks: finalPlaylist 
                  })
              });
          }
      } catch (error) {
          console.error("Lỗi khi xử lý nhạc:", error);
          toast.error("Có lỗi xảy ra khi xử lý nhạc.");
      }

      onClose();
      navigate('/player', { state: { playlist: finalPlaylist } });
  };

  const handleCloseClick = async () => {
      const isConfirmed = await confirm({
          title: "Chú ý",
          message: "Bạn có chắc muốn thoát không? Quá trình hiện tại sẽ bị hủy.",
          confirmText: "Thoát luôn",
          cancelText: "Tiếp tục",
          type: "warning" 
      });

      if (isConfirmed) {
          onClose(); 
      }
  };
  
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      
      <button onClick={handleCloseClick} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition text-white z-50">
        <X className="w-6 h-6" />
      </button>


      <div className="absolute top-10 left-10 md:left-14 z-[60] w-32 h-32 pointer-events-none">
        <Mascot status={step === 'loading-music' || step === 'checking' ? 'thinking' : 'listening'} className="w-full h-full" />
      </div>

      {(step === 'card-selection' || isSelectionFinished) && (
          <PlaylistDock selectedCards={selectedCards} isFinished={isSelectionFinished} onRestart={handleRestartSelection} onStartListening={handleStartListening}/>
      )}

      {!isSelectionFinished && (
        <motion.div layoutId="focus-container" className="w-full max-w-5xl h-[80vh] border border-white/20 rounded-[32px] overflow-hidden relative bg-black/40 backdrop-blur-md">
            
          {step === 'checking' && <div className="flex h-full items-center justify-center text-white"><span className="animate-pulse">Đang tải dữ liệu...</span></div>}
          
          {step === 'loading-music' && <div className="flex h-full flex-col items-center justify-center text-white"><Mascot status="thinking" className="w-32 h-32 mb-4"/><span className="animate-pulse text-xl font-bold">AI đang phân tích và tìm nhạc cho bạn...</span></div>}

          {step === 'checkpoint' && latestResult && (
              <CheckpointView 
                  latestResult={latestResult} 
                  latestPlaylist={latestPlaylist}
                  onUseOldResult={fetchTherapyMusic} 
                  onTakeNewTest={() => setStep('intro')} 
                  onPlayOldPlaylist={() => {
                      onClose();
                      navigate('/player', { state: { playlist: latestPlaylist.tracks } });
                  }}
              />
          )}
          
          {step === 'intro' && <div className="w-full h-full p-8 md:p-12 flex flex-col justify-center"><IntroView onComplete={() => setStep('chat')} /></div>}

          {step === 'chat' && <ChatView onFinish={(data) => { setAnswers(data); setStep('result'); }} />}

          {step === 'result' && (
            <div className="w-full h-full overflow-y-auto custom-scrollbar p-4 md:p-8">
               <ResultView answers={answers} onLoginRequest={() => { onClose(); navigate('/login'); }} onContinue={() => setStep('card-selection')} onSaveSuccess={fetchTherapyMusic}/>
            </div>
          )}
          
          {step === 'card-selection' && dynamicIsoSteps.length > 0 && (
                <CardSelectionView currentStep={currentStep} stepData={dynamicIsoSteps[currentStep]} displayedCards={displayedCards} handleSelectCard={handleSelectCard} handleBack={handleBackCard} handleShuffle={handleShuffleCard}/>
          )}

        </motion.div>
      )}
    </motion.div>
  );
};

export default FocusOverlay;