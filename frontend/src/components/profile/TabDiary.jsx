import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Calendar, Edit3, Trash2, ArrowLeft, Save, Filter } from 'lucide-react';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

//all const here is fake data, use real later Fate/strange fake!
const DIARY_THEMES =[
  { id: 'theme-default', name: 'defaul', image: 'images/p0.png' },
  { id: 'theme-forest', name: 'f', image: 'images/p1.jpg' },
  { id: 'theme-sunset', name: 's', image: 'images/p2.jpg' },
  { id: 'theme-rain', name: 'r', image: 'images/p3.png' },
];

const INITIAL_ENTRIES =[
  { id: 1, title: 'Ngày đầu tiên trị liệu', content: '<p>Hôm nay mình nghe bản lofi này thấy đầu óc nhẹ nhõm hơn hẳn. <strong style="color: rgb(65, 166, 126);">Không còn nghĩ nhiều về công việc nữa...</strong></p>', date: '2026-03-05T10:00:00Z', theme: 'theme-default' },
  { id: 2, title: 'Áp lực sếp giao', content: '<p>Thật sự quá mệt mỏi. Cảm giác như thở không nổi. Mình đã nghe Playlist Acoustic 30 phút, khóc một trận rồi thôi...</p>', date: '2026-03-02T18:30:00Z', theme: 'theme-rain' },
];

const modules = {
  toolbar: [
    [{ 'font': [] }],
    [{ 'size':['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background':[] }],
    [{ 'align': [] }],
    ['clean']
  ],
};

const TabDiary = () => {
  const [viewMode, setViewMode] = useState('list');
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState('all'); 
  const [currentEntry, setCurrentEntry] = useState(null);
  const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  const handleOpenCreate = () => {
    setCurrentEntry({
        id: null, // new
        title: '',
        content: '',
        theme: 'theme-default'
    });
    setViewMode('write');
  };

  const handleOpenEdit = (entry) => {
    setCurrentEntry({ ...entry });
    setViewMode('write');
  };

  const handleDelete = async (id, e) => {
    if(e) e.stopPropagation(); 
    if (window.confirm('Bạn có chắc chắn muốn xóa trang nhật ký này?')) {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (id !== null) {
            try {
                await fetch(`${API}/users/diary/${id}/`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (err) {
                console.error("Lỗi xóa nhật ký:", err);
                return;
            }
        }
        
        setEntries(prev => prev.filter(item => item.id !== id));
        if (viewMode === 'write') setViewMode('list');
    }
  };

  const handleSave = async () => {
    if (!currentEntry.title.trim()) {
        alert("Vui lòng đặt tên cho nhật ký!");
        return;
    }
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const isNew = currentEntry.id === null;
    const url = isNew ? `${API}/users/diary/` : `${API}/users/diary/${currentEntry.id}/`;
    const method = isNew ? 'POST' : 'PATCH';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: currentEntry.title,
                content: currentEntry.content,
                theme: currentEntry.theme
            })
        });

        if (res.ok) {
            const savedEntry = await res.json();
            if (isNew) {
                setEntries([savedEntry, ...entries]); // Thêm lên đầu
            } else {
                setEntries(entries.map(e => e.id === savedEntry.id ? savedEntry : e));
            }
            setViewMode('list');
        } else {
            alert("Có lỗi khi lưu nhật ký.");
        }
    } catch (err) {
        console.error("Lỗi lưu nhật ký:", err);
    }
  };

  const getThemeImage = (themeId) => {
      const theme = DIARY_THEMES.find(t => t.id === themeId);
      return theme ? theme.image : DIARY_THEMES[0].image;
  };

  useEffect(() => {
    const fetchDiary = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      try {
        const res = await fetch(`${API}/users/diary/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEntries(data);
        }
      } catch (err) {
        console.error("Lỗi lấy nhật ký:", err);
      }
    };
    fetchDiary();
  },[API]);

  return (
    <div className="w-full h-full text-white max-w-5xl mx-auto flex flex-col">
      <AnimatePresence mode="wait">
        
        {/* main diary */}
        {viewMode === 'list' && (
          <motion.div 
            key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full pb-8"
          >
            {/* Header List */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-out-text text-transparent bg-clip-text bg-gradient-to-r from-[#75ae88] to-[#cbf4d8] flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-[#41A67E]" /> Nhật ký cảm xúc
                    </h2>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1">
                        {['all', 'week', 'month'].map((f) => (
                            <button
                                key={f} onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                    filter === f ? 'bg-[#41A67E]/80 text-white shadow-md' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {f === 'all' ? 'Tất cả' : f === 'week' ? 'Tuần này' : 'Tháng này'}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={handleOpenCreate}
                        className="px-5 py-2 bg-[#41A67E] hover:bg-[#66D0BC] text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(65,166,126,0.3)] flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Viết mới
                    </button>
                </div>
            </div>

            {entries.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center opacity-70">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Edit3 className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-300 font-medium">Bạn chưa có dòng nhật ký nào.</p>
                    <p className="text-sm text-gray-400 mt-1">Hãy bắt đầu ghi lại cảm xúc của ngày hôm nay nhé.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 overflow-y-auto custom-scrollbar pr-2 pb-10">
                    {entries.map((entry) => (
                        <motion.div 
                            key={entry.id} whileHover={{ y: -5 }} onClick={() => handleOpenEdit(entry)}
                            className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer shadow-lg border border-white/10 hover:border-[#66D0BC]/50 transition-colors"
                        >
                            <img src={getThemeImage(entry.theme)} alt="Theme" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                            
                            <div className="absolute inset-0 p-5 flex flex-col justify-end">
                                <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-[#66D0BC] transition-colors">{entry.title}</h3>
                                {/* dangerouslySetInnerHTML để render HTML thu gọn ngoài lưới */}
                                <div className="text-xs text-gray-300 line-clamp-2 mb-3 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: entry.content }}></div>
                                <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(entry.created_at).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </div>

                            <button 
                                onClick={(e) => handleDelete(entry.id, e)}
                                className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-[#41A67E] rounded-full text-gray-300 hover:text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md"
                                title="Xóa nhật ký"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
          </motion.div>
        )}

        {/* screen write  */}
        {viewMode === 'write' && currentEntry && (
          <motion.div 
            key="write" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="flex flex-col h-[calc(100vh-220px)] relative rounded-[28px] overflow-hidden border border-white/20 shadow-2xl"
          >
            <img src={getThemeImage(currentEntry.theme)} alt="Background" className="absolute inset-0 w-full h-full object-cover transition-all duration-500" />
            <div className="absolute inset-0 bg-black/60 rounded-[28px]"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-white/10 bg-black/60 gap-4">
                <button onClick={() => setViewMode('list')} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Trở về
                </button>

                {/* theme */}
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                    <span className="text-xs text-gray-400 font-medium mr-2 hidden md:block">Nền:</span>
                    {DIARY_THEMES.map(t => (
                        <button 
                            key={t.id} 
                            onClick={() => setCurrentEntry({...currentEntry, theme: t.id})}
                            className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all ${currentEntry.theme === t.id ? 'border-[#66D0BC] scale-125 shadow-[0_0_10px_rgba(102,208,188,0.6)]' : 'border-transparent hover:border-white/50 opacity-60 hover:opacity-100'}`}
                            title={t.name}
                        >
                            <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={(e) => handleDelete(currentEntry.id, e)} className="p-2 text-gray-400 hover:text-[#66D0BC] hover:bg-[#41A67E]/10 rounded-full transition-colors" title="Xóa">
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-[#41A67E] hover:bg-[#66D0BC] text-white font-bold rounded-lg transition-colors ml-2 shadow-[0_0_15px_rgba(65,166,126,0.3)]">
                        <Save className="w-4 h-4" /> Lưu
                    </button>
                </div>
            </div>

            {/* write element */}
            <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
                <div className="px-6 pt-6 md:px-10 md:pt-8">
                    <input 
                        type="text" 
                        value={currentEntry.title}
                        onChange={(e) => setCurrentEntry({...currentEntry, title: e.target.value})}
                        placeholder="Tiêu đề nhật ký..."
                        className="w-full bg-transparent border-none text-3xl font-bold font-out-text text-white placeholder-gray-300 focus:outline-none mb-2 font-heading"
                    />
                    <p className="text-xs text-[#66D0BC] font-medium flex items-center gap-2 mb-4">
                        <Calendar className="w-3.5 h-3.5" /> 
                        {new Date(currentEntry.created_at).toLocaleString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                <div className="custom-quill-container flex-1 px-6 md:px-10 pb-10 overflow-y-auto custom-scrollbar rounded-2xl">
                    <ReactQuill 
                        theme="snow"
                        value={currentEntry.content}
                        onChange={(content) => setCurrentEntry({...currentEntry, content})}
                        modules={modules}
                        placeholder="Hôm nay bạn cảm thấy thế nào? Hãy viết ra đây nhé..."
                    />
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CUSTOM CSS  --- */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-quill-container .ql-toolbar.ql-snow {
            border: none;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding: 10px 0;
            margin-bottom: 10px;
        }
        .custom-quill-container .ql-container.ql-snow {
            border: none;
        }
        .custom-quill-container .ql-editor {
            padding: 0;
            font-size: 1.125rem;
            color: #f3f4f6;
            line-height: 1.7;
            min-height: 200px;
        }
        .custom-quill-container .ql-editor.ql-blank::before {
            color: #c2c2c2;
            font-style: italic;
            left: 0;
        }

        .custom-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
        .custom-scrollbar::-webkit-scrollbar {
            display: none;  /* Chrome, Safari, Opera */
        }

        /* Đảm bảo không có padding gây lệch layout khi ẩn scrollbar */
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: transparent;
        }

        /* Custom Toolbar Icons Color for Dark Mode */
        .custom-quill-container .ql-snow .ql-stroke { stroke: #9ca3af; }
        .custom-quill-container .ql-snow .ql-fill { fill: #9ca3af; }
        .custom-quill-container .ql-snow .ql-picker { color: #9ca3af; }
        .custom-quill-container .ql-snow.ql-toolbar button:hover .ql-stroke,
        .custom-quill-container .ql-snow .ql-toolbar button:hover .ql-stroke { stroke: #66D0BC; }
        .custom-quill-container .ql-snow.ql-toolbar button:hover .ql-fill,
        .custom-quill-container .ql-snow .ql-toolbar button:hover .ql-fill { fill: #66D0BC; }
        .custom-quill-container .ql-snow.ql-toolbar button.ql-active .ql-stroke,
        .custom-quill-container .ql-snow .ql-toolbar button.ql-active .ql-stroke { stroke: #66D0BC; }
        .custom-quill-container .ql-snow .ql-picker-options { background-color: #1f2937; border-color: #374151; color: white;}
      `}} />
    </div>
  );
};

export default TabDiary;