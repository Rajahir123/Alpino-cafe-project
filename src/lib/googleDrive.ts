/**
 * Utility for handling Google Drive URLs and IDs.
 * Specifically handles converting sharing links to direct media links for <video> and <img> tags.
 */

export const DEFAULT_LOADING_VIDEO_URL = "https://drive.google.com/file/d/1xJmDA3BB_LXduFDkiWWuBI7C7NbB6dbV/view?usp=sharing";

// This will be used once the Vercel Blob upload is successful
export const VERCEL_BLOB_LOADING_VIDEO_URL = ""; 


/**
 * Extracts a Google Drive file ID from various Drive URL formats.
 */
export function getDriveId(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // Clean the URL
  const cleanUrl = url.trim();

  // Pattern 1: /file/d/ID/...
  const fileDMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]{20,100})/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  // Pattern 2: id=ID or docid=ID
  try {
    const urlObj = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
    const idParam = urlObj.searchParams.get('id') || urlObj.searchParams.get('docid');
    if (idParam && /^[a-zA-Z0-9_-]{20,100}$/.test(idParam)) return idParam;
  } catch (e) {
    // If URL parsing fails, try query param regex
    const queryMatch = cleanUrl.match(/[?&](?:id|docid)=([a-zA-Z0-9_-]{20,100})/);
    if (queryMatch && queryMatch[1]) return queryMatch[1];
  }

  // Pattern 3: /d/ID/... (Alternative drive format)
  const dMatch = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]{20,100})/);
  if (dMatch && dMatch[1]) return dMatch[1];

  // Pattern 4: /folders/ID (Not an image, but good to handle)
  const foldersMatch = cleanUrl.match(/\/folders\/([a-zA-Z0-9_-]{20,100})/);
  if (foldersMatch && foldersMatch[1]) return foldersMatch[1];

  // If it's a raw 20-100 char ID
  if (/^[a-zA-Z0-9_-]{20,100}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  return null;
}

const BROKEN_UNSPLASH_MAP: Record<string, string> = {
  '1541167760496-162955ed8a9f': '1495474472287-4d71bcdd2085',
  '1594132220641-768565780517': '1495474472287-4d71bcdd2085',
  '1556484681-d9d3000ce8fc': '1495474472287-4d71bcdd2085',
  '1544145940-2761d15c7e7b': '1495474472287-4d71bcdd2085',
  '1543644574-19750f5194b5': '1589135398305-587b7a11ad2d',
  '1572286258217-48887a05442b': '1559496417-e7f25cb247f3',
  '1662116765994-4e321adec670': '1561651823-34feb02250e4'
};

/**
 * Converts a Drive URL or ID into a direct link.
 * @param urlOrId The Drive URL or File ID
 * @param isVideo If true, returns a link suitable for <video src=""> (using export=media)
 * @returns A direct link to the content
 */
export function getDriveDirectLink(urlOrId: string | null | undefined, isVideo: boolean = false): string {
  if (!urlOrId) return '';
  
  // Quick fix for known broken Unsplash URLs
  let processedUrl = urlOrId;
  for (const [broken, fixed] of Object.entries(BROKEN_UNSPLASH_MAP)) {
    if (urlOrId.includes(broken)) {
      processedUrl = urlOrId.replace(broken, fixed);
      break;
    }
  }

  const id = getDriveId(processedUrl);
  if (!id) return processedUrl; // Return as is if we can't extract an ID

  // Video links work best with the 'media' export parameter to avoid HTML 'virus check' pages
  if (isVideo) {
    return `https://drive.google.com/uc?export=media&id=${id}`;
  }

  // Images work best with the thumbnail/content server
  // lh3.googleusercontent.com is generally the most robust for public display
  return `https://lh3.googleusercontent.com/d/${id}=w1600`;
}

/**
 * Returns a link suitable for an <iframe> preview.
 */
export function getDriveEmbedLink(urlOrId: string | null | undefined): string | null {
  const id = getDriveId(urlOrId);
  if (!id) return null;
  return `https://drive.google.com/file/d/${id}/preview?autoplay=1&mute=1`;
}
