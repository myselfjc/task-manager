import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { taskRouter } from './routes/task.routes';
import { authRouter } from './routes/auth.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security headers
app.use(helmet());

// CORS – origin from env (e.g. CORS_ORIGIN=http://localhost:3000)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  })
);

// Request body size limit (e.g. 100kb for JSON)
app.use(express.json({ limit: '100kb' }));

// Rate limiting – 100 requests per 15 minutes per IP (higher in test)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 10000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health / liveness endpoint (cloud readiness)
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/tasks', taskRouter);

app.use(errorHandler);

export { app };
