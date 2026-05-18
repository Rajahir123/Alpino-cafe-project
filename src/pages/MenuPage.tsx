import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { MENU_ITEMS } from '../constants';
import { MenuItem } from '../types';
import AssetImage from '../components/AssetImage';
import { motion } from 'motion/react';
import { Utensils, Zap, Salad, Coffee, Info, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'menu'));
        const menuData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as MenuItem)).filter(item => item.published); // Only live products
        setItems(menuData);
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const categories = ['All', ...new Set(items.map(item => item.category))];
  
  const filteredItems = activeCategory === 'All' 
    ? items 
    : items.filter(item => item.category === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-600 font-black italic uppercase animate-pulse tracking-widest">Igniting Fuel Log...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 selection:text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-600 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-6 text-xs font-black uppercase tracking-widest group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Base
            </Link>
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8] mb-4">
              THE <span className="text-red-600">FUEL</span> LOG
            </h1>
            <p className="text-white/40 font-black uppercase tracking-[0.3em] text-xs">High-performance nutrition for the modern athlete</p>
          </div>
          
          <div className="flex bg-neutral-900/80 backdrop-blur-xl border border-white/5 p-1 rounded-2xl md:self-end">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-white/40 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={item.id}
              className="group bg-neutral-900/40 border border-white/5 rounded-[3rem] overflow-hidden hover:border-red-600/30 transition-all duration-500 flex flex-col h-full"
            >
              <div className="relative aspect-square overflow-hidden bg-black/40">
                <AssetImage
                  assetName={item.name}
                  fallbackUrl={item.image || ''}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                <div className="absolute top-8 right-8">
                   <div className="bg-red-600 text-white px-4 py-2 rounded-xl font-black italic uppercase tracking-tighter text-xl shadow-2xl">
                     {item.protein}g P
                   </div>
                </div>
                <div className="absolute bottom-8 left-8">
                   <span className="bg-white/10 backdrop-blur-md text-white/60 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border border-white/5">
                     {item.category}
                   </span>
                </div>
              </div>

              <div className="p-10 flex-grow flex flex-col">
                <h3 className="text-2xl font-black italic uppercase leading-none mb-4 group-hover:text-red-600 transition-colors">
                  {item.name}
                </h3>
                <p className="text-white/40 text-sm font-medium leading-relaxed mb-8 flex-grow">
                  {item.description}
                </p>
                
                <div className="flex items-center justify-between pt-8 border-t border-white/5">
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Calories</span>
                      <span className="text-lg font-black italic">{item.calories} KCAL</span>
                   </div>
                   <Link 
                     to="/plans"
                     className="bg-white text-black px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 hover:text-white transition-all active:scale-95"
                   >
                     Order Now
                   </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-32 p-12 bg-neutral-900/20 border border-white/5 rounded-[4rem] text-center max-w-3xl mx-auto">
           <Zap className="text-red-600 mx-auto mb-6" size={40} />
           <h2 className="text-2xl font-black italic uppercase italic mb-4">Precision Nutrition</h2>
           <p className="text-white/40 text-sm leading-relaxed font-medium uppercase tracking-wide">
             Every meal is engineered with the exact macro ratios required for peak athletic output. 
             No fillers. No shortcuts. Just industrial-grade nourishment.
           </p>
        </div>
      </div>
    </div>
  );
}
