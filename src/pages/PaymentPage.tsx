import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, AlertCircle, Clock, Upload, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { PLANS } from '../constants';
import { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, updateDoc, Timestamp, collection, query, where, getDocs, setDoc } from 'firebase/firestore';

export default function PaymentPage() {
  const { profile } = useAuth();
  const [barcodeUrl, setBarcodeUrl] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState('');
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

    // Check if a payment record already exists
    const checkPayment = async () => {
      if (!profile) return;
      const q = query(collection(db, 'payments'), where('userId', '==', profile.uid), where('status', 'in', ['pending', 'submitted', 'rejected']));
      const snap = await getDocs(q);
      if (!snap.empty) {
        // Sort by newest
        const docs = snap.docs.sort((a,b) => b.data().createdAt.seconds - a.data().createdAt.seconds);
        const data = docs[0].data();
        if (data.status === 'submitted') {
          setSubmitted(true);
        } else if (data.status === 'rejected') {
          setSubmitted(false);
          setRejectionMessage(data.statusMessage || 'Payment rejected. Please verify your details and try again.');
        }
      }
    };
    checkPayment();
  }, [profile]);

  const handleSubmitPayment = async () => {
    if (!profile || !transactionId) return;
    setUploading(true);
    
    try {
      // Find or create payment record
      const paymentId = `pay_${profile.uid}_${Date.now()}`;
      const paymentRef = doc(db, 'payments', paymentId);
      
      await setDoc(paymentRef, {
        id: paymentId,
        userId: profile.uid,
        userName: profile.name,
        userEmail: profile.email,
        planId: profile.planId,
        planName: selectedPlan?.name,
        amount: selectedPlan?.price,
        transactionId: transactionId,
        screenshotUrl: screenshotUrl || 'https://via.placeholder.com/400?text=Screenshot+Pending',
        status: 'submitted',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Update user status
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        planStatus: 'pending',
        updatedAt: Timestamp.now()
      });

      setSubmitted(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'Payment Submission');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center pt-24 pb-12 px-6 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.1),transparent_50%)] overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-neutral-900 border border-white/10 p-8 md:p-10 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
        
        <div className="flex justify-between items-center mb-8 relative z-10">
           <div className="text-left">
             <div className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-2">Protocol: Deposit</div>
             <h1 className="text-3xl font-black italic uppercase italic leading-none tracking-tighter">{selectedPlan?.name}</h1>
           </div>
           <div className="text-2xl font-black italic text-white flex flex-col items-end">
             <span className="text-red-600">₹{selectedPlan?.price}</span>
             <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Total cost</span>
           </div>
        </div>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div 
              key="payment-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {rejectionMessage && (
                <div className="bg-red-600/10 border border-red-600/20 p-4 rounded-2xl flex items-start gap-3 text-left">
                  <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={16} />
                  <div>
                    <div className="text-[10px] font-black uppercase text-red-600 mb-1 tracking-widest">Protocol Rejection</div>
                    <p className="text-[10px] text-red-100/60 font-medium leading-relaxed">{rejectionMessage}</p>
                  </div>
                </div>
              )}
              
              <div className="bg-white p-6 md:p-8 rounded-[2rem] flex flex-col items-center justify-center aspect-square shadow-[0_0_50px_rgba(255,255,255,0.05)] border-4 border-red-600/10 overflow-hidden relative group">
                {barcodeUrl ? (
                  <img src={barcodeUrl} alt="Payment Barcode" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <>
                    <QrCode size={160} className="text-black" />
                    <div className="mt-4 text-black/40 text-[10px] font-black uppercase tracking-[0.2em]">Scan with GPay / PhonePe</div>
                  </>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                   <p className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Official Alpino Vector</p>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block ml-1">Transaction ID / Reference No.</label>
                  <input 
                    type="text" 
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter 12-digit number"
                    className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-red-600 outline-none transition-all placeholder:text-white/10"
                  />
                </div>

                <div className="p-1 bg-white/5 rounded-2xl border border-white/5">
                   <button 
                     onClick={() => setScreenshotUrl('https://via.placeholder.com/800x1200?text=Screenshot+Verified')}
                     className={`w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed transition-all ${
                       screenshotUrl ? 'bg-green-600/10 border-green-600/50 text-green-500' : 'bg-black border-white/10 text-white/40 hover:border-white/20'
                     }`}
                   >
                     {screenshotUrl ? <CheckCircle2 size={18} /> : <Upload size={18} />}
                     <span className="text-[10px] font-black uppercase tracking-widest">
                       {screenshotUrl ? 'Screenshot Attached' : 'Attach Screenshot'}
                     </span>
                   </button>
                </div>
              </div>

              <button 
                onClick={handleSubmitPayment}
                disabled={!transactionId || uploading}
                className={`w-full py-5 rounded-2xl font-black italic uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg ${
                  transactionId ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20' : 'bg-neutral-800 text-white/20 cursor-not-allowed'
                }`}
              >
                {uploading ? 'SYNCHRONIZING...' : 'SUBMIT PAYMENT'}
                {!uploading && <ChevronRight size={20} />}
              </button>

              <p className="text-[9px] text-white/20 font-black uppercase leading-relaxed tracking-widest">
                Our logistics AI will verify the transaction within 30-60 minutes. Access will unlock automatically.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="verification-pending"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 space-y-8"
            >
              <div className="w-24 h-24 bg-red-600/10 rounded-[2rem] border border-red-600/20 flex items-center justify-center mx-auto relative">
                 <Clock className="text-red-600 animate-pulse" size={48} />
                 <div className="absolute -top-2 -right-2">
                   <div className="w-6 h-6 bg-red-600 rounded-full animate-ping opacity-30" />
                 </div>
              </div>

              <div>
                <h2 className="text-xl font-black italic uppercase mb-2">Extraction Pending</h2>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest leading-relaxed px-4">
                  Your payment record has been submitted to Alpino Governance. Verification is currently active.
                </p>
              </div>

              <div className="bg-white/5 border border-white/5 p-6 rounded-2xl text-left space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase">
                   <span className="text-white/20">Target Status</span>
                   <span className="text-red-600 flex items-center gap-2">
                     <Zap size={10} className="animate-bounce" /> ANALYZING
                   </span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase">
                   <span className="text-white/20">Access Token</span>
                   <span className="text-white/40">GATED</span>
                 </div>
              </div>

              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <Clock size={12} /> Force State Sync
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="mt-12 text-center text-[9px] text-white/10 font-black uppercase tracking-[0.5em] animate-pulse">
        [ ALPINO SECURE TRANSACTION PROTOCOL v4.2 ]
      </div>
    </div>
  );
}
