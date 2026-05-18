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
  
  // Pattern 1: https://drive.google.com/file/d/ID/view
  // Pattern 2: https://docs.google.com/open?id=ID
  // Pattern 3: https://docs.google.com/uc?id=ID
  // Pattern 4: https://drive.google.com/thumbnail?id=ID
  // Pattern 5: https://drive.google.com/uc?export=download&id=ID
  const driveMatch = url.match(/\/(?:file\/d\/|open\?id=|uc\?id=|thumbnail\?id=|uc\?export=[a-z]+&id=)([a-zA-Z0-9_-]{28,40})/);
  if (driveMatch && driveMatch[1]) {
    return driveMatch[1];
  }

  // Fallback for simple ID-only strings or query params anywhere in the string
  const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
  const idParam = urlObj.searchParams.get('id') || urlObj.searchParams.get('docid');
  if (idParam && /^[a-zA-Z0-9_-]{28,40}$/.test(idParam)) return idParam;

  // If it's a raw 28-33 char ID (standard drive ID length)
  if (/^[a-zA-Z0-9_-]{28,40}$/.test(url)) {
    return url;
  }

  return null;
}

/**
 * Converts a Drive URL or ID into a direct link.
 * @param urlOrId The Drive URL or File ID
 * @param isVideo If true, returns a link suitable for <video src=""> (using export=media)
 * @returns A direct link to the content
 */
export function getDriveDirectLink(urlOrId: string | null | undefined, isVideo: boolean = false): string {
  if (!urlOrId) return '';
  
  const id = getDriveId(urlOrId);
  if (!id) return urlOrId; // Return as is if we can't extract an ID

  // Video links work best with the 'media' export parameter to avoid HTML 'virus check' pages
  if (isVideo) {
    return `https://drive.google.com/uc?export=media&id=${id}`;
  }

  // Images work best with the thumbnail/content server
  // This endpoint is generally more robust for public display
  return `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;
}

/**
 * Returns a link suitable for an <iframe> preview.
 */
export function getDriveEmbedLink(urlOrId: string | null | undefined): string | null {
  const id = getDriveId(urlOrId);
  if (!id) return null;
  return `https://drive.google.com/file/d/${id}/preview?autoplay=1&mute=1`;
}
