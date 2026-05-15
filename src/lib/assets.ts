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

export function getGoogleDriveDirectUrl(url: string | null | undefined, isImage: boolean = true): string {
  if (!url) return '';
  
  // Handle already converted or non-drive URLs
  if (url.includes('googleusercontent.com/d/')) {
    if (isImage) return url;
    // If it's a video but we have a direct image link, try to extract ID
    const idMatch = url.match(/d\/([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/uc?id=${idMatch[1]}&confirm=t`;
    }
    return url;
  }

  const ucMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
  const pathMatch = url.match(/\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
  
  const driveId = ucMatch?.[1] || pathMatch?.[1];

  if (driveId) {
    if (isImage) {
      return `https://lh3.googleusercontent.com/d/${driveId}`;
    } else {
      // Use drive.google.com/uc?export=download for best binary stream compatibility in video tags
      return `https://drive.google.com/uc?export=download&id=${driveId}&confirm=t`;
    }
  }

  return url;
}
