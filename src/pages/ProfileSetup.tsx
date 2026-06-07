import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Phone, MapPin, ChevronRight, Mountain, ShieldCheck } from 'lucide-react';
import { usePersistedState } from '../hooks/usePersistedState';

export default function ProfileSetup() {
  const { profile } = useAuth();
  const [phone, setPhone, loadingPhone] = usePersistedState('setup_phone', profile?.phone || '');
  const [address, setAddress, loadingAddress] = usePersistedState('setup_address', profile?.address || '');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Sync with profile if it loads later
  useEffect(() => {
    if (profile?.phone && !phone) setPhone(profile.phone);
    if (profile?.address && !address) setAddress(profile.address);
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    
    const path = `users/${profile.uid}`;
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        phone,
        address,
        updatedAt: Timestamp.now()
      });
      navigate('/plans');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 md:p-6 bg-[radial-gradient(circle_at_bottom_left,rgba(220,38,38,0.1),transparent_50%)]">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-neutral-900 border border-white/10 p-5 md:p-12 rounded-2xl md:rounded-[3rem] shadow-2xl mx-2"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 md:mb-10">
          <div className="flex items-center gap-3 md:gap-4">
             <div className="w-10 h-10 md:w-14 md:h-14 bg-red-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
               <Mountain size={18} className="fill-current" />
             </div>
             <div>
                <h1 className="text-lg md:text-3xl font-black italic uppercase tracking-tighter leading-none mb-1">Set Your Goal</h1>
                <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/30">Member Onboarding</div>
             </div>
          </div>
          <div className="flex items-center gap-1.5 text-green-500/50 self-end sm:self-auto">
             <ShieldCheck size={14} className="md:w-4 md:h-4" />
             <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest">Active Sync</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 md:space-y-8">
           <div className="space-y-3.5 md:space-y-6">
             {/* Name (ReadOnly) */}
             <div className="relative group">
                <User className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-red-500 transition-colors md:w-5 md:h-5" size={16} />
                <input 
                  type="text" 
                  value={profile?.name} 
                  disabled
                  className="w-full bg-black/50 border border-white/5 rounded-xl md:rounded-2xl py-3 md:py-5 pl-12 md:pl-16 pr-4 md:pr-6 font-bold text-xs md:text-sm uppercase tracking-widest text-white/30 cursor-not-allowed"
                />
             </div>

             {/* Phone */}
             <div className="relative group">
                <Phone className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-red-600 transition-colors md:w-5 md:h-5" size={16} />
                <input 
                  type="tel" 
                  placeholder="PHONE NUMBER"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-5 pl-12 md:pl-16 pr-4 md:pr-6 font-bold text-xs md:text-sm uppercase tracking-widest text-white focus:outline-none focus:border-red-600 transition-all placeholder:text-white/10"
                />
             </div>

             {/* Address */}
             <div className="relative group">
                <MapPin className="absolute left-4 md:left-6 top-4 md:top-8 text-white/20 group-focus-within:text-red-600 transition-colors md:w-5 md:h-5" size={16} />
                <textarea 
                  placeholder="DELIVERY ADDRESS"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-5 pl-12 md:pl-16 pr-4 md:pr-6 font-bold text-xs md:text-sm uppercase tracking-widest text-white focus:outline-none focus:border-red-600 transition-all placeholder:text-white/10"
                />
             </div>
           </div>

           <button 
             type="submit"
             disabled={saving}
             className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm transition-all flex items-center justify-center gap-2 md:gap-3 shadow-[0_4px_30px_rgba(220,38,38,0.3)] hover:shadow-red-600/40 cursor-pointer"
           >
             {saving ? 'SAVING...' : 'CONTINUE TO PLANS'}
             <ChevronRight size={16} className="md:w-5 md:h-5" />
           </button>
        </form>

        <div className="text-[8px] md:text-[10px] text-white/20 font-bold uppercase tracking-[0.2em] mt-6 pt-4 md:mt-12 md:pt-8 border-t border-white/5 text-center">
           Your data is secured with enterprise-grade encryption.
        </div>
      </motion.div>
    </div>
  );
}
