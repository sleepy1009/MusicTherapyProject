import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, FileText, CheckCircle2, LogOut } from 'lucide-react';

const ConsentModal = ({ isOpen, onAccept, onLogout }) => {
    const [isAgreed, setIsAgreed] = useState(false);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100000] cursor-auto flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                >
                    <motion.div 
                        initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }}
                        className="bg-[#F3F4F4]/90 text-black w-full max-w-2xl rounded-[32px] overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[#41A67E]">
                                <ShieldCheck size={28} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold font-out-text leading-tight">Đồng ý điều khoản</h2>
                                <p className="text-xs text-gray-500 font-medium">MindMelody - Hệ thống hỗ trợ tâm lý AI</p>
                            </div>
                        </div>

                        {/* Nội dung cam kết (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-8 font-out-text text-sm leading-relaxed text-gray-700 custom-scrollbar">
                            <section className="mb-6">
                                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><FileText size={16}/> 1. Mục đích nghiên cứu</h3>
                                <p>Hệ thống này là sản phẩm thuộc đề tài nghiên cứu khoa học. Chúng tôi sử dụng âm nhạc và AI (theo nguyên lý ISO Principle) để hỗ trợ điều chỉnh cảm xúc cho sinh viên. Dữ liệu của bạn giúp chúng tôi đánh giá tính hiệu quả của thuật toán.</p>
                            </section>

                            <section className="mb-6">
                                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><FileText size={16}/> 2. Dữ liệu chúng tôi thu thập</h3>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Chỉ số tâm lý từ bài test DASS-21.</li>
                                    <li>Hành vi tương tác với âm nhạc (Bỏ qua, Yêu thích).</li>
                                    <li>Nội dung hội thoại với trợ lý AI (được mã hóa).</li>
                                </ul>
                            </section>

                            <section className="mb-6">
                                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><FileText size={16}/> 3. Cam kết bảo mật & Quyền riêng tư</h3>
                                <p>Mọi dữ liệu cá nhân của bạn được mã hóa. Danh tính thật của bạn không được sử dụng trong các báo cáo khoa học. Chúng tôi cam kết không chia sẻ dữ liệu này cho bất kỳ bên thứ ba nào ngoài mục đích nghiên cứu.</p>
                            </section>

                            <section className="mb-6">
                                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><FileText size={16}/> 4. Quy tắc an toàn (SOS)</h3>
                                <p>Lưu ý: MindMelody là trợ lý hỗ trợ cảm xúc, không phải bác sĩ y khoa hay chuyên viên tâm lý. Nếu hệ thống phát hiện các dấu hiệu nguy cơ tự hại, chúng tôi sẽ tự động kích hoạt chế độ hỗ trợ khẩn cấp và cung cấp thông tin liên hệ y tế chính thống.</p>
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-[#F3F4F4]/90 border-t border-gray-100">
                            <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                                <div className="relative flex items-center mt-0.5">
                                    <input 
                                        type="checkbox" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)}
                                        className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-[#41A67E] checked:border-[#41A67E] transition-all"
                                    />
                                    <CheckCircle2 className="absolute text-white w-4 h-4 left-0.5 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                                    Tôi đã đọc, hiểu rõ các điều khoản và đồng ý cung cấp dữ liệu cho mục đích nghiên cứu.
                                </span>
                            </label>

                            <div className="flex gap-3">
                                <button onClick={onLogout} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-100 transition-all">
                                    <LogOut size={18} /> Đăng xuất
                                </button>
                                <button 
                                    disabled={!isAgreed} onClick={onAccept}
                                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                                        isAgreed ? 'bg-[#41A67E] hover:bg-[#358a68] text-white shadow-[#41A67E]/30' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                    }`}
                                >
                                    Bắt đầu hành trình
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConsentModal;