import React, { useState, useEffect } from 'react';
import { db, storage, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, Timestamp, deleteDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Trash2, Image as ImageIcon, Settings, Check, X, RefreshCw, AlertCircle, Info, Loader2 } from 'lucide-react';
import { MENU_ITEMS } from '../constants';

interface Asset {
  id: string;
  name: string;
  url: string;
  type: string;
}

interface StatusMessage {
  type: 'success' | 'error' | 'info';
  text: string;
}

export default function ImageManagement() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoLoading, setLogoLoading] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assetName, setAssetName] = useState('');
  const [status, setStatus] = useState<StatusMessage | null>(null);

  const showStatus = (type: 'success' | 'error' | 'info', text: string) => {
    setStatus({ type, text });
    if (type !== 'info') {
      setTimeout(() => setStatus(null), 5000);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const assetSnap = await getDocs(collection(db, 'assets'));
      setAssets(assetSnap.docs.map(d => ({ id: d.id, ...d.data() } as Asset)));
      
      const settingsRef = doc(db, 'settings', 'global');
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists()) {
        setLogoUrl(settingsSnap.data().logoUrl || '');
      }
    } catch (error) {
      console.error("Error fetching assets/settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile || !assetName) {
      showStatus('error', 'Please select a file and enter a name.');
      return;
    }
    
    setUploading(true);
    setUploadProgress(10);
    showStatus('info', 'Preparing upload...');

    try {
      console.log("Starting asset upload for:", assetName);
      const storageRef = ref(storage, `assets/${Date.now()}_${selectedFile.name.replace(/\s+/g, '_')}`);
      
      showStatus('info', 'Uploading to Cloud Storage...');
      setUploadProgress(30);
      
      const snapshot = await uploadBytes(storageRef, selectedFile);
      setUploadProgress(70);
      showStatus('info', 'Getting download URL...');
      
      const url = await getDownloadURL(snapshot.ref);
      setUploadProgress(90);
      
      console.log("Upload successful, mapping to Firestore...");
      showStatus('info', 'Saving mapping to Database...');

      const assetId = assetName.replace(/\s+/g, '_').toLowerCase();
      await setDoc(doc(db, 'assets', assetId), {
        name: assetName,
        url,
        type: selectedFile.type,
        updatedAt: Timestamp.now()
      });

      setUploadProgress(100);
      setSelectedFile(null);
      setAssetName('');
      await fetchData();
      
      setStatus(null);
      showStatus('success', `Asset "${assetName}" uploaded successfully!`);
    } catch (error: any) {
      console.error("Asset upload error details:", error);
      let errorMessage = error.message || 'Unknown error';
      if (error.code === 'storage/unauthorized') {
        errorMessage = 'Storage Permission Denied. Please check Firebase console.';
      }
      setStatus(null);
      showStatus('error', `Mapping failed: ${errorMessage}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (asset: Asset) => {
    if (!confirm(`Are you sure you want to delete mapping for "${asset.name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'assets', asset.id));
      await fetchData();
      showStatus('success', 'Mapping deleted.');
    } catch (error) {
      showStatus('error', 'Failed to delete mapping.');
      handleFirestoreError(error, OperationType.DELETE, `assets/${asset.id}`);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLogoLoading(true);
    showStatus('info', 'Uploading company logo...');
    try {
      console.log("Uploading logo to storage...", file.name);
      const storageRef = ref(storage, `branding/logo_${Date.now()}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      console.log("Logo upload successful:", url);
      showStatus('info', 'Saving logo to settings...');

      const settingsRef = doc(db, 'settings', 'global');
      await setDoc(settingsRef, {
        logoUrl: url,
        updatedAt: Timestamp.now()
      }, { merge: true });
      
      console.log("Logo URL saved to Firestore");

      setLogoUrl(url);
      setStatus(null);
      showStatus('success', 'Company logo updated successfully!');
    } catch (error: any) {
      console.error("Detailed logo upload error:", error);
      let errorMessage = error.message || 'Unknown error';
      if (error.code === 'storage/unauthorized') {
        errorMessage = 'Storage Permission Denied. Check Firebase rules.';
      }
      setStatus(null);
      showStatus('error', `Logo change failed: ${errorMessage}`);
    } finally {
      setLogoLoading(false);
    }
  };

  return (
    <div className="space-y-12 relative pb-20">
      {/* Toast Notifications */}
      <AnimatePresence>
        {status && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-8 left-1/2 z-[150] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border backdrop-blur-xl ${
              status.type === 'success' 
                ? 'bg-green-600/20 border-green-500/50 text-green-400' 
                : status.type === 'info'
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                : 'bg-red-600/20 border-red-500/50 text-red-400'
            }`}
          >
            {status.type === 'success' ? <Check size={20} /> : status.type === 'info' ? <Loader2 className="animate-spin" size={20} /> : <AlertCircle size={20} />}
            <span className="font-black uppercase italic tracking-tighter text-sm">{status.text}</span>
            <button onClick={() => setStatus(null)} className="ml-4 hover:opacity-50">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Branding Section */}
      <section className="bg-neutral-900/40 border border-white/5 p-8 rounded-[2rem] shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
           <div className="bg-red-600/20 p-3 rounded-2xl text-red-600">
             <Settings size={24} />
           </div>
           <h2 className="text-2xl font-black italic uppercase tracking-tighter">Branding <span className="text-red-600">Settings</span></h2>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
           <div className="w-32 h-32 rounded-2xl bg-black border-2 border-white/5 flex items-center justify-center overflow-hidden group relative">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-4" />
              ) : (
                <ImageIcon className="text-white/10" size={40} />
              )}
              {logoLoading && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <RefreshCw className="animate-spin text-red-600" size={24} />
                </div>
              )}
           </div>
           
           <div className="flex-grow space-y-4">
              <div>
                <h3 className="font-black italic uppercase text-lg mb-1">Company Logo</h3>
                <p className="text-sm text-white/40 font-medium">Update your cafe logo across the entire application.</p>
                <div className="text-[10px] font-bold text-red-600 uppercase tracking-widest mt-1">Admin: {auth.currentUser?.email}</div>
              </div>
              <label className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg active:scale-95">
                <Upload size={20} />
                Upload New Logo
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </label>
           </div>
        </div>
      </section>

      {/* Assets Management */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <ImageIcon size={24} className="text-red-600" /> Asset <span className="text-red-600">Inventory</span>
            </h2>
            <p className="text-white/40 text-sm font-medium uppercase tracking-widest mt-1">Map names to Cloud URLs for Menu Items</p>
          </div>
        </div>

        {/* Suggested Names */}
        <div className="bg-neutral-900/40 border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4 text-white/40">
            <Info size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Suggested Item Names (Click to fill)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {MENU_ITEMS.slice(0, 15).map(item => (
              <button 
                key={item.id}
                onClick={() => setAssetName(item.name)}
                className="px-3 py-1 bg-white/5 hover:bg-red-600/20 border border-white/5 hover:border-red-600/50 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all text-white/60 hover:text-white"
              >
                {item.name}
              </button>
            ))}
            <span className="text-[8px] text-white/20 italic self-center">...and more</span>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-neutral-900 border border-white/5 p-8 rounded-[2rem] flex flex-col md:flex-row gap-6 items-end">
           <div className="space-y-2 flex-grow w-full">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Mapping Name (must match Exactly)</label>
              <input 
                type="text" 
                placeholder="Enter Name (e.g. Mexican Paneer Rice Bowl)"
                className="w-full bg-black border border-white/5 rounded-xl py-4 px-4 font-bold text-xs uppercase tracking-widest focus:outline-none focus:border-red-600 transition-all text-white"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
              />
           </div>
           <div className="space-y-2 w-full md:w-auto">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Select PNG/JPG</label>
              <div className="flex items-center gap-3">
                 <label className="flex-grow md:flex-none border-2 border-dashed border-white/10 hover:border-red-600/50 rounded-xl px-6 py-4 flex items-center justify-center gap-3 cursor-pointer transition-all hover:bg-white/5">
                    <ImageIcon size={20} className={selectedFile ? 'text-green-500' : 'text-white/20'} />
                    <span className="text-[10px] font-black uppercase tracking-widest max-w-[120px] truncate">{selectedFile ? selectedFile.name : 'Choose File'}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                 </label>
                 
                 <button 
                   onClick={handleUpload}
                   disabled={uploading || !selectedFile || !assetName}
                   className="h-14 relative bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 text-white px-8 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 overflow-hidden"
                 >
                   {uploading && (
                     <div 
                       className="absolute inset-0 bg-red-800 transition-all duration-300 pointer-events-none" 
                       style={{ width: `${uploadProgress}%` }}
                     />
                   )}
                   <span className="relative z-10 flex items-center gap-2">
                     {uploading ? <RefreshCw className="animate-spin" size={20} /> : <Check size={20} />}
                     {uploading ? `${Math.round(uploadProgress)}%` : 'SAVE MAPPING'}
                   </span>
                 </button>

                 {selectedFile && (
                   <button 
                    onClick={() => setSelectedFile(null)}
                    className="w-14 h-14 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all flex items-center justify-center border border-white/5"
                   >
                     <X size={20} />
                   </button>
                 )}
              </div>
           </div>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 text-xs uppercase tracking-widest">
           {assets.map(asset => (
             <motion.div 
               layout
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               key={asset.id} 
               className="bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden group relative"
             >
                <div className="aspect-square bg-black p-4">
                   <img src={asset.url} alt={asset.name} className="w-full h-full object-contain" />
                </div>
                <div className="p-4 bg-black/50 backdrop-blur-sm">
                   <div className="font-black truncate mb-1">{asset.name}</div>
                   <div className="text-[8px] text-white/30 truncate">ID: {asset.id}</div>
                </div>
                
                <button 
                  onClick={() => handleDelete(asset)}
                  className="absolute top-2 right-2 bg-red-600/20 hover:bg-red-600 text-white/50 hover:text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                >
                  <Trash2 size={16} />
                </button>
             </motion.div>
           ))}

           {assets.length === 0 && !loading && (
             <div className="col-span-full py-20 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center text-white/20 font-black italic uppercase tracking-widest">
               No custom assets mapped yet.
             </div>
           )}
        </div>
      </section>
    </div>
  );
}
