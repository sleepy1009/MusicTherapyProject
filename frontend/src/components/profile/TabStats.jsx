import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Clock, Music, Brain, Sparkles, PlayCircle } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea 
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/formatDate';
import { normalizeLevel } from '../../utils/dassScoring';

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
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [timeFilter, setTimeFilter] = useState('month'); 
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [chartData, setChartData] = useState([]);
  const [dateRange, setDateRange] = useState(undefined); // undefined = not computed yet, null = no data, { first, last } = range

  const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const { data: rawData = [], isLoading: isDassLoading } = useQuery({
    queryKey: ['dass21'],
    queryFn: async () => {
      const res = await fetch(`${API}/users/dass21/`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    }
  });

  // DÙNG REACT QUERY ĐỂ LẤY STATS (Tự động gọi lại nếu timeFilter hoặc selectedSessionId thay đổi)
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['userStats', timeFilter, selectedSessionId, lang],
    queryFn: async () => {
      const url = `${API}/users/stats/?filter=${timeFilter}&lang=${lang}${selectedSessionId ? `&session_id=${selectedSessionId}` : ''}`;
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    },
    // Tự động set session ID mặc định nếu chưa có
    onSuccess: (data) => {
        if (!selectedSessionId && data.session_history?.length > 0) {
            setSelectedSessionId(data.session_history[0].id);
        }
    }
  });

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
            label = lang === 'vi' ? `T${date.getMonth() + 1}` : date.toLocaleDateString('en-GB', { month: 'short' });
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
        setDateRange({ first: sorted[0].created_at, last: sorted[sorted.length - 1].created_at });
    } else {
        setDateRange(null);
    }

  }, [rawData, timeFilter, lang]);

  const rangeText = (() => {
    if (dateRange === undefined) return '';
    if (dateRange === null) return t('profile.stats.noDataInRange');
    const from = formatDate(dateRange.first, lang);
    const to = formatDate(dateRange.last, lang);
    return from === to ? t('profile.stats.dataOnDate', { date: from }) : t('profile.stats.fromTo', { from, to });
  })();

  const levelText = (value) => {
    const key = normalizeLevel(value);
    return key ? t(`dass.levels.${key}`) : value;
  };

  const hasData = rawData.length > 0;
  const isLoading = isDassLoading || isStatsLoading;

  if (isLoading && !hasData) {
      return <div className="text-center text-gray-400 py-20">{t('profile.stats.loading')}</div>;
  }

  const timeStats = statsData?.time_stats || [];
  const genreStats = statsData?.genre_stats || [];
  const isoCurveData = statsData?.iso_curve || [];
  const sessionHistory = statsData?.session_history || [];

  return (
    <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} 
        className="w-full  text-white max-w-5xl mx-auto pb-6"
    >
        {/* HEADER & FILTERS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 mb-6 gap-4">
            <h2 className="text-2xl font-bold text-transparent font-out-text bg-clip-text bg-gradient-to-r from-[#75ae88] to-[#cbf4d8] flex items-center gap-2">
                <BarChart2 className="w-6 h-6 text-[#41A67E]" /> {t('profile.stats.title')}
            </h2>
            
            
            <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1">
                {['week', 'month', 'year'].map((filter) => (
                    <button
                        key={filter} onClick={() => setTimeFilter(filter)}
                        className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            timeFilter === filter ? 'bg-[#41A67E] text-white shadow-md' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {t(`profile.stats.filter.${filter}`)}
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
                <h3 className="text-xl font-bold text-white">{t('profile.stats.emptyTitle')}</h3>
                <p className="text-gray-400 text-sm max-w-md">{t('profile.stats.emptyBody')}</p>
            </motion.div>
        ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <p className="text-xs text-gray-400 mt-1">
                    {rangeText} {chartData.length > 0 && <span className="italic text-[#66D0BC]">{t('profile.stats.averaged')}</span>}
                </p>
                {/* 1. CHART ROW 1: DASS-21 SCORES */}
                <div className="w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-bold text-main_text flex items-center gap-2">
                                <Brain className="w-5 h-5 text-[#41A67E]" /> {t('profile.stats.dassTitle')}
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

                                    <Line type="monotone" dataKey="stress" name={t('dass.categories.stress')} stroke="#FF0000" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="anxiety" name={t('dass.categories.anxiety')} stroke="#758A93" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="depression" name={t('dass.categories.depression')} stroke="#685AFF" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                                {t('profile.stats.noTests')}
                            </div>
                        )}
                    </div>
                </div>

                

                {/* 2. CHART ROW 2: TIME & GENRES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6">
                        <h3 className="text-base font-bold text-main_text flex items-center gap-2 mb-6">
                            <Clock className="w-5 h-5 text-[#66D0BC]" /> {t('profile.stats.therapyTime')}
                        </h3>
                        <div className="w-full h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={timeStats} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} content={<CustomTooltip />} />
                                    <Bar dataKey="minutes" name={t('profile.stats.minutes')} fill="#41A67E" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6">
                        <h3 className="text-base font-bold text-main_text flex items-center gap-2 mb-2">
                            <Music className="w-5 h-5 text-[#cbf4d8]" /> {t('profile.stats.topGenres')}
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


                {/* 1.5. CHART ĐƯỜNG CONG ISO */}
                {isoCurveData.length > 0 && (
                    <div className="w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-[0_0_20px_rgba(65,166,126,0.05)] mt-6 ">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-4">
                            <div>
                                <h3 className="text-base font-bold text-[#66D0BC] flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" /> {t('profile.stats.isoTitle')}
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">{t('profile.stats.isoSub')}</p>
                            </div>
                            
                            <select 
                                value={selectedSessionId} 
                                onChange={(e) => setSelectedSessionId(e.target.value)}
                                className="bg-[#212121]/60 border border-white/20 text-white text-xs rounded-lg px-1 py-2 focus:outline-none focus:border-[#66D0BC]"
                            >
                                {sessionHistory.map(session => (
                                    <option key={session.id} value={session.id}>
                                        {t('profile.stats.sessionOption', { date: session.date, stress: levelText(session.stress), anxiety: levelText(session.anxiety) })}
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

                                    <Line yAxisId="left" type="monotone" dataKey="valence" name={t('profile.stats.valence')} stroke="#FFB76C" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    <Line yAxisId="left" type="monotone" dataKey="energy" name={t('profile.stats.energy')} stroke="#8CE4FF" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    <Line yAxisId="right" type="monotone" dataKey="tempo" name={t('profile.stats.tempo')} stroke="#bfff51" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} strokeDasharray="5 5" />
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