import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { router } from './routes';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;

// Ensure uploads and data directories exist
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Static uploads serving (allows viewing and downloading uploaded PC media)
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    // Enable CORS and inline viewing for images & PDFs
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));

// API Routes
app.use('/api', router);

// Root welcome endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'AICTE KOSH-GUARD Security Deposit & FDR Management Engine',
    status: 'ACTIVE',
    apiVersion: 'v1.0.0',
    documentation: '/api/health',
    endpoints: [
      '/api/instruments',
      '/api/upload',
      '/api/institutions',
      '/api/audit-logs',
      '/api/crypto-ledger',
      '/api/notifications',
      '/api/analytics/summary',
      '/api/analytics/export-csv'
    ]
  });
});

// 404 Route Handler for undefined API endpoints
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      error: `API Route not found: ${req.method} ${req.originalUrl}`
    });
  }
  next();
});

// Global Centralized Error Handling Middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[SERVER ERROR]', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: message,
    code: err.code || 'SERVER_ERROR',
    timestamp: new Date().toISOString()
  });
});

// Start Server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🛡️  AICTE KOSH-GUARD Robust Backend Server is Live!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📁 Uploads Directory: ${uploadsDir}`);
  console.log(`⚡ Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

// Graceful shutdown handling
const shutdown = (signal: string) => {
  console.log(`\n[SERVER] Received ${signal}. Gracefully shutting down...`);
  server.close(() => {
    console.log('[SERVER] Closed all active connections. Safe exit.');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export default app;
