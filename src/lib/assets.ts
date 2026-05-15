import { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export function useAsset(name: string) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!name) {
      setLoading(false);
      return;
    }

    async function fetchAsset() {
      try {
        const assetId = name.replace(/\s+/g, '_').toLowerCase();
        const assetDoc = await getDoc(doc(db, 'assets', assetId));
        if (assetDoc.exists()) {
          setUrl(assetDoc.data().url);
        } else {
          // If not found in assets collection, maybe it's a direct URL or the name itself is the identifier
          // We could also check by name field but ID is faster
          setUrl(null);
        }
      } catch (error) {
        console.error("Error fetching asset:", error);
        setUrl(null);
      } finally {
        setLoading(false);
      }
    }

    fetchAsset();
  }, [name]);

  return { url, loading };
}

export function getGoogleDriveDirectUrl(url: string | null | undefined, isVideo: boolean = false): string {
  if (!url) return '';
  
  // Handle already converted or non-drive URLs
  if (url.includes('googleusercontent.com/d/')) return url;
  if (url.includes('docs.google.com/uc')) {
    const idMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return isVideo 
        ? `https://docs.google.com/uc?export=download&id=${idMatch[1]}`
        : `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
    }
    return url;
  }

  // Handle drive.google.com/file/d/ID/view...
  const driveMatch = url.match(/\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return isVideo 
      ? `https://docs.google.com/uc?export=download&id=${driveMatch[1]}`
      : `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }

  return url;
}
