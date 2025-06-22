import { Socket } from 'socket.io';
import { registerBookingEvents } from './booking.events';
import { registerNotificationEvents } from './notification.events';
import { registerLabEvents } from './lab.events';

export function registerAllSocketEvents(socket: Socket) {
  registerBookingEvents(socket);
  registerNotificationEvents(socket);
  registerLabEvents(socket);
}
