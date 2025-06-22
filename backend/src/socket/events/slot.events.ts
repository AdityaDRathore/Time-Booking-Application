import { Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from './event.types';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerSlotEvents(socket: TypedSocket) {
  socket.on('slot:cancel', async (data) => {
    console.log(`🗑️ Slot booking cancelled: ${data.bookingId}`);

    // Notify all users (or specific ones if needed)
    socket.broadcast.emit('booking:cancelled', {
      bookingId: data.bookingId,
    });

    // Optionally: make slot available again
    const freedSlotId = 'slot-123'; // This would come from DB in real app
    socket.broadcast.emit('slot:available', {
      slotId: freedSlotId,
    });
  });
}
