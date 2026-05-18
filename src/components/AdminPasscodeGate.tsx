import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, Terminal, Zap, ShieldAlert } from 'lucide-react';

interface AdminPasscodeGateProps {
  children: React.ReactNode;
}

const PASSCODE = '1522';

export default function AdminPasscodeGate({ children }: AdminPasscodeGateProps) {
  const [passcode, setPasscode] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('alpino_admin_authorized');
    if (saved === 'true') {
      setIsAuthorized(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === PASSCODE) {
      setIsAuthorized(true);
      localStorage.setItem('alpino_admin_authorized', 'true');
      setError(false);
    } else {
      setError(true);
      setAttempts(prev => prev + 1);
      setPasscode('');
      // Shake effect timeout
      setTimeout(() => setError(false), 500);
    }
  };

  if (isAuthorized) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans selection:bg-red-600 selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-neutral-900/50 backdrop-blur-xl border border-white/5 p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />
        
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 bg-red-600/10 rounded-3xl flex items-center justify-center mb-6 border border-red-600/20">
            <ShieldCheck className="text-red-600" size={40} />
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">CAFE <span className="text-red-600">COMMAND</span></h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Authorization Required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <div className={`absolute -inset-1 bg-red-600 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition-opacity ${error ? 'opacity-40 blur-md' : ''}`} />
            <div className="relative">
              <input
                type="password"
                maxLength={4}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
                placeholder="ENTER 4-DIGIT KEY"
                className={`w-full bg-black border ${error ? 'border-red-600' : 'border-white/10'} rounded-2xl p-6 text-center text-2xl font-black tracking-[1em] focus:border-red-600 outline-none transition-all placeholder:text-[10px] placeholder:tracking-[0.5em] placeholder:text-white/10`}
                autoFocus
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10 pointer-events-none">
                <Lock size={20} />
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-center gap-2 text-red-600 text-[10px] font-black uppercase tracking-widest"
              >
                <ShieldAlert size={14} /> Access Denied. Integrity compromised.
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-black hover:text-red-600 border-2 border-red-600 py-6 rounded-2xl font-black italic uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group"
          >
            Log In <Zap size={20} className="group-hover:scale-125 transition-transform" />
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center gap-1 group">
            <Terminal size={16} className="text-white/20 group-hover:text-red-600 transition-colors" />
            <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Protocol: Encrypted</span>
          </div>
          <div className="flex flex-col items-center gap-1 group">
            <Zap size={16} className="text-white/20 group-hover:text-red-600 transition-colors" />
            <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Latency: Minimal</span>
          </div>
        </div>
        
        {attempts > 0 && (
          <div className="mt-6 text-center">
            <p className="text-[8px] font-black uppercase text-white/10 tracking-widest">
              Security Log: {attempts} Failed Attempts Recorded
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
