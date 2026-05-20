import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, setDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { PLANS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mountain, Calendar, Target, TrendingUp, Truck, 
  ChevronRight, Save, Clock, CheckCircle2, ChevronDown, Info, Utensils, Zap, X
} from 'lucide-react';
import { MenuItem, Order } from '../types';
import AssetImage from '../components/AssetImage';

export default function UserDashboard() {
  const { profile } = useAuth();
  const [tomorrowDate, setTomorrowDate] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecipeId, setShowRecipeId] = useState<string | null>(null);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setTomorrowDate(tomorrow.toISOString().split('T')[0]);
    
    // Fetch orders
    const fetchOrders = async () => {
      if (!profile) return;
      const path = 'orders';
      try {
        const q = query(collection(db, 'orders'), where('userId', '==', profile.uid));
        const unsubscribe = onSnapshot(q, (snap) => {
          const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
          setOrders(fetched);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, path);
        });
        return unsubscribe;
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    };

    // Fetch menu
    const fetchMenu = async () => {
      try {
        const q = query(collection(db, 'menu'), where('published', '==', true));
        const unsubscribe = onSnapshot(q, (snap) => {
          const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem));
          setMenuItems(fetched);
          setLoading(false);
        }, (error) => {
          console.error("Menu fetch failed:", error);
          setLoading(false);
        });
        return unsubscribe;
      } catch (error) {
        console.error("Menu fetch failed:", error);
        setLoading(false);
      }
    };

    const unsubOrders = fetchOrders();
    const unsubMenu = fetchMenu();

    return () => {
      unsubOrders.then(unsub => unsub?.());
      unsubMenu.then(unsub => unsub?.());
    };
  }, [profile]);

  const plan = PLANS.find(p => p.id === profile?.planId);
  
  const availableMenu = useMemo(() => {
    const isTrial = plan?.type === 'trial';
    if (isTrial) {
      return menuItems.filter(i => i.isTrialFixed);
    }
    return menuItems;
  }, [menuItems, plan]);

  // Pre-select current order for tomorrow if it exists
  useEffect(() => {
    if (availableMenu.length > 0 && orders.length > 0) {
      const tomorrowOrder = orders.find(o => o.date === tomorrowDate);
      if (tomorrowOrder && tomorrowOrder.items.length > 0) {
        const item = availableMenu.find(i => i.id === tomorrowOrder.items[0].id);
        if (item) setSelectedItem(item);
      }
    }
  }, [availableMenu, orders, tomorrowDate]);

  const handleSaveToKitchen = async () => {
    if (!profile || !selectedItem) return;
    setSaving(true);
    
    const orderId = `${profile.uid}_${tomorrowDate}`;
    const path = `orders/${orderId}`;
    try {
      await setDoc(doc(db, 'orders', orderId), {
        id: orderId,
        userId: profile.uid,
        userName: profile.name,
        date: tomorrowDate,
        items: [selectedItem],
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      setMessage('Updated Kitchen!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setSaving(false);
    }
  };

  const getDayLeft = () => {
    return profile?.daysRemaining || 0;
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
       <div className="text-red-600 font-black italic uppercase animate-pulse flex items-center gap-3">
         <Zap size={24} /> Syncing Intelligence...
       </div>
    </div>
  );

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDateStr = tomorrow.toISOString().split('T')[0];
  const todayDateStr = new Date().toISOString().split('T')[0];

  const todayOrder = orders.find(o => o.date === todayDateStr);
  const tomorrowOrder = orders.find(o => o.date === tomorrowDateStr);

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
           <div>
             <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-red-600 mb-2 underline underline-offset-8 decoration-red-600/30">Protocol: Active</div>
             <h1 className="text-3xl md:text-4xl font-black italic uppercase leading-none tracking-tighter">Hey {profile?.name.split(' ')[0]}</h1>
           </div>
           <div className="flex w-full md:w-auto bg-neutral-900 border border-white/5 rounded-2xl p-4 divide-x divide-white/10 shadow-lg relative group transition-all hover:border-red-600/30">
              <div className="flex-1 md:flex-none px-4 md:px-6 text-center">
                <div className="text-[10px] font-black uppercase text-white/40 mb-1 tracking-widest">Days Left</div>
                <div className="text-xl md:text-2xl font-black text-white">{getDayLeft()}</div>
              </div>
              <div className="flex-1 md:flex-none px-4 md:px-6 text-center">
                <div className="text-[10px] font-black uppercase text-white/40 mb-1 tracking-widest">Avg Protein</div>
                <div className="text-2xl font-black text-red-600">{profile?.avgProtein}g</div>
                <div className="text-[9px] uppercase font-black text-white/20 mt-1">Goal: {profile?.proteinGoal}g+</div>
              </div>

              {/* Integrity Manifest Tooltip */}
              <div className="absolute top-full left-0 right-0 mt-4 bg-black/95 backdrop-blur-2xl border border-red-600/30 p-5 rounded-[2rem] opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 z-50 pointer-events-none shadow-[0_25px_60px_rgba(220,38,38,0.3)]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-1 bg-red-600 rounded-full animate-ping" />
                  <div className="text-[9px] font-black uppercase tracking-[0.4em] text-red-600">Integrity Protocol Active</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   {['Maida', 'Palm Oil', 'Artificial', 'Sugar'].map(tag => (
                     <div key={tag} className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">{tag}</span>
                        <span className="text-xs font-black text-red-600 italic tracking-tighter">NULL</span>
                     </div>
                   ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 text-center">
                   <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Zero Compromise Logistics</p>
                </div>
              </div>
           </div>
        </div>

        {/* Current Sync Status */}
        <div className="grid md:grid-cols-2 gap-6">
           <div className="bg-red-600 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(220,38,38,0.2)] text-white flex justify-between items-center relative overflow-hidden group">
             <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
               <TrendingUp size={120} />
             </div>
             <div className="relative z-10">
               <div className="text-[10px] font-black uppercase tracking-[0.3em] text-black/60 mb-2">Today's Arrival</div>
               {todayOrder ? (
                 <>
                   <div className="text-2xl font-black italic uppercase leading-none mb-1">{todayOrder.items[0]?.name}</div>
                   <div className="text-[10px] font-black uppercase text-black/40 tracking-widest flex items-center gap-2">
                     <CheckCircle2 size={12} /> Syncing Status: {todayOrder.status}
                   </div>
                 </>
               ) : (
                 <div className="text-2xl font-black italic uppercase">Off Service</div>
               )}
             </div>
             <div className="text-right relative z-10">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-black/60 mb-2">Protein</div>
                <div className="text-3xl font-black italic">{todayOrder?.items[0]?.protein || '--'}g</div>
             </div>
           </div>

           <div className="bg-neutral-900 p-8 rounded-[2.5rem] border border-white/5 shadow-xl flex flex-col justify-center group overflow-hidden relative">
             <div className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-[0.02] group-hover:scale-110 transition-transform duration-700">
                <Truck size={140} />
             </div>
             <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4 relative z-10">Extraction Logistics</div>
             <div className="flex gap-4 items-center relative z-10">
                <div className="p-4 bg-white/5 rounded-2xl text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all"><Truck size={24} /></div>
                <div>
                  <div className="text-sm font-black italic uppercase tracking-tighter truncate max-w-[200px] mb-1">{profile?.address || 'UNSET VECTOR'}</div>
                  <div className="text-[10px] text-white/30 font-black uppercase tracking-widest flex items-center gap-2">
                    <Clock size={12} className="text-red-600" /> Slot: 8:00 AM - 9:00 AM
                  </div>
                </div>
             </div>
           </div>
        </div>

        {/* Change Recipe Section */}
        <section className="bg-neutral-900/50 border border-white/10 rounded-[3.5rem] p-8 md:p-12 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Calendar size={200} />
          </div>
          <div className="flex justify-between items-start mb-12 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">Tomorrow <span className="text-red-600">—</span> Change Recipe</h2>
              </div>
              <p className="text-[10px] md:text-[11px] text-white/40 font-black uppercase tracking-[0.2em] bg-white/5 inline-block px-4 py-2 rounded-xl border border-white/5">Pick before 9 PM — instant kitchen synchronization</p>
            </div>
            <Calendar className="text-red-600 hidden md:block" size={40} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-10">
             {availableMenu.map((item) => (
               <motion.div 
                 key={item.id}
                 layoutId={`item-${item.id}`}
                 whileTap={{ scale: 0.98 }}
                 className={`p-4 md:p-6 rounded-2xl md:rounded-[1.5rem] border-2 cursor-pointer transition-all relative overflow-hidden group ${
                   selectedItem?.id === item.id ? 'border-red-600 bg-red-600/10' : 'border-white/5 bg-black hover:border-white/20'
                 }`}
               >
                  <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
                    <div className="text-[8px] md:text-[10px] font-black tracking-widest text-white/40 uppercase truncate">{item.category}</div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowRecipeId(showRecipeId === item.id ? null : item.id);
                      }}
                      className="p-1 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                    >
                      <Info size={14} />
                    </button>
                  </div>
                  
                  <div 
                    onClick={() => setSelectedItem(item)}
                    className="relative z-10"
                  >
                    <div className="w-full aspect-square mb-4 rounded-xl overflow-hidden border border-white/5 bg-neutral-900 group-hover:scale-105 transition-transform duration-500">
                      <AssetImage 
                        assetName={item.name}
                        fallbackUrl={item.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-black italic uppercase text-[10px] md:text-sm leading-tight mb-2 line-clamp-2 min-h-[2.5em] group-hover:text-red-500 transition-colors">{item.name}</h3>
                    <div className="flex justify-between items-baseline pt-2 border-t border-white/5">
                      <span className="text-sm md:text-lg font-black text-red-600 italic tracking-tighter">{item.protein}g</span>
                      <span className="text-[8px] md:text-[10px] font-black text-white/20 uppercase tracking-widest">Protein</span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {showRecipeId === item.id && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute inset-0 bg-black/95 z-20 p-6 flex flex-col justify-center text-left"
                      >
                         <button 
                           onClick={() => setShowRecipeId(null)}
                           className="absolute top-4 right-4 text-white/40 hover:text-white"
                         >
                           <X size={20} />
                         </button>
                         <h4 className="text-[10px] font-black uppercase text-red-600 mb-2 tracking-[0.2em]">Recipe Intelligence</h4>
                         <p className="text-[11px] font-bold text-white uppercase leading-relaxed tracking-wider">
                           {item.description || 'Calculated nutrition plan for high-performance recovery. Optimized proteins and complex carbohydrates.'}
                         </p>
                         <div className="mt-6 flex flex-wrap gap-2">
                           <div className="bg-white/5 px-2 py-1 rounded text-[8px] font-black uppercase text-white/40">{item.calories} KCAL</div>
                           <div className="bg-white/5 px-2 py-1 rounded text-[8px] font-black uppercase text-white/40">{item.protein}G PROT</div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </motion.div>
             ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-full flex items-center justify-center text-red-600 animate-pulse flex-shrink-0">
                <Clock size={20} />
              </div>
              <div className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-white/60 italic">Updating to kitchen instantly...</div>
            </div>
            
            <button 
              disabled={!selectedItem || saving}
              onClick={handleSaveToKitchen}
              className={`w-full md:w-auto px-10 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                selectedItem ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_30px_rgba(220,38,38,0.3)]' : 'bg-white/5 text-white/20 cursor-not-allowed'
              }`}
            >
              {saving ? 'UPDATING...' : message || 'SAVE TO KITCHEN →'}
              {!saving && !message && <Save size={18} />}
              {message && <CheckCircle2 size={18} />}
            </button>
          </div>
        </section>

        {/* Recent Orders */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-black italic uppercase">Recent Orders</h2>
            <div className="h-[1px] flex-grow bg-white/5" />
          </div>
          
          <div className="space-y-4">
             {orders.length === 0 ? (
               <div className="p-12 border-2 border-dashed border-white/5 rounded-3xl text-center">
                 <div className="text-white/20 font-black uppercase tracking-widest mb-2 italic">Nothing found</div>
                 <p className="text-xs text-white/30 font-medium">Your nutrition journey starts here.</p>
               </div>
             ) : (
               orders.sort((a,b) => b.date.localeCompare(a.date)).map(order => (
                 <div key={order.id} className="bg-neutral-900 border border-white/5 p-6 rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-6">
                      <div className="text-sm font-black italic text-red-600 uppercase w-24">{new Date(order.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</div>
                      <div className="font-bold uppercase text-sm">{order.items[0]?.name}</div>
                    </div>
                    <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      order.status === 'delivered' ? 'bg-green-600/20 text-green-500' : 'bg-red-600/20 text-red-500'
                    }`}>
                      {order.status}
                    </div>
                 </div>
               ))
             )}
          </div>
        </section>
        
      </div>

      {/* Profile/Logout Floating Action */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4">
         <button className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform">
           <Mountain size={24} className="fill-current" />
         </button>
      </div>

    </div>
  );
}
