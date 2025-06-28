import { Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from './event.types';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerSlotEvents(socket: TypedSocket) {
  socket.on('join', ({ room }, ack) => {
    socket.join(room);
    console.log(`✅ ${socket.data.userId} joined room ${room}`);
    ack?.();
  });

  socket.on('slot:cancel', async (data) => {
    console.log(`🗑️ Slot booking cancelled: ${data.bookingId}`);

    // Notify all in the specific room
    const room = `slot:${data.slotId}`;

    // Emit to everyone in the room except sender
    socket.to(room).emit('booking:cancelled', {
      bookingId: data.bookingId,
    });

    socket.to(room).emit('slot:available', {
      slotId: data.slotId,
    });
  });
}


