import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Lock, ArrowRight } from 'lucide-react';
import Mascot from '../Mascot';
import { calculateResult } from '../../utils/dassScoring';

const ResultView = ({ answers, onLoginRequest, onContinue }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Giả lập tính toán và "suy nghĩ"
  useEffect(() => {
    const timer = setTimeout(() => {
      const computed = calculateResult(answers);
      setResult(computed);
      setLoading(false);
    }, 2000); // 2 giây suy nghĩ
    return () => clearTimeout(timer);
  }, [answers]);

  // View lúc đang tính toán
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-48 h-48 mb-6">
          <Mascot status="thinking" className="w-full h-full" />
        </div>
        <h2 className="text-2xl font-bold text-white animate-pulse">Đang phân tích cảm xúc...</h2>
        <p className="text-gray-400 mt-2">AI đang tìm kiếm giai điệu dành riêng cho bạn</p>
      </div>
    );
  }

  // View hiển thị kết quả
  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto pt-10 pb-24 px-4 md:px-0">
      
      {/* Header Result */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="w-32 h-32 mx-auto mb-4">
           {/* Nếu kết quả nặng -> Mascot buồn/lắng nghe. Nếu nhẹ -> Mascot vui */}
           <Mascot status="listening" className="w-full h-full" />
        </div>
        <h2 className="text-3xl font-bold text-main_text mb-2">Kết quả Sàng lọc Tâm lý</h2>
        <p className="text-gray-300">Dựa trên thang đo tiêu chuẩn DASS-21</p>
      </motion.div>

      {/* Grid biểu đồ 3 cột */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {['Stress', 'Lo âu', 'Trầm cảm'].map((label, idx) => {
          const key = ['S', 'A', 'D'][idx];
          const item = result[key];
          
          return (
            <motion.div 
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.2 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors"
            >
              <h3 className="text-gray-400 text-sm uppercase tracking-widest mb-2">{label}</h3>
              <div className={`text-2xl font-bold mb-1 ${item.color}`}>{item.label}</div>
              <div className="text-xs text-gray-500 mb-4">Điểm số: {item.score}</div>
              
              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((item.score / 42) * 100, 100)}%` }}
                  className={`h-full ${item.bg}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Thông báo chặn / CTA */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-2xl bg-gradient-to-r from-secondary/10 to-white/10 border border-white/10 rounded-2xl p-8 text-center relative overflow-hidden"
      >
        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-main_text mb-3">Liệu trình Âm nhạc Cá nhân hóa</h3>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Chúng tôi đã chuẩn bị một lộ trình nghe nhạc theo nguyên tắc Iso để giúp bạn cân bằng lại cảm xúc. 
            Để lưu lại kết quả và theo dõi tiến trình, bạn cần đăng nhập.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Nút Đăng nhập & Tạo */}
            <button 
              onClick={onLoginRequest}
              className="px-8 py-3 bg-secondary text-black font-bold rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg"
            >
              <Lock className="w-4 h-4" />
              Đăng nhập & Tạo Playlist
            </button>
            
            {/* Nút Thử ngay (Không lưu) */}
            <button 
              onClick={onContinue}
              className="px-8 py-3 bg-transparent border border-white/20 text-main_text font-medium rounded-full hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              Thử trải nghiệm ngay <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Decorate background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      </motion.div>

    </div>
  );
};

export default ResultView;