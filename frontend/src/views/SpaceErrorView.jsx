import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, RefreshCw } from 'lucide-react';
import Mascot from '../components/Mascot';
import ParticlesBackground from '../components/reactbits/ParticlesBackground';
import TargetCursor from '../components/reactbits/TargetCursor';

const SpaceErrorView = ({ type = "404", onAction }) => {
    const navigate = useNavigate();

    const errorConfig = {
        "404": {
            code: "404",
            title: "LẠC TRONG VŨ TRỤ",
            message: "Tọa độ không gian này không tồn tại. Có vẻ như bạn đã đi quá xa khỏi quỹ đạo MindMelody.",
            actionText: "Về trang chủ",
            Icon: Home,
            defaultAction: () => navigate('/')
        },
        "500": {
            code: "500",
            title: "MẤT TÍN HIỆU",
            message: "Trạm điều khiển (server) đang từ chối kết nối hoặc đường truyền bị nhiễu. Hãy thử lại sau!",
            actionText: "Thử lại",
            Icon: RefreshCw,
            defaultAction: () => window.location.reload()
        }
    };

    const currentError = errorConfig[type] || errorConfig["404"];
    const handleAction = onAction || currentError.defaultAction;
    const ActionIcon = currentError.Icon;

    return (
        <div className="relative min-h-screen overflow-hidden text-white flex flex-col justify-center items-center">
            <TargetCursor targetSelector=".cursor-target" spinDuration={0} hoverDuration={0.2} hideDefaultCursor={true} />

            <div className="absolute inset-0 z-0">
                <ParticlesBackground
                    particleCount={500}
                    particleSpread={10}
                    speed={0.1} 
                    particleColors={['#ffffff', '#bfff51ff', '#ff7676ff']} 
                    moveParticlesOnHover={true}
                    particleHoverFactor={1}
                    alphaParticles={true}
                    particleBaseSize={100}
                    sizeRandomness={1}
                    cameraDistance={20}
                    disableRotation={false}
                    className="w-full h-full"
                />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="z-10 flex flex-col items-center text-center px-6 max-w-3xl"
            >
                <div className="w-40 h-40 relative z-20 mb-4">
                    <div className="absolute inset-0 blur-3xl opacity-20 bg-secondary rounded-full"></div>
                    <Mascot status="idle2" className="w-full h-full drop-shadow-xl opacity-80" />
                </div>

                <h1 className="text-8xl md:text-6xl font-black font-out-text text-main_text/80 mb-2 tracking-widest drop-shadow-md">
                    {currentError.code} - ERROR
                </h1>
                
                <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-widest text-secondary uppercase">
                    {currentError.title}
                </h2>
                
                <p className="text-main_text/70 mb-10 leading-relaxed text-xl md:text-base ">
                    {currentError.message}
                </p>

                <motion.button 
                    onClick={handleAction}
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="cursor-target group relative px-6 py-3 mb-32 bg-main_text text-black font-extrabold text-lg transition-all flex items-center gap-3 overflow-hidden border-4 border-black/80 [clip-path:polygon(0_0,100%_0,95%_75%,75%_100%,0_100%)]"
                >
                    <motion.div className="relative z-10">
                        <ActionIcon className="w-5 h-5" />
                    </motion.div>
                    <motion.span className="relative z-10 font-out-text tracking-wider ">
                        {currentError.actionText}
                    </motion.span>
                </motion.button>

            </motion.div>
        </div>
    );
};

export default SpaceErrorView;