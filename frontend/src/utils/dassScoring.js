import { SCORING_GUIDE } from './dass21_data';

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

  //  DASS-21 cần nhân đôi điểm để khớp với DASS-42 chuẩn
  scores.S *= 2;
  scores.A *= 2;
  scores.D *= 2;

  // level 
  const getLevel = (score, type) => {
    const ranges = SCORING_GUIDE[type]; // { normal: [0,14], mild: [15,18]... }
    if (score <= ranges.normal[1]) return { label: 'Bình thường', color: 'text-green-400', bg: 'bg-green-500' };
    if (score <= ranges.mild[1]) return { label: 'Nhẹ', color: 'text-yellow-400', bg: 'bg-yellow-500' };
    if (score <= ranges.moderate[1]) return { label: 'Vừa', color: 'text-orange-400', bg: 'bg-orange-500' };
    if (score <= ranges.severe[1]) return { label: 'Nặng', color: 'text-red-400', bg: 'bg-red-500' };
    return { label: 'Rất nặng', color: 'text-rose-500', bg: 'bg-rose-600' };
  };

  return {
    S: { score: scores.S, ...getLevel(scores.S, 'S') },
    A: { score: scores.A, ...getLevel(scores.A, 'A') },
    D: { score: scores.D, ...getLevel(scores.D, 'D') }
  };
};