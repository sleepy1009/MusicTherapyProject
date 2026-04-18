import React, { useState, useEffect } from 'react'; 
import { useLocation, useNavigate } from 'react-router-dom';
import ParticlesBackground from '../components/reactbits/ParticlesBackground';
import { AnimatePresence, motion } from 'framer-motion';
import HeroSection from '../components/HeroSection';
import FocusOverlay from '../components/FocusOverlay';

const Home = () => {
  const [isFocusMode, setIsFocusMode] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
      if (location.state?.autoStartTherapy || location.state?.autoStartTest) {
          setIsFocusMode(true); 
          navigate(location.pathname, { replace: true, state: {} });
      }
  }, [location, navigate]);
  
  return (
    <div className="relative min-h-screen  overflow-hidden text-white flex flex-col justify-center">
      
      {/* 1: BACKGROUND ANIMATION */}
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

      <AnimatePresence>
        {!isFocusMode ? (
           <HeroSection onStart={() => setIsFocusMode(true)} />
        ) : (
           <FocusOverlay onClose={() => setIsFocusMode(false)} />
        )}
      </AnimatePresence>

      

    </div>
  );
};

export default Home;