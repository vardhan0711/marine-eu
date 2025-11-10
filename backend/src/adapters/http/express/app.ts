import express, { Express } from 'express';
import cors from 'cors';
import { RouteRepository } from '../../../core/ports/RouteRepository';
import { ComplianceRepository } from '../../../core/ports/ComplianceRepository';
import { PoolRepository } from '../../../core/ports/PoolRepository';
import { createRoutesRouter } from './routes/routes.routes';
import { createComplianceRouter } from './routes/compliance.routes';
import { createBankingRouter } from './routes/banking.routes';
import { createPoolsRouter } from './routes/pools.routes';

export function createApp(
  routeRepository: RouteRepository,
  complianceRepository: ComplianceRepository,
  poolRepository: PoolRepository
): Express {
  const app = express();

  // ✅ CORS for localhost dev (3000, 3001 & 5173)
  const ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS blocked for origin: ${origin}`));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.options("*", cors());
  app.use(express.json());

  // Routes
  app.use('/routes', createRoutesRouter(routeRepository));
  app.use('/compliance', createComplianceRouter(complianceRepository));
  app.use('/banking', createBankingRouter());
  app.use('/pools', createPoolsRouter(poolRepository));

  // Health check
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // Error handling middleware
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  });

  return app;
}
