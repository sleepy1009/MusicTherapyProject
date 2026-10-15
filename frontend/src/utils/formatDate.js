export const formatDate = (value, lang) =>
  new Date(value).toLocaleDateString(
    lang === 'vi' ? 'vi-VN' : 'en-GB',
    lang === 'vi'
      ? { day: '2-digit', month: '2-digit', year: 'numeric' }
      : { day: 'numeric', month: 'short', year: 'numeric' }
  );