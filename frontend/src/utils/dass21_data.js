// Data based on the DASS-21 scale.
// "en": official DASS-21 wording (Lovibond & Lovibond, 1995).
// "vi": the existing Vietnamese version, unchanged.
export const DASS21_QUESTIONS = [
  { id: 1, category: 'S', text: { vi: "Tôi thấy khó mà thoải mái được", en: "I found it hard to wind down" } },
  { id: 2, category: 'A', text: { vi: "Tôi bị khô miệng", en: "I was aware of dryness of my mouth" } },
  { id: 3, category: 'D', text: { vi: "Tôi không thấy có chút cảm xúc tích cực nào", en: "I couldn't seem to experience any positive feeling at all" } },
  { id: 4, category: 'A', text: { vi: "Tôi bị rối loạn nhịp thở (thở gấp, khó thở dù chẳng làm việc gì nặng)", en: "I experienced breathing difficulty (eg, excessively rapid breathing, breathlessness in the absence of physical exertion)" } },
  { id: 5, category: 'D', text: { vi: "Tôi thấy khó bắt tay vào công việc", en: "I found it difficult to work up the initiative to do things" } },
  { id: 6, category: 'S', text: { vi: "Tôi đã phản ứng thái quá khi có những sự việc xảy ra", en: "I tended to over-react to situations" } },
  { id: 7, category: 'A', text: { vi: "Tôi bị ra mồ hôi (chẳng hạn như mồ hôi tay...)", en: "I experienced trembling (eg, in the hands)" } },
  { id: 8, category: 'S', text: { vi: "Tôi thấy mình đang suy nghĩ quá nhiều", en: "I felt that I was using a lot of nervous energy" } },
  { id: 9, category: 'A', text: { vi: "Tôi lo lắng về những tình huống có thể khiến tôi hoảng sợ hoặc biến tôi thành trò cười", en: "I was worried about situations in which I might panic and make a fool of myself" } },
  { id: 10, category: 'D', text: { vi: "Tôi thấy mình chẳng có gì để mong đợi cả", en: "I felt that I had nothing to look forward to" } },
  { id: 11, category: 'S', text: { vi: "Tôi thấy bản thân dễ bị kích động", en: "I found myself getting agitated" } },
  { id: 12, category: 'S', text: { vi: "Tôi thấy khó thư giãn được", en: "I found it difficult to relax" } },
  { id: 13, category: 'D', text: { vi: "Tôi cảm thấy chán nản, thất vọng", en: "I felt down-hearted and blue" } },
  { id: 14, category: 'S', text: { vi: "Tôi không chấp nhận được việc có cái gì đó xen vào cản trở việc tôi đang làm", en: "I was intolerant of anything that kept me from getting on with what I was doing" } },
  { id: 15, category: 'A', text: { vi: "Tôi thấy mình gần như hoảng loạn", en: "I felt I was close to panic" } },
  { id: 16, category: 'D', text: { vi: "Tôi không thấy hăng hái với bất kỳ việc gì nữa", en: "I was unable to become enthusiastic about anything" } },
  { id: 17, category: 'D', text: { vi: "Tôi cảm thấy mình chẳng đáng làm người", en: "I felt I wasn't worth much as a person" } },
  { id: 18, category: 'S', text: { vi: "Tôi thấy mình khá dễ phật ý, tự ái", en: "I felt that I was rather touchy" } },
  { id: 19, category: 'A', text: { vi: "Tôi nghe thấy rõ tiếng nhịp tim dù chẳng làm việc gì cả", en: "I was aware of the action of my heart in the absence of physical exertion (eg, sense of heart rate increase, heart missing a beat)" } },
  { id: 20, category: 'A', text: { vi: "Tôi hay sợ vô cớ", en: "I felt scared without any good reason" } },
  { id: 21, category: 'D', text: { vi: "Tôi thấy cuộc sống vô nghĩa", en: "I felt that life was meaningless" } }
];

// Answer scale.
// Official EN wording of the 4 options:
//   0 Did not apply to me at all
//   1 Applied to me to some degree, or some of the time
//   2 Applied to me to a considerable degree, or a good part of time
//   3 Applied to me very much, or most of the time
export const ANSWERS = [
  { value: 0, label: { vi: "Không đúng với tôi chút nào cả", en: "Did not apply to me at all" } },
  { value: 1, label: { vi: "Thỉnh thoảng mới đúng", en: "Applied to me some of the time" } },
  { value: 2, label: { vi: "Phần lớn thời gian là đúng", en: "Applied to me much of the time" } },
  { value: 3, label: { vi: "Hoàn toàn đúng với tôi", en: "Applied to me most of the time" } }
];

// Resolve a { vi, en } value (or a plain string) for the given language
export const localize = (value, lang) =>
  value && typeof value === 'object' ? (value[lang] ?? value.en) : value;

// Scoring table. Note: score = sum of items * 2
export const SCORING_GUIDE = {
  D: { normal: [0, 9], mild: [10, 13], moderate: [14, 20], severe: [21, 27], extreme: [28, 100] },
  A: { normal: [0, 7], mild: [8, 9], moderate: [10, 14], severe: [15, 19], extreme: [20, 100] },
  S: { normal: [0, 14], mild: [15, 18], moderate: [19, 25], severe: [26, 33], extreme: [34, 100] }
};