import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { QrCode, AlertCircle, Clock } from 'lucide-react';
import { PLANS } from '../constants';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function PaymentPage() {
  const { profile } = useAuth();
  const [barcodeUrl, setBarcodeUrl] = useState('');
  const selectedPlan = PLANS.find(p => p.id === profile?.planId);

  useEffect(() => {
    const fetchBarcode = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'payment_barcode'));
        if (docSnap.exists()) {
          setBarcodeUrl(docSnap.data().url);
        }
      } catch (error) {
        console.error("Failed to fetch barcode:", error);
      }
    };
    fetchBarcode();
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.1),transparent_50%)]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-neutral-900 border border-white/10 p-10 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
        
        <div className="flex justify-between items-center mb-8">
           <div className="text-left">
             <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Payment Pending</div>
             <h1 className="text-2xl font-black italic uppercase italic leading-none">{selectedPlan?.name}</h1>
           </div>
           <div className="text-xl font-black italic text-red-600">₹{selectedPlan?.price}</div>
        </div>

        <div className="bg-white p-8 rounded-3xl mb-8 flex flex-col items-center justify-center aspect-square shadow-[0_0_40px_rgba(255,255,255,0.05)] border-4 border-red-600/20 overflow-hidden">
           {barcodeUrl ? (
             <img src={barcodeUrl} alt="Payment Barcode" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
           ) : (
             <>
               <QrCode size={180} className="text-black" />
               <div className="mt-4 text-black/40 text-[10px] font-bold uppercase tracking-widest">Scan with GPay / PhonePe</div>
             </>
           )}
        </div>

        <div className="space-y-6 mb-8 text-left">
          <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
             <div className="bg-red-600/20 p-2 rounded-xl text-red-600 mt-1">
               <AlertCircle size={20} />
             </div>
             <div>
               <div className="text-xs font-bold uppercase tracking-widest text-white">Manual Approval</div>
               <p className="text-xs text-white/50 leading-relaxed">Admin will manually approve your payment. Once done, your dashboard will unlock automatically.</p>
             </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 animate-pulse">
             <div className="bg-white/10 p-2 rounded-xl text-white">
               <Clock size={20} />
             </div>
             <div className="text-xs font-bold uppercase tracking-widest text-white/60">Waiting for system update...</div>
          </div>
        </div>

        <div className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em] pt-6 border-t border-white/5">
           Alpino Hospitalities Pvt Ltd.
        </div>
      </motion.div>

      <p className="mt-8 text-white/30 text-xs text-center max-w-xs uppercase leading-relaxed font-bold tracking-widest">
        If your payment is approved and this page doesn't update, please refresh the app.
      </p>
    </div>
  );
}
