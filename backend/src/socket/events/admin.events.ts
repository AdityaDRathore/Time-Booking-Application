import { Server, Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from './event.types';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

const ADMIN_ROOM = 'admin:dashboard';

/**
 * Handles admin dashboard event subscriptions.
 */
export function registerAdminEvents(socket: TypedSocket) {
  const user = (socket as any).user;

  socket.on('admin:subscribe', () => {
    if (user.role === 'ADMIN') {
      socket.join(ADMIN_ROOM);
      console.log(`🛠️ Admin ${user.id} joined dashboard`);
    } else {
      socket.emit('error', { message: 'Unauthorized access to admin dashboard' });
    }
  });
}

/**
 * Emits real-time system stats and analytics to all admins in the dashboard room.
 */
export function emitAdminStatus(io: Server<ClientToServerEvents, ServerToClientEvents>) {
  io.of('/notifications').to(ADMIN_ROOM).emit('admin:system:status', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    activeUsers: io.of('/notifications').sockets.size, // actual count
  });

  io.of('/notifications').to(ADMIN_ROOM).emit('admin:analytics', {
    totalBookings: Math.floor(Math.random() * 200), // mock for now
    activeLabs: Math.floor(Math.random() * 20),     // mock for now
  });
}
