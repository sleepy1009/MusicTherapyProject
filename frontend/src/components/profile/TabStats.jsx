import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Clock, Music, Brain, Sparkles, PlayCircle } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea 
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 backdrop-blur-md border border-white/20 p-3 rounded-xl shadow-xl z-50">
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

// Fake data cho nhạc (Do chưa làm API phần nhạc)
const fakeListeningData = [{ name: 'T2', minutes: 45 }, { name: 'T3', minutes: 60 }, { name: 'T4', minutes: 30 }, { name: 'T5', minutes: 90 }, { name: 'T6', minutes: 40 }, { name: 'T7', minutes: 120 }, { name: 'CN', minutes: 150 }];
const fakeGenreData = [{ name: 'Lofi & Chill', value: 45, color: '#66D0BC' }, { name: 'Acoustic', value: 30, color: '#41A67E' }, { name: 'Piano', value: 15, color: '#cbf4d8' }, { name: 'Khác', value: 10, color: '#888888' }];

const TabStats = () => {
  const [timeFilter, setTimeFilter] = useState('month'); 
  const [hasData, setHasData] = useState(false); 
  const [rawData, setRawData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [dateRangeText, setDateRangeText] = useState('');

  const [isoCurveData, setIsoCurveData] = useState([]);
  const [timeStats, setTimeStats] = useState([]);
  const [genreStats, setGenreStats] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');

  const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

useEffect(() => {
    const fetchData = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            const resDass = await fetch(`${API}/users/dass21/`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (resDass.ok) {
                const data = await resDass.json();
                setRawData(data);
                if (data.length > 0) setHasData(true);
            }
            const url = `${API}/users/stats/?filter=${timeFilter}${selectedSessionId ? `&session_id=${selectedSessionId}` : ''}`;
            const resStats = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            if (resStats.ok) {
                const dataStats = await resStats.json();
                setIsoCurveData(dataStats.iso_curve);
                setTimeStats(dataStats.time_stats);
                setGenreStats(dataStats.genre_stats);
                setSessionHistory(dataStats.session_history); 
                if (!selectedSessionId && dataStats.session_history.length > 0) {
                    setSelectedSessionId(dataStats.session_history[0].id); 
                }
            }
        } catch (err) { console.error(err); }
    };
    fetchData();
  }, [API, selectedSessionId, timeFilter]);

  useEffect(() => {
    if (rawData.length === 0) return;

    const now = new Date();
    let startDate = new Date();

    if (timeFilter === 'week') startDate.setDate(now.getDate() - 7);
    else if (timeFilter === 'month') startDate.setDate(now.getDate() - 30);
    else if (timeFilter === 'year') startDate.setFullYear(now.getFullYear() - 1);

    const filteredData = rawData.filter(item => new Date(item.created_at) >= startDate);

    const grouped = {};
    filteredData.forEach(item => {
        const date = new Date(item.created_at);
        let key = '';
        let label = '';
        
        if (timeFilter === 'year') {
            key = `${date.getFullYear()}-${date.getMonth() + 1}`; 
            label = `T${date.getMonth() + 1}`;
        } else {
            key = date.toLocaleDateString('vi-VN'); 
            label = `${date.getDate()}/${date.getMonth() + 1}`;
        }

        if (!grouped[key]) {
            grouped[key] = { label, count: 0, s: 0, a: 0, d: 0, timestamp: date.getTime() };
        }
        grouped[key].count += 1;
        grouped[key].s += item.stress_score;
        grouped[key].a += item.anxiety_score;
        grouped[key].d += item.depression_score;
    });

    const processedData = Object.values(grouped).map(item => ({
        name: item.label,
        stress: Math.round(item.s / item.count),
        anxiety: Math.round(item.a / item.count),
        depression: Math.round(item.d / item.count),
        timestamp: item.timestamp
    })).sort((a, b) => a.timestamp - b.timestamp); 

    setChartData(processedData);

    if (filteredData.length > 0) {
        const sorted = [...filteredData].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        const first = new Date(sorted[0].created_at).toLocaleDateString('vi-VN');
        const last = new Date(sorted[sorted.length - 1].created_at).toLocaleDateString('vi-VN');
        
        if(first === last) setDateRangeText(`Dữ liệu ngày: ${first}`);
        else setDateRangeText(`Từ ${first} đến ${last}`);
    } else {
        setDateRangeText('Không có dữ liệu trong khoảng thời gian này');
    }

  }, [rawData, timeFilter]);

  return (
    <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} 
        className="w-full  text-white max-w-5xl mx-auto pb-6"
    >
        {/* HEADER & FILTERS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 mb-6 gap-4">
            <h2 className="text-2xl font-bold text-transparent font-out-text bg-clip-text bg-gradient-to-r from-[#75ae88] to-[#cbf4d8] flex items-center gap-2">
                <BarChart2 className="w-6 h-6 text-[#41A67E]" /> Thống kê & biểu đồ
            </h2>
            
            
            <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1">
                {['week', 'month', 'year'].map((filter) => (
                    <button
                        key={filter} onClick={() => setTimeFilter(filter)}
                        className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            timeFilter === filter ? 'bg-[#41A67E] text-white shadow-md' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {filter === 'week' ? '7 Ngày qua' : filter === 'month' ? '30 Ngày qua' : '1 Năm qua'}
                    </button>
                ))}
            </div>
        </div>
                
        {/* --- EMPTY STATE --- */}
        {!hasData ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <BarChart2 className="w-12 h-12 text-gray-400 opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-white">Chưa có dữ liệu phân tích</h3>
                <p className="text-gray-400 text-sm max-w-md">Hãy làm test DASS-21 ít nhất 1 lần để hệ thống bắt đầu theo dõi sức khỏe tinh thần của bạn nhé.</p>
            </motion.div>
        ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <p className="text-xs text-gray-400 mt-1">
                    {dateRangeText} {chartData.length > 0 && <span className="italic text-[#66D0BC]">- Đã tính trung bình các lần test cùng thời điểm</span>}
                </p>
                {/* 1. CHART ROW 1: DASS-21 SCORES */}
                <div className="w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-bold text-main_text flex items-center gap-2">
                                <Brain className="w-5 h-5 text-[#41A67E]" /> Biến thiên Tâm lý (DASS-21)
                            </h3>
                            
                        </div>
                    </div>
                    
                    <div className="w-full h-[300px]">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 42]} ticks={[0, 10, 20, 30, 42]} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                                    
                                    <ReferenceArea y1={0} y2={10} fill="#41A67E" fillOpacity={0.05} />
                                    <ReferenceArea y1={10} y2={22} fill="#F59E0B" fillOpacity={0.05} />
                                    <ReferenceArea y1={22} y2={42} fill="#EF4444" fillOpacity={0.05} />

                                    <Line type="monotone" dataKey="stress" name="Căng thẳng" stroke="#FF0000" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="anxiety" name="Lo âu" stroke="#758A93" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="depression" name="Trầm cảm" stroke="#685AFF" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                                Không có bài test nào trong khoảng thời gian này.
                            </div>
                        )}
                    </div>
                </div>

                

                {/* 2. CHART ROW 2: TIME & GENRES (Giữ nguyên fake cho đến khi làm Player) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6">
                        <h3 className="text-base font-bold text-main_text flex items-center gap-2 mb-6">
                            <Clock className="w-5 h-5 text-[#66D0BC]" /> Thời gian trị liệu
                        </h3>
                        <div className="w-full h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={timeStats} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} content={<CustomTooltip />} />
                                    <Bar dataKey="minutes" name="Phút" fill="#41A67E" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6">
                        <h3 className="text-base font-bold text-main_text flex items-center gap-2 mb-2">
                            <Music className="w-5 h-5 text-[#cbf4d8]" /> Thể loại hay nghe
                        </h3>
                        <div className="w-full h-[240px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={genreStats} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                        {genreStats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>


                {/* 1.5. CHART ĐƯỜNG CONG ISO (VŨ KHÍ SHOW-OFF) */}
                {isoCurveData.length > 0 && (
                    <div className="w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-[0_0_20px_rgba(65,166,126,0.05)] mt-6 ">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-4">
                            <div>
                                <h3 className="text-base font-bold text-[#66D0BC] flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" /> Đường cong Đồng bộ Cảm xúc
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">Năng lượng, Độ tích cực và Nhịp độ (BPM)</p>
                            </div>
                            
                            <select 
                                value={selectedSessionId} 
                                onChange={(e) => setSelectedSessionId(e.target.value)}
                                className="bg-[#212121]/60 border border-white/20 text-white text-xs rounded-lg px-1 py-2 focus:outline-none focus:border-[#66D0BC]"
                            >
                                {sessionHistory.map(session => (
                                    <option key={session.id} value={session.id}>
                                        Ngày {session.date} ({session.stress} / {session.anxiety})
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="w-full h-[280px] mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={isoCurveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                    
                                    <YAxis yAxisId="left" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} />
                                    <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} domain={[60, 180]} ticks={[60, 100, 140, 180]} />
                                    
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                                    <Line yAxisId="left" type="monotone" dataKey="valence" name="Độ Tích Cực (0-1)" stroke="#FFB76C" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    <Line yAxisId="left" type="monotone" dataKey="energy" name="Năng lượng (0-1)" stroke="#8CE4FF" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    <Line yAxisId="right" type="monotone" dataKey="tempo" name="Nhịp độ (BPM)" stroke="#bfff51" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} strokeDasharray="5 5" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </motion.div>
        )}
    </motion.div>
  );
};

export default TabStats;