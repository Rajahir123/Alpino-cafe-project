import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, Target, Clock, Star, Info } from 'lucide-react';
import { MENU_ITEMS, PLANS } from '../constants';
import DynamicLogo from '../components/DynamicLogo';
import AssetImage from '../components/AssetImage';

export default function LandingPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  return (
    <div className="bg-black text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <Link to="/" className="hover:opacity-90 transition-opacity">
          <DynamicLogo />
        </Link>
        <div className="flex gap-6 items-center">
          <a href="#menu" className="text-sm font-medium hover:text-red-500 transition-colors uppercase tracking-widest">Menu</a>
          <a href="#plans" className="text-sm font-medium hover:text-red-500 transition-colors uppercase tracking-widest">Plans</a>
          <Link to="/login" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)]">
            Join Now
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.4),transparent_70%)]" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8 flex justify-center"
          >
            <div className="relative group">
               {/* Neon Logo Effect */}
               <div className="absolute -inset-2 bg-red-600 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
               <div className="relative bg-black border-4 border-red-600 p-8 rounded-2xl transform shadow-[0_0_50px_rgba(220,38,38,0.3)] rotate-[-2deg]">
                  <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
                    Alpino<br />
                    <span className="text-white">Protein</span><br />
                    <span className="text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">Cafe!</span>
                  </h1>
               </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-10 py-4 border-y border-white/5"
          >
            <span className="text-red-600 shadow-[0_0_10px_rgba(220,38,38,0.2)]">No Maida</span>
            <div className="w-1.5 h-1.5 bg-white/20 rotate-45" />
            <span className="text-red-600 shadow-[0_0_10px_rgba(220,38,38,0.2)]">No Palm Oil</span>
            <div className="w-1.5 h-1.5 bg-white/20 rotate-45" />
            <span className="text-red-600 shadow-[0_0_10px_rgba(220,38,38,0.2)]">No Artificial Colouring</span>
            <div className="w-1.5 h-1.5 bg-white/20 rotate-45" />
            <span className="text-red-600 shadow-[0_0_10px_rgba(220,38,38,0.2)]">No Refined Sugar</span>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-3xl text-white/50 max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
          >
            Just <span className="text-white font-black italic underline decoration-red-600 underline-offset-8">Pure Performance Fuel</span> for your body.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col md:flex-row gap-4 justify-center"
          >
            <Link to="/login" className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-xl text-lg font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group shadow-[0_4px_20px_rgba(220,38,38,0.4)]">
              Start Your Plan <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#menu" className="border-2 border-white/20 hover:border-red-600 hover:bg-red-600/10 px-10 py-4 rounded-xl text-lg font-black uppercase tracking-widest transition-all">
              View Menu
            </a>
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
            <div key={i} className="flex items-center gap-16">
              <div className="flex items-center gap-12">
                <span className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-black flex items-center gap-4">
                  Eat <span className="text-white">.</span>
                </span>
                <span className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-black flex items-center gap-4">
                  Train <span className="text-white">.</span>
                </span>
                <span className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-black flex items-center gap-4">
                  Repeat <span className="text-white">.</span>
                </span>
              </div>
              <div className="flex items-center gap-4 bg-black px-8 py-2 transform -skew-x-12">
                <span className="text-3xl md:text-6xl font-black italic uppercase tracking-tighter text-red-600">
                  With Alpino Protein Cafe
                </span>
                <Zap className="text-white fill-current" size={40} />
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
              viewport={{ once: true }}
            >
              <div className="inline-block bg-red-600 text-white px-4 py-1 skew-x-[-10deg] mb-6 font-bold uppercase tracking-widest text-sm">
                 The Alpino Way
              </div>
              <h2 className="text-4xl md:text-5xl font-black italic uppercase leading-tight mb-8">
                Clean eating shouldn't be a <span className="text-red-600">struggle.</span>
              </h2>
              <div className="space-y-6 text-lg text-black/70">
                <p>We believe that protein is the foundation of a healthy life, but finding delicious, high-protein meals that are actually healthy is hard.</p>
                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 p-2 rounded-lg text-red-600"><Zap size={20} /></div>
                    <div>
                      <div className="font-bold uppercase text-sm">High Protein</div>
                      <div className="text-xs">30g+ protein in every bowl</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 p-2 rounded-lg text-red-600"><Target size={20} /></div>
                    <div>
                      <div className="font-bold uppercase text-sm">Zero Junk</div>
                      <div className="text-xs">No refined sugar or oils</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-neutral-100 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center p-12">
                 {/* Visual Placeholder for high-protein food */}
                 <div className="text-center">
                   <div className="text-8xl mb-4">🥗</div>
                   <div className="text-4xl font-black italic uppercase text-red-600">38G PROTEIN</div>
                   <div className="text-black/50 font-bold">MUSCLE MANIA MAKHNI BOWL</div>
                 </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-red-600 text-white p-8 rounded-2xl shadow-xl transform rotate-3">
                <div className="text-4xl font-black">100%</div>
                <div className="uppercase font-bold tracking-widest text-sm text-white/80">Nutritious</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-24 bg-black overflow-hidden">
        <div className="container mx-auto px-6 mb-16 relative">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600/10 blur-[120px] rounded-full" />
          <div className="relative z-10">
            <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-4 leading-none text-white/10 absolute -top-12 left-0 select-none">
              Performance
            </h2>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-4 relative font-black italic uppercase italic tracking-tighter">
              The <span className="text-red-600">Alpino</span> Menu
            </h2>
            <p className="text-white/40 text-lg uppercase tracking-[0.4em] font-bold max-w-xl">
              Scientifically formulated fuel for your metabolism. 
              <span className="text-red-600 ml-2">Clean Ingredients Only.</span>
            </p>
          </div>
        </div>

        <div className="container mx-auto px-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-4 mb-20">
            {['All', 'Bowl', 'Smoothie', 'Wrap', 'Sub', 'Oats'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  selectedCategory === cat 
                  ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' 
                  : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat}s
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            <AnimatePresence mode="popLayout">
              {MENU_ITEMS.filter(item => selectedCategory === 'All' || item.category === selectedCategory).map((item) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={item.id}
                  className="group relative"
                >
                  {/* Image Container with Hover Effect */}
                  <div className="relative aspect-square mb-6 overflow-hidden rounded-3xl bg-neutral-900 border border-white/5 group-hover:border-red-600/30 transition-all duration-500">
                    <AssetImage 
                      assetName={item.name}
                      fallbackUrl={item.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800`}
                      alt={item.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                    
                    {/* Floating Price */}
                    <div className="absolute bottom-6 right-6 bg-red-600 text-white px-4 py-2 rounded-xl font-black text-xl shadow-xl transform rotate-3 group-hover:rotate-0 transition-transform">
                      ₹{item.price}
                    </div>

                    {/* Quick Nutrition Badges */}
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
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
              ))}
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
               whileHover={{ y: -10 }}
               className="bg-black border-4 border-white/5 rounded-3xl p-10 flex flex-col relative overflow-hidden"
            >
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
               whileHover={{ y: -10 }}
               className="bg-red-600 border-4 border-red-500 rounded-3xl p-10 flex flex-col relative overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.3)]"
            >
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
          </div>
          <div className="text-white/20 text-[10px] uppercase font-bold tracking-[0.2em]">
            © 2026 ALPINO PROTEIN CAFÉ. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  );
}
