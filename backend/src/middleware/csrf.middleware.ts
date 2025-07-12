import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import { Request, Response, NextFunction } from 'express';

const csrfProtection = csrf({ cookie: true });

const attachCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  next();
};

export { csrfProtection, attachCsrfToken };
