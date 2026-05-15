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
  
  // Clean up whitespace
  const cleanUrl = url.trim();

  // If it's already a direct googleusercontent link (common for images)
  if (cleanUrl.includes('googleusercontent.com/d/')) {
    if (isImage) return cleanUrl;
    // For videos, conversion is needed
    const idMatch = cleanUrl.match(/d\/([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://docs.google.com/uc?id=${idMatch[1]}&export=download`;
    }
    return cleanUrl;
  }

  // Handle various sharing formats
  const driveId = 
    cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1] || 
    cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1] ||
    cleanUrl.match(/d\/([a-zA-Z0-9_-]+)/)?.[1] ||
    cleanUrl.match(/\/open\?id=([a-zA-Z0-9_-]+)/)?.[1];

    if (driveId) {
    if (isImage) {
      // images work best via googleusercontent
      return `https://lh3.googleusercontent.com/d/${driveId}`;
    } else {
      // videos work via uc?export=download
      // For small videos (<100MB), this direct link is usually reliable
      return `https://docs.google.com/uc?id=${driveId}&export=download`;
    }
  }

  return cleanUrl;
}
