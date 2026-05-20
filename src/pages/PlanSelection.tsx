import { useState } from 'react';
import { PLANS } from '../constants';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc, setDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, Star, Zap } from 'lucide-react';

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
      // If paymentRef exists, we might want to check which one failed, but generally a permissions error here is what we're looking for
      handleFirestoreError(error, OperationType.WRITE, 'Plan Selection Action');
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black italic uppercase italic tracking-tighter mb-4">Choose Your <span className="text-red-600">Goal</span></h1>
          <p className="text-white/50 text-lg uppercase tracking-widest font-bold">Select a routine that fits your lifestyle</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
           {/* Section 1: Trial */}
           <div className="space-y-6">
             <div className="flex items-center gap-3 mb-6">
               <Zap className="text-red-600" size={24} />
               <h2 className="text-2xl font-black uppercase italic tracking-tighter">Trial Plans (5 Days)</h2>
             </div>
             {PLANS.filter(p => p.type === 'trial').map(plan => (
               <motion.div 
                 key={plan.id}
                 whileHover={{ scale: 1.02 }}
                 className="bg-neutral-900 border border-white/10 p-6 rounded-2xl cursor-pointer hover:border-red-600 transition-all flex justify-between items-center group"
                 onClick={() => handleSelectPlan(plan.id)}
               >
                 <div>
                   <h3 className="font-bold uppercase tracking-wide group-hover:text-red-600 transition-colors">{plan.includes.join(' + ')}</h3>
                   <p className="text-xs text-white/50">{plan.description}</p>
                 </div>
                 <div className="text-right">
                   <div className="text-xl font-black italic">₹{plan.price}</div>
                   <div className="text-[10px] uppercase font-bold text-red-600">Starter</div>
                 </div>
               </motion.div>
             ))}
           </div>

           {/* Section 2: Pro */}
           <div className="space-y-6">
             <div className="flex items-center gap-3 mb-6">
               <Star className="text-red-600" size={24} fill="currentColor" />
               <h2 className="text-2xl font-black uppercase italic tracking-tighter">Pro Plans (20 Days)</h2>
             </div>
             {PLANS.filter(p => p.type === 'pro').map(plan => (
               <motion.div 
                 key={plan.id}
                 whileHover={{ scale: 1.02 }}
                 className="bg-red-600 text-white p-6 rounded-2xl cursor-pointer hover:bg-red-700 transition-all flex justify-between items-center shadow-lg group relative overflow-hidden"
                 onClick={() => handleSelectPlan(plan.id)}
               >
                 <div className="absolute -right-4 -top-4 opacity-10">
                   <Star size={80} fill="currentColor" />
                 </div>
                 <div>
                   <h3 className="font-black uppercase tracking-wide italic">{plan.includes.join(' + ')}</h3>
                   <p className="text-xs text-white/80">{plan.description}</p>
                 </div>
                 <div className="text-right">
                   <div className="text-xl font-black italic">₹{plan.price}</div>
                   <div className="text-[10px] uppercase font-bold text-black">Active Routine</div>
                 </div>
               </motion.div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
