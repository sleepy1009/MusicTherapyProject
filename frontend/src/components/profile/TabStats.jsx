import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Clock, Music, Brain, Sparkles, AlertCircle, PlayCircle, Filter } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea 
} from 'recharts';

// fate/strange fake
const fakeDassData = [
  { name: 'Tuần 1', stress: 18, anxiety: 14, depression: 12 },
  { name: 'Tuần 2', stress: 15, anxiety: 10, depression: 14 },
  { name: 'Tuần 3', stress: 10, anxiety: 8, depression: 9 },
  { name: 'Tuần 4', stress: 6, anxiety: 5, depression: 4 },
];

const fakeListeningData = [
  { name: 'T2', minutes: 45 }, { name: 'T3', minutes: 60 },
  { name: 'T4', minutes: 30 }, { name: 'T5', minutes: 90 },
  { name: 'T6', minutes: 40 }, { name: 'T7', minutes: 120 }, { name: 'CN', minutes: 150 },
];

const fakeGenreData = [
  { name: 'Lofi & Chill', value: 45, color: '#66D0BC' },
  { name: 'Acoustic', value: 30, color: '#41A67E' },
  { name: 'Piano', value: 15, color: '#cbf4d8' },
  { name: 'Khác', value: 10, color: '#888888' },
];

// CUSTOM TOOLTIP
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 backdrop-blur-md border border-white/20 p-3 rounded-xl shadow-xl">
        <p className="text-white font-bold text-sm mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-300">{entry.name}:</span>
            <span className="text-white font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const TabStats = () => {
  const [timeFilter, setTimeFilter] = useState('month'); // week, month, year
  
  const [hasData, setHasData] = useState(true); 

  return (
    <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} 
        className="w-full h-full text-white max-w-5xl mx-auto pb-10"
    >
        {/* HEADER & FILTERS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 mb-6 gap-4">
            <h2 className="text-2xl font-bold text-transparent font-out-text bg-clip-text bg-gradient-to-r from-[#75ae88] to-[#cbf4d8] flex items-center gap-2">
                <BarChart2 className="w-6 h-6 text-[#41A67E]" /> Thống kê & biểu đồ
            </h2>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setHasData(!hasData)}
                    className="text-xs bg-rose-500/20 text-rose-300 px-3 py-1.5 rounded-lg hover:bg-rose-500/40 transition-colors"
                >
                    {hasData ? "Giả lập: Chưa có Data" : "Giả lập: Đã có Data"}
                </button>

                <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1">
                    {['week', 'month', 'year'].map((filter) => (
                        <button
                            key={filter} onClick={() => setTimeFilter(filter)}
                            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                timeFilter === filter ? 'bg-[#41A67E] text-white shadow-md' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {filter === 'week' ? 'Tuần' : filter === 'month' ? 'Tháng' : 'Năm'}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* --- EMPTY STATE --- */}
        {!hasData ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <BarChart2 className="w-12 h-12 text-gray-400 opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-white">Chưa có dữ liệu phân tích</h3>
                <p className="text-gray-400 text-sm max-w-md">
                    MindMelody cần bạn thực hiện ít nhất 1 bài test DASS-21 và trải nghiệm liệu pháp âm nhạc để có thể hiển thị biểu đồ theo dõi tâm trạng.
                </p>
                <div className="flex gap-4 mt-6">
                    <button className="px-6 py-2.5 bg-[#41A67E] hover:bg-[#66D0BC] text-white font-bold rounded-full transition-all shadow-[0_0_15px_rgba(65,166,126,0.3)] flex items-center gap-2">
                        <Brain className="w-4 h-4" /> Làm test DASS-21
                    </button>
                    <button className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full transition-all flex items-center gap-2">
                        <PlayCircle className="w-4 h-4" /> Nghe nhạc ngay
                    </button>
                </div>
            </motion.div>
        ) : (
            /* --- HAVE DATA --- */
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
                {/* 1. AI INSIGHTS */}
                <div className="w-full bg-gradient-to-r from-[#41A67E]/20 to-transparent border border-[#41A67E]/30 backdrop-blur-xl rounded-2xl p-5 flex items-start gap-4 shadow-[0_0_20px_rgba(65,166,126,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#66D0BC]"></div>
                    <Sparkles className="w-6 h-6 text-[#66D0BC] flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-[#cbf4d8] mb-1">AI Đánh giá tổng quan</h4>
                        <p className="text-sm text-gray-200 leading-relaxed">
                            "Trong tháng qua, chỉ số <strong>Căng thẳng (Stress)</strong> của bạn đã giảm rõ rệt (từ 18 xuống 6). Có vẻ như các bản nhạc Lofi & Acoustic đang phát huy tác dụng rất tốt. Hãy tiếp tục duy trì thói quen nghe nhạc 30 phút mỗi tối trước khi ngủ nhé!"
                        </p>
                    </div>
                </div>

                {/* 2. CHART ROW 1: DASS-21 SCORES */}
                <div className="w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-bold text-main_text flex items-center gap-2">
                                <Brain className="w-5 h-5 text-[#41A67E]" /> Biến thiên Tâm lý (DASS-21)
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">Theo dõi mức độ Trầm cảm, Lo âu và Căng thẳng.</p>
                        </div>
                    </div>
                    
                    <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={fakeDassData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 42]} ticks={[0, 10, 20, 30, 42]} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                                
                                {/* VÙNG MÀU NỀN */}
                                <ReferenceArea y1={0} y2={14} fill="#41A67E" fillOpacity={0.05} /> {/* Bình thường */}
                                <ReferenceArea y1={14} y2={24} fill="#F59E0B" fillOpacity={0.05} /> {/* Nhẹ - Vừa */}
                                <ReferenceArea y1={24} y2={42} fill="#EF4444" fillOpacity={0.05} /> {/* Nặng */}

                                <Line type="monotone" dataKey="stress" name="Căng thẳng" stroke="#FF0000" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="anxiety" name="Lo âu" stroke="#758A93" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="depression" name="Trầm cảm" stroke="#685AFF" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. CHART ROW 2: TIME & GENRES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                    
                    {/* Listening Time Bar Chart */}
                    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                        <h3 className="text-base font-bold text-main_text flex items-center gap-2 mb-6">
                            <Clock className="w-5 h-5 text-[#66D0BC]" /> Thời gian trị liệu
                        </h3>
                        <div className="w-full h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={fakeListeningData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} content={<CustomTooltip />} />
                                    <Bar dataKey="minutes" name="Phút" fill="#41A67E" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Genres Pie Chart */}
                    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                        <h3 className="text-base font-bold text-main_text flex items-center gap-2 mb-2">
                            <Music className="w-5 h-5 text-[#cbf4d8]" /> Thể loại hay nghe
                        </h3>
                        <div className="w-full h-[240px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={fakeGenreData} 
                                        cx="50%" cy="50%" 
                                        innerRadius={60} outerRadius={80} 
                                        paddingAngle={5} dataKey="value"
                                        stroke="none"
                                    >
                                        {fakeGenreData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Text in center of Donut */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold text-white">4</span>
                                <span className="text-xs text-gray-400">Thể loại</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
    </motion.div>
  );
};

export default TabStats;