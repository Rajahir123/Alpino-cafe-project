import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, ShieldCheck, Utensils, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminQuickNav() {
  const location = useLocation();
  
  const navItems = [
    { label: 'Hub', icon: <Zap size={15} />, path: '/hub' },
    { label: 'Admin', icon: <ShieldCheck size={15} />, path: '/admin' },
    { label: 'User', icon: <LayoutDashboard size={15} />, path: '/user-view' },
    { label: 'Kitchen', icon: <Utensils size={15} />, path: '/kitchen' },
    { label: 'Public', icon: <Home size={15} />, path: '/' },
  ];

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] bg-white/70 backdrop-blur-xl border border-white/50 p-1.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex items-center gap-0.5"
    >
      <div className="px-3 py-1.5 flex items-center gap-1.5 border-r border-black/10 mr-1 ml-1">
        <Zap size={12} className="text-red-600 fill-current" />
        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Quick Access</span>
      </div>
      
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link 
            key={item.path}
            to={item.path}
            className={`
              flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all duration-300
              ${isActive 
                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-black/5'}
            `}
          >
            {item.icon}
            <span className="text-[9px] font-black uppercase tracking-widest hidden md:block">
              {item.label}
            </span>
          </Link>
        );
      })}
    </motion.div>
  );
}
