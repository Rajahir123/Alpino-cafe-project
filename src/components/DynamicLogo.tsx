import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Mountain, Zap } from 'lucide-react';
import { getGoogleDriveDirectUrl } from '../lib/assets';
import { motion } from 'motion/react';

interface DynamicLogoProps {
  size?: number;
  showText?: boolean;
  showImage?: boolean;
  className?: string;
  textClassName?: string;
  layoutId?: string;
}

export default function DynamicLogo({ 
  size = 24, 
  showText = true, 
  showImage = true,
  className = "", 
  textClassName = "",
  layoutId
}: DynamicLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogo() {
      try {
        const settingsRef = doc(db, 'settings', 'global');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const url = settingsSnap.data().logoUrl || null;
          setLogoUrl(url ? getGoogleDriveDirectUrl(url) : null);
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
      }
    }
    fetchLogo();
  }, []);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showImage && (
        <motion.div 
          layoutId={layoutId}
          className="relative group/logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div style={{ width: size * 1.6, height: size * 1.6 }} className="flex items-center justify-center overflow-hidden relative">
            {logoUrl ? (
              <img src={logoUrl} alt="Alpino" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            ) : (
              <motion.div 
                className="bg-red-600 rounded-xl w-full h-full flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)] relative overflow-hidden"
                animate={{ 
                  boxShadow: [
                    "0 0 20px rgba(220,38,38,0.4)",
                    "0 0 40px rgba(220,38,38,0.6)",
                    "0 0 20px rgba(220,38,38,0.4)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Mountain className="text-white fill-current relative z-10" size={size} />
                {/* Internal Sweep effect */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full"
                  animate={{ translateX: ["100%", "-100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                />
              </motion.div>
            )}
          </div>
          {!logoUrl && (
            <motion.div 
              className="absolute -right-1 -top-1 w-4 h-4 bg-white rounded-full flex items-center justify-center border-2 border-red-600 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              animate={{ 
                scale: [1, 1.2, 1],
                filter: ["drop-shadow(0 0 2px #dc2626)", "drop-shadow(0 0 8px #dc2626)", "drop-shadow(0 0 2px #dc2626)"]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Zap className="text-red-600 fill-current" size={size/3} />
            </motion.div>
          )}
        </motion.div>
      )}
      {showText && (
        <motion.div 
          className={`flex flex-col -gap-1 md:-gap-1.5 ${textClassName}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.span 
            className="font-logo font-black text-xl md:text-5xl italic tracking-tighter uppercase leading-none text-white drop-shadow-[0_2px_15px_rgba(255,255,255,0.2)]"
            whileHover={{ skewX: -5 }}
          >
            Alpino
          </motion.span>
          <motion.span 
            className="font-logo text-[8px] md:text-xs font-black uppercase tracking-[0.6em] text-red-600 leading-none ml-1"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            Protein Cafe
          </motion.span>
        </motion.div>
      )}
    </div>
  );
}
