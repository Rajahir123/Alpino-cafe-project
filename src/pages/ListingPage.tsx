import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, Utensils, Home, Zap, ChevronRight, User as UserIcon } from 'lucide-react';

export default function ListingPage() {
  const sections = [
    {
      title: 'Site Control',
      description: 'Manage menu, payments, and system settings.',
      path: '/admin',
      icon: <ShieldCheck size={32} />,
      color: 'bg-red-600',
      tag: 'Restricted'
    },
    {
      title: 'Kitchen Ops',
      description: 'Monitor orders and delivery status real-time.',
      path: '/kitchen',
      icon: <Utensils size={32} />,
      color: 'bg-neutral-800',
      tag: 'Active'
    },
    {
      title: 'User Portal',
      description: 'View the application from a members perspective.',
      path: '/user-view',
      icon: <LayoutDashboard size={32} />,
      color: 'bg-neutral-800',
      tag: 'Management'
    },
    {
      title: 'Public Site',
      description: 'The main landing page and sales funnel.',
      path: '/',
      icon: <Home size={32} />,
      color: 'bg-neutral-800',
      tag: 'Public'
    }
  ];

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6 font-sans selection:bg-red-600 selection:text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-[2px] bg-red-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Alpino Systems</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase italic tracking-tighter">
              HUB <span className="text-red-600">CENTER</span>
            </h1>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
             <div className="text-right">
                <div className="text-[10px] font-black uppercase text-white/20 tracking-widest">Protocol</div>
                <div className="text-sm font-black text-white/60">SECURE SHELL V2</div>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-red-600">
                <Zap size={20} className="fill-current" />
             </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sections.map((section, idx) => (
            <motion.div
              key={section.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link 
                to={section.path}
                className="block group h-full"
              >
                <div className="relative h-full bg-neutral-900 border border-white/5 p-8 rounded-[2.5rem] hover:border-red-600/30 transition-all duration-500 overflow-hidden flex flex-col items-start text-left">
                  <div className={`absolute top-0 right-0 w-32 h-32 ${section.color} opacity-5 blur-[60px] group-hover:opacity-10 transition-opacity`} />
                  
                  <div className={`w-16 h-16 ${section.color}/10 rounded-2xl flex items-center justify-center text-white mb-8 border border-white/5 group-hover:scale-110 transition-transform duration-500`}>
                     {section.icon}
                  </div>
                  
                  <div className="mb-8 flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase text-red-600 tracking-widest">{section.tag}</span>
                    </div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4 group-hover:text-red-600 transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-white/30 text-xs font-bold leading-relaxed uppercase tracking-wider">
                      {section.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-colors mt-auto">
                    Access Portal <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Corner indicator */}
                  <div className="absolute top-8 right-8 text-white/5 group-hover:text-red-600/20 transition-colors">
                    <Zap size={40} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">All Systems Operational</span>
           </div>
           <div className="flex gap-8">
              <div className="flex flex-col items-center gap-1 group">
                <span className="text-[8px] font-black uppercase text-white/10 tracking-widest">Integrity Check</span>
                <span className="text-xs font-black text-white/30">PASSED</span>
              </div>
              <div className="flex flex-col items-center gap-1 group">
                <span className="text-[8px] font-black uppercase text-white/10 tracking-widest">Access Mode</span>
                <span className="text-xs font-black text-white/30">OVERRIDE</span>
              </div>
           </div>
        </div>
      </div>
      
      {/* Decorative background element */}
      <div className="fixed bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-red-600/5 to-transparent pointer-events-none -z-10" />
    </div>
  );
}
