// src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/environment';
import logger from './utils/logger';
import { AppError, errorTypes } from './utils/errors';
import { sendError } from './utils/response';
import mainRouter from './routes'; // Main router

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount all routes under /api/v1/*
app.use(mainRouter);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Global error handler
app.use(
  (err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error(err.stack);

    if (err instanceof AppError) {
      return sendError(res, err.message, err.statusCode);
    }

    sendError(res, 'Something went wrong', errorTypes.INTERNAL_SERVER);
  }
);

// Start server
const PORT = Number(config.PORT) || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
