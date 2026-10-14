import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

// Shows the CURRENT language (EN by default). Click to switch to the other one.
const LangToggle = ({ className = '' }) => {
  const { t, i18n } = useTranslation();
  const current = i18n.resolvedLanguage === 'vi' ? 'vi' : 'en';
  const next = current === 'en' ? 'vi' : 'en';

  return (
    <button
      type="button"
      onClick={() => i18n.changeLanguage(next)}
      aria-label={t('lang.switchTo', { language: t(`lang.name.${next}`) })}
      title={t('lang.switchTo', { language: t(`lang.name.${next}`) })}
      className={`flex items-center gap-1.5 text-main_text/80 hover:text-main_text transition-colors text-sm font-medium px-3 py-1.5 rounded-full border border-white/30 hover:bg-white/10 cursor-pointer ${className}`}
    >
      <Globe size={16} />
      <span>{current.toUpperCase()}</span>
    </button>
  );
};

export default LangToggle;