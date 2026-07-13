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
        } else if (data.status === 'pending') {
          setSubmitted(false);
        }
      }
    };
    checkPayment();
  }, [profile]);

  const handleSubmitPayment = async () => {
    if (!profile || !screenshotUrl) return;
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
        planName: selectedPlan?.name || 'Unknown Plan',
        amount: selectedPlan?.price || 0,
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
    <div className="min-h-screen bg-white flex flex-col items-center pt-16 md:pt-24 pb-8 md:pb-12 px-4 md:px-6 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.1),transparent_50%)] overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-neutral-100 border border-neutral-200 p-5 md:p-10 rounded-2xl md:rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
        
        <div className="flex justify-between items-center mb-4 md:mb-8 relative z-10">
           <div className="text-left">
             <div className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-red-600 mb-1 md:mb-2">Protocol: Deposit</div>
             <h1 className="text-xl md:text-3xl font-black italic uppercase leading-none tracking-tighter">{selectedPlan?.name}</h1>
           </div>
           <div className="text-lg md:text-2xl font-black italic text-neutral-900 flex flex-col items-end">
             <span className="text-red-600">₹{selectedPlan?.price}</span>
             <span className="text-[8px] md:text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Total cost</span>
           </div>
        </div>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div 
              key="payment-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4 md:space-y-6"
            >
              {rejectionMessage && (
                <div className="bg-red-600/10 border border-red-600/20 p-3 md:p-4 rounded-xl md:rounded-2xl flex items-start gap-2.5 text-left">
                  <AlertCircle className="text-red-600 shrink-0 mt-0.5 md:w-4 md:h-4" size={14} />
                  <div>
                    <div className="text-[9px] md:text-[10px] font-black uppercase text-red-600 mb-0.5 tracking-widest">Protocol Rejection</div>
                    <p className="text-[9px] md:text-[10px] text-red-100/60 font-medium leading-relaxed">{rejectionMessage}</p>
                  </div>
                </div>
              )}
              
              <div className="bg-white p-4 md:p-8 rounded-xl md:rounded-[2rem] flex flex-col items-center justify-center max-w-[240px] md:max-w-full mx-auto aspect-square shadow-[0_0_50px_rgba(255,255,255,0.05)] border-2 md:border-4 border-red-600/10 overflow-hidden relative group">
                {barcodeUrl ? (
                  <img src={barcodeUrl} alt="Payment Barcode" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <>
                    <QrCode size={100} className="text-black md:w-[160px] md:h-[160px]" />
                    <div className="mt-2 md:mt-4 text-black/40 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">Scan with GPay / PhonePe</div>
                  </>
                )}
                <div className="absolute inset-0 bg-neutral-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                   <p className="text-neutral-900 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">Official Alpino Vector</p>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4 text-left">
                <div>
                  <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 md:mb-2 block ml-1">Transaction ID / Reference No. (Optional)</label>
                  <input 
                    type="text" 
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter 12-digit number"
                    className="w-full bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-3 md:p-4 text-neutral-900 font-bold text-xs md:text-sm focus:border-red-600 outline-none transition-all placeholder:text-neutral-500"
                  />
                </div>

                <div className="p-0.5 md:p-1 bg-neutral-50 rounded-xl md:rounded-2xl border border-neutral-200">
                   <label 
                     className={`w-full flex items-center justify-center gap-2 md:gap-3 p-3 md:p-4 rounded-lg md:rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                       screenshotUrl ? 'bg-green-600/10 border-green-600/50 text-green-500' : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-200'
                     }`}
                   >
                     <input 
                       type="file" 
                       accept=".jpeg, .jpg, .png" 
                       className="hidden"                        onChange={async (e) => {
                         const file = e.target.files?.[0];
                         if (!file || !profile) return;
                         
                         if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
                           alert('Please upload a .jpeg or .png file');
                           return;
                         }
                         setUploading(true);
                         try {
                           const base64 = await new Promise<string>((resolve) => {
                             const reader = new FileReader();
                             reader.onloadend = () => {
                               const base64String = reader.result as string;
                               resolve(base64String.split(',')[1]);
                             };
                             reader.readAsDataURL(file);
                           });
                           
                           const response = await fetch('/api/upload-blob', {
                             method: 'POST',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({
                               filename: `payments/${profile.uid}_${Date.now()}_${file.name}`,
                               contentType: file.type,
                               data: base64
                             })
                           });
                           
                           if (!response.ok) {
                             const errData = await response.json().catch(() => ({}));
                             throw new Error(errData.error || 'Vercel Blob upload failed');
                           }
                           
                           const data = await response.json();
                           setScreenshotUrl(data.url);
                         } catch (error: any) {
                           console.error('Upload failed:', error);
                           // Fallback 2: Compress and store as base64 data URL
                           try {
                             const compressedDataUrl = await new Promise<string>((resolve, reject) => {
                               const reader = new FileReader();
                               reader.onload = (e) => {
                                 const img = new Image();
                                 img.onload = () => {
                                   const canvas = document.createElement('canvas');
                                   let width = img.width;
                                   let height = img.height;
                                   const maxDim = 800;
                                   
                                   if (width > height && width > maxDim) {
                                     height = Math.round((height * maxDim) / width);
                                     width = maxDim;
                                   } else if (height > maxDim) {
                                     width = Math.round((width * maxDim) / height);
                                     height = maxDim;
                                   }
                                   
                                   canvas.width = width;
                                   canvas.height = height;
                                   const ctx = canvas.getContext('2d');
                                   if (ctx) {
                                     ctx.drawImage(img, 0, 0, width, height);
                                     resolve(canvas.toDataURL('image/jpeg', 0.6));
                                   } else {
                                     reject(new Error('Canvas context not available'));
                                   }
                                 };
                                 img.onerror = () => reject(new Error('Failed to load image for compression'));
                                 if (e.target?.result) {
                                   img.src = e.target.result as string;
                                 } else {
                                   reject(new Error('FileReader result is null'));
                                 }
                               };
                               reader.onerror = () => reject(new Error('FileReader failed'));
                               reader.readAsDataURL(file);
                             });
                             
                             setScreenshotUrl(compressedDataUrl);
                             // Silently succeed
                           } catch (compressError: any) {
                             console.error('Compression failed:', compressError);
                             alert(`Upload completely failed. Storage error: ${error.message}. Local error: ${compressError.message}`);
                           }
                         } finally {
                           setUploading(false);
                         }
                       }}
                     />
                     {uploading ? (
                       <Clock size={14} className="md:w-4.5 md:h-4.5 animate-spin" />
                     ) : screenshotUrl ? (
                       <CheckCircle2 size={14} className="md:w-4.5 md:h-4.5" />
                     ) : (
                       <Upload size={14} className="md:w-4.5 md:h-4.5" />
                     )}
                     <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                       {uploading ? 'Uploading...' : screenshotUrl ? 'Screenshot Attached' : 'Attach Screenshot'}
                     </span>
                   </label>
                </div>
              </div>

              <button 
                onClick={handleSubmitPayment}
                disabled={!screenshotUrl || uploading}
                className={`w-full py-3.5 md:py-5 rounded-xl md:rounded-2xl font-black italic uppercase tracking-[0.2em] text-xs md:text-sm transition-all flex items-center justify-center gap-2 md:gap-3 shadow-lg cursor-pointer ${
                  screenshotUrl ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                {uploading ? 'SYNCHRONIZING...' : 'SUBMIT PAYMENT'}
                {!uploading && <ChevronRight size={16} className="md:w-5 md:h-5" />}
              </button>

              <p className="text-[8px] md:text-[9px] text-neutral-500 font-black uppercase leading-relaxed tracking-widest">
                Our logistics AI will verify the transaction within 30-60 minutes. Access will unlock automatically.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="verification-pending"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6 md:py-12 space-y-5 md:space-y-8"
            >
              <div className="w-16 h-16 md:w-24 md:h-24 bg-red-600/10 rounded-2xl md:rounded-[2rem] border border-red-600/20 flex items-center justify-center mx-auto relative">
                 <Clock className="text-red-600 animate-pulse w-8 h-8 md:w-12 md:h-12" size={32} />
                 <div className="absolute -top-2 -right-2">
                   <div className="w-6 h-6 bg-red-600 rounded-full animate-ping opacity-30" />
                 </div>
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-black italic uppercase mb-1 md:mb-2">Extraction Pending</h2>
                <p className="text-[9px] md:text-[10px] text-neutral-500 font-black uppercase tracking-widest leading-relaxed px-4">
                  Your payment record has been submitted to Alpino Governance. Verification is currently active.
                </p>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 p-4 md:p-6 rounded-xl md:rounded-2xl text-left space-y-3 md:space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase">
                   <span className="text-neutral-500">Target Status</span>
                   <span className="text-red-600 flex items-center gap-2">
                     <Zap size={10} className="animate-bounce" /> ANALYZING
                   </span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase">
                   <span className="text-neutral-500">Access Token</span>
                   <span className="text-neutral-500">GATED</span>
                 </div>
              </div>

              <button 
                onClick={() => window.location.reload()}
                className="w-full py-3 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-neutral-500 hover:text-neutral-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Clock size={10} /> Force State Sync
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="mt-6 md:mt-12 text-center text-[8px] md:text-[9px] text-neutral-500 font-black uppercase tracking-[0.3em] md:tracking-[0.5em] animate-pulse">
        [ ALPINO SECURE TRANSACTION PROTOCOL v4.2 ]
      </div>
    </div>
  );
}
