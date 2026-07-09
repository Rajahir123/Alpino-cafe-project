import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Phone, MapPin, ChevronRight, ChevronDown, ShieldCheck, Activity, Info, Calendar } from 'lucide-react';
import { usePersistedState } from '../hooks/usePersistedState';
import { UserProfile } from '../types';
import DynamicLogo from '../components/DynamicLogo';
import ThemeSelect from '../components/ThemeSelect';

export default function ProfileSetup() {
  const { profile } = useAuth();
  const [formData, setFormData, loadingForm] = usePersistedState<Partial<UserProfile>>('setup_form_v2', {
    name: profile?.name || '',
    phone: (profile?.phone && /^0+$/.test(profile.phone)) ? '' : (profile?.phone || ''),
    address: (profile?.address && /^0+$/.test(profile.address)) ? '' : (profile?.address || ''),
    gender: profile?.gender || '',
    occupation: profile?.occupation || '',
    primaryGoal: profile?.primaryGoal || '',
    workoutFrequency: profile?.workoutFrequency || '',
    mealPreference: profile?.mealPreference || '',
    foodAllergies: profile?.foodAllergies || '',
    consumptionMethod: profile?.consumptionMethod || '',
    preferredTimeSlot: profile?.preferredTimeSlot || '',
    upgradeMeals: profile?.upgradeMeals || '',
    socialMediaFeature: profile?.socialMediaFeature || '',
    fitnessTips: profile?.fitnessTips || '',
    heardAboutUs: profile?.heardAboutUs || '',
    startDate: profile?.startDate || '',
  });

  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Sync with profile if it loads later
  useEffect(() => {
    if (profile && !formData.phone && profile.phone) {
      setFormData(prev => ({ 
        ...prev, 
        name: profile.name || prev.name || '',
        phone: (profile.phone && /^0+$/.test(profile.phone)) ? '' : (profile.phone || ''),
        address: (profile.address && /^0+$/.test(profile.address)) ? '' : (profile.address || ''),
        gender: profile.gender || '',
        occupation: profile.occupation || '',
        primaryGoal: profile.primaryGoal || '',
        workoutFrequency: profile.workoutFrequency || '',
        mealPreference: profile.mealPreference || '',
        foodAllergies: profile.foodAllergies || '',
        consumptionMethod: profile.consumptionMethod || '',
        preferredTimeSlot: profile.preferredTimeSlot || '',
        upgradeMeals: profile.upgradeMeals || '',
        socialMediaFeature: profile.socialMediaFeature || '',
        fitnessTips: profile.fitnessTips || '',
        heardAboutUs: profile.heardAboutUs || '',
        startDate: profile.startDate || ''
      }));
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    
    const path = `users/${profile.uid}`;
    try {
      // Remove undefined values
      const allowedKeys = [
        'name', 'phone', 'address', 'gender', 'occupation', 'primaryGoal', 'workoutFrequency', 
        'mealPreference', 'foodAllergies', 'consumptionMethod', 'preferredTimeSlot', 
        'upgradeMeals', 'socialMediaFeature', 'fitnessTips', 'heardAboutUs', 'startDate'
      ];
      const sanitizedData = Object.fromEntries(
        Object.entries(formData).filter(([k, v]) => v !== undefined && allowedKeys.includes(k))
      );

      await updateDoc(doc(db, 'users', profile.uid), {
        ...sanitizedData,
        updatedAt: Timestamp.now()
      });
      if (profile.planStatus === 'pending') {
        navigate('/payment');
      } else {
        navigate('/plans');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 md:p-6 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.08),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(234,179,8,0.05),transparent_40%)]">
      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl w-full bg-white border border-neutral-100 p-6 md:p-14 rounded-3xl md:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] mx-2 relative overflow-hidden"
      >
        {/* Decorative background effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 mb-10 md:mb-14 relative">
          <div className="flex items-center gap-5 md:gap-6">
             <motion.div 
               initial={{ rotate: -20, scale: 0.5, opacity: 0 }}
               animate={{ rotate: 0, scale: 1, opacity: 1 }}
               transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
             >
               <DynamicLogo showText={false} size={56} />
             </motion.div>
             <div className="flex flex-col justify-center">
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none mb-2 text-neutral-900"
                >
                  Set Your Goal
                </motion.h1>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] md:tracking-[0.5em] text-red-600"
                >
                  Member Onboarding
                </motion.div>
             </div>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex items-center gap-2 text-yellow-600 self-end sm:self-auto bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200/50 shadow-sm"
          >
             <ShieldCheck size={16} className="md:w-5 md:h-5" />
             <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Active Sync</span>
          </motion.div>
        </div>

        <form onSubmit={handleSave} className="space-y-6 md:space-y-8 relative z-10">
           <motion.div 
             initial="hidden"
             animate="visible"
             variants={{
               hidden: { opacity: 0 },
               visible: {
                 opacity: 1,
                 transition: { staggerChildren: 0.08, delayChildren: 0.5 }
               }
             }}
             className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7"
           >
             
             {/* Name */}
             <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="relative group md:col-span-2">
                <User className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-red-600 transition-colors md:w-5 md:h-5 z-10" size={18} />
                <input 
                  type="text" 
                  placeholder="FULL NAME"
                  value={formData.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  required
                  className="w-full bg-white border border-neutral-200 rounded-2xl py-4 md:py-5 pl-14 md:pl-16 pr-5 md:pr-6 font-bold text-sm uppercase tracking-widest text-neutral-900 focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all placeholder:text-neutral-300 hover:border-neutral-300 shadow-sm"
                />
             </motion.div>

             {/* Phone */}
             <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="relative group">
                <Phone className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-red-600 transition-colors md:w-5 md:h-5 z-10" size={18} />
                <input 
                  type="tel" 
                  placeholder="PHONE NUMBER"
                  value={(formData.phone && /^0+$/.test(formData.phone)) ? '' : (formData.phone || '')}
                  onChange={(e) => updateField('phone', e.target.value)}
                  required
                  className="w-full bg-white border border-neutral-200 rounded-2xl py-4 md:py-5 pl-14 md:pl-16 pr-5 md:pr-6 font-bold text-sm uppercase tracking-widest text-neutral-900 focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all placeholder:text-neutral-300 hover:border-neutral-300 shadow-sm"
                />
             </motion.div>

             {/* Gender */}
             <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="relative group">
                <ThemeSelect
                  value={formData.gender || ''}
                  onChange={(val) => updateField('gender', val)}
                  placeholder="GENDER"
                  icon={Info}
                  options={[
                    { label: 'Male', value: 'Male' },
                    { label: 'Female', value: 'Female' },
                    { label: 'Other', value: 'Other' },
                  ]}
                />
             </motion.div>

             {/* Occupation */}
             <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="relative group md:col-span-2">
                <Info className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-red-600 transition-colors md:w-5 md:h-5 z-10" size={18} />
                <input 
                  type="text" 
                  placeholder="OCCUPATION"
                  value={formData.occupation || ''}
                  onChange={(e) => updateField('occupation', e.target.value)}
                  required
                  className="w-full bg-white border border-neutral-200 rounded-2xl py-4 md:py-5 pl-14 md:pl-16 pr-5 md:pr-6 font-bold text-sm uppercase tracking-widest text-neutral-900 focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all placeholder:text-neutral-300 hover:border-neutral-300 shadow-sm"
                />
             </motion.div>

             {/* Primary Goal */}
             <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="relative group">
                <ThemeSelect
                  value={formData.primaryGoal || ''}
                  onChange={(val) => updateField('primaryGoal', val)}
                  placeholder="PRIMARY GOAL"
                  icon={Activity}
                  options={[
                    { label: 'Muscle Gain', value: 'Muscle Gain' },
                    { label: 'Fat Loss', value: 'Fat Loss' },
                    { label: 'Healthy Lifestyle', value: 'Healthy Lifestyle' },
                    { label: 'Busy Professionals', value: 'Busy Professionals' },
                    { label: 'Gym Athletes', value: 'Gym Athletes' },
                  ]}
                />
             </motion.div>

             {/* Workout Frequency */}
             <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="relative group">
                <ThemeSelect
                  value={formData.workoutFrequency || ''}
                  onChange={(val) => updateField('workoutFrequency', val)}
                  placeholder="WORKOUT FREQUENCY"
                  icon={Activity}
                  options={[
                    { label: '0-2 days', value: '0-2 days' },
                    { label: '3-4 days', value: '3-4 days' },
                    { label: '5+ days', value: '5+ days' },
                  ]}
                />
             </motion.div>

             {/* Meal Preference */}
             <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="relative group">
                <ThemeSelect
                  value={formData.mealPreference || ''}
                  onChange={(val) => updateField('mealPreference', val)}
                  placeholder="MEAL PREFERENCE"
                  icon={Info}
                  options={[
                    { label: 'Veg', value: 'Veg' },
                    { label: 'Non-Veg', value: 'Non-Veg' },
                    { label: 'Vegan', value: 'Vegan' },
                    { label: 'Jain', value: 'Jain' },
                  ]}
                />
             </motion.div>
             
             {/* Consumption Method */}
             <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="relative group">
                <ThemeSelect
                  value={formData.consumptionMethod || ''}
                  onChange={(val) => updateField('consumptionMethod', val)}
                  placeholder="HOW TO CONSUME"
                  icon={Info}
                  options={[
                    { label: 'Dine-in', value: 'Dine-in' },
                    { label: 'Takeaway', value: 'Takeaway' },
                    { label: 'Delivery', value: 'Delivery' },
                  ]}
                />
             </motion.div>

             {/* Food Allergies */}
             <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="relative group md:col-span-2">
                <Info className="absolute left-5 md:left-6 top-4 md:top-5 text-neutral-400 group-focus-within:text-red-600 transition-colors md:w-5 md:h-5 z-10" size={18} />
                <textarea 
                  placeholder="ANY FOOD ALLERGIES? (OPTIONAL)"
                  rows={2}
                  value={formData.foodAllergies || ''}
                  onChange={(e) => updateField('foodAllergies', e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-2xl py-4 md:py-5 pl-14 md:pl-16 pr-5 md:pr-6 font-bold text-sm uppercase tracking-widest text-neutral-900 focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all placeholder:text-neutral-300 hover:border-neutral-300 shadow-sm"
                />
             </motion.div>

             {/* Address */}
             <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="relative group md:col-span-2">
                <MapPin className="absolute left-5 md:left-6 top-4 md:top-5 text-neutral-400 group-focus-within:text-red-600 transition-colors md:w-5 md:h-5 z-10" size={18} />
                <textarea 
                  placeholder="DELIVERY ADDRESS"
                  rows={2}
                  value={(formData.address && /^0+$/.test(formData.address)) ? '' : (formData.address || '')}
                  onChange={(e) => updateField('address', e.target.value)}
                  required
                  className="w-full bg-white border border-neutral-200 rounded-2xl py-4 md:py-5 pl-14 md:pl-16 pr-5 md:pr-6 font-bold text-sm uppercase tracking-widest text-neutral-900 focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all placeholder:text-neutral-300 hover:border-neutral-300 shadow-sm"
                />
             </motion.div>

             {/* Preferred Time Slot */}
             <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="relative group">
                <Calendar className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-red-600 transition-colors md:w-5 md:h-5 z-10" size={18} />
                <input 
                  type="text" 
                  placeholder="PREFERRED TIME SLOT"
                  value={formData.preferredTimeSlot || ''}
                  onChange={(e) => updateField('preferredTimeSlot', e.target.value)}
                  required
                  className="w-full bg-white border border-neutral-200 rounded-2xl py-4 md:py-5 pl-14 md:pl-16 pr-5 md:pr-6 font-bold text-sm uppercase tracking-widest text-neutral-900 focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all placeholder:text-neutral-300 hover:border-neutral-300 shadow-sm"
                />
             </motion.div>
             
             {/* Start Date */}
             <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="relative group">
                <Calendar className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-red-600 transition-colors md:w-5 md:h-5 z-10" size={18} />
                <input 
                  type="date" 
                  value={formData.startDate || ''}
                  onChange={(e) => updateField('startDate', e.target.value)}
                  required
                  className="w-full bg-white border border-neutral-200 rounded-2xl py-4 md:py-5 pl-14 md:pl-16 pr-5 md:pr-6 font-bold text-sm uppercase tracking-widest text-neutral-900 focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 transition-all placeholder:text-neutral-400 hover:border-neutral-300 shadow-sm"
                />
             </motion.div>

             {/* Additional Questions */}
             <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="md:col-span-2 space-y-4 pt-6 border-t border-neutral-100">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-50/80 p-5 rounded-2xl border border-neutral-100">
                 <span className="text-xs font-bold uppercase tracking-widest text-neutral-700">Want to upgrade your meals?</span>
                 <div className="flex bg-neutral-200/50 p-1 rounded-xl w-full sm:w-auto">
                   <button
                     type="button"
                     onClick={() => updateField('upgradeMeals', 'Yes')}
                     className={`flex-1 sm:w-24 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${formData.upgradeMeals === 'Yes' ? 'bg-white shadow-sm text-red-600' : 'text-neutral-500 hover:text-neutral-700'}`}
                   >
                     Yes
                   </button>
                   <button
                     type="button"
                     onClick={() => updateField('upgradeMeals', 'No')}
                     className={`flex-1 sm:w-24 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${formData.upgradeMeals === 'No' ? 'bg-white shadow-sm text-red-600' : 'text-neutral-500 hover:text-neutral-700'}`}
                   >
                     No
                   </button>
                 </div>
               </div>
               
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-50/80 p-5 rounded-2xl border border-neutral-100">
                 <span className="text-xs font-bold uppercase tracking-widest text-neutral-700">Okay being featured for transformation stories?</span>
                 <div className="flex bg-neutral-200/50 p-1 rounded-xl w-full sm:w-auto">
                   <button
                     type="button"
                     onClick={() => updateField('socialMediaFeature', 'Yes')}
                     className={`flex-1 sm:w-24 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${formData.socialMediaFeature === 'Yes' ? 'bg-white shadow-sm text-red-600' : 'text-neutral-500 hover:text-neutral-700'}`}
                   >
                     Yes
                   </button>
                   <button
                     type="button"
                     onClick={() => updateField('socialMediaFeature', 'No')}
                     className={`flex-1 sm:w-24 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${formData.socialMediaFeature === 'No' ? 'bg-white shadow-sm text-red-600' : 'text-neutral-500 hover:text-neutral-700'}`}
                   >
                     No
                   </button>
                 </div>
               </div>

               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-50/80 p-5 rounded-2xl border border-neutral-100">
                 <span className="text-xs font-bold uppercase tracking-widest text-neutral-700">Would you like fitness & nutrition guidance?</span>
                 <div className="flex bg-neutral-200/50 p-1 rounded-xl w-full sm:w-auto">
                   <button
                     type="button"
                     onClick={() => updateField('fitnessTips', 'Yes')}
                     className={`flex-1 sm:w-24 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${formData.fitnessTips === 'Yes' ? 'bg-white shadow-sm text-red-600' : 'text-neutral-500 hover:text-neutral-700'}`}
                   >
                     Yes
                   </button>
                   <button
                     type="button"
                     onClick={() => updateField('fitnessTips', 'No')}
                     className={`flex-1 sm:w-24 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${formData.fitnessTips === 'No' ? 'bg-white shadow-sm text-red-600' : 'text-neutral-500 hover:text-neutral-700'}`}
                   >
                     No
                   </button>
                 </div>
               </div>
             </motion.div>

           </motion.div>

           <motion.button 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 1, duration: 0.6 }}
             whileHover={{ scale: 1.01 }}
             whileTap={{ scale: 0.99 }}
             type="submit"
             disabled={saving}
             className="w-full bg-red-600 hover:bg-red-700 text-white py-4 md:py-5 mt-10 rounded-2xl font-black uppercase tracking-[0.2em] text-sm md:text-base transition-all flex items-center justify-center gap-3 shadow-[0_10px_40px_-10px_rgba(220,38,38,0.5)] hover:shadow-[0_15px_50px_-10px_rgba(220,38,38,0.6)] cursor-pointer disabled:opacity-70"
           >
             {saving ? 'SAVING...' : 'CONTINUE TO PLANS'}
             <ChevronRight size={20} className="md:w-6 md:h-6" />
           </motion.button>
        </form>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-[9px] md:text-[11px] text-neutral-400 font-bold uppercase tracking-[0.25em] mt-8 pt-6 md:mt-12 md:pt-8 border-t border-neutral-100 text-center relative z-10"
        >
           Your data is secured with enterprise-grade encryption.
        </motion.div>
      </motion.div>
    </div>
  );
}
