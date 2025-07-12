import { Server as IOServer } from 'socket.io';
import { createServer } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient, RedisClientType } from 'redis';

import { socketAuthMiddleware } from './middleware/auth';
import { registerAllSocketEvents } from './events';
import { registerAdminEvents, emitAdminStatus } from './events/admin.events';
import { config } from '../config/environment';
import { ClientToServerEvents, ServerToClientEvents } from './events/event.types';
import { getUserRoom, getRoleRoom } from './utils/roomNames';

// Redis clients
export let pubClient: RedisClientType | undefined;
export let subClient: RedisClientType | undefined;

// Exported io instance
export let io: IOServer<ClientToServerEvents, ServerToClientEvents>;

export async function initSocket(appServer: ReturnType<typeof createServer>) {
  io = new IOServer<ClientToServerEvents, ServerToClientEvents>(appServer, {
    cors: {
      origin: config.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) throw new Error('❌ REDIS_URL not set in environment');

  // Connect Redis clients
  pubClient = createClient({ url: redisUrl });
  subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));
  console.log('🔗 Redis adapter connected');

  // Set up /notifications namespace
  const notificationNS = io.of('/notifications');
  notificationNS.use(socketAuthMiddleware);

  notificationNS.on('connection', (socket) => {
    const user = (socket as any).user;

    if (!user?.id || !user?.role) {
      console.warn('⚠️ Invalid user object on socket:', user);
      return socket.disconnect(true);
    }

    console.log(`🔌 User ${user.id} connected to /notifications`);

    // Join user & role-based rooms
    socket.join(getUserRoom(user.id));
    socket.join(getRoleRoom(user.role));

    // Register domain-specific events
    registerAllSocketEvents(socket);
    registerAdminEvents(socket);

    socket.on('disconnect', (reason) => {
      console.log(`❌ User ${user.id} disconnected: ${reason}`);
    });

    socket.onAny((event, ...args) => {
      if (event === 'reconnect_attempt') {
        console.log(`♻️ User ${user.id} is trying to reconnect...`);
      }
    });
  });

  // Emit admin status periodically (skip in test env)
  if (process.env.NODE_ENV !== 'test') {
    setInterval(() => emitAdminStatus(io), 5000);
  }

  return { io, notificationNS };
}

export async function closeRedisClients() {
  try {
    if (pubClient?.isOpen) {
      await pubClient.quit();
      console.log('🔌 pubClient disconnected');
    }
    if (subClient?.isOpen) {
      await subClient.quit();
      console.log('🔌 subClient disconnected');
    }
  } catch (err) {
    console.warn('⚠️ Redis disconnection error:', err);
  }
}
