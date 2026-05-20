import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, getDocs, doc, updateDoc, Timestamp, where, writeBatch, addDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { PaymentRecord, UserProfile, MenuItem } from '../types';
import { PLANS } from '../constants';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Check, X, ShieldCheck, ShieldAlert, Users, CreditCard, LayoutDashboard, Search, Image as ImageIcon, Utensils, Plus, Trash2, Save, History, FileText, Zap, ExternalLink, Lock, LogIn } from 'lucide-react';
import ImageManagement from '../components/ImageManagement';
import { usePersistedState } from '../hooks/usePersistedState';
import { useAuth } from '../hooks/useAuth';
import { signInWithPopup } from 'firebase/auth';
import { auth as firebaseAuth, googleProvider } from '../lib/firebase';

export default function AdminDashboard() {
  const { profile, user } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  const handleSystemLock = () => {
    localStorage.removeItem('alpino_admin_authorized');
    window.location.reload();
  };

  const handleAdminLogin = async () => {
    try {
      await signInWithPopup(firebaseAuth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [notes, setNotes] = useState<{id: string, text: string, createdAt: any}[]>([]);
  const [paymentBarcode, setPaymentBarcode] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Persisted variables
  const [searchTerm, setSearchTerm] = usePersistedState('admin_search', '');
  const [activeTab, setActiveTab] = usePersistedState<'payments' | 'images' | 'menu' | 'notes'>('admin_tab', 'payments');
  
  const [selectedMenuItemIds, setSelectedMenuItemIds] = useState<Set<string>>(new Set());
  const [isMenuSelectMode, setIsMenuSelectMode] = useState(false);
  
  // Menu Item Form State
  const [newItem, setNewItem] = usePersistedState<Partial<MenuItem>>('admin_new_item', { 
    category: 'Bowl', 
    protein: 0, 
    calories: 0, 
    price: 0, 
    isTrialFixed: false,
    description: '',
    bgImage: '',
    spinningImage: '',
    published: true
  });
  const [newNote, setNewNote] = usePersistedState('admin_new_note', '');

  const fetchData = async () => {
    setLoading(true);
    try {
      const paySnap = await getDocs(collection(db, 'payments'));
      const userSnap = await getDocs(collection(db, 'users'));
      const menuSnap = await getDocs(collection(db, 'menu'));
      const notesSnap = await getDocs(query(collection(db, 'notes')));
      const settingsSnap = await getDocs(collection(db, 'settings'));
      
      const barcodeDoc = settingsSnap.docs.find(d => d.id === 'payment_barcode');
      if (barcodeDoc) {
        setPaymentBarcode(barcodeDoc.data().url || '');
      }
      
      setPayments(paySnap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentRecord)));
      setUsers(userSnap.docs.map(d => ({ ...d.data() } as UserProfile)));
      setMenuItems(menuSnap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem)));
      setNotes(notesSnap.docs.map(d => ({ id: d.id, ...d.data() } as any)).sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds));
    } catch (error: any) {
      console.error("Data fetch failed:", error);
      // We don't throw here to avoid crashing the UI
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

  const handleAddMenuItem = async () => {
    if (!newItem.name || !newItem.category) return;
    try {
      const id = newItem.name.replace(/\s+/g, '-').toLowerCase();
      await setDoc(doc(db, 'menu', id), {
        ...newItem,
        bgImage: newItem.bgImage || '',
        spinningImage: newItem.spinningImage || '',
        published: newItem.published !== undefined ? newItem.published : true,
        id,
        updatedAt: Timestamp.now()
      });
      setNewItem({ 
        category: 'Bowl', 
        protein: 0, 
        calories: 0, 
        price: 0, 
        isTrialFixed: false,
        description: '',
        bgImage: '',
        spinningImage: '',
        published: true
      });
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'menu adding');
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'menu', id));
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `menu/${id}`);
    }
  };

  const toggleMenuItemSelection = (id: string) => {
    const newSelected = new Set(selectedMenuItemIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMenuItemIds(newSelected);
  };

  const handleBulkDeleteMenuItems = async () => {
    if (selectedMenuItemIds.size === 0) return;
    const batch = writeBatch(db);
    selectedMenuItemIds.forEach(id => {
      batch.delete(doc(db, 'menu', id));
    });
    
    try {
      setLoading(true);
      await batch.commit();
      setSelectedMenuItemIds(new Set());
      setIsMenuSelectMode(false);
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'bulk menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (item: MenuItem) => {
    try {
      await updateDoc(doc(db, 'menu', item.id), {
        published: !item.published,
        updatedAt: Timestamp.now()
      });
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `menu/${item.id}`);
    }
  };

  const handleAddNote = async () => {
    if (!newNote) return;
    try {
      await addDoc(collection(db, 'notes'), {
        text: newNote,
        createdAt: Timestamp.now()
      });
      setNewNote('');
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notes');
    }
  };

  const updateBarcode = async (url: string) => {
    try {
      await setDoc(doc(db, 'settings', 'payment_barcode'), {
        url,
        updatedAt: Timestamp.now()
      });
      setPaymentBarcode(url);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/payment_barcode');
    }
  };

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-red-600 italic uppercase">Syncing CAFE COMMAND...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <ShieldCheck size={16} md:size={20} />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">System Admin</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">Command <span className="text-red-600">Center</span></h1>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end w-full md:w-auto">
            {!user && (
              <button 
                onClick={handleAdminLogin}
                className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-red-600/20"
              >
                <LogIn size={14} /> Full Access Login
              </button>
            )}
            <button 
              onClick={handleSystemLock}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-600/20 hover:text-red-500 rounded-xl border border-white/10 transition-all text-[10px] font-black uppercase tracking-widest text-white/40"
              title="Lock Admin Panel"
            >
              <Lock size={14} /> Lock System
            </button>
            {(profile?.role !== 'admin') && (
              <div className="bg-red-600/10 border border-red-600/20 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                <ShieldAlert className="text-red-600" size={20} />
                <div className="text-[10px] font-black uppercase tracking-widest text-red-100">
                  Write Access Restricted <br/>
                  <span className="opacity-60">Login as Primary Admin required to save changes.</span>
                </div>
              </div>
            )}
            <Link to="/hub" className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-600 rounded-xl border border-red-600/20 transition-all text-[10px] font-black uppercase tracking-widest">
              <Zap size={14} /> Systems Hub
            </Link>
            <Link to="/" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white">
              <ExternalLink size={14} className="text-red-600" /> View Live Site
            </Link>
            <div className="flex flex-col gap-4 w-full md:w-auto">
              <div className="flex bg-neutral-900 p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar shadow-inner">
                <button 
                  onClick={() => setActiveTab('payments')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'payments' ? 'bg-red-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  Governance
                </button>
                <button 
                  onClick={() => setActiveTab('images')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'images' ? 'bg-red-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  Assets
                </button>
                <button 
                  onClick={() => setActiveTab('menu')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'menu' ? 'bg-red-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  Menu
                </button>
                <button 
                  onClick={() => setActiveTab('notes')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'notes' ? 'bg-red-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  Records
                </button>
              </div>
              
              <div className="flex gap-2">
                <div className="relative group flex-grow">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-red-600 transition-colors" size={14} />
                  <input 
                    type="text"
                    placeholder="LOCATE RECORDS OR USERS..."
                    className="w-full bg-neutral-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] focus:border-red-600 focus:bg-black transition-all outline-none placeholder:text-white/10"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => fetchData()}
                  className="flex items-center justify-center p-3.5 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white rounded-2xl transition-all border border-red-600/20 shadow-lg group"
                  title="Sync Intelligence"
                >
                  <Zap size={16} className={loading ? "animate-pulse" : "group-hover:scale-125 transition-transform"} />
                </button>
              </div>
            </div>
            <div className="flex gap-4 w-full md:w-auto self-end">
              <div className="flex-1 md:min-w-[100px] bg-neutral-900 border border-white/5 p-4 rounded-2xl text-center">
                  <div className="text-[10px] font-bold uppercase text-white/40 mb-1">Users</div>
                  <div className="text-xl font-black">{users.length}</div>
              </div>
              <div className="flex-1 md:min-w-[100px] bg-red-600 p-4 rounded-2xl text-center">
                  <div className="text-[10px] font-bold uppercase text-black/40 mb-1">Queue</div>
                  <div className="text-xl font-black">{pendingPayments.length}</div>
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'payments' ? (
          <main className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
               <div className="flex items-center justify-between">
                 <h2 className="text-3xl font-black italic uppercase flex items-center gap-3">
                   <CreditCard className="text-red-600" /> Payment <span className="text-red-600">Verification</span>
                 </h2>
                 <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">{pendingPayments.length} PENDING REQUESTS</span>
               </div>

               {pendingPayments.length === 0 ? (
                 <div className="bg-neutral-900/50 border border-white/5 p-12 rounded-[3rem] text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Check className="text-white/20" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">All accounts are currently synchronized.</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                    {pendingPayments.map(payment => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={payment.id} 
                        className="bg-neutral-900 border border-white/5 p-6 md:p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-red-600/30 transition-all"
                      >
                         <div className="flex gap-4">
                            <div className="w-12 h-12 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600 shrink-0">
                               <CreditCard size={20} />
                            </div>
                            <div>
                               <div className="text-[10px] font-black uppercase text-red-600 mb-1 tracking-widest">{payment.planName} Request</div>
                               <h3 className="font-black italic uppercase text-lg leading-tight tracking-tighter">{payment.userName}</h3>
                               <p className="text-[10px] text-white/30 font-black uppercase tracking-wider">{payment.userEmail}</p>
                            </div>
                         </div>
                         
                         <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="text-right flex-grow md:flex-grow-0 hidden md:block">
                               <div className="text-[10px] font-black uppercase text-white/20 tracking-widest">Amount</div>
                               <div className="text-xl font-black tracking-tighter italic">₹{payment.amount}</div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                               <button 
                                 onClick={() => handleApprove(payment)}
                                 className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
                               >
                                 Approve
                               </button>
                               <button 
                                 onClick={() => handleReject(payment.id)}
                                 className="flex-1 md:flex-none border border-white/10 hover:bg-red-600 hover:border-red-600 transition-all text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest"
                               >
                                 Reject
                               </button>
                            </div>
                         </div>
                      </motion.div>
                    ))}
                 </div>
               )}

               <div className="space-y-6">
                 <h2 className="text-2xl font-black italic uppercase flex items-center gap-3">
                   <Users className="text-red-600" /> User <span className="text-red-600">Database</span>
                 </h2>
                 <div className="bg-neutral-900 border border-white/5 rounded-[3rem] overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="p-6 text-[10px] font-black uppercase text-white/30 tracking-widest">Identity</th>
                          <th className="p-6 text-[10px] font-black uppercase text-white/30 tracking-widest">Plan Status</th>
                          <th className="p-6 text-[10px] font-black uppercase text-white/30 tracking-widest text-right">Integrity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredUsers.map(u => (
                          <tr key={u.uid} className="hover:bg-white/5 transition-colors">
                            <td className="p-6">
                               <div className="font-black italic uppercase text-sm tracking-tighter">{u.name}</div>
                               <div className="text-[10px] text-white/30 font-black uppercase">{u.email}</div>
                            </td>
                            <td className="p-6">
                               <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${u.planStatus === 'active' ? 'bg-green-600/10 text-green-500 border-green-600/20' : 'bg-red-600/10 text-red-600 border-red-600/20'}`}>
                                 {u.planStatus === 'active' ? `${u.planId} (${u.daysRemaining}d)` : 'Unmonitored'}
                               </span>
                            </td>
                            <td className="p-6 text-right">
                               <div className="text-[10px] font-black uppercase text-white/20">Prot: {u.proteinGoal}g</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
               </div>
            </div>

            <div className="space-y-8">
               <div className="bg-neutral-900 border border-white/5 p-8 rounded-[3rem] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <ImageIcon size={100} />
                  </div>
                  <h3 className="text-xl font-black italic uppercase mb-6 flex items-center gap-2">
                    <ImageIcon className="text-red-600" size={20} /> Payment <span className="text-red-600">Barcode</span>
                  </h3>
                  
                  <div className="space-y-6">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">Select an image from the Assets tab to use as your payment QR code.</p>
                    
                    <div className="aspect-square bg-black border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden relative group">
                      {paymentBarcode ? (
                        <>
                          <img src={paymentBarcode} alt="Payment Barcode" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                            <button 
                              onClick={() => updateBarcode('')}
                              className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                            >
                              Remove Barcode
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-8">
                           <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4">
                             <Plus className="text-white/20" />
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No Barcode Assigned</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-white/40 ml-1 tracking-widest">Barcode URL</label>
                       <div className="flex gap-2">
                         <input 
                           type="text" 
                           placeholder="PASTE IMAGE URL HERE..."
                           className="flex-grow bg-black border border-white/10 rounded-xl p-4 text-[10px] font-bold uppercase tracking-widest focus:border-red-600 outline-none"
                           value={paymentBarcode}
                           onChange={e => setPaymentBarcode(e.target.value)}
                         />
                         <button 
                           onClick={() => updateBarcode(paymentBarcode)}
                           className="bg-red-600 hover:bg-neutral-100 hover:text-red-600 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
                         >
                           Save
                         </button>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="bg-red-600/5 border border-red-600/10 p-8 rounded-[3rem]">
                  <h3 className="text-sm font-black italic uppercase mb-4 text-red-600">Quick Intelligence</h3>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Revenue Target</span>
                        <span className="text-sm font-black italic uppercase tracking-tighter text-red-600 italic">Calculated</span>
                     </div>
                     <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Sync Health</span>
                        <span className="text-sm font-black italic uppercase tracking-tighter text-green-500">Optimal</span>
                     </div>
                  </div>
               </div>
            </div>
          </main>
        ) : activeTab === 'menu' ? (
          <main className="space-y-12">
            <section className="bg-neutral-900 p-8 md:p-12 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                 <Utensils size={150} />
               </div>
               
               <h2 className="text-3xl font-black italic uppercase mb-10 flex items-center gap-3 relative z-10">
                 <Utensils className="text-red-600" size={32} /> Product <span className="text-red-600">Listing</span> Panel
               </h2>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                  <div className="lg:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 ml-1 tracking-widest">Product Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. MEXICAN PANEER RICE BOWL"
                      className="w-full bg-black border border-white/10 rounded-2xl p-5 text-xs font-bold uppercase tracking-widest focus:border-red-600 outline-none transition-all"
                      value={newItem.name || ''}
                      onChange={e => setNewItem({...newItem, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 ml-1 tracking-widest">Category</label>
                    <select 
                      className="w-full bg-black border border-white/10 rounded-2xl p-5 text-xs font-bold uppercase tracking-widest focus:border-red-600 outline-none transition-all appearance-none"
                      value={newItem.category}
                      onChange={e => setNewItem({...newItem, category: e.target.value as any})}
                    >
                      <option value="Bowl">Bowl</option>
                      <option value="Smoothies">Smoothies</option>
                      <option value="Shake">Shake</option>
                      <option value="Wrap">Wrap</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 ml-1 tracking-widest">Price (INR)</label>
                    <input 
                      type="number" 
                      className="w-full bg-black border border-white/10 rounded-2xl p-5 text-xs font-bold uppercase tracking-widest focus:border-red-600 outline-none"
                      value={newItem.price}
                      onChange={e => setNewItem({...newItem, price: Number(e.target.value)})}
                    />
                  </div>

                  <div className="lg:col-span-3 space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 ml-1 tracking-widest">Product Description & Details</label>
                    <textarea 
                      placeholder="ENTER NUTRITION INFO, INGREDIENTS, OR STORY..."
                      className="w-full bg-black border border-white/10 rounded-2xl p-5 text-xs font-semibold uppercase tracking-widest focus:border-red-600 outline-none min-h-[100px] resize-none"
                      value={newItem.description || ''}
                      onChange={e => setNewItem({...newItem, description: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2 flex flex-col justify-end">
                    <label className="text-[10px] font-black uppercase text-white/40 ml-1 tracking-widest mb-2">Plan Availability</label>
                    <button 
                      onClick={() => setNewItem({...newItem, isTrialFixed: !newItem.isTrialFixed})}
                      className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${newItem.isTrialFixed ? 'bg-red-600 border-red-600 text-white' : 'border-white/10 text-white/40 hover:text-white'}`}
                    >
                      {newItem.isTrialFixed ? 'Trial Plan Fixed' : 'Pro Plan Only'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 ml-1 tracking-widest">Protein (g)</label>
                    <input 
                      type="number" 
                      className="w-full bg-black border border-white/10 rounded-2xl p-5 text-xs font-bold uppercase tracking-widest focus:border-red-600 outline-none"
                      value={newItem.protein}
                      onChange={e => setNewItem({...newItem, protein: Number(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 ml-1 tracking-widest">Calories (kcal)</label>
                    <input 
                      type="number" 
                      className="w-full bg-black border border-white/10 rounded-2xl p-5 text-xs font-bold uppercase tracking-widest focus:border-red-600 outline-none"
                      value={newItem.calories}
                      onChange={e => setNewItem({...newItem, calories: Number(e.target.value)})}
                    />
                  </div>

                  <div className="lg:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 ml-1 tracking-widest">Background Image (URL)</label>
                    <input 
                      type="text" 
                      placeholder="PASTE URL FROM ASSETS TAB..."
                      className="w-full bg-black border border-white/10 rounded-2xl p-5 text-xs font-bold uppercase tracking-widest focus:border-red-600 outline-none"
                      value={newItem.bgImage || ''}
                      onChange={e => setNewItem({...newItem, bgImage: e.target.value})}
                    />
                  </div>

                  <div className="lg:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 ml-1 tracking-widest">Spinning Cut-out PNG (URL)</label>
                    <input 
                      type="text" 
                      placeholder="PASTE URL FROM ASSETS TAB..."
                      className="w-full bg-black border border-white/10 rounded-2xl p-5 text-xs font-bold uppercase tracking-widest focus:border-red-600 outline-none"
                      value={newItem.spinningImage || ''}
                      onChange={e => setNewItem({...newItem, spinningImage: e.target.value})}
                    />
                  </div>

                  <div className="lg:col-span-4 pt-4">
                    <button 
                      onClick={handleAddMenuItem}
                      className="w-full bg-red-600 hover:bg-black hover:text-red-600 border-2 border-red-600 p-6 rounded-2xl font-black italic uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 text-lg"
                    >
                      Authenticate & List Product <Plus size={24} />
                    </button>
                  </div>
               </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between px-4">
                 <div className="flex items-center gap-6">
                   <h3 className="text-xl font-black italic uppercase tracking-tighter">Active <span className="text-red-600">Showcase</span></h3>
                   {menuItems.length > 0 && (
                     <div className="flex bg-neutral-900 border border-white/5 p-1 rounded-xl">
                       <button 
                         onClick={() => {
                           setIsMenuSelectMode(!isMenuSelectMode);
                           setSelectedMenuItemIds(new Set());
                         }}
                         className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isMenuSelectMode ? 'bg-red-600 text-white' : 'text-white/40 hover:text-white'}`}
                       >
                         {isMenuSelectMode ? 'Cancel' : 'Multi-Select'}
                       </button>
                       {isMenuSelectMode && selectedMenuItemIds.size > 0 && (
                         <button 
                           onClick={handleBulkDeleteMenuItems}
                           className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest bg-red-600 text-white animate-pulse"
                         >
                           Delete ({selectedMenuItemIds.size})
                         </button>
                       )}
                     </div>
                   )}
                 </div>
                 <span className="text-[10px] font-black uppercase text-white/20">{menuItems.length} ITEMS SYNCED</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {menuItems.map(item => (
                   <motion.div 
                    layout
                    key={item.id} 
                    onClick={() => isMenuSelectMode && toggleMenuItemSelection(item.id)}
                    className={`bg-neutral-900 border ${item.published ? 'border-red-600/30 shadow-[0_0_20px_rgba(220,38,38,0.1)]' : 'border-white/5'} p-6 rounded-[2.5rem] flex justify-between items-center group transition-all cursor-pointer ${isMenuSelectMode && selectedMenuItemIds.has(item.id) ? 'ring-2 ring-red-600 border-red-600' : ''}`}
                   >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center overflow-hidden border border-white/5 relative">
                           {(item.spinningImage || item.image) ? (
                             <img src={item.spinningImage || item.image || ''} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                           ) : (
                             <Utensils className="text-white/10" size={24} />
                           )}
                           {!item.published && (
                             <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                               <X size={12} className="text-white/40" />
                             </div>
                           )}
                           {isMenuSelectMode && (
                             <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${selectedMenuItemIds.has(item.id) ? 'opacity-100' : 'opacity-0'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedMenuItemIds.has(item.id) ? 'bg-red-600 text-white' : 'border-2 border-white text-white'}`}>
                                   <Check size={16} className={selectedMenuItemIds.has(item.id) ? 'opacity-100' : 'opacity-0'} />
                                </div>
                             </div>
                           )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <div className="text-[10px] font-black uppercase text-red-600 tracking-widest">{item.category}</div>
                            {!item.published && (
                              <span className="bg-white/5 text-[8px] font-black uppercase tracking-widest text-white/20 px-1.5 py-0.5 rounded border border-white/5">Draft</span>
                            )}
                          </div>
                          <div className="font-black italic uppercase text-lg leading-tight tracking-tighter">{item.name}</div>
                          <div className="text-[10px] text-white/30 font-black uppercase mt-1">₹{item.price} • {item.protein}g Protein</div>
                        </div>
                      </div>
                      {!isMenuSelectMode && (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleTogglePublish(item); }}
                            className={`p-4 rounded-2xl ${item.published ? 'bg-green-600/10 text-green-500 hover:bg-green-600 hover:text-white' : 'bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white'} transition-all shadow-lg`}
                            title={item.published ? "Take Offline" : "Go Live"}
                          >
                            {item.published ? <Check size={20} /> : <Zap size={20} />}
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteMenuItem(item.id); }}
                            className="p-4 rounded-2xl bg-white/5 text-white/20 hover:bg-red-600 hover:text-white transition-all shadow-lg"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      )}
                   </motion.div>
                 ))}
              </div>
            </section>
          </main>
        ) : activeTab === 'notes' ? (
          <main className="space-y-12">
            <section className="bg-neutral-900 p-8 rounded-[3rem] border border-white/5">
                <h2 className="text-2xl font-black italic uppercase mb-8 flex items-center gap-3">
                  <FileText className="text-red-600" /> Admin Records
                </h2>
                <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase text-white/40 ml-1 mb-2">History is preserved. Add any data here.</div>
                  <textarea 
                    placeholder="ENTER LOGS, SYSTEM NOTES, OR ANNOUNCEMENTS..."
                    className="w-full bg-black border border-white/10 rounded-3xl p-6 text-sm font-bold uppercase tracking-widest focus:border-red-600 outline-none h-40 resize-none"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                  />
                  <button 
                    onClick={handleAddNote}
                    className="bg-white text-black hover:bg-neutral-200 px-12 py-5 rounded-2xl font-black italic uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl"
                  >
                    Commit to History <History size={20} />
                  </button>
                </div>
            </section>

            <section className="space-y-4">
               {notes.map(note => (
                 <div key={note.id} className="bg-neutral-900 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                      <Save size={100} />
                    </div>
                    <div className="text-[10px] font-black uppercase text-red-600 mb-4 tracking-[0.2em]">
                      Entry: {note.createdAt?.toDate().toLocaleString() || 'Just now'}
                    </div>
                    <p className="text-lg font-black italic uppercase whitespace-pre-wrap">{note.text}</p>
                 </div>
               ))}
            </section>
          </main>
        ) : (
          <ImageManagement />
        )}
      </div>
    </div>
  );
}
