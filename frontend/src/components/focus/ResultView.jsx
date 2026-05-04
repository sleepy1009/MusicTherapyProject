import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Save, Phone } from 'lucide-react';
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

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} 
          className={`w-full max-w-2xl border rounded-2xl p-8 text-center relative overflow-hidden ${
              ['Nặng', 'Rất nặng'].includes(result.S.label) || ['Nặng', 'Rất nặng'].includes(result.A.label) || ['Nặng', 'Rất nặng'].includes(result.D.label)
              ? 'bg-gradient-to-r from-primary/10 to-white/10  border-white/10' 
              : 'bg-gradient-to-r from-secondary/10 to-white/10 border-white/10'
          }`}
      >
        <div className="relative z-10">
          {(() => {
              const isSevere = ['Nặng', 'Rất nặng'].includes(result.S.label) || ['Nặng', 'Rất nặng'].includes(result.A.label) || ['Nặng', 'Rất nặng'].includes(result.D.label);

              return isSevere ? (
                  // SOS
                  <>
                      <h3 className="text-2xl font-bold text-main_text mb-3">MindMelody đang lắng nghe bạn</h3>
                      <p className="text-gray-300 mb-6 leading-relaxed">
                          MindMelody nhận thấy bạn đang mang một gánh nặng rất lớn. Âm nhạc có thể xoa dịu, nhưng một chuyên gia tâm lý sẽ giúp bạn tháo gỡ tận gốc rễ. Hãy tìm kiếm sự trợ giúp chuyên nghiệp khi bạn sẵn sàng nhé.
                      </p>
                      <div className="flex justify-center mb-6">
                          <div className="bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-lg text-sm text-rose-300 flex items-center gap-2">
                              <Phone className="w-4 h-4" /> Hotline Hỗ trợ Tâm lý Quốc gia: <b>###</b>
                          </div>
                      </div>

                  </>
              ) : (
                  // base
                  <>
                      <h3 className="text-2xl font-bold text-main_text mb-3">Liệu trình Âm nhạc Cá nhân hóa</h3>
                      <p className="text-gray-300 mb-8 leading-relaxed">
                          {isLoggedIn 
                          ? "Kết quả của bạn đã sẵn sàng. Hãy lưu lại để chúng tôi tạo ra lộ trình nghe nhạc cho bạn nhé." 
                          : "Chúng tôi đã chuẩn bị một lộ trình nghe nhạc. Để lưu lại kết quả và theo dõi tiến trình, bạn cần đăng nhập."}
                      </p>
                  </>
              );
          })()}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoggedIn ? (
                <button onClick={handleSaveResult} disabled={isSaving} className="px-6 py-3 bg-main_text/30 text-white rounded-3xl hover:bg-main_text/40 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
                    {isSaving ? "Đang chuẩn bị..." : (
                        ['Nặng', 'Rất nặng'].includes(result.S.label) || ['Nặng', 'Rất nặng'].includes(result.A.label) || ['Nặng', 'Rất nặng'].includes(result.D.label)
                        ? "Đưa tôi vào Không gian An toàn"
                        : "Lưu kết quả & Tạo Playlist"
                    )}
                </button>
            ) : (
                <button onClick={onLoginRequest} className="px-8 py-3 bg-secondary text-black font-bold rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg">
                    <Lock className="w-4 h-4" /> Đăng nhập để Lưu
                </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultView;