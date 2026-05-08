import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, getDocs, doc, updateDoc, Timestamp, where, writeBatch } from 'firebase/firestore';
import { PaymentRecord, UserProfile } from '../types';
import { PLANS } from '../constants';
import { motion } from 'motion/react';
import { Check, X, ShieldCheck, Users, CreditCard, LayoutDashboard, Search, Image as ImageIcon } from 'lucide-react';
import ImageManagement from '../components/ImageManagement';

export default function AdminDashboard() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'payments' | 'images'>('payments');

  const fetchData = async () => {
    setLoading(true);
    try {
      const paySnap = await getDocs(collection(db, 'payments'));
      const userSnap = await getDocs(collection(db, 'users'));
      
      setPayments(paySnap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentRecord)));
      setUsers(userSnap.docs.map(d => ({ ...d.data() } as UserProfile)));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'Admin Dashboard Initial Data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (payment: PaymentRecord) => {
    const plan = PLANS.find(p => p.id === payment.planId);
    if (!plan) return;

    const batch = writeBatch(db);

    try {
      // 1. Update Payment
      const payRef = doc(db, 'payments', payment.id);
      batch.update(payRef, { status: 'approved' });

      // 2. Update User
      const userRef = doc(db, 'users', payment.userId);
      batch.update(userRef, {
        planId: payment.planId,
        planStatus: 'active',
        daysRemaining: plan.duration,
        updatedAt: Timestamp.now()
      });

      await batch.commit();
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `approve payment/${payment.id}`);
    }
  };

  const handleReject = async (paymentId: string) => {
    try {
      await updateDoc(doc(db, 'payments', paymentId), { status: 'rejected' });
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `payments/${paymentId}`);
    }
  };

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-red-600 italic uppercase">Syncing CAFE COMMAND...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <ShieldCheck size={20} />
              <span className="text-xs font-black uppercase tracking-[0.3em]">System Admin</span>
            </div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter">Command <span className="text-red-600">Center</span></h1>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex bg-neutral-900 p-1 rounded-xl border border-white/5">
              <button 
                onClick={() => setActiveTab('payments')}
                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'payments' ? 'bg-red-600 text-white' : 'text-white/40 hover:text-white'}`}
              >
                Governance
              </button>
              <button 
                onClick={() => setActiveTab('images')}
                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'images' ? 'bg-red-600 text-white' : 'text-white/40 hover:text-white'}`}
              >
                Assets
              </button>
            </div>
            <div className="flex gap-4">
              <div className="bg-neutral-900 border border-white/5 p-4 rounded-2xl text-center min-w-[100px]">
                  <div className="text-[10px] font-bold uppercase text-white/40 mb-1">Users</div>
                  <div className="text-xl font-black">{users.length}</div>
              </div>
              <div className="bg-red-600 p-4 rounded-2xl text-center min-w-[100px]">
                  <div className="text-[10px] font-bold uppercase text-black/40 mb-1">Queue</div>
                  <div className="text-xl font-black">{pendingPayments.length}</div>
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'payments' ? (
          <main className="grid lg:grid-cols-3 gap-12">
            {/* Payment Approval */}
            <section className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black italic uppercase flex items-center gap-3">
                  <CreditCard size={24} className="text-red-600" /> Payment Queue
                </h2>
                <span className="text-xs bg-red-600 text-white px-3 py-1 rounded-full font-black italic">{pendingPayments.length} PENDING</span>
              </div>

              <div className="space-y-4">
                {pendingPayments.length === 0 ? (
                  <div className="p-20 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center text-white/20 font-black italic uppercase tracking-widest">
                    Clean state — All paid up.
                  </div>
                ) : (
                  pendingPayments.map(pay => (
                    <motion.div 
                      key={pay.id}
                      layout
                      className="bg-neutral-900 border border-white/5 p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-red-600/50 transition-all shadow-xl"
                    >
                      <div className="space-y-1 flex-grow">
                         <div className="text-[10px] font-black uppercase text-red-600 tracking-widest">{pay.planName}</div>
                         <div className="text-xl font-black italic uppercase">{pay.userName}</div>
                         <div className="text-xs text-white/30 font-medium">{pay.userEmail}</div>
                      </div>
                      
                      <div className="flex items-center gap-12">
                         <div className="text-center">
                           <div className="text-2xl font-black italic text-red-600">₹{pay.amount}</div>
                           <div className="text-[10px] font-bold uppercase text-white/20 tracking-widest italic">Verify Receipt</div>
                         </div>
                         
                         <div className="flex gap-2">
                           <button 
                             onClick={() => handleReject(pay.id)}
                             className="w-12 h-12 rounded-xl bg-white/5 hover:bg-red-600/20 text-white/40 hover:text-red-500 transition-all flex items-center justify-center border border-white/5"
                           >
                             <X size={20} />
                           </button>
                           <button 
                             onClick={() => handleApprove(pay)}
                             className="px-6 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-red-600/20 flex items-center gap-2"
                           >
                             Approve <Check size={20} />
                           </button>
                         </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>

            {/* User List */}
            <section className="space-y-8">
              <h2 className="text-2xl font-black italic uppercase flex items-center gap-3">
                <Users size={24} className="text-red-600" /> Member Hub
              </h2>
              
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                 <input 
                   type="text" 
                   placeholder="SEARCH BY NAME/EMAIL..."
                   className="w-full bg-neutral-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 font-bold text-xs uppercase tracking-widest focus:outline-none focus:border-red-600 transition-all"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-white/5 text-xs">
                {filteredUsers.map((user, idx) => (
                  <div key={idx} className="bg-neutral-900/50 border border-white/5 p-5 rounded-2xl flex items-center gap-4 hover:bg-neutral-900 transition-all">
                     <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-red-600 font-black italic text-lg uppercase">
                       {user.name.charAt(0)}
                     </div>
                     <div className="flex-grow">
                        <div className="font-black uppercase italic tracking-tighter">{user.name}</div>
                        <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{user.role} • {user.planStatus}</div>
                     </div>
                     <div className="text-right">
                        <div className="font-black text-red-600 italic leading-none">{user.daysRemaining}</div>
                        <div className="text-[8px] font-bold uppercase text-white/20 tracking-widest">Days</div>
                     </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        ) : (
          <ImageManagement />
        )}
      </div>
    </div>
  );
}
