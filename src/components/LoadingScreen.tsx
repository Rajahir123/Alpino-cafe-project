import { motion } from 'motion/react';
import { Utensils, Milk, Zap, Target, Mountain } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[100]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center space-y-8 max-w-md w-full px-6"
      >
        {/* Brand Section */}
        <div className="text-center">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ 
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            className="inline-flex flex-col items-center bg-red-600 text-white p-6 mb-4 transform -rotate-2 shadow-xl rounded-2xl"
          >
            <Mountain size={40} className="mb-2 fill-white" />
            <span className="text-3xl font-black tracking-tighter uppercase leading-none">
              Alpino
            </span>
            <div className="text-xs font-bold tracking-[0.3em] mt-1 border-t border-white/20 pt-1">
              PROTEIN CAFÉ
            </div>
          </motion.div>
        </div>

        {/* Visual Elements Grid */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {[
            { tag: 'Bowls', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop', icon: <Utensils size={12} /> },
            { tag: 'Smoothies', img: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=300&auto=format&fit=crop', icon: <Milk size={12} /> },
            { tag: 'Fuel', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=300&auto=format&fit=crop', icon: <Zap size={12} /> },
            { tag: 'Protein', img: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=300&auto=format&fit=crop', icon: <Target size={12} /> }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i + 0.2 }}
              className="aspect-square bg-gray-50 rounded-2xl flex flex-col items-center justify-center p-3 border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="relative w-full h-full rounded-xl overflow-hidden mb-2">
                 <img 
                  src={item.img} 
                  alt={item.tag}
                  className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[8px] uppercase tracking-widest">
                {item.icon}
                <span>{item.tag}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Loading Progress Bar */}
        <div className="w-full pt-8">
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ 
                duration: 2.5,
                repeat: Infinity,
                ease: "linear"
              }}
              className="h-full bg-red-600"
            />
          </div>
          <p className="text-gray-400 text-[10px] font-mono mt-3 text-center uppercase tracking-[0.2em]">
            Fueling your potential...
          </p>
        </div>
      </motion.div>
    </div>
  );
}
