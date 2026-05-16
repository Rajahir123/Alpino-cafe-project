import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { put } from '@vercel/blob';

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
