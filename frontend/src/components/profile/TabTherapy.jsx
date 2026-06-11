import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, PlayCircle, ArrowRight, Lock, Calendar, Music, Activity, Headphones, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getColorClass = (label) => {
  switch (label) {
    case 'Bình thường': return 'text-green-400';
    case 'Nhẹ': return 'text-yellow-400';
    case 'Vừa': return 'text-orange-400';
    case 'Nặng': return 'text-red-400';
    case 'Rất nặng': return 'text-rose-500';
    default: return 'text-white';
  }
};

const SEVERITY_WIDTH = {
  'Bình thường': 15,
  'Nhẹ': 30,
  'Vừa': 55,
  'Nặng': 80,
  'Rất nặng': 100,
};

const MetricBar = ({ label, value }) => {
  const width = SEVERITY_WIDTH[value] ?? 0;
  const barColor =
    width >= 80 ? 'bg-red-500' :
    width >= 55 ? 'bg-orange-400' :
    width >= 30 ? 'bg-yellow-400' :
    'bg-[#41A67E]';

  return (
    <div className="mb-1.5">
      <div className="flex justify-between text-[11px] text-gray-400 mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-[3px] w-full bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
};

const getMonthOptions = (history) => {
  const seen = new Set();
  const options = [];
  history.forEach(s => {
    if (!s.date) return;
    
    const parts = s.date.split('/');
    if (parts.length === 3) {
        const month = parts[1];
        const year = parts[2];
        const key = `${year}-${month}`; 
        
        if (!seen.has(key)) {
          seen.add(key);
          options.push({ key, label: `Tháng ${month}/${year}` });
        }
    }
  });
  return options.sort((a, b) => b.key.localeCompare(a.key));
};

const toISO = (session) => {
  if (session.date_raw) return session.date_raw;
  if (!session.date) return '';
  const parts = session.date.split('/');
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return session.date;
};

const TabTherapy = () => {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  const [userState, setUserState] = useState({
    hasTestResult: false,
    hasRecentPlaylist: false,
    latestResult: null,
    latestPlaylist: null,
    history: []
  });

  const [likedCount, setLikedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [filterMode, setFilterMode] = useState('all');
  const [weekFrom, setWeekFrom] = useState('');
  const [weekTo, setWeekTo] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [appliedFilter, setAppliedFilter] = useState({ mode: 'all', weekFrom: '', weekTo: '', month: '' });

  const carouselRef = useRef(null);
  const [dragWidth, setDragWidth] = useState(0);

  

  useEffect(() => {
    const today = new Date();
    const ago = new Date(Date.now() - 7 * 86400000);
    setWeekTo(today.toISOString().slice(0, 10));
    setWeekFrom(ago.toISOString().slice(0, 10));
  }, []);

  const handlePlaySession = async (sessionId) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    try {
      const res = await fetch(`${API}/users/stats/?session_id=${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const playlist = data.iso_curve.map(t => ({
          id: t.id, title: t.title, artist: t.artist,
          image: t.image, youtube_id: t.youtube_id,
          duration: t.duration, isLiked: t.isLiked,
          valence: t.valence, energy: t.energy, tempo: t.tempo
        }));
        navigate('/player', { state: { playlist, mode: 'therapy' } });
      }
    } catch (err) { console.error("Lỗi phát lại:", err); }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${API}/users/dass21/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            const latest = data[0];
            setUserState(prev => ({
              ...prev,
              hasTestResult: true,
              latestResult: {
                date: new Date(latest.created_at).toLocaleDateString('vi-VN'),
                stress: latest.stress_level, stressScore: latest.stress_score, stressColor: getColorClass(latest.stress_level),
                anxiety: latest.anxiety_level, anxietyScore: latest.anxiety_score, anxietyColor: getColorClass(latest.anxiety_level),
                depression: latest.depression_level, depressionScore: latest.depression_score, depressionColor: getColorClass(latest.depression_level)
              }
            }));
          }
        }
        const resStats = await fetch(`${API}/users/stats/`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (resStats.ok) {
          const dataStats = await resStats.json();
          setUserState(prev => ({
            ...prev,
            history: dataStats.session_history,
            hasRecentPlaylist: dataStats.session_history.length > 0,
          }));
          setLikedCount(dataStats.liked_count || 0);
        }
      } catch (err) { console.error("Lỗi lấy dữ liệu:", err); }
    };
    fetchData();
  }, [API]);

  const filteredHistory = useMemo(() => {
    const { mode, weekFrom, weekTo, month } = appliedFilter;
    if (mode === 'week' && weekFrom && weekTo) {
      return userState.history.filter(s => {
        const iso = toISO(s);
        return iso >= weekFrom && iso <= weekTo;
      });
    }
    if (mode === 'month' && month) {
      return userState.history.filter(s => {
        const iso = toISO(s);
        return iso.startsWith(month);
      });
    }
    return userState.history;
  }, [appliedFilter, userState.history]);

  useEffect(() => {
    const updateWidth = () => {
      if (carouselRef.current) {
        setDragWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [filteredHistory]);

  const monthOptions = useMemo(() => getMonthOptions(userState.history), [userState.history]);

  const handleApply = () => {
    setAppliedFilter({ mode: filterMode, weekFrom, weekTo, month: selectedMonth });
  };

  const handleSetMode = (m) => {
    setFilterMode(m);
    if (m === 'all') setAppliedFilter({ mode: 'all', weekFrom: '', weekTo: '', month: '' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="w-full text-white max-w-5xl mx-auto pb-6 flex flex-col"
    >
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-[#1a1c23]/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl">
          <div className="w-10 h-10 border-4 border-[#41A67E] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#66D0BC] font-bold text-sm">Đang chuẩn bị danh sách phát...</p>
        </div>
      )}

      <div className="border-b border-white/10 pb-4 mb-8">
        <h2 className="text-2xl font-bold text-transparent font-out-text bg-clip-text bg-gradient-to-r from-[#75ae88] to-[#cbf4d8] flex items-center gap-2">
          <Headphones className="w-6 h-6 text-[#41A67E]" /> Góc nghe nhạc
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">

        {/* THẺ 1 */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/', { state: { autoStartTest: true } })}
          className="group cursor-pointer bg-white/5 border border-white/10 hover:border-[#41A67E]/50 backdrop-blur-xl rounded-3xl p-6 flex flex-col relative overflow-hidden transition-colors shadow-lg"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#41A67E]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="w-12 h-12 bg-[#41A67E]/20 rounded-2xl flex items-center justify-center mb-6 border border-[#41A67E]/30 text-[#66D0BC]">
            <Brain className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Đánh giá tâm trạng</h3>
          <p className="text-sm text-gray-400 mb-6 flex-1 leading-relaxed">
            Tâm trạng của bạn thay đổi mỗi ngày. Làm một bài test ngắn để AI tạo playlist phù hợp nhất với hiện tại.
          </p>
          <div className="flex items-center text-[#66D0BC] font-medium text-sm group-hover:translate-x-2 transition-transform">
            Bắt đầu bài test <ArrowRight className="w-4 h-4 ml-2" />
          </div>
        </motion.div>

        {/* THẺ 2 */}
        <motion.div
          onClick={() => { if (userState.hasTestResult) navigate('/', { state: { autoStartTherapy: true } }); }}
          whileHover={userState.hasTestResult ? { scale: 1.02 } : {}}
          className={`relative bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 flex flex-col overflow-hidden transition-colors shadow-lg ${userState.hasTestResult ? 'cursor-pointer hover:border-[#66D0BC]/50' : ''}`}
        >
          {!userState.hasTestResult && (
            <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
              <Lock className="w-8 h-8 text-gray-400 mb-3" />
              <p className="text-sm font-bold text-white mb-1">Chưa có dữ liệu</p>
              <p className="text-xs text-gray-400">Bạn cần làm bài test ít nhất 1 lần để sử dụng tính năng này.</p>
            </div>
          )}
          <div className="w-12 h-12 bg-[#66D0BC]/20 rounded-2xl flex items-center justify-center mb-6 border border-[#66D0BC]/30 text-[#66D0BC]">
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
                  <span className="text-[#ec5353]">Căng thẳng:</span>
                  <span className={`font-medium ${userState.latestResult.stressColor}`}>{userState.latestResult.stress} ({userState.latestResult.stressScore})</span>
                </div>
                <div className="flex justify-between text-sm bg-black/30 px-3 py-2 rounded-lg">
                  <span className="text-[#758A93]">Lo âu:</span>
                  <span className={`font-medium ${userState.latestResult.anxietyColor}`}>{userState.latestResult.anxiety} ({userState.latestResult.anxietyScore})</span>
                </div>
                <div className="flex justify-between text-sm bg-black/30 px-3 py-2 rounded-lg">
                  <span className="text-[#685AFF]">Trầm cảm:</span>
                  <span className={`font-medium ${userState.latestResult.depressionColor}`}>{userState.latestResult.depression} ({userState.latestResult.depressionScore})</span>
                </div>
              </>
            ) : (
              <div className="h-full bg-black/20 rounded-lg border border-white/5"></div>
            )}
          </div>
          <div className="flex items-center text-[#66D0BC] font-medium text-sm group-hover:translate-x-2 transition-transform">
            Tạo playlist theo kết quả này <ArrowRight className="w-4 h-4 ml-2" />
          </div>
        </motion.div>

        {/* THẺ 3 */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative bg-white/5 border border-white/10 hover:border-[#41A67E]/50 cursor-pointer backdrop-blur-xl rounded-3xl p-6 flex flex-col overflow-hidden shadow-lg transition-colors"
        >
          {likedCount < 14 && (
            <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
              <Lock className="w-8 h-8 text-gray-400 mb-3" />
              <p className="text-sm font-bold text-white mb-1">Chưa đủ dữ liệu</p>
              <p className="text-xs text-gray-400">Bạn cần thích ít nhất 14 bài hát ({likedCount}/14) để sử dụng tính năng này.</p>
            </div>
          )}
          <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center mb-4 border border-rose-500/30 text-rose-400">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Kho nhạc Yêu thích</h3>
          <p className="text-sm text-gray-400 mb-4 flex-1 leading-relaxed">
            Nghe tự do hoặc xây dựng lộ trình trị liệu theo luật ISO từ những bài hát bạn đã thả tim.
          </p>
          <div className="mt-2 mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>Tiến độ</span>
              <span>{likedCount}/14 bài</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#66D0BC] h-full transition-all" style={{ width: `${Math.min((likedCount / 14) * 100, 100)}%` }}></div>
            </div>
          </div>
          <div className="flex gap-3 w-full mt-auto">
            <button
              onClick={async (e) => {
                e.stopPropagation();
                setIsLoading(true);
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const res = await fetch(`${API}/users/liked-tracks/`, { headers: { 'Authorization': `Bearer ${token}` } });
                const data = await res.json();
                setIsLoading(false);
                navigate('/player', { state: { playlist: data, mode: 'liked' } });
              }}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs transition-all bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-1.5"
            >
              <Music className="w-4 h-4" /> Nghe Tự Do
            </button>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                setIsLoading(true);
                try {
                  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                  const res = await fetch(`${API}/users/build-liked-therapy/`, { headers: { 'Authorization': `Bearer ${token}` } });
                  if (res.ok) {
                    const data = await res.json();
                    navigate('/player', { state: { playlist: data, mode: 'therapy' } });
                  }
                } catch (err) { console.error(err); } finally { setIsLoading(false); }
              }}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs transition-all bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 flex items-center justify-center gap-1.5"
            >
              <Brain className="w-4 h-4" /> Xây dựng Trị Liệu
            </button>
          </div>
        </motion.div>
      </div>

      {userState.history && userState.history.length > 0 && (
        <div className="mt-10">

          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#41A67E]" /> Hành trình của bạn
            </h3>
            <div className="flex items-center gap-2">
              {['all', 'week', 'month'].map(m => (
                <button
                  key={m}
                  onClick={() => handleSetMode(m)}
                  className={`text-xs px-3.5 py-1.5 rounded-full border transition-all ${
                    filterMode === m
                      ? 'bg-[#41A67E]/20 border-[#41A67E]/60 text-[#66D0BC] font-semibold'
                      : 'bg-white/5 border-white/15 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {m === 'all' ? 'Tất cả' : m === 'week' ? 'Theo tuần' : 'Theo tháng'}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {filterMode === 'week' && (
              <motion.div
                key="week-panel"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 flex-wrap mb-4 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                  <span className="text-xs text-gray-400">Từ</span>
                  <input
                    type="date" value={weekFrom} onChange={e => setWeekFrom(e.target.value)}
                    className="bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#41A67E]/60 transition-colors"
                  />
                  <span className="text-xs text-gray-500">—</span>
                  <span className="text-xs text-gray-400">đến</span>
                  <input
                    type="date" value={weekTo} onChange={e => setWeekTo(e.target.value)}
                    className="bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#41A67E]/60 transition-colors"
                  />
                  <button
                    onClick={handleApply}
                    className="px-4 py-1.5 bg-[#41A67E] hover:bg-[#35906c] text-white text-xs font-bold rounded-full transition-colors"
                  >
                    Lọc
                  </button>
                </div>
              </motion.div>
            )}

            {filterMode === 'month' && (
              <motion.div
                key="month-panel"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 flex-wrap mb-4 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                  <span className="text-xs text-gray-400">Tháng</span>
                  <select
                    value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#41A67E]/60 transition-colors"
                  >
                    <option value="">-- Chọn tháng --</option>
                    {monthOptions.map(opt => (
                      <option key={opt.key} value={opt.key}>{opt.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleApply}
                    className="px-4 py-1.5 bg-[#41A67E] hover:bg-[#35906c] text-white text-xs font-bold rounded-full transition-colors"
                  >
                    Lọc
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {appliedFilter.mode !== 'all' && (
            <p className="text-xs text-gray-500 mb-3">{filteredHistory.length} phiên</p>
          )}

          {filteredHistory.length === 0 ? (
            <p className="text-sm text-gray-500 italic py-4">Không có phiên nào trong khoảng thời gian này.</p>
          ) : (
            <motion.div 
              ref={carouselRef} 
              className="overflow-hidden cursor-grab active:cursor-grabbing pb-4"
            >
              <motion.div 
                drag="x"
                dragConstraints={{ right: 0, left: -Math.max(0, dragWidth) }}
                dragElastic={0.15} 
                className="flex gap-3 w-max"
              >
                {filteredHistory.map((session) => {
                  const isSevere = session.stress?.includes('Nặng') || session.anxiety?.includes('Nặng') || session.depression?.includes('Nặng');
                  return (
                    <motion.div
                      key={session.id}
                      whileHover={{ y: -4 }}
                      onClick={() => handlePlaySession(session.id)}
                      className={`group relative flex-shrink-0 w-[178px] rounded-2xl p-4 border transition-all duration-200 overflow-hidden
                        bg-white/5 ${isSevere ? 'hover:border-rose-500/50' : 'hover:border-[#41A67E]/50'} border-white/10`}
                    >
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                        <PlayCircle className={`w-12 h-12 ${isSevere ? 'text-rose-400' : 'text-[#66D0BC]'}`} />
                      </div>

                      <div className="relative z-10 pointer-events-none">
                          <p className="text-[11px] text-gray-500 mb-1">{session.date}</p>
                          <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-bold text-white">{session.track_count} bài hát</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              isSevere ? 'bg-rose-500/15 text-rose-400' : 'bg-[#41A67E]/15 text-[#66D0BC]'
                          }`}>
                              {isSevere ? 'Nặng' : 'Ổn'}
                          </span>
                          </div>

                          <MetricBar label="Căng thẳng" value={session.stress} />
                          <MetricBar label="Lo âu" value={session.anxiety} />
                          <MetricBar label="Trầm cảm" value={session.depression} />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default TabTherapy;