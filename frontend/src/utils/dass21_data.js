// Dữ liệu dựa trên thang đo DASS-21 [cite: 31, 43]
export const DASS21_QUESTIONS = [
  { id: 1, category: 'S', text: "Tôi thấy khó mà thoải mái được" },
  { id: 2, category: 'A', text: "Tôi bị khô miệng" },
  { id: 3, category: 'D', text: "Tôi không thấy có chút cảm xúc tích cực nào" },
  { id: 4, category: 'A', text: "Tôi bị rối loạn nhịp thở (thở gấp, khó thở dù chẳng làm việc gì nặng)" },
  { id: 5, category: 'D', text: "Tôi thấy khó bắt tay vào công việc" },
  { id: 6, category: 'S', text: "Tôi đã phản ứng thái quá khi có những sự việc xảy ra" },
  { id: 7, category: 'A', text: "Tôi bị ra mồ hôi (chẳng hạn như mồ hôi tay...)" },
  { id: 8, category: 'S', text: "Tôi thấy mình đang suy nghĩ quá nhiều" },
  { id: 9, category: 'A', text: "Tôi lo lắng về những tình huống có thể khiến tôi hoảng sợ hoặc biến tôi thành trò cười" },
  { id: 10, category: 'D', text: "Tôi thấy mình chẳng có gì để mong đợi cả" },
  { id: 11, category: 'S', text: "Tôi thấy bản thân dễ bị kích động" },
  { id: 12, category: 'S', text: "Tôi thấy khó thư giãn được" },
  { id: 13, category: 'D', text: "Tôi cảm thấy chán nản, thất vọng" },
  { id: 14, category: 'S', text: "Tôi không chấp nhận được việc có cái gì đó xen vào cản trở việc tôi đang làm" },
  { id: 15, category: 'A', text: "Tôi thấy mình gần như hoảng loạn" },
  { id: 16, category: 'D', text: "Tôi không thấy hăng hái với bất kỳ việc gì nữa" },
  { id: 17, category: 'D', text: "Tôi cảm thấy mình chẳng đáng làm người" },
  { id: 18, category: 'S', text: "Tôi thấy mình khá dễ phật ý, tự ái" },
  { id: 19, category: 'A', text: "Tôi nghe thấy rõ tiếng nhịp tim dù chẳng làm việc gì cả" },
  { id: 20, category: 'A', text: "Tôi hay sợ vô cớ" },
  { id: 21, category: 'D', text: "Tôi thấy cuộc sống vô nghĩa" }
];

// Thang điểm trả lời [cite: 36, 37, 38, 39]
export const ANSWERS = [
  { value: 0, label: "Không đúng với tôi chút nào cả" },
  { value: 1, label: "Thỉnh thoảng mới đúng" },
  { value: 2, label: "Phần lớn thời gian là đúng" },
  { value: 3, label: "Hoàn toàn đúng với tôi" }
];

// Bảng kết quả (Logic tính toán dùng sau này) [cite: 49]
// Lưu ý: Điểm số = Tổng điểm * 2 [cite: 41]
export const SCORING_GUIDE = {
  D: { normal: [0, 9], mild: [10, 13], moderate: [14, 20], severe: [21, 27], extreme: [28, 100] },
  A: { normal: [0, 7], mild: [8, 9], moderate: [10, 14], severe: [15, 19], extreme: [20, 100] },
  S: { normal: [0, 14], mild: [15, 18], moderate: [19, 25], severe: [26, 33], extreme: [34, 100] }
};