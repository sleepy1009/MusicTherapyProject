import React from 'react';
import { motion } from 'framer-motion';
import { Brain, RefreshCw, PlayCircle, Music, Activity, Calendar, ChevronRight } from 'lucide-react';
import Mascot from '../Mascot';

const SCORE_COLOR = (level) => {
  switch (level) {
    case 'Bình thường': return 'bg-[#41A67E]/10 text-[#66D0BC] border-[#41A67E]/30';
    case 'Nhẹ':         return 'bg-yellow-400/10 text-yellow-300 border-yellow-400/25';
    case 'Vừa':         return 'bg-orange-400/10 text-orange-300 border-orange-400/25';
    case 'Nặng':        return 'bg-red-500/10 text-red-400 border-red-500/25';
    case 'Rất nặng':    return 'bg-rose-600/10 text-rose-400 border-rose-600/25';
    default:            return 'bg-white/5 text-gray-400 border-white/10';
  }
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const CheckpointView = ({ latestResult, latestPlaylist, onUseOldResult, onTakeNewTest, onPlayOldPlaylist }) => {
  const date = new Date(latestResult.created_at).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const actions = [
    {
      key: 'new-playlist',
      icon: <Brain className="w-5 h-5" />,
      iconBg: 'bg-[#41A67E]/15 text-[#66D0BC]',
      title: 'Tạo Playlist từ kết quả này',
      sub: `Dựa trên đánh giá ngày ${date}`,
      onClick: onUseOldResult,
      hoverBorder: 'hover:border-[#41A67E]/50',
      hoverBg: 'hover:bg-[#41A67E]/5',
    },
    ...(latestPlaylist ? [{
      key: 'old-playlist',
      icon: <PlayCircle className="w-5 h-5" />,
      iconBg: 'bg-[#1E90FF]/15 text-[#5aabff]',
      title: 'Nghe lại playlist gần nhất',
      sub: `${latestPlaylist.tracks?.length ?? '—'} bài hát • ${new Date(latestPlaylist.created_at).toLocaleDateString('vi-VN')}`,
      onClick: onPlayOldPlaylist,
      hoverBorder: 'hover:border-[#1E90FF]/40',
      hoverBg: 'hover:bg-[#1E90FF]/5',
    }] : []),
    {
      key: 'new-test',
      icon: <RefreshCw className="w-5 h-5" />,
      iconBg: 'bg-white/6 text-gray-400',
      title: 'Làm bài test mới hôm nay',
      sub: 'Cập nhật tâm trạng hiện tại',
      onClick: onTakeNewTest,
      hoverBorder: 'hover:border-white/20',
      hoverBg: 'hover:bg-white/5',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-start h-full px-4 md:px-8 py-10 overflow-y-auto custom-scrollbar">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-lg flex flex-col items-center"
      >

        <motion.div variants={itemVariants} className="relative w-24 h-24 mb-5 flex-shrink-0">
          {/* Outer ring */}
          <span className="absolute inset-0 rounded-full border border-[#41A67E]/60 animate-ping" style={{ animationDuration: '2.8s' }} />
          {/* Middle ring */}
          <span className="absolute inset-[-4px] rounded-full border border-[#41A67E]/20" />
          <div className="relative z-10 w-full h-full ">
            <Mascot status="idle" className="w-full h-full" />
          </div>
        </motion.div>

        {/* ── Heading ── */}
        <motion.h2 variants={itemVariants} className="text-2xl font-bold text-main_text mb-2 text-center">
          Chào mừng bạn quay lại
        </motion.h2>
        <motion.p variants={itemVariants} className="text-gray-300 text-sm text-center mb-5 leading-relaxed max-w-xl">
          Bạn muốn tiếp tục từ lần trước hay bắt đầu đánh giá lại hôm nay?
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-2 mb-7">
          {[
            { label: 'Căng thẳng', value: latestResult.stress_level },
            { label: 'Lo âu',      value: latestResult.anxiety_level },
            { label: 'Trầm cảm',   value: latestResult.depression_level },
          ].map(({ label, value }) => (
            <span
              key={label}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium ${SCORE_COLOR(value)}`}
            >
              {label}: {value}
            </span>
          ))}
          <span className="text-[12px] text-gray-400 w-full text-center flex items-center justify-center gap-1 mt-1">
            <Calendar className="w-3 h-3" /> Đánh giá ngày {date}
          </span>
        </motion.div>

        {/* ── Action list ── */}
        <motion.div variants={itemVariants} className="w-full flex flex-col gap-3">
          {actions.map((action, i) => (
            <motion.button
              key={action.key}
              onClick={action.onClick}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-4 bg-white/[0.04] border border-white/10 
                rounded-2xl px-4 py-3.5 text-left transition-colors duration-200
                ${action.hoverBorder} ${action.hoverBg}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${action.iconBg}`}>
                {action.icon}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold leading-snug">{action.title}</p>
                <p className="text-gray-500 text-xs mt-0.5 truncate">{action.sub}</p>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
            </motion.button>
          ))}
        </motion.div>

      </motion.div>
    </div>
  );
};

export default CheckpointView;