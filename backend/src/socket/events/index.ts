// src/socket/events/index.ts
import { Socket } from 'socket.io';
import { registerBookingEvents } from './booking.events';
import { registerNotificationEvents } from './notification.events';
import { registerLabEvents } from './lab.events';
import { registerSlotEvents } from './slot.events';
import { registerAdminEvents } from './admin.events';

export function registerAllSocketEvents(socket: Socket) {
  registerNotificationEvents(socket);
  registerBookingEvents(socket);
  registerLabEvents(socket);
  registerSlotEvents(socket);
  registerAdminEvents(socket);
}
