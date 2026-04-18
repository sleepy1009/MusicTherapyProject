import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Save } from 'lucide-react';
import Mascot from '../Mascot';
import { calculateResult } from '../../utils/dassScoring';

const ResultView = ({ answers, onLoginRequest, onContinue, onSaveSuccess }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isLoggedIn = !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
  const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    const timer = setTimeout(() => {
      const computed = calculateResult(answers);
      setResult(computed);
      setLoading(false);
    }, 2000); 
    return () => clearTimeout(timer);
  }, [answers]);

  const handleSaveResult = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    setIsSaving(true);
    try {
        const res = await fetch(`${API}/users/dass21/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                stress_score: result.S.score,
                anxiety_score: result.A.score,
                depression_score: result.D.score,
                stress_level: result.S.label,
                anxiety_level: result.A.label,
                depression_level: result.D.label
            })
        });

        if (res.ok) {
            onSaveSuccess(); 
        } else {
            alert("Có lỗi xảy ra khi lưu kết quả!");
        }
    } catch (err) {
        console.error("Lỗi mạng:", err);
    } finally {
        setIsSaving(false);
    }
  };

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

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto pt-10 pb-24 px-4 md:px-0">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="w-32 h-32 mx-auto mb-4">
           <Mascot status="listening" className="w-full h-full" />
        </div>
        <h2 className="text-3xl font-bold text-main_text mb-2">Kết quả Sàng lọc Tâm lý</h2>
        <p className="text-gray-300">Dựa trên thang đo tiêu chuẩn DASS-21</p>
      </motion.div>

      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {['Stress', 'Lo âu', 'Trầm cảm'].map((label, idx) => {
          const key = ['S', 'A', 'D'][idx];
          const item = result[key];
          
          return (
            <motion.div 
              key={key} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.2 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors"
            >
              <h3 className="text-gray-400 text-sm uppercase tracking-widest mb-2">{label}</h3>
              <div className={`text-2xl font-bold mb-1 ${item.color}`}>{item.label}</div>
              <div className="text-xs text-gray-500 mb-4">Điểm số: {item.score}</div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((item.score / 42) * 100, 100)}%` }} className={`h-full ${item.bg}`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="w-full max-w-2xl bg-gradient-to-r from-secondary/10 to-white/10 border border-white/10 rounded-2xl p-8 text-center relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-main_text mb-3">Liệu trình Âm nhạc Cá nhân hóa</h3>
          <p className="text-gray-300 mb-8 leading-relaxed">
            {isLoggedIn 
              ? "Tuyệt vời! Kết quả của bạn đã sẵn sàng. Hãy lưu lại để chúng tôi tạo ra lộ trình nghe nhạc theo nguyên tắc Iso cho bạn nhé." 
              : "Chúng tôi đã chuẩn bị một lộ trình nghe nhạc. Để lưu lại kết quả và theo dõi tiến trình, bạn cần đăng nhập."}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            
            {isLoggedIn ? (
                <button onClick={handleSaveResult} disabled={isSaving} className="px-8 py-3 bg-[#41A67E] text-main_text font-bold rounded-full hover:bg-[#66D0BC] transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
                    <Save className="w-4 h-4" />
                    {isSaving ? "Đang lưu..." : "Lưu kết quả & Tạo Playlist"}
                </button>
            ) : (
                <button onClick={onLoginRequest} className="px-8 py-3 bg-secondary text-black font-bold rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg">
                    <Lock className="w-4 h-4" /> Đăng nhập để Lưu
                </button>
            )}
            
            {!isLoggedIn && (
                <button onClick={onContinue} className="px-8 py-3 bg-transparent border border-white/20 text-main_text font-medium rounded-full hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                    Thử trải nghiệm ngay <ArrowRight className="w-4 h-4" />
                </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultView;