import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, PlayCircle, ArrowRight, Lock, Calendar, Music, Activity, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TabTherapy = () => {
  const navigate = useNavigate();

  // Fate/strange fake
  const [userState] = useState({
    hasTestResult: false, 
    hasRecentPlaylist: false, 
    latestResult: {
        date: '2026-03-05',
        stress: 'Nhẹ',
        anxiety: 'Bình thường',
        depression: 'Vừa'
    },
    latestPlaylist: {
        name: 'Acoustic xoa dịu',
        trackCount: 12,
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'
    }
  });

  return (
    <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} 
        className="w-full h-full text-white max-w-5xl mx-auto pb-10 flex flex-col"
    >
        <div className="border-b border-white/10  pb-4 mb-8">
            <h2 className="text-2xl font-bold text-transparent font-out-text bg-clip-text bg-gradient-to-r from-[#75ae88] to-[#cbf4d8] flex items-center gap-2">
                <Headphones className="w-6 h-6 text-[#41A67E]" /> Góc nghe nhạc
            </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
            
            {/* 3 card, improve logical later */}
            <motion.div 
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate('/')} 
                className="group cursor-pointer bg-white/5 border border-white/10 hover:border-[#41A67E]/50 backdrop-blur-xl rounded-3xl p-6 flex flex-col relative overflow-hidden transition-colors shadow-lg"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#41A67E]/10  rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                
                <div className="w-12 h-12 bg-[#41A67E]/20  rounded-2xl flex items-center justify-center mb-6 border border-[#41A67E]/30 text-[#66D0BC]">
                    <Brain className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">Đánh giá tâm trạng</h3>
                <p className="text-sm text-gray-400 mb-6 flex-1 leading-relaxed">
                    Tâm trạng của bạn thay đổi mỗi ngày. Làm một bài test DASS-21 ngắn để AI tạo playlist phù hợp nhất với hiện tại.
                </p>
                
                <div className="flex items-center text-[#66D0BC] font-medium text-sm group-hover:translate-x-2 transition-transform">
                    Bắt đầu bài test <ArrowRight className="w-4 h-4 ml-2" />
                </div>
            </motion.div>

            <motion.div 
                whileHover={userState.hasTestResult ? { scale: 1.02 } : {}}
                className={`relative bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 flex flex-col overflow-hidden transition-colors shadow-lg ${
                    userState.hasTestResult ? 'cursor-pointer hover:border-yellow-500/50' : ''
                }`}
            >
                {!userState.hasTestResult && (
                    <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                        <Lock className="w-8 h-8 text-gray-400 mb-3" />
                        <p className="text-sm font-bold text-white mb-1">Chưa có dữ liệu</p>
                        <p className="text-xs text-gray-400">Bạn cần làm bài test ít nhất 1 lần để sử dụng tính năng này.</p>
                    </div>
                )}

                <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center mb-6 border border-yellow-500/30 text-yellow-400">
                    <Activity className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-1">Dùng kết quả cũ</h3>
                {userState.hasTestResult && (
                    <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Cập nhật: {userState.latestResult.date}
                    </p>
                )}
                
                <div className="flex-1 mb-6 space-y-2">
                    {userState.hasTestResult ? (
                        <>
                            <div className="flex justify-between text-sm bg-black/30 px-3 py-2 rounded-lg">
                                <span className="text-gray-400">Căng thẳng:</span>
                                <span className="text-white font-medium">{userState.latestResult.stress}</span>
                            </div>
                            <div className="flex justify-between text-sm bg-black/30 px-3 py-2 rounded-lg">
                                <span className="text-gray-400">Lo âu:</span>
                                <span className="text-white font-medium">{userState.latestResult.anxiety}</span>
                            </div>
                            <div className="flex justify-between text-sm bg-black/30 px-3 py-2 rounded-lg">
                                <span className="text-gray-400">Trầm cảm:</span>
                                <span className="text-white font-medium">{userState.latestResult.depression}</span>
                            </div>
                        </>
                    ) : (
                        <div className="h-full bg-black/20 rounded-lg border border-white/5"></div>
                    )}
                </div>
                
                <div className="flex items-center text-yellow-400 font-medium text-sm group-hover:translate-x-2 transition-transform">
                    Tạo playlist theo kết quả này <ArrowRight className="w-4 h-4 ml-2" />
                </div>
            </motion.div>

            <motion.div 
                whileHover={userState.hasRecentPlaylist ? { scale: 1.02 } : {}}
                className={`group relative bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 flex flex-col overflow-hidden transition-colors shadow-lg ${
                    userState.hasRecentPlaylist ? 'cursor-pointer hover:border-blue-500/50' : ''
                }`}
            >
                {!userState.hasRecentPlaylist && (
                    <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                        <Lock className="w-8 h-8 text-gray-400 mb-3" />
                        <p className="text-sm font-bold text-white mb-1">Trống</p>
                        <p className="text-xs text-gray-400">Chưa có danh sách phát nào được tạo gần đây.</p>
                    </div>
                )}

                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30 text-blue-400">
                    <PlayCircle className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4">Nghe tiếp phiên trước</h3>
                
                <div className="flex-1 mb-6">
                    {userState.hasRecentPlaylist ? (
                        <div className="relative h-24 rounded-xl overflow-hidden group-hover:shadow-md transition-shadow">
                            <img src={userState.latestPlaylist.cover} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
                                <p className="text-sm font-bold text-white truncate">{userState.latestPlaylist.name}</p>
                                <p className="text-xs text-gray-300 flex items-center gap-1"><Music className="w-3 h-3" /> {userState.latestPlaylist.trackCount} bài hát</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-24 bg-black/20 rounded-xl border border-white/5"></div>
                    )}
                </div>
                
                <div className="flex items-center text-blue-400 font-medium text-sm group-hover:translate-x-2 transition-transform">
                    Vào góc nghe nhạc <ArrowRight className="w-4 h-4 ml-2" />
                </div>
            </motion.div>

        </div>
    </motion.div>
  );
};

export default TabTherapy;