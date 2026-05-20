import { useState, useEffect } from 'react';
import { PLANS } from '../constants';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc, setDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Star, Zap, ChevronRight, Fuel, ShieldCheck } from 'lucide-react';

export default function PlanSelection() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [checkingIntent, setCheckingIntent] = useState(true);

  useEffect(() => {
    const handleIntent = async () => {
      const intent = sessionStorage.getItem('plan_intent');
      if (intent && profile && !saving) {
        sessionStorage.removeItem('plan_intent');
        await handleSelectPlan(intent);
      }
      setCheckingIntent(false);
    };
    handleIntent();
  }, [profile]);

  const handleSelectPlan = async (planId: string) => {
    if (!profile) {
      // Store intent and redirect to login
      sessionStorage.setItem('plan_intent', planId);
      navigate('/login');
      return;
    }
    
    try {
      setSaving(true);
      // Set plan selection and status to pending
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        planId: planId,
        planStatus: 'pending',
        updatedAt: Timestamp.now()
      });

      // Create a payment record
      const selectedPlan = PLANS.find(p => p.id === planId);
      const paymentId = `pay_${Date.now()}`;
      const paymentRef = doc(db, 'payments', paymentId);
      await setDoc(paymentRef, {
        id: paymentId,
        userId: profile.uid,
        userName: profile.name,
        userEmail: profile.email,
        planId: planId,
        planName: selectedPlan?.name,
        amount: selectedPlan?.price,
        status: 'pending',
        createdAt: Timestamp.now()
      });

      navigate('/payment');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'Plan Selection Action');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-28 pb-20 px-6 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.05),transparent_50%)]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 px-4 py-2 rounded-full mb-4"
          >
            <ShieldCheck className="text-red-600" size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">Alpino Purity System</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
            Choose Your <span className="text-red-600">Protocol</span>
          </h1>
          <p className="text-white/30 text-sm md:text-base uppercase tracking-[0.4em] font-black max-w-2xl mx-auto">
            PRECISION NUTRITION FOR ELITE PERFORMANCE
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
           {/* Section 1: Trial */}
           <div className="space-y-8">
             <div className="flex items-center justify-between border-b border-white/5 pb-4">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-red-600 transition-colors">
                   <Zap className="text-red-600" size={20} />
                 </div>
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter">Trial Phase <span className="text-white/20 ml-2">5 Days</span></h2>
               </div>
               <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Starter Extraction</span>
             </div>
             
             <div className="space-y-4">
               {PLANS.filter(p => p.type === 'trial').map(plan => (
                 <motion.div 
                   key={plan.id}
                   whileHover={{ x: 10 }}
                   className="bg-neutral-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] cursor-pointer hover:border-red-600/50 hover:bg-neutral-900 transition-all flex justify-between items-center group relative overflow-hidden"
                   onClick={() => handleSelectPlan(plan.id)}
                 >
                   <div className="relative z-10">
                     <h3 className="font-black uppercase tracking-wider text-white/80 group-hover:text-white transition-colors mb-2 italic">{plan.name.split(':')[1].trim()}</h3>
                     <div className="flex items-center gap-3">
                        <div className="flex -space-x-1">
                          {plan.includes.map(inc => (
                             <div key={inc} className="w-2 h-2 bg-red-600 rounded-full border border-black" />
                          ))}
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/20">{plan.description}</p>
                     </div>
                   </div>
                   <div className="text-right relative z-10">
                     <div className="text-2xl font-black italic text-white group-hover:text-red-600 transition-colors">₹{plan.price}</div>
                     <div className="flex items-center justify-end gap-2 text-[9px] font-black uppercase tracking-widest text-white/10 group-hover:text-red-600/50">
                        Select <ChevronRight size={10} />
                     </div>
                   </div>
                 </motion.div>
               ))}
             </div>
           </div>

           {/* Section 2: Pro */}
           <div className="space-y-8">
             <div className="flex items-center justify-between border-b border-white/5 pb-4">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                   <Star className="text-white" size={20} fill="currentColor" />
                 </div>
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter">Pro Protocol <span className="text-red-600/40 ml-2">20 Days</span></h2>
               </div>
               <span className="text-[8px] font-black uppercase tracking-widest text-red-600/40">Elite Execution</span>
             </div>

             <div className="space-y-4">
               {PLANS.filter(p => p.type === 'pro').map(plan => (
                 <motion.div 
                   key={plan.id}
                   whileHover={{ x: -10 }}
                   className="bg-red-600 p-7 rounded-[2rem] cursor-pointer hover:bg-black hover:border-red-600 border-2 border-transparent transition-all flex justify-between items-center group relative overflow-hidden shadow-2xl shadow-red-600/20"
                   onClick={() => handleSelectPlan(plan.id)}
                 >
                   <div className="absolute right-0 top-0 opacity-10 -translate-y-4 translate-x-4">
                     <Fuel size={120} />
                   </div>
                   <div className="relative z-10">
                     <h3 className="font-black uppercase tracking-wider text-white group-hover:text-red-600 transition-colors mb-2 italic text-lg">{plan.name.split(':')[1].trim()}</h3>
                     <div className="flex items-center gap-3">
                        <div className="px-2 py-1 bg-white/20 rounded-md">
                          <Check size={10} className="text-white" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white/40">{plan.description}</p>
                     </div>
                   </div>
                   <div className="text-right relative z-10">
                     <div className="text-3xl font-black italic text-white group-hover:text-red-600 transition-colors">₹{plan.price}</div>
                     <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-red-600">
                        Activate <Check size={12} />
                     </div>
                   </div>
                 </motion.div>
               ))}
             </div>
           </div>
        </div>

        <div className="mt-20 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10 animate-pulse">
             [ ALL PROTOCOLS INCLUDE BIO-ACTIVE PROTEIN OPTIMIZATION ]
           </p>
        </div>
      </div>
    </div>
  );
}
