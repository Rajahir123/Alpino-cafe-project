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
      setLoading(true);
      try {
        // 1. Try matching by Name (e.g. "Banana Shake")
        const nameId = assetName.replace(/\s+/g, '_').toLowerCase();
        const nameDoc = await getDoc(doc(db, 'assets', nameId));
        
        if (nameDoc.exists()) {
          setUrl(nameDoc.data().url);
          return;
        }

        // 2. Try matching by Filename if fallback was a local path (e.g. "input_file_0.png")
        if (fallbackUrl && (fallbackUrl.startsWith('/') || fallbackUrl.includes('input_file'))) {
          const filename = fallbackUrl.split('/').pop()?.toLowerCase() || '';
          if (filename) {
            const fileDoc = await getDoc(doc(db, 'assets', filename));
            if (fileDoc.exists()) {
              setUrl(fileDoc.data().url);
              return;
            }
          }
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
