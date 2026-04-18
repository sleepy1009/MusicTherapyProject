import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Calendar, Edit3, Trash2, ArrowLeft, Save, X } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { usePlayer } from './PlayerContext';

const DIARY_THEMES = [
  { id: 'theme-default', name: 'Mặc định', image: '/images/p0.png' },
  { id: 'theme-forest', name: 'Rừng xanh', image: '/images/p1.jpg' },
  { id: 'theme-sunset', name: 'Hoàng hôn', image: '/images/p2.jpg' },
  { id: 'theme-rain', name: 'Mưa rơi', image: '/images/p3.png' },
];

const modules = {
  toolbar: [['bold', 'italic', 'underline'], [{ 'color': [] }], ['clean']],
};

const DiaryPanel = () => {
  const { 
    API, diaryViewMode, setDiaryViewMode, diaryFilter, setDiaryFilter,
    currentDiaryEntry, setCurrentDiaryEntry, filteredDiaryEntries,
    diaryEntries, setDiaryEntries, fetchDiary
  } = usePlayer();

  const getThemeImage = (themeId) => {
    const theme = DIARY_THEMES.find(t => t.id === themeId);
    return theme ? theme.image : DIARY_THEMES[0].image;
  };

  const handleOpenCreate = () => {
    setCurrentDiaryEntry({ id: null, title: '', content: '', theme: 'theme-default', created_at: new Date().toISOString() });
    setDiaryViewMode('write');
  };

  const handleSave = async () => {
    if (!currentDiaryEntry.title.trim()) return alert("Vui lòng nhập tiêu đề!");
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const isNew = currentDiaryEntry.id === null;
    const url = isNew ? `${API}/users/diary/` : `${API}/users/diary/${currentDiaryEntry.id}/`;
    
    try {
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(currentDiaryEntry)
      });
      if (res.ok) {
        fetchDiary();
        setDiaryViewMode('list');
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <AnimatePresence mode="wait">
        {diaryViewMode === 'list' ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                {['all', 'week', 'month'].map(f => (
                  <button key={f} onClick={() => setDiaryFilter(f)} className={`px-3 py-1 text-[10px] rounded-md transition-all ${diaryFilter === f ? 'bg-[#41A67E] text-white' : 'text-gray-400'}`}>
                    {f === 'all' ? 'Tất cả' : f === 'week' ? 'Tuần' : 'Tháng'}
                  </button>
                ))}
              </div>
              <button onClick={handleOpenCreate} className="p-2 bg-[#41A67E] rounded-full text-white shadow-lg hover:scale-110 transition-transform">
                <Plus size={16} />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
              {filteredDiaryEntries.map(entry => (
                <div key={entry.id} onClick={() => { setCurrentDiaryEntry(entry); setDiaryViewMode('write'); }}
                  className="group relative h-24 rounded-xl overflow-hidden cursor-pointer border border-white/10 hover:border-[#66D0BC]/50 transition-all">
                  <img src={getThemeImage(entry.theme)} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent p-3 flex flex-col justify-center">
                    <h4 className="text-sm font-bold text-white truncate mb-1">{entry.title}</h4>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1"><Calendar size={10}/> {new Date(entry.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="write" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 50, opacity: 0 }} className="flex flex-col h-full relative">
            <img src={getThemeImage(currentDiaryEntry.theme)} className="absolute inset-0 w-full h-full object-cover opacity-20" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="p-3 border-b border-white/10 bg-black/40 flex items-center justify-between">
                <button onClick={() => setDiaryViewMode('list')} className="p-1 text-gray-400 hover:text-white"><ArrowLeft size={18}/></button>
                <div className="flex gap-1">
                  {DIARY_THEMES.map(t => (
                    <button key={t.id} onClick={() => setCurrentDiaryEntry({...currentDiaryEntry, theme: t.id})} 
                      className={`w-5 h-5 rounded-full border transition-all ${currentDiaryEntry.theme === t.id ? 'border-[#66D0BC] scale-110' : 'border-transparent opacity-50'}`}>
                      <img src={t.image} className="w-full h-full rounded-full object-cover" />
                    </button>
                  ))}
                </div>
                <button onClick={handleSave} className="p-1.5 bg-[#41A67E] text-white rounded-lg"><Save size={16}/></button>
              </div>
              <div className="p-4 flex-1 flex flex-col overflow-hidden">
                <input type="text" value={currentDiaryEntry.title} onChange={e => setCurrentDiaryEntry({...currentDiaryEntry, title: e.target.value})}
                  placeholder="Tiêu đề..." className="w-full bg-transparent border-none text-lg font-bold text-white focus:outline-none mb-2" />
                <div className="flex-1 overflow-y-auto custom-quill-sidebar">
                  <ReactQuill theme="snow" value={currentDiaryEntry.content} onChange={val => setCurrentDiaryEntry({...currentDiaryEntry, content: val})} modules={modules} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-quill-sidebar .ql-snow .ql-stroke { stroke: #ffffff; }
        .custom-quill-sidebar .ql-snow .ql-fill { fill: #ffffff; }
        .custom-quill-sidebar .ql-snow .ql-picker { color: #ffffff; }
        `}} />
    </div>
  );
};



export default DiaryPanel;