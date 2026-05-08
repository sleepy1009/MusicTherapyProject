import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, AlertCircle, Star, UserPlus, Eye, EyeOff } from 'lucide-react';
import ParticlesBackground from '../components/reactbits/ParticlesBackground';
import { useGoogleLogin } from '@react-oauth/google';
import { useDocumentTitle } from '../utils/useDocumentTitle';



const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  
  const [isHovered, setIsHovered] = useState(false);
  const [starExitCoords, setStarExitCoords] = useState({ x: -100, y: 0 });

  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  const handleMouseEnter = () => setIsHovered(true);

  useDocumentTitle('Đăng ký');
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    const randomX = (Math.random() - 0.5) * 300; 
    const randomY = (Math.random() - 0.5) * 200; 
    setStarExitCoords({ x: randomX, y: randomY });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); 

    if (!username || !email || !password) {
      setError('Tất cả các trường không được trống.');
      return;
    }
    if (username.length < 3 || username.length > 20) {
      setError('Tên người dùng phải có từ 3 đến 20 ký tự.');
      return;
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!(hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar)) {
        let errorMessage = "Mật khẩu phải chứa ít nhất:";
        if (!hasUpperCase) errorMessage += " 1 chữ hoa,";
        if (!hasLowerCase) errorMessage += " 1 chữ thường,";
        if (!hasNumber) errorMessage += " 1 số,";
        if (!hasSpecialChar) errorMessage += " 1 ký tự đặc biệt,";
        setError(errorMessage.slice(0, -1) + ".");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    setIsLoading(true);
    try {
      const registerResponse = await fetch(`${API}/users/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const registerData = await registerResponse.json();

      if (registerResponse.ok) {
        const loginResponse = await fetch(`${API}/users/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
          localStorage.setItem('token', loginData.access);
          localStorage.setItem('displayName', username);

          window.dispatchEvent(new Event('checkConsent'));
          
          navigate('/onboarding'); 
        } else {
          navigate('/login?success=registered');
        }
      } else {
        const errorMessages = Object.values(registerData).flat().join(' ');
        setError(errorMessages || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      console.error("Lỗi đăng ký:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch(`${API}/users/google-login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: tokenResponse.access_token })
        });
        
        if (res.ok) {
            const data = await res.json();
            const storage = rememberMe ? localStorage : sessionStorage;
            localStorage.setItem('token', data.access); 
            localStorage.setItem('username', data.username);
            
            const profileRes = await fetch(`${API}/users/me/`, {
                headers: { 'Authorization': `Bearer ${data.access}` }
            });
            const profileData = await profileRes.json();
            
            storage.setItem('email', profileData.email);
            window.dispatchEvent(new Event('checkConsent'));

            if (!profileData.age) {
                navigate('/onboarding');
            } else {
                localStorage.setItem('displayName', profileData.display_name || profileData.username);
                if (profileData.avatar) localStorage.setItem('avatar', profileData.avatar);
                navigate('/');
                toast.success("Đăng nhập bằng Google thành công!");
            }
        } else {
             setError('Lỗi xác thực từ Server.');
        }
      } catch (err) {
        setError('Lỗi kết nối máy chủ.');
      }
    },
    onError: () => setError('Đăng nhập Google bị hủy.')
  });

  return (
    <div className="relative w-full flex-1 flex items-center justify-center min-h-[calc(100vh-64px)] pt-28 pb-20">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <ParticlesBackground
          particleCount={500} particleSpread={10} speed={0.1} 
          particleColors={['#ffffff', '#bfff51ff', '#ff7676ff']} 
          moveParticlesOnHover={true} particleHoverFactor={1}
          alphaParticles={true} particleBaseSize={100} sizeRandomness={1}
          cameraDistance={20} disableRotation={false} className="w-full h-full"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md bg-[#F3F4F4]/15 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-[0_0_12px_rgba(255,255,255,0.15)]"
      >
        <div className="text-center mb-8">
          <motion.h2 
              className="text-3xl font-bold font-out-text font-heading mb-2 text-transparent bg-clip-text bg-[length:200%_auto]"
              style={{ backgroundImage: 'linear-gradient(90deg, #75ae88, #d7d9e5, #cbf4d8)' }}
              animate={{ backgroundPosition:["0% center", "200% center"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          >
              Đăng Ký
          </motion.h2>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2 mt-8">Tên đăng nhập</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-main_text/90  border border-white/10 rounded-xl py-3 pl-12 pr-4 text-black placeholder-gray-600 focus:outline-primary focus:border-primary transition-colors"
                placeholder="Nhập tên đăng nhập"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-main_text/90  border border-white/10 rounded-xl py-3 pl-12 pr-4 text-black placeholder-gray-600 focus:outline-primary focus:border-primary transition-colors"
                placeholder="Nhập email của bạn"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type={showPassword ? "text" : "password"}
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-main_text/90  border border-white/10 rounded-xl py-3 pl-12 pr-12 text-black placeholder-gray-600 focus:outline-primary focus:border-primary transition-colors"
                placeholder="••••••••"
              />
              
              <button
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-3 mt-2 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={isLoading}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`group relative w-2/4 mx-auto mt-6 py-3 bg-[#41A67E] hover:bg-[#66D0BC]/80 text-main_text font-bold rounded-full shadow-lg shadow-[#41A67E]/20 overflow-hidden transition-all duration-300 flex items-center justify-center ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            >
            <span className="relative z-20 flex items-center gap-2 transition-transform duration-500 group-hover:translate-x-3">
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <UserPlus className="w-4 h-4 transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-5 group-hover:rotate-45" /> 
                )}
                {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
            </span>

            {!isLoading && (
              <div className="absolute top-1/2 left-[calc(50%-75px)] -translate-y-1/2 z-10 pointer-events-none">
                  <motion.div
                  initial={{ x: -150, y: 0, opacity: 0 }} 
                  animate={
                      isHovered 
                      ? { x: 20, y: 0, opacity: 1, scale: 1 } 
                      : { x: starExitCoords.x, y: starExitCoords.y, opacity: 0, scale: 0.5 } 
                  }
                  transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
                  className="relative flex items-center justify-center"
                  >
                  <motion.div 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ 
                        opacity: isHovered ? 1 : 0,
                        width: isHovered ? '40px' : '0px'
                      }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className="absolute right-2 h-[2px] bg-gradient-to-r from-transparent via-yellow-200 to-yellow-400 blur-[1px] rounded-full"
                  />
                  <div className="absolute w-6 h-6 bg-yellow-400/50 blur-md rounded-full animate-pulse" />
                  <Star className="w-5 h-5 text-yellow-300 relative z-10 drop-shadow-[0_0_8px_rgba(253,224,71,0.9)]" fill="currentColor" />
                  </motion.div>
              </div>
            )}
            </button>
        </form>

        <div className="mt-6 flex items-center gap-4">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-xs text-gray-500 uppercase tracking-widest">Hoặc</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <button 
          type="button" 
          onClick={() => loginWithGoogle()}
          className="w-2/4 mx-auto mt-4 py-2 bg-transparent hover:bg-gray-100/20 text-main_text text-sm font-semibold rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
          Đăng ký với Google
        </button>

        <p className="mt-4 text-center text-sm text-gray-400">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-[#41A67E] hover:text-[#66D0BC]/80 font-bold transition-colors">
            Đăng nhập ngay
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;