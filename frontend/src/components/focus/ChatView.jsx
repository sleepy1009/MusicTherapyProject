import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import GooeyNav from '../reactbits/GooeyNav';
import ChatBubble from './ChatBubble';
import TypingIndicator from './TypingIndicator';
import { DASS21_QUESTIONS, ANSWERS } from '../../utils/dass21_data';

const ChatView = ({ onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [messages, setMessages] = useState([]); 
  const [isTyping, setIsTyping] = useState(true); // cau 1
  const [showOptions, setShowOptions] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (currentIndex < DASS21_QUESTIONS.length) {
      setIsTyping(true);
      setShowOptions(false);

      // Sau 1s hiện câu hỏi
      const timer = setTimeout(() => {
        setIsTyping(false);
        const questionText = DASS21_QUESTIONS[currentIndex].text;
        
        setMessages(prev => [
          ...prev, 
          { id: `bot-${currentIndex}`, text: questionText, isBot: true }
        ]);
        
        // sau khi hiện câu hỏi 500ms thì hiện nút chọn (để user kịp đọc)
        setTimeout(() => setShowOptions(true), 500);

      }, 1000); // bot suy nghĩ

      return () => clearTimeout(timer);
    } else {
        // Hết câu hỏi -> end
        onFinish(answers);
    }
  }, [currentIndex]);


  //khi User chọn đáp án
  const handleAnswerSelect = (selectedIndex) => {
    const selectedLabel = ANSWERS[selectedIndex].label;

    setShowOptions(false);

    setMessages(prev => [
      ...prev,
      { id: `user-${currentIndex}`, text: selectedLabel, isBot: false }
    ]);

    setAnswers(prev => ({ 
        ...prev, 
        [DASS21_QUESTIONS[currentIndex].id]: selectedIndex 
    }));

    setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
    }, 500);
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      // Xóa câu hỏi hiện tại và câu trả lời trước đó khỏi lịch sử
      setMessages(prev => prev.slice(0, -2)); 
      // Xóa kết quả
      const newAnswers = { ...answers };
      delete newAnswers[DASS21_QUESTIONS[prevIndex].id];
      setAnswers(newAnswers);
    }
  };

  const gooeyItems = ANSWERS.map(ans => ({
    label: ans.label,
    href: "#"
  }));

  return (
    <div className="flex flex-col h-full relative">
      
      {/* HEADER*/}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between bg-gradient-to-b from-gray-500/20 to-transparent pb-12 px-4 py-4">
        {currentIndex > 0 ? (
            <button onClick={handleBack} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
        ) : <div></div>}
        
        <div className="text-xs font-medium text-[#EFECE3]/90 bg-white/5 px-4 py-1 rounded-full">
            {currentIndex + 1} / {DASS21_QUESTIONS.length}
        </div>
      </div>

      {/* VÙNG CHAT */}
      <div className="flex-grow overflow-y-auto custom-scrollbar bg-transparent pt-12 pb-40 px-2">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg.text} isBot={msg.isBot} />
        ))}
        
        <AnimatePresence>
            {isTyping && <TypingIndicator />}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* VÙNG INPUT (Gooey Options) -  ở đáy */}
      <div className="absolute bottom-0 left-0 w-full bg-transparent  via-black/90 to-transparent pt-4 pb-6 flex justify-center z-20 min-h-[120px] pointer-events-auto">
      <div className="absolute inset-0 h-32 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
        <AnimatePresence>
          {showOptions && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="w-full flex justify-center pointer-events-auto"
            >
               {/* GooeyNav Quick Replies */}
               <GooeyNav 
                  items={gooeyItems} 
                  onSelect={handleAnswerSelect} 
                  initialActiveIndex={null}
                  particleColors={[1, 2, 3, 4]}
               />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default ChatView;