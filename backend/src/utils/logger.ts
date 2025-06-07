//-------------------------------Logging Utility-------------------------------
import winston from 'winston';
import { config } from '../config/environment';

const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  return JSON.stringify({
    timestamp,
    level,
    message,
    ...metadata,
  });
});

const loggerTransports: winston.transport[] = [
  new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  new winston.transports.File({ filename: 'logs/combined.log' }),
];

// Only add console transports if NOT in 'test' environment
if (config.NODE_ENV !== 'test') {
  if (config.NODE_ENV === 'production') {
    // For production, add the JSON console transport.
    // It will use the default format defined in createLogger below.
    loggerTransports.push(new winston.transports.Console());
  } else {
    // For development (or any other non-test, non-production env),
    // add a colorized, simple console transport.
    loggerTransports.push(
      new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      }),
    );
  }
}

export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.metadata(), // Gathers all metadata passed to logger
    customFormat, // Default format (JSON) for transports that don't override it
  ),
  transports: loggerTransports,
});

// The original conditional add block is now handled by the logic above,
// ensuring 'test' gets no console output from Winston,
// 'development' gets a simple colorized console output,
// and 'production' gets a JSON console output.

export default logger;
