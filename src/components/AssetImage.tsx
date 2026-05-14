import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getGoogleDriveDirectUrl } from '../lib/assets';

interface AssetImageProps {
  assetName: string;
  fallbackUrl: string;
  alt: string;
  className?: string;
}

export default function AssetImage({ assetName, fallbackUrl, alt, className = "" }: AssetImageProps) {
  const [url, setUrl] = useState<string>(fallbackUrl);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function resolveAsset() {
      if (!assetName) {
        setLoading(false);
        return;
      }
      
      try {
        const assetId = assetName.replace(/\s+/g, '_').toLowerCase();
        const assetDoc = await getDoc(doc(db, 'assets', assetId));
        if (assetDoc.exists()) {
          const rawUrl = assetDoc.data().url;
          setUrl(getGoogleDriveDirectUrl(rawUrl));
        }
      } catch (error) {
        console.error("Asset resolution failed:", error);
      } finally {
        setLoading(false);
      }
    }
    
    resolveAsset();
  }, [assetName, fallbackUrl]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-neutral-800 animate-pulse flex items-center justify-center">
           <div className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
      )}
      <img 
        src={url} 
        alt={alt} 
        onLoad={() => setLoading(false)}
        onError={(e) => {
          if (url !== fallbackUrl) {
            setUrl(fallbackUrl);
          }
          setLoading(false);
        }}
        className={`w-full h-full object-cover transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-100'}`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
