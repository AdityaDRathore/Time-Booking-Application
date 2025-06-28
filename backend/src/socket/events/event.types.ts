export type ClientToServerEvents = {
  'join': (data: { room: string }, ack?: () => void) => void;
  'booking:create': (data: { userId: string; slotId: string }) => void;
  'send:notification': (data: { title: string; message: string }) => void;
  'lab:status': (data: { labId: string; isOccupied: boolean }) => void;
  'slot:cancel': (data: { bookingId: string; slotId: string }) => void;
  'admin:subscribe': () => void; // ✅ NEW
};

export type ServerToClientEvents = {
  'booking:confirmed': (data: { bookingId: string }) => void;
  'notification:new': (data: { title: string; message: string }) => void;
  'lab:status:update': (data: { labId: string; isOccupied: boolean }) => void;
  'slot:available': (data: { slotId: string }) => void;
  'booking:cancelled': (data: { bookingId: string }) => void;
  'admin:system:status': (data: { uptime: number; activeUsers: number; timestamp: string }) => void;
  'admin:analytics': (data: { totalBookings: number; activeLabs: number }) => void;
  'error': (data: { message: string }) => void;
};
