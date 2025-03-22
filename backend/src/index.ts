import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/environment';
import logger from './utils/logger';
import { AppError, errorTypes } from './utils/errors';
import { sendError } from './utils/response';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.stack);

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  // For unhandled errors
  sendError(res, 'Something went wrong', errorTypes.INTERNAL_SERVER);
});

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;