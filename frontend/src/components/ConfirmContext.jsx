import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, HelpCircle, Trash2, X } from 'lucide-react';

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Đồng ý',
        cancelText: 'Hủy',
        type: 'danger', 
    });

    const [resolver, setResolver] = useState(null);

    const confirm = useCallback((options) => {
        return new Promise((resolve) => {
            setConfirmState({
                isOpen: true,
                title: options.title || 'Xác nhận',
                message: options.message || 'Bạn có chắc chắn không?',
                confirmText: options.confirmText || 'Đồng ý',
                cancelText: options.cancelText || 'Hủy',
                type: options.type || 'danger',
            });
            setResolver(() => resolve);
        });
    }, []);

    const handleConfirm = () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        if (resolver) resolver(true);
    };

    const handleCancel = () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        if (resolver) resolver(false);
    };

    const styles = {
        danger: {
            bgLayer: 'bg-rose-500/90', 
            icon: <Trash2 size={28} />,
            iconBg: 'bg-rose-100 text-rose-500',
            btnBg: 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30'
        },
        warning: {
            bgLayer: 'bg-yellow-400/90',
            icon: <AlertCircle size={28} />,
            iconBg: 'bg-yellow-50 text-yellow-600',
            btnBg: 'bg-yellow-400 hover:bg-yellow-500 text-gray-900 shadow-yellow-500/30'
        },
        info: {
            bgLayer: 'bg-[#41A67E]/90',
            icon: <HelpCircle size={28} />,
            iconBg: 'bg-[#e2f3ed] text-[#41A67E]',
            btnBg: 'bg-[#41A67E] hover:bg-[#358a68] text-white shadow-[#41A67E]/30'
        }
    };

    const currentStyle = styles[confirmState.type] || styles.danger;

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            
            <AnimatePresence>
                {confirmState.isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4"
                        onClick={handleCancel}
                    >
                        <div className="relative max-w-sm w-full">
                            <motion.div 
                                initial={{ rotate: 0, scale: 0.9 }}
                                animate={{ rotate: 4, scale: 1 }}
                                exit={{ rotate: 0, scale: 0.9 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className={`absolute inset-0 rounded-[28px] border-2 border-white ${currentStyle.bgLayer}`}
                            ></motion.div>

                            {/* Card */}
                            <motion.div 
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                transition={{ duration: 0.2 }}
                                onClick={(e) => e.stopPropagation()} 
                                className="relative bg-[#F3F4F4]/94 border border-white p-8 rounded-[28px] shadow-2xl text-center z-10"
                            >
                                <button onClick={handleCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors">
                                    <X size={20} />
                                </button>

                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${currentStyle.iconBg}`}>
                                    {currentStyle.icon}
                                </div>
                                
                                <h3 className="text-gray-900 font-bold text-xl mb-3 font-out-text">
                                    {confirmState.title}
                                </h3>
                                
                                <p className="text-gray-600 text-sm mb-8 leading-relaxed px-2">
                                    {confirmState.message}
                                </p>
                                
                                <div className="flex justify-center space-x-2">
                                    <button 
                                        onClick={handleCancel}
                                        className="px-4 py-2 rounded-2xl border-1 border-gray bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold transition-all"
                                    >
                                        {confirmState.cancelText}
                                    </button>
                                    <button 
                                        onClick={handleConfirm}
                                        className={`px-4 py-2 rounded-2xl  border-1 border-gray  text-sm font-bold transition-all shadow-lg ${currentStyle.btnBg}`}
                                    >
                                        {confirmState.confirmText}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ConfirmContext.Provider>
    );
};