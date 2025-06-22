import { Server as IOServer } from 'socket.io';
import { createServer } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient, RedisClientType } from 'redis';

import { socketAuthMiddleware } from './middleware/auth';
import { registerAllSocketEvents } from './events';
import { emitAdminStatus } from './events/admin.events';
import { config } from '../config/environment';
import { ClientToServerEvents, ServerToClientEvents } from './events/event.types';
import { getUserRoom, getRoleRoom } from './utils/roomNames';

// 🔓 Export Redis clients for cleanup in test
export let pubClient: RedisClientType | undefined;
export let subClient: RedisClientType | undefined;

export function initSocket(appServer: ReturnType<typeof createServer>) {
  const io = new IOServer<ClientToServerEvents, ServerToClientEvents>(appServer, {
    cors: {
      origin: config.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) throw new Error('❌ REDIS_URL not set in environment');

  // 🌐 Connect Redis clients
  pubClient = createClient({ url: redisUrl });
  subClient = pubClient.duplicate();

  Promise.all([pubClient.connect(), subClient.connect()])
    .then(() => {
      io.adapter(createAdapter(pubClient!, subClient!));
      console.log('🔗 Redis adapter connected');
    })
    .catch((err) => {
      console.error('❌ Redis connection failed:', err);
    });

  const notificationNS = io.of('/notifications');

  // 🔐 Attach authentication middleware
  notificationNS.use(socketAuthMiddleware);

  // 📡 Connection handling
  notificationNS.on('connection', (socket) => {
    const user = (socket as any).user;

    if (!user?.id || !user?.role) {
      console.warn('⚠️ Invalid user object on socket:', user);
      return socket.disconnect(true);
    }

    console.log(`🔌 User ${user.id} connected to /notifications`);

    // 🏷️ Room assignments
    socket.join(getUserRoom(user.id));
    socket.join(getRoleRoom(user.role));

    // ⚙️ Register domain-specific events
    registerAllSocketEvents(socket);

    socket.on('disconnect', (reason) => {
      console.log(`❌ User ${user.id} disconnected: ${reason}`);
    });

    socket.onAny((event, ...args) => {
      if (event === 'reconnect_attempt') {
        console.log(`♻️ User ${user.id} is trying to reconnect...`);
      }
    });
  });

  // 📊 Periodic status only outside test mode
  if (process.env.NODE_ENV !== 'test') {
    setInterval(() => emitAdminStatus(io), 5000);
  }

  return { io, notificationNS };
}
