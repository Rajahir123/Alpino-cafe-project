import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Utensils, Clock, CheckCircle2, Truck, AlertTriangle, Zap } from 'lucide-react';

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for today and future orders
    const today = new Date().toISOString().split('T')[0];
    try {
      const q = query(collection(db, 'orders'), where('date', '>=', today));
      
      const unsubscribe = onSnapshot(q, (snap) => {
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'orders (kitchen feed)');
      });

      return () => unsubscribe();
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'orders (kitchen feed query setup)');
    }
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    const path = `orders/${orderId}`;
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const activeOrders = orders
    .filter(o => o.status !== 'delivered')
    .sort((a, b) => {
      const timeA = a.updatedAt?.toMillis() || a.createdAt?.toMillis() || 0;
      const timeB = b.updatedAt?.toMillis() || b.createdAt?.toMillis() || 0;
      return timeB - timeA;
    });
  const todayOrders = activeOrders.filter(o => o.date === todayStr);
  const futureOrders = activeOrders.filter(o => o.date > todayStr);

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-red-600 italic">SYNCING KITCHEN...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <Utensils size={16} md:size={20} />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">Kitchen OS</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">Live <span className="text-red-600">Service</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/hub" className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-600 rounded-xl border border-red-600/20 transition-all text-[10px] font-black uppercase tracking-widest">
              <Zap size={14} /> Hub
            </Link>
            <div className="h-10 md:h-12 flex items-center gap-4 bg-neutral-900 border border-white/5 px-4 md:px-6 rounded-full">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-ping shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-widest italic">{activeOrders.length} LIVE TICKETS</span>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-12">
           {/* Section 1: Today's Prep */}
           <section className="space-y-8">
             <div className="flex items-center gap-4">
               <div className="bg-red-600 p-2 rounded-lg text-white"><Clock size={20} /></div>
               <h2 className="text-2xl font-black italic uppercase tracking-tighter italic underline decoration-red-600 underline-offset-8">Prep For Today</h2>
             </div>

             <div className="space-y-6">
                {todayOrders.length === 0 ? (
                  <div className="bg-neutral-900/50 p-12 rounded-[2rem] border-2 border-dashed border-white/5 text-center text-white/20 font-black italic uppercase italic tracking-widest">
                    Kitchen empty — All clear.
                  </div>
                ) : (
                  todayOrders.map(order => (
                    <motion.div 
                      key={order.id}
                      layout
                      className="bg-neutral-900 border border-white/5 p-6 md:p-8 rounded-[2rem] shadow-xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 py-2 px-4 md:px-6 bg-red-600 text-white font-black italic uppercase text-[8px] md:text-[10px] tracking-widest">Urgent</div>
                      
                      <div className="flex justify-between items-start mb-6">
                         <div>
                           <div className="text-[8px] md:text-[10px] font-black uppercase text-red-600 tracking-widest mb-1 italic">Ticket #{order.id.slice(-4)}</div>
                           <h3 className="text-xl md:text-2xl font-black italic uppercase leading-none">{order.userName}</h3>
                         </div>
                         <div className="text-right">
                            <div className="text-[8px] md:text-[10px] font-bold uppercase text-white/30 tracking-widest">Status</div>
                            <div className="text-xs md:text-sm font-black italic text-white uppercase">{order.status}</div>
                         </div>
                      </div>

                      <div className="space-y-2 md:space-y-3 mb-8">
                        {order.items.map((item, idx) => (
                           <div key={idx} className="flex justify-between items-center p-3 md:p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="font-black uppercase italic tracking-tighter text-sm md:text-lg">{item.name}</div>
                            <div className="text-[8px] md:text-[10px] font-bold uppercase p-1 bg-red-600 rounded text-white shrink-0 ml-2">{item.category}</div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <button 
                            onClick={() => updateStatus(order.id, 'preparing')}
                            className="flex-grow bg-white text-black h-12 md:h-14 rounded-2xl font-black uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                          >
                            Start Prep <Utensils size={18} />
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button 
                            onClick={() => updateStatus(order.id, 'out-for-delivery')}
                            className="flex-grow bg-red-600 text-white h-12 md:h-14 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(220,38,38,0.3)] text-sm md:text-base"
                          >
                            Out for Delivery <Truck size={18} />
                          </button>
                        )}
                        {order.status === 'out-for-delivery' && (
                          <button 
                            onClick={() => updateStatus(order.id, 'delivered')}
                            className="flex-grow bg-green-600 text-white h-12 md:h-14 rounded-2xl font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(22,163,74,0.2)] text-sm md:text-base"
                          >
                            Mark Delivered <CheckCircle2 size={18} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
             </div>
           </section>

           {/* Section 2: Future Outlook */}
           <section className="space-y-8">
             <div className="flex items-center gap-4">
               <div className="bg-neutral-800 p-2 rounded-lg text-white/50"><AlertTriangle size={20} /></div>
               <h2 className="text-2xl font-black italic uppercase tracking-tighter italic text-white/40">Incoming Orders</h2>
             </div>
             
             <div className="space-y-4">
                {futureOrders.map(order => (
                  <div key={order.id} className="bg-neutral-900/50 border border-white/5 p-6 rounded-2xl flex justify-between items-center group hover:bg-neutral-900 transition-all">
                     <div>
                        <div className="text-[10px] font-black uppercase text-white/20 tracking-widest italic">{new Date(order.date).toLocaleDateString(undefined, {weekday: 'long', month: 'short', day: 'numeric'})}</div>
                        <div className="font-black italic uppercase tracking-tighter text-lg leading-tight">{order.userName}</div>
                        <div className="text-[10px] font-bold uppercase text-red-600 italic">{order.items[0]?.name}</div>
                     </div>
                     <div className="text-right">
                        <div className="text-2xl font-black italic text-white/10 group-hover:text-red-500/20 transition-all italic">FUTURE</div>
                     </div>
                  </div>
                ))}
                {futureOrders.length === 0 && (
                  <div className="text-center p-8 text-white/10 font-black italic uppercase text-sm tracking-widest">No future tickets yet.</div>
                )}
             </div>
           </section>
        </div>
      </div>
    </div>
  );
}
