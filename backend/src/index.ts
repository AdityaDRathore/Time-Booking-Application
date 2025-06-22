// src/index.ts

import { createServer } from 'http';
import app from './app';
import { initSocket } from './socket';
import logger from './utils/logger';
import { config } from './config/environment';

const PORT = Number(config.PORT) || 4000;

// Create HTTP server with Express app
const server = createServer(app);

// Initialize WebSocket (Socket.IO) support
initSocket(server);

// Start the server
server.listen(PORT, () => {
  logger.info(`🚀 Server running at http://localhost:${PORT}`);
});

// Optional: Handle server errors gracefully
server.on('error', (err) => {
  logger.error(`❌ Server failed to start: ${err.message}`);
  process.exit(1);
});
