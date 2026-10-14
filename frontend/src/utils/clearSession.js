// Clears auth/session data on logout but keeps UI preferences (e.g. language).
const KEEP_KEYS = ['lang'];

export const clearSession = () => {
  const kept = KEEP_KEYS.map((key) => [key, localStorage.getItem(key)]);
  localStorage.clear();
  sessionStorage.clear();
  kept.forEach(([key, value]) => {
    if (value !== null) localStorage.setItem(key, value);
  });
};