import { Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "./event.types";

// Define a properly typed socket
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerBookingEvents(socket: TypedSocket) {
  socket.on('booking:create', async (data) => {
    try {
      console.log('📅 Booking request received:', data);

      // Simulate booking logic (replace with real DB interaction)
      const bookingId = Math.random().toString(36).substring(2, 10);

      // Send confirmation back to the same client
      socket.emit('booking:confirmed', { bookingId });
    } catch (err) {
      console.error('❌ Booking failed:', err);
      socket.emit('error', { message: 'Failed to create booking' });
    }
  });
}
