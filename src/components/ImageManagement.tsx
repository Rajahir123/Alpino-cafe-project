import React, { useState, useEffect } from 'react';
import { db, storage, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, getDocs, doc, setDoc, Timestamp, deleteDoc, getDoc, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion } from 'motion/react';
import { Upload, Trash2, Image as ImageIcon, Settings, Check, X, RefreshCw, Link as LinkIcon, ExternalLink, Info, CloudCheck } from 'lucide-react';
import { usePersistedState } from '../hooks/usePersistedState';

interface Asset {
  id: string;
  name: string;
  url: string;
  type: string;
}

export default function ImageManagement() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [loadingUrl, setLoadingUrl] = useState('');
  const [loadingVideoUrl, setLoadingVideoUrl] = useState('');
  const [logoLoading, setLogoLoading] = useState(false);
  const [loadingPageLoading, setLoadingPageLoading] = useState(false);
  const [loadingVideoLoading, setLoadingVideoLoading] = useState(false);
  
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assetName, setAssetName] = usePersistedState('asset_name', '');
  const [logoMode, setLogoMode] = usePersistedState<'upload' | 'blob'>('logo_mode', 'blob');
  const [loadingMode, setLoadingMode] = usePersistedState<'upload' | 'blob'>('loading_mode', 'blob');
  const [loadingVideoMode, setLoadingVideoMode] = usePersistedState<'upload' | 'blob'>('loading_video_mode', 'blob');
  const [assetMode, setAssetMode] = usePersistedState<'upload' | 'blob'>('asset_mode', 'blob');
  
  const uploadToBlob = async (file: File, isMenu: boolean = false) => {
    // Convert file to base64 for server transport
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.readAsDataURL(file);
    });

    const prefix = isMenu ? 'menu/' : '';
    const response = await fetch('/api/upload-blob', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: `${prefix}${Date.now()}_${file.name}`,
        contentType: file.type,
        data: base64
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to upload to Vercel Blob');
    }

    return await response.json(); // { url: '...' }
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
        setLoadingUrl(settingsSnap.data().loadingUrl || '');
        setLoadingVideoUrl(settingsSnap.data().loadingVideoUrl || '');
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
    if (!selectedFile || !assetName) return;
    setUploading(true);
    try {
      let url = '';
      let type = selectedFile.type;

      if (assetMode === 'blob') {
        const blob = await uploadToBlob(selectedFile, true);
        url = blob.url;
      } else {
        const storageRef = ref(storage, `assets/${Date.now()}_${selectedFile.name}`);
        const snapshot = await uploadBytes(storageRef, selectedFile);
        url = await getDownloadURL(snapshot.ref);
      }

      const assetId = assetName.replace(/\s+/g, '_').toLowerCase();
      await setDoc(doc(db, 'assets', assetId), {
        name: assetName,
        url,
        type,
        updatedAt: Timestamp.now()
      });

      setSelectedFile(null);
      setAssetName('');
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Error saving asset');
      handleFirestoreError(error, OperationType.WRITE, `assets ${assetMode} upload`);
    } finally {
      setUploading(false);
    }
  };

  const handleSettingUpload = async (file: File, field: 'logoUrl' | 'loadingUrl' | 'loadingVideoUrl', mode: 'upload' | 'blob' = 'upload') => {
    const isLogo = field === 'logoUrl';
    const isVideo = field === 'loadingVideoUrl';
    
    if (isLogo) setLogoLoading(true);
    else if (isVideo) setLoadingVideoLoading(true);
    else setLoadingPageLoading(true);

    try {
      let url = '';
      if (mode === 'blob') {
        const blob = await uploadToBlob(file);
        url = blob.url;
      } else {
        const storageRef = ref(storage, `branding/${field}_${Date.now()}`);
        const snapshot = await uploadBytes(storageRef, file);
        url = await getDownloadURL(snapshot.ref);
      }

      const settingsRef = doc(db, 'settings', 'global');
      await setDoc(settingsRef, {
        [field]: url,
        updatedAt: Timestamp.now()
      }, { merge: true });

      if (isLogo) setLogoUrl(url);
      else if (isVideo) setLoadingVideoUrl(url);
      else setLoadingUrl(url);
      alert(`${isLogo ? 'Logo' : isVideo ? 'Loading video' : 'Loading interface'} uploaded to ${mode === 'blob' ? 'Vercel' : 'Firebase'} successfully!`);
    } catch (error: any) {
      alert(error.message || 'Upload failed');
      handleFirestoreError(error, OperationType.WRITE, `${field} ${mode} upload`);
    } finally {
      if (isLogo) setLogoLoading(false);
      else if (isVideo) setLoadingVideoLoading(false);
      else setLoadingPageLoading(false);
    }
  };

  const handleDelete = async (asset: Asset) => {
    try {
      await deleteDoc(doc(db, 'assets', asset.id));
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `assets/${asset.id}`);
    }
  };

  const toggleAssetSelection = (id: string) => {
    const newSelected = new Set(selectedAssetIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAssetIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedAssetIds.size === 0) return;
    const batch = writeBatch(db);
    selectedAssetIds.forEach(id => {
      batch.delete(doc(db, 'assets', id));
    });
    
    try {
      setLoading(true);
      await batch.commit();
      setSelectedAssetIds(new Set());
      setIsSelectMode(false);
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'bulk assets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Branding Section */}
      <section className="bg-neutral-900/40 border border-white/5 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Settings size={120} className="animate-[spin_20s_linear_infinite]" />
        </div>
        
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
              <div className="bg-red-600/20 p-3 rounded-2xl text-red-600">
                <Settings size={24} />
              </div>
              <h2 className="text-2xl font-black italic uppercase italic tracking-tighter">Branding <span className="text-red-600">Settings</span></h2>
           </div>
           <div className="flex items-center gap-2 text-green-500/30">
              <CloudCheck size={16} />
              <span className="text-[8px] font-black uppercase tracking-widest">Saved to Season</span>
           </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
            <div className="w-32 h-32 rounded-3xl bg-black border-2 border-white/10 flex items-center justify-center overflow-hidden group relative shadow-2xl">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-4" referrerPolicy="no-referrer" />
              ) : (
                <ImageIcon className="text-white/10" size={40} />
              )}
              {logoLoading && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <RefreshCw className="animate-spin text-red-600" size={24} />
                </div>
              )}
            </div>
           
           <div className="flex-grow space-y-6 w-full md:w-auto">
              <div className="space-y-2">
                <h3 className="font-black italic uppercase text-lg">Main Enterprise Logo</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setLogoMode('upload')}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${logoMode === 'upload' ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                  >
                    Firebase
                  </button>
                  <button 
                    onClick={() => setLogoMode('blob')}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${logoMode === 'blob' ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}
                  >
                    Vercel Blob
                  </button>
                </div>
              </div>

              <label className={`inline-flex items-center gap-3 ${logoMode === 'blob' ? 'bg-blue-600' : 'bg-white'} ${logoMode === 'blob' ? 'text-white' : 'text-black'} hover:opacity-80 px-8 py-4 rounded-xl font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg active:scale-95 group`}>
                <Upload size={20} />
                Upload to {logoMode === 'blob' ? 'Vercel' : 'Firebase'}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleSettingUpload(e.target.files[0], 'logoUrl', logoMode)} />
              </label>
           </div>
        </div>

        <div className="mt-12 pt-12 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
            <div className="w-32 h-32 rounded-3xl bg-black border-2 border-white/10 flex items-center justify-center overflow-hidden group relative shadow-2xl">
              {loadingUrl ? (
                <img src={loadingUrl} alt="Loading Page" className="w-full h-full object-contain p-4" referrerPolicy="no-referrer" />
              ) : (
                <RefreshCw className="text-white/10" size={40} />
              )}
              {loadingPageLoading && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <RefreshCw className="animate-spin text-red-600" size={24} />
                </div>
              )}
            </div>

           <div className="flex-grow space-y-6 w-full md:w-auto">
              <div className="space-y-2">
                <h3 className="font-black italic uppercase text-lg">Custom Loading Interface</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setLoadingMode('upload')}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${loadingMode === 'upload' ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                  >
                    Firebase
                  </button>
                  <button 
                    onClick={() => setLoadingMode('blob')}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${loadingMode === 'blob' ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}
                  >
                    Vercel Blob
                  </button>
                </div>
              </div>

              <label className={`inline-flex items-center gap-3 ${loadingMode === 'blob' ? 'bg-blue-600' : 'bg-white'} ${loadingMode === 'blob' ? 'text-white' : 'text-black'} hover:opacity-80 px-8 py-4 rounded-xl font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg active:scale-95 group`}>
                <Upload size={20} />
                Upload to {loadingMode === 'blob' ? 'Vercel' : 'Firebase'}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleSettingUpload(e.target.files[0], 'loadingUrl', loadingMode)} />
              </label>
           </div>
        </div>

        <div className="mt-12 pt-12 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
           <div className="w-32 h-32 rounded-3xl bg-black border-2 border-white/10 flex items-center justify-center overflow-hidden group relative shadow-2xl">
              {loadingVideoUrl ? (
                <div className="w-full h-full p-4 flex items-center justify-center bg-red-600/10">
                   <LinkIcon size={32} className="text-red-600" />
                </div>
              ) : (
                <RefreshCw className="text-white/10" size={40} />
              )}
              {loadingVideoLoading && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <RefreshCw className="animate-spin text-red-600" size={24} />
                </div>
              )}
           </div>

           <div className="flex-grow space-y-6 w-full md:w-auto">
              <div className="space-y-2">
                <h3 className="font-black italic uppercase text-lg">Custom Loading Video (BG)</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setLoadingVideoMode('upload')}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${loadingVideoMode === 'upload' ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                  >
                    Firebase
                  </button>
                  <button 
                    onClick={() => setLoadingVideoMode('blob')}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${loadingVideoMode === 'blob' ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}
                  >
                    Vercel Blob
                  </button>
                </div>
              </div>

              <label className={`inline-flex items-center gap-3 ${loadingVideoMode === 'blob' ? 'bg-blue-600' : 'bg-white'} ${loadingVideoMode === 'blob' ? 'text-white' : 'text-black'} hover:opacity-80 px-8 py-4 rounded-xl font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg active:scale-95 group`}>
                <Upload size={20} />
                Upload to {loadingVideoMode === 'blob' ? 'Vercel' : 'Firebase'}
                <input type="file" className="hidden" accept="video/*" onChange={(e) => e.target.files?.[0] && handleSettingUpload(e.target.files[0], 'loadingVideoUrl', loadingVideoMode)} />
              </label>

              {loadingVideoUrl && (
                <p className="text-[10px] font-black uppercase text-green-500 flex items-center gap-2">
                   <Check size={12} /> Video background is active
                </p>
              )}
           </div>
        </div>
      </section>

      {/* Assets Management */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black italic uppercase italic tracking-tighter flex items-center gap-3">
              <ImageIcon size={24} className="text-red-600" /> Asset <span className="text-red-600">Forge</span>
            </h2>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Populate the menu items with industrial precision</p>
          </div>
          
          <div className="flex items-center gap-4">
            {assets.length > 0 && (
              <div className="flex bg-neutral-900 border border-white/5 p-1 rounded-xl">
                <button 
                  onClick={() => {
                    setIsSelectMode(!isSelectMode);
                    setSelectedAssetIds(new Set());
                  }}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isSelectMode ? 'bg-red-600 text-white' : 'text-white/40 hover:text-white'}`}
                >
                  {isSelectMode ? 'Cancel Selection' : 'Multi-Select'}
                </button>
                {isSelectMode && selectedAssetIds.size > 0 && (
                  <button 
                    onClick={handleBulkDelete}
                    className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest bg-red-600 text-white animate-pulse"
                  >
                    Delete ({selectedAssetIds.size})
                  </button>
                )}
              </div>
            )}

            <div className="flex bg-neutral-900 border border-white/5 p-1 rounded-xl">
              <div className="flex items-center gap-2 px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-lg mr-4">
                <Info size={12} className="text-red-500" />
                <span className="text-[8px] font-black uppercase text-red-500 tracking-widest whitespace-nowrap">Vercel Blob storage: active</span>
              </div>
              <button 
                onClick={() => setAssetMode('upload')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${assetMode === 'upload' ? 'bg-white text-black' : 'text-white/40'}`}
              >
                <Upload size={14} /> Firebase
              </button>
              <button 
                onClick={() => setAssetMode('blob')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${assetMode === 'blob' ? 'bg-blue-600 text-white' : 'text-white/40'}`}
              >
                <Upload size={14} /> Vercel Blob
              </button>
            </div>
          </div>
        </div>

        {/* Combined Form */}
        <div className="bg-neutral-900 border border-white/5 p-8 rounded-[3rem] shadow-xl relative group">
           <div className="grid md:grid-cols-2 gap-8 items-end">
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Menu Item Matching Name (EXACT)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mexican Paneer Rice Bowl"
                      className="w-full bg-black border border-white/10 rounded-2xl py-5 px-6 font-bold text-xs uppercase tracking-widest focus:outline-none focus:border-red-600 transition-all text-white"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                    />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Select PNG/JPG Source for {assetMode === 'blob' ? 'Vercel' : 'Firebase'}</label>
                    <label className={`w-full h-[62px] border-2 border-dashed ${assetMode === 'blob' ? 'border-blue-600/30 hover:border-blue-600' : 'border-white/10 hover:border-red-600/50'} rounded-2xl px-6 flex items-center gap-4 cursor-pointer transition-all hover:bg-white/5 bg-black`}>
                       <div className="bg-white/5 p-2 rounded-lg">
                         <ImageIcon size={20} className={selectedFile ? 'text-green-500' : 'text-white/20'} />
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">{selectedFile ? selectedFile.name : `Choose Asset for ${assetMode === 'blob' ? 'Vercel' : 'Industrial'} Storage`}</span>
                       <input type="file" className="hidden" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                    </label>
                 </div>
              </div>

              <div className="flex flex-col gap-4">
                 <button 
                   onClick={handleUpload}
                   disabled={uploading || !assetName || !selectedFile}
                   className={`w-full h-[62px] ${assetMode === 'blob' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl ${assetMode === 'blob' ? 'shadow-blue-600/20' : 'shadow-red-600/20'} flex items-center justify-center gap-3 text-lg`}
                 >
                   {uploading ? <RefreshCw className="animate-spin" size={24} /> : <Check size={24} />}
                   {uploading ? 'FUSING ASSET...' : assetMode === 'blob' ? 'BLOB FORGE' : 'FORGE ASSET'}
                 </button>
              </div>
           </div>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
           {assets.map(asset => (
             <motion.div 
               layout
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               key={asset.id} 
               onClick={() => isSelectMode && toggleAssetSelection(asset.id)}
               className={`bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden group relative hover:border-red-600/50 transition-all shadow-xl cursor-pointer ${isSelectMode && selectedAssetIds.has(asset.id) ? 'ring-2 ring-red-600 border-red-600' : ''}`}
             >
                <div className="aspect-square bg-black p-4 relative group-hover:scale-105 transition-transform duration-700">
                   <img src={asset.url} alt={asset.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                   {asset.type === 'image/external' && (
                     <div className="absolute top-4 left-4 bg-red-600 p-1.5 rounded-lg shadow-lg">
                        <LinkIcon size={12} className="text-white" />
                     </div>
                   )}
                   {isSelectMode && (
                     <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${selectedAssetIds.has(asset.id) ? 'opacity-100' : 'opacity-0 hover:opacity-40'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedAssetIds.has(asset.id) ? 'bg-red-600 text-white' : 'border-2 border-white text-white'}`}>
                           <Check size={24} className={selectedAssetIds.has(asset.id) ? 'opacity-100' : 'opacity-0'} />
                        </div>
                     </div>
                   )}
                </div>
                <div className="p-6 bg-black/40 backdrop-blur-md">
                   <div className="font-black italic uppercase tracking-tighter truncate text-sm mb-1">{asset.name}</div>
                   <div className="flex items-center justify-between">
                    <div className="text-[8px] font-bold uppercase text-white/20 tracking-tighter truncate">ID: {asset.id}</div>
                    {!isSelectMode && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(asset); }}
                        className="bg-white/5 hover:bg-red-600 text-white/20 hover:text-white p-2 rounded-lg transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                   </div>
                </div>
                
                {!isSelectMode && (
                  <a href={asset.url} target="_blank" rel="noreferrer" className="absolute top-4 right-4 bg-black/80 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-white/50 hover:text-white">
                    <ExternalLink size={14} />
                  </a>
                )}
             </motion.div>
           ))}

           {assets.length === 0 && !loading && (
             <div className="col-span-full py-32 bg-neutral-900/50 border-4 border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center gap-6 opacity-40">
                <ImageIcon size={64} className="text-white/20" />
                <div className="text-center">
                  <div className="text-xl font-black italic uppercase tracking-[0.2em]">The Vault is Empty.</div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Start forging assets to customize the menu.</p>
                </div>
             </div>
           )}
        </div>
      </section>
    </div>
  );
}

