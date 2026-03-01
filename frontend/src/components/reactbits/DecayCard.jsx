import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';

const DecayCard = ({ 
  width = 270, 
  height = 360, 
  image, 
  title,
  artist,
  duration,
  previewUrl,
  onClick 
}) => {
  const svgRef = useRef(null);
  const displacementMapRef = useRef(null);
  const cursor = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const cachedCursor = useRef({ ...cursor.current });
  const winsize = useRef({ width: window.innerWidth, height: window.innerHeight });
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const lerp = (a, b, n) => (1 - n) * a + n * b;
    const map = (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c;
    const distance = (x1, x2, y1, y2) => Math.hypot(x1 - x2, y1 - y2);

    const handleResize = () => {
      winsize.current = { width: window.innerWidth, height: window.innerHeight };
    };

    const handleMouseMove = ev => {
      cursor.current = { x: ev.clientX, y: ev.clientY };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    const imgValues = {
      imgTransforms: { x: 0, y: 0, rz: 0 },
      displacementScale: 0
    };

    const render = () => {
      // Logic tính toán biến dạng dựa trên vị trí chuột
      let targetX = lerp(imgValues.imgTransforms.x, map(cursor.current.x, 0, winsize.current.width, -120, 120), 0.1);
      let targetY = lerp(imgValues.imgTransforms.y, map(cursor.current.y, 0, winsize.current.height, -120, 120), 0.1);
      let targetRz = lerp(imgValues.imgTransforms.rz, map(cursor.current.x, 0, winsize.current.width, -10, 10), 0.1);

      const bound = 50;
      if (targetX > bound) targetX = bound + (targetX - bound) * 0.2;
      if (targetX < -bound) targetX = -bound + (targetX + bound) * 0.2;
      if (targetY > bound) targetY = bound + (targetY - bound) * 0.2;
      if (targetY < -bound) targetY = -bound + (targetY + bound) * 0.2;

      imgValues.imgTransforms.x = targetX;
      imgValues.imgTransforms.y = targetY;
      imgValues.imgTransforms.rz = targetRz;

      if (svgRef.current) {
        gsap.set(svgRef.current, {
          x: imgValues.imgTransforms.x,
          y: imgValues.imgTransforms.y,
          rotateZ: imgValues.imgTransforms.rz
        });
      }

      const cursorTravelledDistance = distance(
        cachedCursor.current.x,
        cursor.current.x,
        cachedCursor.current.y,
        cursor.current.y
      );
      imgValues.displacementScale = lerp(
        imgValues.displacementScale,
        map(cursorTravelledDistance, 0, 200, 0, 400),
        0.06
      );

      if (displacementMapRef.current) {
        gsap.set(displacementMapRef.current, { attr: { scale: imgValues.displacementScale } });
      }

      cachedCursor.current = { ...cursor.current };
      requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Xử lý Audio khi Hover
  const handleMouseEnter = () => {
    if (audioRef.current) {
        audioRef.current.volume = 0.4; // Âm lượng vừa phải
        audioRef.current.play().catch(e => console.log("Audio play error:", e));
        setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Reset về đầu
        setIsPlaying(false);
    }
  };

  return (
    <motion.div 
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // ANIMATION HOVER: Tăng kích thước và bay lên
      whileHover={{ scale: 1.05, y: -10, zIndex: 10 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="relative cursor-pointer group select-none rounded-xl overflow-visible " 
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* Audio Element ẩn */}
      <audio ref={audioRef} src={previewUrl} loop />

      <div ref={svgRef} className="w-full h-full rounded-xl overflow-hidden">
        <svg
            viewBox="0 0 600 750"
            preserveAspectRatio="xMidYMid slice"
            className="w-full h-full block [will-change:transform] "
        >
            <filter id="imgFilter">
            <feTurbulence
                type="turbulence"
                baseFrequency="0.015"
                numOctaves="5"
                seed="4"
                stitchTiles="stitch"
                result="turbulence1"
            />
            <feDisplacementMap
                ref={displacementMapRef}
                in="SourceGraphic"
                in2="turbulence1"
                scale="0"
                xChannelSelector="R"
                yChannelSelector="B"
                result="displacementMap3"
            />
            </filter>
            <image
                href={image}
                x="0"
                y="0"
                width="600"
                height="750"
                filter="url(#imgFilter)"
                preserveAspectRatio="xMidYMid slice"
            />
        </svg>
        
        {isPlaying && (
            <div className="absolute inset-0 bg-black/30 z-[5] flex items-center justify-center pointer-events-none mix-blend-overlay">
                <div className="flex gap-1 items-end h-20">
                    {[1,2,3,4,5].map(i => (
                        <motion.div 
                            key={i}
                            className="w-2 bg-white/90 rounded-full"
                            animate={{ height: [10, 40, 15, 50, 20] }}
                            transition={{ 
                                repeat: Infinity, 
                                duration: 0.8, 
                                delay: i * 0.1,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>
            </div>
        )}
        
        {/* GRADIENT TỐI Ở ĐÁY (Giúp text rõ hơn) */}
        <div className="absolute bottom-0 left-0 w-full h-[35%] bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-[8]"></div>

        {/* TEXT INFO */}
        

        <div className="absolute bottom-8 left-6 z-10 text-white drop-shadow-lg pointer-events-none mix-blend-difference">
            <h3 className="text-l font-bold font-heading leading-tight mb-1 uppercase tracking-wider">{title}</h3>
            <div className="flex items-center gap-2 text-sm font-light opacity-90 tracking-widest text-gray-300">
                <span>{artist}</span>
                <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                <span>{duration}</span>
            </div>
        </div>

        {/* BORDER GLOW */}
        <div className="absolute inset-0 border-4 border-white/0 group-hover:border-white/60 transition-all duration-500 rounded-xl pointer-events-none z-[11]"></div>
      </div>
    </motion.div>
  );
};

export default DecayCard;