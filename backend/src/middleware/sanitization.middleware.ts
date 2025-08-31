import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import { Express } from 'express';

export const applySanitizers = (app: Express) => {
  app.use(xss()); // XSS Protection
  app.use(mongoSanitize()); // Prevents NoSQL Injection
};
