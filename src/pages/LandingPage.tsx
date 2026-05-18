import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, Target, Clock, Star, Info } from 'lucide-react';
import { MENU_ITEMS, PLANS, LANDING_PAGE_ITEM_NAMES } from '../constants';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { MenuItem } from '../types';
import DynamicLogo from '../components/DynamicLogo';
import AssetImage from '../components/AssetImage';
import BowlCarousel from '../components/BowlCarousel';

export default function LandingPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [scrolled, setScrolled] = useState(false);
  const [firestoreItems, setFirestoreItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'menu'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFirestoreItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem)));
    });
    return () => unsubscribe();
  }, []);

  const allMenuItems = useMemo(() => {
    const combined = [...MENU_ITEMS];
    firestoreItems.forEach(fi => {
       const index = combined.findIndex(ci => ci.id === fi.id);
       if (index >= 0) {
         combined[index] = { ...combined[index], ...fi };
       } else {
         combined.push(fi);
       }
    });
    // Filter out unpublished items from firestore
    return combined.filter(item => {
      const fromFirestore = firestoreItems.find(fi => fi.id === item.id);
      if (fromFirestore) {
        return fromFirestore.published;
      }
      return true; // Keep static items published by default
    });
  }, [firestoreItems]);

  const landingPageItems = useMemo(() => {
    return allMenuItems.filter(item => 
      LANDING_PAGE_ITEM_NAMES.includes(item.name) || 
      firestoreItems.some(fi => fi.id === item.id)
    );
  }, [allMenuItems, firestoreItems]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="bg-black text-white"
    >
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${
        scrolled ? 'bg-black/80 backdrop-blur-xl py-3 border-b border-white/10 shadow-2xl' : 'bg-transparent py-4 md:py-12 border-transparent'
      } px-4 md:px-12 flex justify-between items-center`}>
        <Link to="/" className="hover:opacity-90 transition-all duration-500 flex-shrink-0 flex items-center relative h-10 md:h-12">
          {!scrolled ? (
            <motion.div
              layoutId="logo-text-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center"
            >
              <DynamicLogo showImage={false} size={36} />
            </motion.div>
          ) : (
            <motion.div
              layoutId="main-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 30
              }}
              className="flex items-center"
            >
              <DynamicLogo showText={false} size={32} />
            </motion.div>
          )}
        </Link>
        <div className="flex gap-2 md:gap-10 items-center">
          <Link to="/menu" className="hidden lg:block text-xs font-black hover:text-red-500 transition-colors uppercase tracking-[0.3em]">Menu</Link>
          <a href="#plans" className="hidden lg:block text-xs font-black hover:text-red-500 transition-colors uppercase tracking-[0.3em]">Plans</a>
          <Link to="/login" className={`hidden md:block bg-transparent hover:bg-white/10 text-white rounded-xl text-[10px] md:text-sm font-black uppercase tracking-[0.2em] transition-all border border-white/20 hover:border-white/50 ${
            scrolled ? 'px-4 py-2' : 'px-6 py-3'
          }`}>
            Admin Login
          </Link>
          <Link to="/login" className={`bg-red-600 hover:bg-red-700 text-white rounded-xl text-[8px] md:text-sm font-black uppercase tracking-[0.2em] transition-all shadow-[0_4px_25px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-95 ${
            scrolled ? 'px-3 md:px-8 py-2 md:py-3' : 'px-4 md:px-10 py-2.5 md:py-4'
          }`}>
            Join Now
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] md:h-screen flex items-center justify-center pt-28 md:pt-20 overflow-hidden">
        <motion.div 
          className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.4),transparent_70%)]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ 
              opacity: 1, 
              scale: [1, 1.02, 1],
              rotate: [0, -1, 1, 0],
              y: [0, -15, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.5, 1],
              opacity: { duration: 1.2, delay: 0.2 }
            }}
            className="mb-12 md:mb-16 flex justify-center"
          >
              <div className="relative group cursor-pointer active:scale-95 transition-transform duration-500">
                <AnimatePresence>
                 {!scrolled && (
                   <motion.div
                     key="hero-logo-container"
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                     className="relative"
                   >
                     {/* Kinetic Energy Rings */}
                     <motion.div 
                       animate={{ 
                         scale: [1, 1.5], 
                         opacity: [0.3, 0],
                         borderWidth: ["2px", "0px"]
                       }}
                       transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                       className="absolute inset-0 border-2 border-red-600 rounded-full -z-10"
                     />
                     <motion.div 
                       animate={{ 
                         scale: [1, 1.8], 
                         opacity: [0.2, 0],
                         borderWidth: ["1px", "0px"]
                       }}
                       transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                       className="absolute inset-0 border border-red-500 rounded-full -z-10"
                     />
                     
                     {/* Atmospheric Glow */}
                     <div className="absolute -inset-10 md:-inset-20 bg-red-600/20 rounded-full blur-[60px] md:blur-[100px] group-hover:bg-red-600/30 transition-colors duration-1000" />
                     
                     <DynamicLogo 
                      layoutId="main-logo"
                      size={window.innerWidth < 768 ? 100 : 180} 
                      showText={false} 
                      className="justify-center relative z-10 filter drop-shadow-[0_0_50px_rgba(220,38,38,0.5)] transform md:hover:scale-110 transition-all duration-700" 
                     />
                   </motion.div>
                 )}
                </AnimatePresence>
              </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-x-3 md:gap-x-6 gap-y-2 md:gap-y-3 text-[7px] md:text-xs font-black uppercase tracking-[0.1em] md:tracking-[0.3em] mb-8 py-4 border-y border-white/5"
          >
            <span className="text-red-600 shadow-[0_0_10px_rgba(220,38,38,0.2)]">No Maida</span>
            <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-white/20 rotate-45" />
            <span className="text-red-600 shadow-[0_0_10px_rgba(220,38,38,0.2)]">No Palm Oil</span>
            <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-white/20 rotate-45" />
            <span className="text-red-600 shadow-[0_0_10px_rgba(220,38,38,0.2)]">No Artificial</span>
            <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-white/20 rotate-45" />
            <span className="text-red-600 shadow-[0_0_10px_rgba(220,38,38,0.2)]">No Sugar</span>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-sm md:text-3xl text-white/50 max-w-2xl mx-auto mb-10 font-medium leading-relaxed px-4 md:px-0"
          >
            Just <span className="text-white font-black italic underline decoration-red-600 underline-offset-8">Pure Performance Fuel</span> for your body.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col md:flex-row gap-3 justify-center px-10 md:px-0"
          >
            <Link to="/login" className="bg-red-600 hover:bg-red-700 text-white px-6 md:px-10 py-3.5 md:py-4 rounded-xl text-xs md:text-lg font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group shadow-[0_4px_20px_rgba(220,38,38,0.4)]">
              Start Your Plan <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/menu" className="border-2 border-white/20 hover:border-red-600 hover:bg-red-600/10 px-6 md:px-10 py-3 md:py-4 rounded-xl text-xs md:text-lg font-black uppercase tracking-widest transition-all">
              View Menu
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Kinetic Slogan Ticker */}
      <div className="relative z-20 bg-red-600 border-y-8 border-black py-8 overflow-hidden select-none">
        <motion.div 
          animate={{ x: [0, -2800] }}
          transition={{ 
            duration: 40, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex whitespace-nowrap gap-16 items-center"
        >
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 md:gap-16">
              <div className="flex items-center gap-8 md:gap-12">
                <span className="text-3xl md:text-8xl font-black italic uppercase tracking-tighter text-black flex items-center gap-2 md:gap-4">
                  Eat <span className="text-white">.</span>
                </span>
                <span className="text-3xl md:text-8xl font-black italic uppercase tracking-tighter text-black flex items-center gap-2 md:gap-4">
                  Train <span className="text-white">.</span>
                </span>
                <span className="text-3xl md:text-8xl font-black italic uppercase tracking-tighter text-black flex items-center gap-2 md:gap-4">
                  Repeat <span className="text-white">.</span>
                </span>
              </div>
              <div className="flex items-center gap-3 md:gap-4 bg-black px-4 md:px-8 py-1 md:py-2 transform -skew-x-12">
                <span className="text-xl md:text-6xl font-black italic uppercase tracking-tighter text-red-600">
                  With Alpino Protein Cafe
                </span>
                <Zap className="text-white fill-current" size={24} />
              </div>
            </div>
          ))}
        </motion.div>
        
        {/* Decorative Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
      </div>

      {/* About Section */}
      <section className="py-24 bg-white text-black relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-block bg-red-600 text-white px-4 py-1 skew-x-[-10deg] mb-6 font-bold uppercase tracking-widest text-sm"
              >
                 The Alpino Way
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-black italic uppercase leading-tight mb-8">
                Clean eating shouldn't be a <span className="text-red-600">struggle.</span>
              </h2>
              <div className="space-y-6 text-lg text-black/70">
                <p>We believe that protein is the foundation of a healthy life, but finding delicious, high-protein meals that are actually healthy is hard.</p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="flex items-start gap-3"
                  >
                    <div className="bg-red-100 p-2 rounded-lg text-red-600"><Zap size={20} /></div>
                    <div>
                      <div className="font-bold uppercase text-sm">High Protein</div>
                      <div className="text-xs">30g+ protein in every bowl</div>
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="flex items-start gap-3"
                  >
                    <div className="bg-red-100 p-2 rounded-lg text-red-600"><Target size={20} /></div>
                    <div>
                      <div className="font-bold uppercase text-sm">Zero Junk</div>
                      <div className="text-xs">No refined sugar or oils</div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <BowlCarousel />
              <div className="absolute -bottom-6 -right-6 bg-red-600 text-white p-8 rounded-2xl shadow-[0_10px_40px_rgba(220,38,38,0.4)] transform rotate-3 z-30">
                <div className="text-4xl font-black">100%</div>
                <div className="uppercase font-bold tracking-widest text-sm text-white/80">Nutritious</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-16 md:py-24 bg-black overflow-hidden border-t border-white/5">
        <div className="container mx-auto px-6 mb-12 md:mb-16 relative">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600/10 blur-[120px] rounded-full" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-8xl font-black italic uppercase tracking-tighter mb-4 leading-none text-white/5 absolute -top-4 md:-top-12 left-0 select-none">
              Performance
            </h2>
            <h2 className="text-2xl md:text-7xl font-black italic uppercase tracking-tighter mb-4 relative">
              The <span className="text-red-600">Alpino</span> Menu
            </h2>
            <p className="text-white/40 text-xs md:text-lg uppercase tracking-[0.1em] md:tracking-[0.4em] font-bold max-w-xl">
              Scientifically formulated fuel.
              <span className="text-red-600 ml-2">Clean Ingredients Only.</span>
            </p>
          </div>
        </div>

        <div className="container mx-auto px-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 md:gap-4 mb-16 relative z-40">
            {['All', 'Bowl', 'Smoothie', 'Shake', 'Wrap', 'Sub', 'Oats']
              .filter(cat => {
                if (cat === 'All') return true;
                return landingPageItems.some(item => item.category === cat);
              })
              .map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  console.log('Category changed to:', cat);
                  setSelectedCategory(cat);
                }}
                className={`relative px-5 md:px-10 py-3 md:py-5 rounded-xl md:rounded-2xl text-[9px] md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.4em] transition-all duration-300 cursor-pointer active:scale-95 group ${
                  selectedCategory === cat 
                  ? 'text-white' 
                  : 'text-white/40 hover:text-white'
                }`}
              >
                {/* Active Background Glitch Effect */}
                {selectedCategory === cat && (
                  <motion.div 
                    layoutId="active-cat-bg"
                    className="absolute inset-0 bg-red-600 rounded-xl md:rounded-2xl -z-10 shadow-[0_15px_40px_rgba(220,38,38,0.4)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 transition-transform duration-300 group-hover:translate-y-[-1px]">
                  {cat === 'All' ? 'All' : `${cat}s`}
                </span>
                
                {/* Invisible stroke for hover stability */}
                <div className={`absolute inset-0 border-2 rounded-xl md:rounded-2xl transition-colors duration-300 ${
                  selectedCategory === cat ? 'border-red-600' : 'border-white/10 group-hover:border-white/20'
                }`} />
              </button>
            ))}
          </div>

          <div className="relative min-h-[600px]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)', scale: 0.95 }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                exit={{ opacity: 0, y: -30, filter: 'blur(10px)', scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16"
              >
                {landingPageItems
                  .filter(item => selectedCategory === 'All' || item.category === selectedCategory)
                  .map((item, idx) => {
                    const bgUrl = item.bgImage || null;
                    const spinningUrl = item.spinningImage || null;

                    return (
                      <motion.div 
                        layout
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover="hover"
                        className="group relative"
                      >
                        <motion.div 
                          variants={{ 
                            hover: { 
                              y: -12,
                              transition: { duration: 0.4, ease: "easeOut" }
                            } 
                          }}
                          className="relative z-10"
                        >
                          {/* Image Container Frame */}
                          <div className="relative aspect-square mb-6 rounded-3xl bg-neutral-900 border border-white/5 group-hover:border-red-600/30 transition-all duration-500 shadow-2xl flex items-center justify-center overflow-hidden">
                            {/* Static Background Image layer - High Visibility */}
                            <div className="absolute inset-0 z-0">
                              {bgUrl ? (
                                <img 
                                  src={bgUrl} 
                                  alt="" 
                                  className="w-full h-full object-cover transition-all duration-700 opacity-90 group-hover:opacity-100" 
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <AssetImage 
                                  assetName={item.name}
                                  fallbackUrl={item.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800`}
                                  alt=""
                                  className="w-full h-full object-cover transition-all duration-700 opacity-90 group-hover:opacity-100"
                                />
                              )}
                            </div>

                            {/* Subtle Glow on hover */}
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl z-10" />
                            
                            {/* Perfectly Cropped Bowl (Spinning) - Deep Crop & Tight Frame */}
                            <motion.div
                              className="relative w-[75%] h-[75%] rounded-full overflow-hidden border-[4px] border-white/70 shadow-[0_60px_120px_rgba(0,0,0,1)] z-20"
                              variants={{
                                hover: { 
                                  rotate: (item.category === 'Shake' || item.category === 'Smoothie') ? 0 : 360,
                                  scale: 1.1,
                                  transition: { 
                                    rotate: { 
                                      duration: (item.category === 'Shake' || item.category === 'Smoothie') ? 0 : 12, 
                                      repeat: (item.category === 'Shake' || item.category === 'Smoothie') ? 0 : Infinity, 
                                      ease: "linear" 
                                    },
                                    scale: { 
                                      duration: 0.4,
                                      repeat: (item.category === 'Shake' || item.category === 'Smoothie') ? Infinity : 0,
                                      repeatType: "reverse"
                                    }
                                  }
                                }
                              }}
                            >
                              {spinningUrl ? (
                                <img 
                                  src={spinningUrl} 
                                  alt={item.name} 
                                  className={`w-full h-full object-cover transform ${(item.category === 'Shake' || item.category === 'Smoothie') ? 'scale-105' : 'scale-125'}`}
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <AssetImage 
                                  assetName={item.name}
                                  fallbackUrl={item.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800`}
                                  alt={item.name}
                                  className={`w-full h-full object-cover transform ${(item.category === 'Shake' || item.category === 'Smoothie') ? 'scale-105' : 'scale-125'}`}
                                />
                              )}
                            </motion.div>
                        
                        {/* Minimal Shadow Overlay for text depth */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)] pointer-events-none z-30 opacity-40 group-hover:opacity-20 transition-opacity" />
                        
                        {/* Floating Price */}
                        <div className="absolute bottom-6 right-6 bg-red-600 text-white px-4 py-2 rounded-xl font-black text-xl shadow-xl transform rotate-3 group-hover:rotate-0 transition-transform z-40">
                          ₹{item.price}
                        </div>

                        {/* Quick Nutrition Badges */}
                        <div className="absolute top-6 left-6 flex flex-col gap-2 z-40">
                           <div className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                              <span className="text-[10px] font-black uppercase text-red-600 tracking-tighter">Protein</span>
                              <div className="text-sm font-black text-white">{item.protein}g</div>
                           </div>
                        </div>
                      </div>

                    {/* Text Content */}
                    <div className="px-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-px bg-red-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-600">
                          {item.category}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black italic uppercase italic tracking-tighter mb-3 group-hover:text-red-500 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-white/40 text-sm font-medium leading-relaxed mb-6 line-clamp-2">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-bold uppercase text-white/30 tracking-widest text-[8px]">Energy</span>
                            <span className="text-xs font-black text-white/80">{item.calories} kcal</span>
                          </div>
                        </div>
                        <Link to="/login" className="bg-white/5 hover:bg-red-600 hover:text-white p-3 rounded-xl transition-all border border-white/5 hover:border-red-600 group-hover:translate-x-2">
                          <ChevronRight size={20} />
                        </Link>
                      </div>
                    </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="mt-24 relative">
             <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-white/5"></div>
             </div>
             <div className="relative flex justify-center">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-black px-12 border-2 border-red-600 rounded-2xl py-8 text-center max-w-2xl"
                >
                  <h4 className="text-3xl font-black italic uppercase italic tracking-tighter mb-4">Want a Custom Meal Plan?</h4>
                  <p className="text-white/50 mb-8 font-medium">Join our PRO Plan for personalized macros, automated tracking, and weekly nutrition consultations.</p>
                  <Link to="/login" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                    Get Started Now
                  </Link>
                </motion.div>
             </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-24 bg-neutral-900 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-black italic uppercase mb-4">Choose Your <span className="text-red-600">Routine</span></h2>
            <div className="flex justify-center gap-4 text-sm font-bold uppercase tracking-widest mb-12">
               <span className="flex items-center gap-1 text-red-500"><Star size={14} fill="currentColor" /> Premium Ingredients</span>
               <span className="flex items-center gap-1 border-l border-white/10 pl-4"><Clock size={14} /> Flexible Delivery</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Trial Plan */}
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               whileHover={{ y: -15, scale: 1.02 }}
               transition={{ duration: 0.4, ease: "easeOut" }}
               className="bg-neutral-950 border-4 border-white/5 rounded-[40px] p-10 flex flex-col relative overflow-hidden group/plan shadow-2xl"
            >
               <motion.div 
                 className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover/plan:opacity-100 transition-all duration-700"
               />
               {/* Animated Shimmer */}
               <motion.div 
                 className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -skew-x-45"
                 animate={{ left: ['-100%', '200%'] }}
                 transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
               />
               <div className="absolute top-0 right-0 bg-white text-black font-black px-6 py-2 rotate-45 translate-x-8 translate-y-4 uppercase text-xs tracking-widest">Starter</div>
               <h3 className="text-3xl font-black italic uppercase mb-2">Trial Plan</h3>
               <p className="text-white/50 mb-8 font-medium">5-Day Starter with fixed menu for testing the waters.</p>
               
               <div className="space-y-4 mb-10 flex-grow">
                 {PLANS.filter(p => p.type === 'trial').map(p => (
                   <div key={p.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                      <div className="font-bold text-sm uppercase tracking-wide">{p.includes.join(' + ')}</div>
                      <div className="text-red-500 font-black text-xl">₹{p.price}</div>
                   </div>
                 ))}
               </div>

               <Link to="/login" className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors text-center">
                 Join Trial
               </Link>
            </motion.div>

            {/* Pro Plan */}
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               whileHover={{ y: -15, scale: 1.02 }}
               transition={{ duration: 0.4, ease: "easeOut" }}
               className="bg-red-600 border-4 border-red-500 rounded-[40px] p-10 flex flex-col relative overflow-hidden shadow-[0_0_60px_rgba(220,38,38,0.4)] group/plan"
            >
               <motion.div 
                 className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent opacity-0 group-hover/plan:opacity-100 transition-all duration-700"
               />
               <motion.div 
                 className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-45"
                 animate={{ left: ['-100%', '200%'] }}
                 transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
               />
               <div className="absolute top-0 right-0 bg-black text-white font-black px-6 py-2 rotate-45 translate-x-8 translate-y-4 uppercase text-xs tracking-widest">Elite</div>
               <h3 className="text-3xl font-black italic uppercase mb-2">Pro Plan</h3>
               <p className="text-white/80 mb-8 font-medium text-lg">20-Day Routine for dedicated athletes and busy professionals.</p>
               
               <div className="space-y-4 mb-10 flex-grow text-black">
                 {PLANS.filter(p => p.type === 'pro').map(p => (
                   <div key={p.id} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-lg border-2 border-black/5">
                      <div className="font-bold text-sm uppercase tracking-wide">{p.includes.join(' + ')}</div>
                      <div className="text-red-600 font-black text-xl">₹{p.price}</div>
                   </div>
                 ))}
               </div>

               <Link to="/login" className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-neutral-900 transition-colors text-center">
                 Go Pro Today
               </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-white/5">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            <DynamicLogo size={32} />
          </div>
          <p className="text-white/40 max-w-md mx-auto mb-8 font-medium">Fueled by protein, driven by results. Join the revolution of clean eating.</p>
          <div className="flex justify-center gap-8 text-white/60 mb-8">
            <a href="#" className="hover:text-red-500 font-bold uppercase text-xs tracking-widest">Instagram</a>
            <a href="#" className="hover:text-red-500 font-bold uppercase text-xs tracking-widest">Twitter</a>
            <a href="#" className="hover:text-red-500 font-bold uppercase text-xs tracking-widest">Facebook</a>
            <Link to="/login" className="hover:text-red-500 font-bold uppercase text-xs tracking-widest">Admin Login</Link>
          </div>
          <div className="text-white/20 text-[10px] uppercase font-bold tracking-[0.2em]">
            © 2026 ALPINO PROTEIN CAFÉ. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
