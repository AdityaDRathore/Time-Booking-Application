import { createServer } from 'http';
import app from './app';
import { initSocket } from './socket';
import logger from './utils/logger';

const PORT = process.env.PORT || 4000;

// ✅ Create an HTTP server using Express app
const server = createServer(app);

// ✅ Initialize WebSocket (Socket.IO) on the same server
initSocket(server);

// ✅ Start listening
server.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
});
