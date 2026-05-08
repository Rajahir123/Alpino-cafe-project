import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Mountain, Zap } from 'lucide-react';

interface DynamicLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function DynamicLogo({ size = 24, showText = true, className = "" }: DynamicLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogo() {
      try {
        const settingsRef = doc(db, 'settings', 'global');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          setLogoUrl(settingsSnap.data().logoUrl || null);
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
      }
    }
    fetchLogo();
  }, []);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <div style={{ width: size * 1.6, height: size * 1.6 }} className="bg-red-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)] overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt="Alpino" className="w-full h-full object-contain p-1" />
          ) : (
            <Mountain className="text-white fill-current" size={size} />
          )}
        </div>
        {!logoUrl && (
          <div className="absolute -right-1 -top-1 w-4 h-4 bg-white rounded-full flex items-center justify-center border-2 border-red-600">
            <Zap className="text-red-600 fill-current" size={size/3} />
          </div>
        )}
      </div>
      {showText && (
        <div className="flex flex-col -gap-1">
          <span className="font-black text-xl italic tracking-tighter uppercase leading-none">Alpino</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-red-600 leading-none">Protein Cafe</span>
        </div>
      )}
    </div>
  );
}
