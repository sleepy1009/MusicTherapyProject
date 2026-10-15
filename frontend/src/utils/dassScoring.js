import { SCORING_GUIDE } from './dass21_data';

export const LEVELS = ['normal', 'mild', 'moderate', 'severe', 'extreme'];


export const STORED_LEVEL = {
  normal: 'Bình thường',
  mild: 'Nhẹ',
  moderate: 'Vừa',
  severe: 'Nặng',
  extreme: 'Rất nặng',
};

const LEVEL_STYLE = {
  normal:   { color: 'text-green-400',  bg: 'bg-green-500' },
  mild:     { color: 'text-yellow-400', bg: 'bg-yellow-500' },
  moderate: { color: 'text-orange-400', bg: 'bg-orange-500' },
  severe:   { color: 'text-red-400',    bg: 'bg-red-500' },
  extreme:  { color: 'text-rose-500',   bg: 'bg-rose-600' },
};

const ALIASES = {
  'bình thường': 'normal', 'nhẹ': 'mild', 'vừa': 'moderate', 'nặng': 'severe', 'rất nặng': 'extreme',
  'normal': 'normal', 'mild': 'mild', 'moderate': 'moderate', 'severe': 'severe',
  'extremely severe': 'extreme', 'extremely_severe': 'extreme', 'extreme': 'extreme',
};

// Accepts a stored label in either language (or a level key) -> level key, or null if unknown
export const normalizeLevel = (value) =>
  ALIASES[String(value ?? '').trim().toLowerCase()] ?? null;

export const isSevereLevel = (value) => {
  const key = normalizeLevel(value);
  return key === 'severe' || key === 'extreme';
};

const getLevelKey = (score, type) => {
  const ranges = SCORING_GUIDE[type]; // { normal: [0,14], mild: [15,18]... }
  if (score <= ranges.normal[1]) return 'normal';
  if (score <= ranges.mild[1]) return 'mild';
  if (score <= ranges.moderate[1]) return 'moderate';
  if (score <= ranges.severe[1]) return 'severe';
  return 'extreme';
};

const buildLevel = (score, type) => {
  const level = getLevelKey(score, type);
  // level: language-neutral key | label: value stored in the DB | color/bg: Tailwind classes
  return { level, label: STORED_LEVEL[level], ...LEVEL_STYLE[level] };
};

export const calculateResult = (answers) => {
  // Stress (S)
  // Anxiety (A)
  // Depression (D)

  const mapCategory = {
    S: [1, 6, 8, 11, 12, 14, 18],
    A: [2, 4, 7, 9, 15, 19, 20],
    D: [3, 5, 10, 13, 16, 17, 21]
  };

  let scores = { S: 0, A: 0, D: 0 };

  Object.keys(answers).forEach((qId) => {
    const score = answers[qId]; // 0, 1, 2, 3
    const id = parseInt(qId);

    if (mapCategory.S.includes(id)) scores.S += score;
    if (mapCategory.A.includes(id)) scores.A += score;
    if (mapCategory.D.includes(id)) scores.D += score;
  });

  // DASS-21 scores are doubled to match the standard DASS-42 ranges
  scores.S *= 2;
  scores.A *= 2;
  scores.D *= 2;

  return {
    S: { score: scores.S, ...buildLevel(scores.S, 'S') },
    A: { score: scores.A, ...buildLevel(scores.A, 'A') },
    D: { score: scores.D, ...buildLevel(scores.D, 'D') }
  };
};