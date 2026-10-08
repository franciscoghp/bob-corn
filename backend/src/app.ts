import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { rateLimiter } from './middleware/rateLimiter';
import { buyCorn } from './controllers/cornController';
import { getClientStats } from './controllers/statsController';
import { initDatabase } from './db/connection';

dotenv.config();

/**
 * Builds the Express app without starting a server, so it can run both
 * locally (src/index.ts) and as a Vercel serverless function (api/index.ts).
 */
export function createApp() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Trust proxy for accurate IP addresses (important for rate limiting)
  app.set('trust proxy', true);

  // Request logging middleware (development only)
  if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: "Bob's Corn API"
    });
  });

  // Initialize the schema once per process (a cold start in serverless).
  // If it fails, the next request retries instead of crashing the process.
  let ready: Promise<void> | null = null;
  app.use(async (req, res, next) => {
    try {
      if (!ready) {
        ready = initDatabase().catch((error) => {
          ready = null;
          throw error;
        });
      }
      await ready;
      next();
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      res.status(503).json({
        error: 'Service Unavailable',
        message: 'Database is not available. Please try again.'
      });
    }
  });

  // API Routes
  app.post('/api/buy-corn', rateLimiter, buyCorn);
  app.get('/api/stats/:clientId', getClientStats);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.path} not found`
    });
  });

  // Global error handler
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message
    });
  });

  return app;
}
