import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Phone, MapPin, ChevronRight, Mountain } from 'lucide-react';

export default function ProfileSetup() {
  const { profile } = useAuth();
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-black flex items-center justify-center p-6 bg-[radial-gradient(circle_at_bottom_left,rgba(220,38,38,0.1),transparent_50%)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-neutral-900 border border-white/10 p-12 rounded-[3rem] shadow-2xl"
      >
        <div className="flex items-center gap-4 mb-10">
           <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
             <Mountain size={24} className="fill-current" />
           </div>
           <div>
             <h1 className="text-3xl font-black italic uppercase italic tracking-tighter leading-none mb-1">Set Your Goal</h1>
             <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Member Onboarding</div>
           </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
           <div className="space-y-6">
             {/* Name (ReadOnly) */}
             <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-red-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  value={profile?.name} 
                  disabled
                  className="w-full bg-black/50 border border-white/5 rounded-2xl py-5 pl-16 pr-6 font-bold text-sm uppercase tracking-widest text-white/30 cursor-not-allowed"
                />
             </div>

             {/* Phone */}
             <div className="relative group">
                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-red-600 transition-colors" size={20} />
                <input 
                  type="tel" 
                  placeholder="PHONE NUMBER"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 font-bold text-sm uppercase tracking-widest text-white focus:outline-none focus:border-red-600 transition-all placeholder:text-white/10"
                />
             </div>

             {/* Address */}
             <div className="relative group">
                <MapPin className="absolute left-6 top-8 text-white/20 group-focus-within:text-red-600 transition-colors" size={20} />
                <textarea 
                  placeholder="DELIVERY ADDRESS"
                  rows={4}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 font-bold text-sm uppercase tracking-widest text-white focus:outline-none focus:border-red-600 transition-all placeholder:text-white/10"
                />
             </div>
           </div>

           <button 
             type="submit"
             disabled={saving}
             className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-[0_4px_30px_rgba(220,38,38,0.3)] hover:shadow-red-600/40"
           >
             {saving ? 'SAVING...' : 'CONTINUE TO PLANS'}
             <ChevronRight size={20} />
           </button>
        </form>

        <div className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em] mt-12 text-center pt-8 border-t border-white/5">
           Your data is secured with enterprise-grade encryption.
        </div>
      </motion.div>
    </div>
  );
}
