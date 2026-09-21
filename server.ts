import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { app } from './src/server/app';
import './src/server/env'; // Run environment validation

const PORT = 3000;

import fs from 'fs';
async function startServer() {
  app.use((req, res, next) => {
    fs.appendFileSync(
      'requests.log',
      `[${new Date().toISOString()}] ${req.method} ${req.url} ${req.headers.accept}\n`,
    );
    next();
  });
  // Mount Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    // Optional comma-separated host allowlist for proxied dev environments
    // (e.g. cloud workspaces/previews). Unset = Vite's secure default.
    const allowedHosts = (process.env.VITE_ALLOWED_HOSTS || '')
      .split(',')
      .map((host) => host.trim())
      .filter(Boolean);
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ...(allowedHosts.length > 0 ? { allowedHosts } : {}),
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built assets
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('Shutting down server gracefully...');
    server.close(() => {
      console.log('Server shut down.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
