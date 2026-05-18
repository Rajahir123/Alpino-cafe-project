import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, setDoc, Timestamp } from 'firebase/firestore';
import { MENU_ITEMS, PLANS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mountain, Calendar, Target, TrendingUp, Truck, 
  ChevronRight, Save, Clock, CheckCircle2, ChevronDown 
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
  const [firestoreMenu, setFirestoreMenu] = useState<MenuItem[]>([]);

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
        const snap = await getDocs(q);
        const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        setOrders(fetched);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    };

    // Fetch menu
    const fetchMenu = async () => {
      try {
        const snap = await getDocs(collection(db, 'menu'));
        setFirestoreMenu(snap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem)));
      } catch (error) {
        console.error("Error fetching menu:", error);
      }
    }

    fetchOrders();
    fetchMenu();
  }, [profile]);

  const allMenuItems = (() => {
    const combined = [...MENU_ITEMS];
    firestoreMenu.forEach(fi => {
      const idx = combined.findIndex(ci => ci.id === fi.id);
      if (idx >= 0) combined[idx] = { ...combined[idx], ...fi };
      else combined.push(fi);
    });
    return combined;
  })();

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
        createdAt: Timestamp.now()
      });
      setMessage('Updated Kitchen!');
      setTimeout(() => setMessage(''), 3000);
      
      // Refresh orders
      const q = query(collection(db, 'orders'), where('userId', '==', profile.uid));
      const snap = await getDocs(q);
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      setOrders(fetched);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setSaving(false);
    }
  };

  const getDayLeft = () => {
    return profile?.daysRemaining || 0;
  };

  const plan = PLANS.find(p => p.id === profile?.planId);
  const isTrial = plan?.type === 'trial';
  const availableMenu = isTrial ? allMenuItems.filter(i => i.isTrialFixed) : allMenuItems;

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
           <div>
             <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-600 mb-2 underline underline-offset-8 decoration-red-600/30">Welcome back</div>
             <h1 className="text-3xl md:text-4xl font-black italic uppercase leading-none">Hey {profile?.name.split(' ')[0]}</h1>
           </div>
           <div className="flex w-full md:w-auto bg-neutral-900 border border-white/5 rounded-2xl p-4 divide-x divide-white/10 shadow-lg">
              <div className="flex-1 md:flex-none px-4 md:px-6 text-center">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Days Left</div>
                <div className="text-xl md:text-2xl font-black text-white">{getDayLeft()}</div>
              </div>
              <div className="flex-1 md:flex-none px-4 md:px-6 text-center">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Avg Protein</div>
                <div className="text-2xl font-black text-red-600">{profile?.avgProtein}g</div>
                <div className="text-[9px] uppercase font-bold text-white/20 mt-1">Goal: {profile?.proteinGoal}g+</div>
              </div>
           </div>
        </div>

        {/* Status Bar */}
        <div className="grid md:grid-cols-2 gap-6">
           <div className="bg-red-600 p-8 rounded-[2rem] shadow-xl text-white flex justify-between items-center relative overflow-hidden">
             <div className="absolute -right-4 -bottom-4 opacity-10">
               <TrendingUp size={120} />
             </div>
             <div>
               <div className="text-xs font-bold uppercase tracking-[0.2em] text-black/40 mb-1">Performance</div>
               <div className="text-3xl font-black italic">ON TIME</div>
             </div>
             <div className="text-right">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-black/40 mb-1">Deliveries Done</div>
                <div className="text-3xl font-black italic">--</div>
             </div>
           </div>

           <div className="bg-neutral-900 p-8 rounded-[2rem] border border-white/5 shadow-xl flex flex-col justify-center">
             <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Delivery Details</div>
             <div className="flex gap-4 items-start">
                <div className="p-3 bg-white/5 rounded-2xl text-red-600"><Truck size={24} /></div>
                <div>
                  <div className="text-sm font-bold truncate max-w-[200px]">{profile?.address || 'Set Address in Profile'}</div>
                  <div className="text-xs text-white/40 font-medium">8:00 AM - 9:00 AM Slot</div>
                </div>
             </div>
           </div>
        </div>

        {/* Change Recipe Section */}
        <section className="bg-neutral-900/50 border border-white/10 rounded-[2.5rem] p-6 md:p-10 relative">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-xl md:text-2xl font-black italic uppercase mb-2">Tomorrow — Change Recipe</h2>
              <p className="text-[10px] md:text-xs text-white/40 font-bold uppercase tracking-widest bg-white/5 inline-block px-3 py-1 rounded">Pick before 9 PM tonight — updates kitchen instantly</p>
            </div>
            <Calendar className="text-red-600 hidden md:block" size={32} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-10">
             {availableMenu.map((item) => (
               <motion.div 
                 key={item.id}
                 whileTap={{ scale: 0.98 }}
                 onClick={() => setSelectedItem(item)}
                 className={`p-4 md:p-6 rounded-2xl md:rounded-[1.5rem] border-2 cursor-pointer transition-all ${
                   selectedItem?.id === item.id ? 'border-red-600 bg-red-600/10' : 'border-white/5 bg-black hover:border-white/20'
                 }`}
               >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="text-[8px] md:text-[10px] font-black tracking-widest text-white/40 uppercase truncate">{item.category}</div>
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded overflow-hidden border border-white/10 bg-neutral-900 flex-shrink-0">
                      <AssetImage 
                        assetName={item.name}
                        fallbackUrl={item.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                 <h3 className="font-bold uppercase text-[10px] md:text-sm leading-tight mb-2 md:mb-4 line-clamp-2 min-h-[2.5em]">{item.name}</h3>
                 <div className="flex justify-between items-baseline">
                   <span className="text-sm md:text-lg font-black text-red-600 italic">{item.protein}g</span>
                   <span className="text-[8px] md:text-[10px] font-bold text-white/30 uppercase">Protein</span>
                 </div>
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
