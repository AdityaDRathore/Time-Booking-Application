import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';

import { swaggerSpec } from './config/swagger';
import { config } from './config/environment';
import logger from './utils/logger';
import { AppError, errorTypes } from './utils/errors';
import { sendError } from './utils/response';
import mainRouter from './routes';
import { globalRateLimiter } from './middleware/rateLimiter';
// import { csrfProtection, attachCsrfToken } from './middleware/csrf.middleware'; // uncomment when CSRF is used

const app = express();

/* ─────────────────────────────────────────────────────────────
   Security Middleware
───────────────────────────────────────────────────────────────*/
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https:"],
      objectSrc: ["'none'"],
      imgSrc: ["'self'", "data:", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: true,
  referrerPolicy: { policy: 'no-referrer' },
}));

// Extra X-XSS-Protection Header
app.use((req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// CORS Config
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || config.CORS_ORIGIN.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin} is not allowed.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Rate Limiting
app.use(globalRateLimiter);

/* ─────────────────────────────────────────────────────────────
   Body Parsers (❗️ Must come BEFORE sanitization)
───────────────────────────────────────────────────────────────*/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ─────────────────────────────────────────────────────────────
   Input Sanitization (AFTER body is parsed)
───────────────────────────────────────────────────────────────*/
app.use(xss());
app.use(mongoSanitize());

/* ─────────────────────────────────────────────────────────────
   CSRF Protection (Optional for APIs)
───────────────────────────────────────────────────────────────*/
// app.use(csrfProtection);
// app.use(attachCsrfToken);

/* ─────────────────────────────────────────────────────────────
   API Documentation
───────────────────────────────────────────────────────────────*/
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check
 *     tags: [Utility]
 *     description: Returns status ok to verify API is live.
 *     responses:
 *       200:
 *         description: API is up and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

/* ─────────────────────────────────────────────────────────────
   Main Routes
───────────────────────────────────────────────────────────────*/
app.use('/', mainRouter);

/* ─────────────────────────────────────────────────────────────
   Global Error Handler
───────────────────────────────────────────────────────────────*/
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('❌ ERROR:', err.message);
  logger.error(err.stack);

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  sendError(res, 'Something went wrong', errorTypes.INTERNAL_SERVER);
});

export default app;
