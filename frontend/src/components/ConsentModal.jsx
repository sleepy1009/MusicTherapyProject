import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, FileText, CheckCircle2, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ConsentModal = ({ isOpen, onAccept, onLogout }) => {
    const { t } = useTranslation();
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
                                <h2 className="text-xl font-bold font-out-text leading-tight">{t('consent.title')}</h2>
                                <p className="text-xs text-gray-500 font-medium">{t('consent.subtitle')}</p>
                            </div>
                        </div>

                        {/* Nội dung cam kết (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-8 font-out-text text-sm leading-relaxed text-gray-700 custom-scrollbar">
                            <section className="mb-6">
                                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><FileText size={16}/> {t('consent.s1.title')}</h3>
                                <p>{t('consent.s1.body')}</p>
                            </section>

                            <section className="mb-6">
                                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><FileText size={16}/> {t('consent.s2.title')}</h3>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>{t('consent.s2.item1')}</li>
                                    <li>{t('consent.s2.item2')}</li>
                                    <li>{t('consent.s2.item3')}</li>
                                </ul>
                            </section>

                            <section className="mb-6">
                                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><FileText size={16}/> {t('consent.s3.title')}</h3>
                                <p>{t('consent.s3.body')}</p>
                            </section>

                            <section className="mb-6">
                                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><FileText size={16}/> {t('consent.s4.title')}</h3>
                                <p>{t('consent.s4.body')}</p>
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
                                    {t('consent.agree')}
                                </span>
                            </label>

                            <div className="flex gap-3">
                                <button onClick={onLogout} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-100 transition-all">
                                    <LogOut size={18} /> {t('header.logout')}
                                </button>
                                <button 
                                    disabled={!isAgreed} onClick={onAccept}
                                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                                        isAgreed ? 'bg-[#41A67E] hover:bg-[#358a68] text-white shadow-[#41A67E]/30' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                    }`}
                                >
                                    {t('consent.start')}
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