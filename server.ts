/**
 * PlanIQ Master Event Strategy & Logistics Suite - Express Server Entry Point
 * Modular, production-ready server running Vite middlewares in dev and serving static assets in prod.
 */

import express from 'express';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  handleHealthCheck,
  handleGenerateBlueprint,
  handleAssistantChat,
} from './server/controllers/eventController.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(
  process.env.NODE_ENV !== 'production' || process.env.PORT === '8080'
    ? '3000'
    : process.env.PORT || '3000',
  10
);

// High-performance gzip/brotli compression and JSON parsing
app.use(compression());
app.use(express.json({ limit: '256kb' }));

// Security headers middleware
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// PlanIQ API Routes
app.get('/api/health', handleHealthCheck);
app.post('/api/generate-blueprint', handleGenerateBlueprint);
app.post('/api/assistant/chat', handleAssistantChat);

async function startServer(): Promise<void> {
  const distDir = path.join(__dirname, 'dist');
  const distIndex = path.join(distDir, 'index.html');
  const hasDist = fs.existsSync(distIndex);
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    if (hasDist) {
      app.use(express.static(distDir));
      app.get('*', (_req, res) => {
        res.sendFile(distIndex);
      });
    } else {
      console.error('[PlanIQ ERROR] dist/index.html was not found! Run npm run build.');
      app.get('*', (_req, res) => {
        res.status(500).send('PlanIQ Web Service Started — Build Required. Run npm run build.');
      });
    }
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`PlanIQ Master Event Strategist suite running on port ${port}`);
  });
}

startServer();
