import React from 'react';
import { motion } from 'framer-motion';
import { Brain, RefreshCw, PlayCircle, Music, Activity, Calendar, ChevronRight, Shield, Phone } from 'lucide-react';
import Mascot from '../Mascot';
import { useTranslation } from 'react-i18next';
import { normalizeLevel, isSevereLevel } from '../../utils/dassScoring';

const SCORE_COLOR = (level) => {
  // level may be a stored label in either language; normalizeLevel turns it into a key
  switch (normalizeLevel(level)) {
    case 'normal':   return 'bg-[#41A67E]/10 text-[#66D0BC] border-[#41A67E]/30';
    case 'mild':     return 'bg-yellow-400/10 text-yellow-300 border-yellow-400/25';
    case 'moderate': return 'bg-orange-400/10 text-orange-300 border-orange-400/25';
    case 'severe':   return 'bg-red-500/10 text-red-400 border-red-500/25';
    case 'extreme':  return 'bg-rose-600/10 text-rose-400 border-rose-600/25';
    default:         return 'bg-white/5 text-gray-400 border-white/10';
  }
};

// vi keeps numeric day/month/year; en uses an unambiguous "14 Oct 2026"
const formatDate = (value, lang) =>
  new Date(value).toLocaleDateString(
    lang === 'vi' ? 'vi-VN' : 'en-GB',
    lang === 'vi'
      ? { day: '2-digit', month: '2-digit', year: 'numeric' }
      : { day: 'numeric', month: 'short', year: 'numeric' }
  );

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const CheckpointView = ({ latestResult, latestPlaylist, onUseOldResult, onTakeNewTest, onPlayOldPlaylist }) => {
  const { t, i18n } = useTranslation();
  const date = formatDate(latestResult.created_at, i18n.language);

  const isSevere = isSevereLevel(latestResult.stress_level) ||
                   isSevereLevel(latestResult.anxiety_level) ||
                   isSevereLevel(latestResult.depression_level);

  const levelText = (value) => {
    const key = normalizeLevel(value);
    return key ? t(`dass.levels.${key}`) : value;
  };

  const actions = [
    {
      key: 'new-playlist',
      icon: <Brain className="w-5 h-5" />,
      iconBg: 'bg-[#41A67E]/15 text-[#66D0BC]',
      title: t('checkpoint.createPlaylist'),
      sub: t('checkpoint.createPlaylistSub', { date }),
      onClick: () => onUseOldResult('normal'),
      hoverBorder: 'hover:border-[#41A67E]/50',
      hoverBg: 'hover:bg-[#41A67E]/5',
    },
    ...(latestPlaylist ? [{
      key: 'old-playlist',
      icon: <PlayCircle className="w-5 h-5" />,
      iconBg: 'bg-[#1E90FF]/15 text-[#5aabff]',
      title: t('checkpoint.replayPlaylist'),
      sub: `${typeof latestPlaylist.tracks?.length === 'number' ? t('checkpoint.tracks', { count: latestPlaylist.tracks.length }) : '—'} • ${formatDate(latestPlaylist.created_at, i18n.language)}`,
      onClick: onPlayOldPlaylist,
      hoverBorder: 'hover:border-[#1E90FF]/40',
      hoverBg: 'hover:bg-[#1E90FF]/5',
    }] : []),
    {
      key: 'new-test',
      icon: <RefreshCw className="w-5 h-5" />,
      iconBg: 'bg-white/6 text-gray-400',
      title: t('checkpoint.takeNewTest'),
      sub: t('checkpoint.takeNewTestSub'),
      onClick: onTakeNewTest,
      hoverBorder: 'hover:border-white/20',
      hoverBg: 'hover:bg-white/5',
    },
    ...(isSevere ? [{
      key: 'sos-space',
      icon: <Shield className="w-5 h-5" />,
      iconBg: 'bg-rose-500/20 text-rose-400',
      title: t('checkpoint.safeSpace'),
      sub: t('checkpoint.safeSpaceSub'),
      onClick: () => onUseOldResult('sos'),
      hoverBorder: 'hover:border-rose-500/50',
      hoverBg: 'hover:bg-rose-500/10',
    }] : []),
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
          <span className={`absolute inset-0 rounded-full border animate-ping ${isSevere ? 'border-rose-500/60' : 'border-[#41A67E]/60'}`} style={{ animationDuration: '2.8s' }} />
          {/* Middle ring */}
          <span className={`absolute inset-[-4px] rounded-full border ${isSevere ? 'border-rose-500/20' : 'border-[#41A67E]/20'}`} />
          <div className="relative z-10 w-full h-full ">
            <Mascot status="idle" className="w-full h-full" />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h2 variants={itemVariants} className="text-2xl font-bold text-main_text mb-2 text-center">
          {t('checkpoint.welcomeBack')}
        </motion.h2>
        
        <motion.p variants={itemVariants} className="text-gray-300 text-sm text-center mb-5 leading-relaxed max-w-xl">
          {isSevere 
            ? t('checkpoint.messageSevere') 
            : t('checkpoint.messageNormal')}
        </motion.p>

        

        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-2 mb-7">
          {[
            { label: t('dass.categories.stress'),     value: latestResult.stress_level },
            { label: t('dass.categories.anxiety'),    value: latestResult.anxiety_level },
            { label: t('dass.categories.depression'), value: latestResult.depression_level },
          ].map(({ label, value }) => (
            <span
              key={label}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium ${SCORE_COLOR(value)}`}
            >
              {label}: {levelText(value)}
            </span>
          ))}
          <span className="text-[12px] text-gray-400 w-full text-center flex items-center justify-center gap-1 mt-1">
            <Calendar className="w-3 h-3" /> {t('checkpoint.assessedOn', { date })}
          </span>
        </motion.div>

        {/* Action list */}
        <motion.div variants={itemVariants} className="w-full flex flex-col gap-3 pb-8">
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