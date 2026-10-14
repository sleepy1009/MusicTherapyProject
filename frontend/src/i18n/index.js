import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import vi from './locales/vi.json';

export const SUPPORTED_LANGS = ['en', 'vi'];
export const DEFAULT_LANG = 'en';
const STORAGE_KEY = 'lang';

const readSavedLang = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED_LANGS.includes(saved) ? saved : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
};

const initialLang = readSavedLang();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    vi: { translation: vi },
  },
  lng: initialLang,
  fallbackLng: DEFAULT_LANG,
  supportedLngs: SUPPORTED_LANGS,
  interpolation: { escapeValue: false },
});

// Single place that persists the choice and keeps <html lang="..."> in sync.
const syncLang = (lng) => {
  document.documentElement.lang = lng;
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* storage unavailable (private mode, etc.) - ignore */
  }
};

syncLang(initialLang);
i18n.on('languageChanged', syncLang);

export default i18n;