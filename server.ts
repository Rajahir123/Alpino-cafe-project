import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { put } from '@vercel/blob';
import { Readable } from 'stream';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON and body for Vercel Blob
  app.use(express.json({ limit: '100mb' }));

  // API Route for Vercel Blob Upload
  // NOTE: This route should be protected in a real app, but for this demo/request
  // it will check for the token to be present in the environment.
  app.post('/api/upload-blob', async (req, res) => {
    try {
      const { filename, contentType, data } = req.body;
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      
      if (!token) {
        return res.status(500).json({ 
          error: 'BLOB_READ_WRITE_TOKEN is not configured in Vercel/Environment.' 
        });
      }

      // Convert base64 data back to buffer if provided that way
      const buffer = Buffer.from(data, 'base64');

      const blob = await put(filename, buffer, {
        contentType,
        access: 'public',
        token: token,
      });

      res.json(blob);
    } catch (error: any) {
      console.error('Blob upload error:', error);
      let errorMessage = error.message;
      if (errorMessage.includes('private store')) {
        errorMessage = 'Vercel Blob Error: Your store is configured as PRIVATE. Please go to your Vercel Dashboard -> Storage -> Blob -> Settings and change "Storage Visibility" to PUBLIC so your website can play the videos.';
      }
      res.status(500).json({ error: errorMessage });
    }
  });

  // Google Drive Proxy to bypass cookie/auth/referer issues
  app.get('/api/drive-proxy', async (req, res) => {
    const { id, isVideo } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).send('File ID is required');
    }

    try {
      // Use the direct media link
      const driveUrl = isVideo === 'true' 
        ? `https://drive.google.com/uc?export=media&id=${id}&confirm=t`
        : `https://drive.google.com/uc?export=download&id=${id}`;

      const response = await fetch(driveUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        return res.status(response.status).send('Failed to fetch from Google Drive');
      }

      // Copy headers for caching and content type
      const contentType = response.headers.get('content-type');
      if (contentType) res.setHeader('Content-Type', contentType);
      
      const contentLength = response.headers.get('content-length');
      if (contentLength) res.setHeader('Content-Length', contentLength);

      // Best for images: tell the browser it can cache this 
      res.setHeader('Cache-Control', 'public, max-age=31536000');

      // Stream the response body directly to Express res
      if (response.body) {
        // @ts-ignore - Readable.fromWeb exists in Node 18+
        Readable.fromWeb(response.body).pipe(res);
      } else {
        res.status(500).send('No response body from Drive');
      }
    } catch (error: any) {
      console.error('Drive proxy error:', error);
      res.status(500).send('Error proxying Google Drive file');
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
