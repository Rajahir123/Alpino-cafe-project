import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, ShieldCheck, Utensils, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminQuickNav() {
  const location = useLocation();
  
  const navItems = [
    { label: 'Hub', icon: <Zap size={18} />, path: '/hub' },
    { label: 'Admin', icon: <ShieldCheck size={18} />, path: '/admin' },
    { label: 'User', icon: <LayoutDashboard size={18} />, path: '/user-view' },
    { label: 'Kitchen', icon: <Utensils size={18} />, path: '/kitchen' },
    { label: 'Public', icon: <Home size={18} />, path: '/' },
  ];

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-neutral-900/80 backdrop-blur-xl border border-white/10 p-2 rounded-[2rem] shadow-2xl flex items-center gap-1"
    >
      <div className="px-4 py-2 flex items-center gap-2 border-r border-white/10 mr-1">
        <Zap size={14} className="text-red-600 fill-current" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Quick Access</span>
      </div>
      
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link 
            key={item.path}
            to={item.path}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300
              ${isActive 
                ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' 
                : 'text-white/40 hover:text-white hover:bg-white/5'}
            `}
          >
            {item.icon}
            <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">
              {item.label}
            </span>
          </Link>
        );
      })}
    </motion.div>
  );
}
