import { auth, db } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { motion } from 'motion/react';
import { Mountain, ShieldCheck, Zap } from 'lucide-react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import DynamicLogo from '../components/DynamicLogo';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = sessionStorage.getItem('plan_intent') ? "/plans" : (location.state?.from?.pathname || "/dashboard");

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // useAuth will catch the change and profile will load
      // Redirect happens in the effect or render below
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-600 font-black italic uppercase animate-pulse flex items-center gap-2">
          <Zap size={20} /> INITIALIZING...
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-neutral-900/50 backdrop-blur-xl border border-white/10 p-6 md:p-12 rounded-2xl md:rounded-3xl text-center shadow-2xl relative z-10 mx-4"
      >
        <div className="flex justify-center mb-4 md:mb-8">
          <DynamicLogo size={24} showImage={false} showText={true} className="flex-col items-center gap-2 md:gap-3" textClassName="items-center" />
        </div>
        
        <h1 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter mb-1.5 md:mb-2 text-red-600">Welcome Back</h1>
        <p className="text-xs md:text-base text-white/50 font-medium mb-6 md:mb-10">Sign in to access your protein dashboard and manage your routine.</p>

        <button 
          onClick={handleGoogleLogin}
          className="max-w-[280px] w-full mx-auto bg-white text-black py-2.5 md:py-3 rounded-lg md:rounded-xl font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 md:gap-3 group mb-4 md:mb-6 shadow-lg cursor-pointer"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 md:w-5 md:h-5" />
          Sign in with Google
        </button>

        <div className="text-[10px] md:text-xs text-white/30 font-bold uppercase tracking-[0.2em] mt-4 pt-4 md:mt-8 md:pt-8 border-t border-white/5">
           Alpino Protein Café Dashboard
        </div>
      </motion.div>
    </div>
  );
}
