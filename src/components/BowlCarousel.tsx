import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { MENU_ITEMS, LANDING_PAGE_ITEM_NAMES } from '../constants';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { MenuItem } from '../types';
import AssetImage from './AssetImage';

export default function BowlCarousel() {
  const [firestoreItems, setFirestoreItems] = useState<MenuItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'menu'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFirestoreItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem)));
    });
    return () => unsubscribe();
  }, []);

  const bowls = useMemo(() => {
    return firestoreItems
      .filter(item => item.published)
      .filter(item => LANDING_PAGE_ITEM_NAMES.includes(item.name))
      .filter(item => item.category === 'Bowl');
  }, [firestoreItems]);

  useEffect(() => {
    if (bowls.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bowls.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bowls.length]);

  const next = () => bowls.length > 1 && setCurrentIndex((prev) => (prev + 1) % bowls.length);
  const prev = () => bowls.length > 1 && setCurrentIndex((prev) => (prev - 1 + bowls.length) % bowls.length);

  if (bowls.length === 0) return null;

  const currentItem = bowls[currentIndex];

  return (
    <div className="relative group overflow-hidden rounded-3xl bg-neutral-900 border border-white/5 shadow-2xl aspect-square flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => {
            if (info.offset.x < -100) next();
            else if (info.offset.x > 100) prev();
          }}
          initial={{ opacity: 0, scale: 0.9, x: 100, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.9, x: -100, rotate: -2 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            opacity: { duration: 0.4 }
          }}
          className="relative flex-grow cursor-grab active:cursor-grabbing h-full"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
          <AssetImage 
            assetName={currentItem.name}
            fallbackUrl={currentItem.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'}
            alt={currentItem.name}
            className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-[2000ms]"
          />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="bg-red-600 text-white px-3 py-1 rounded shadow-[0_0_15px_rgba(220,38,38,0.5)] text-[10px] font-black uppercase tracking-widest">
                High Protein
              </div>
              <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                Daily Fresh
              </div>
            </motion.div>
            
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-2xl md:text-3xl font-black italic uppercase text-white leading-tight mb-2 drop-shadow-lg"
            >
              {currentItem.name}
            </motion.h3>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 400, damping: 10 }}
              className="flex items-end gap-2"
            >
              <span className="text-4xl md:text-5xl font-black italic text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                {currentItem.protein}g
              </span>
              <span className="text-sm font-bold text-white/50 uppercase mb-2">Protein</span>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4 z-30 pointer-events-none">
        <button 
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="w-12 h-12 bg-black/50 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-red-600 hover:border-red-600 transition-all pointer-events-auto active:scale-90"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="w-12 h-12 bg-black/50 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-red-600 hover:border-red-600 transition-all pointer-events-auto active:scale-90"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Swipe Indicators */}
      <div className="absolute top-6 right-6 flex gap-2 z-30">
        {bowls.map((_, i) => (
          <div 
            key={i}
            className={`h-1.5 transition-all duration-500 rounded-full ${
              currentIndex === i ? 'w-8 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'w-2 bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Decorative Brand Accent */}
      <div className="absolute top-6 left-6 z-30 bg-black/40 backdrop-blur-sm p-2 rounded-lg border border-white/5">
        <Zap size={16} className="text-red-600 fill-current" />
      </div>
    </div>
  );
}
