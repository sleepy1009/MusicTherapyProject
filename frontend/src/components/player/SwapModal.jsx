import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { usePlayer } from './PlayerContext';

const SwapModal = () => {
    const { swapState, setSwapState, handleConfirmSwap, devMode } = usePlayer();

    return (
        <AnimatePresence>
            {swapState.isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSwapState({ isOpen: false, trackIndex: null, options: [], loading: false })}>
                    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()} className="bg-[#1a1c23]/10 border border-white/20 rounded-3xl w-full max-w-2xl p-6 shadow-2xl">
                        
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2"><RefreshCw className="w-5 h-5 text-[#8CE4FF]" /> Chọn bài hát thay thế</h3>
                                <p className="text-xs text-gray-400 mt-1">Bài hát hiện tại sẽ bị ghi nhận là "Không thích".</p>
                            </div>
                            <button onClick={() => setSwapState({ isOpen: false, trackIndex: null, options: [], loading: false })} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
                        </div>

                        {swapState.loading ? (
                            <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                <div className="w-8 h-8 border-4 border-[#8CE4FF] border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm text-gray-400">Đang tính toán Vector tìm bài phù hợp...</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {swapState.options.map((track, i) => (
                                    <div key={i} onClick={() => handleConfirmSwap(track)} className="flex items-center gap-4 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#8CE4FF]/50 rounded-xl transition cursor-pointer group">
                                        <img src={track.image || track.cover} alt="cover" className="w-14 h-14 rounded-lg object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-medium truncate group-hover:text-[#8CE4FF] transition-colors">{track.title}</h4>
                                            <p className="text-gray-400 text-xs truncate">{track.artist}</p>
                                            {devMode && (
                                                <p className="text-[10px] text-red-400 font-mono mt-1">
                                                    [Val: {track.valence} | Eng: {track.energy} | BPM: {track.tempo} | Phase: {track.phase}]
                                                </p>
                                            )}
                                        </div>
                                        <button className="px-4 py-2 bg-[#8CE4FF]/20 text-[#8CE4FF] text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">Đổi bài này</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SwapModal;