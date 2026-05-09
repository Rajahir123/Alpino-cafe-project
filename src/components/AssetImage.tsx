import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

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
          setUrl(assetDoc.data().url);
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
    <img 
      src={url} 
      alt={alt} 
      onError={(e) => {
        if (url !== fallbackUrl) {
          setUrl(fallbackUrl);
        }
      }}
      className={className} 
    />
  );
}
