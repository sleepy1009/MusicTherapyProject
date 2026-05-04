import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const toast = {
        success: (msg, duration) => addToast(msg, 'success', duration),
        error: (msg, duration) => addToast(msg, 'error', duration),
        info: (msg, duration) => addToast(msg, 'info', duration),
        warning: (msg, duration) => addToast(msg, 'warning', duration),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed top-18 right-4 md:right-8 z-[9999] flex flex-col items-end gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(t => (
                        <ToastItem key={t.id} toast={t} onClose={() => setToasts(prev => prev.filter(i => i.id !== t.id))} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onClose }) => {
    const icons = {
        success: <CheckCircle2 className="text-[#41A67E] w-5 h-5 flex-shrink-0" />,
        error: <XCircle className="text-rose-500 w-5 h-5 flex-shrink-0" />,
        info: <Info className="text-[#66D0BC] w-5 h-5 flex-shrink-0" />,
        warning: <AlertCircle className="text-yellow-500 w-5 h-5 flex-shrink-0" />
    };

    const bgColors = {
        success: 'border-[#41A67E]/30 bg-[#41A67E]/10',
        error: 'border-rose-500/30 bg-rose-500/10',
        info: 'border-[#66D0BC]/30 bg-[#66D0BC]/10',
        warning: 'border-yellow-500/30 bg-yellow-500/10'
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9, transition: { duration: 0.2 } }}
            layout 
            className={`flex items-start gap-3 min-w-[280px] max-w-[350px] px-4 py-3 rounded-2xl border backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.1)] pointer-events-auto ${bgColors[toast.type]}`}
        >
            {icons[toast.type]}
            <p className="text-[13px] font-medium text-white/90 font-out-text leading-relaxed flex-1 mt-0.5">
                {toast.message}
            </p>
            <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors flex-shrink-0"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </motion.div>
    );
};