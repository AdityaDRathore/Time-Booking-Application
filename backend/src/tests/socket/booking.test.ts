import { createServer } from 'http';
import { io as ClientIO, Socket } from 'socket.io-client';
import { initSocket } from '@src/socket';
import jwt from 'jsonwebtoken';
import { config } from '@src/config/environment';
import { AddressInfo } from 'net';

let httpServer: ReturnType<typeof createServer>;
let port: number;

beforeAll((done) => {
  httpServer = createServer();
  initSocket(httpServer);
  httpServer.listen(() => {
    port = (httpServer.address() as AddressInfo).port;
    done();
  });
});

afterAll((done) => {
  httpServer.close(done);
});

describe('📅 Booking Events', () => {
  test('✅ Booking event returns confirmation', (done) => {
    const token = jwt.sign({ userId: 'u1', role: 'STUDENT' }, config.JWT_SECRET);

    const socket: Socket = ClientIO(`http://localhost:${port}/notifications`, {
      auth: { token },
      reconnection: false,
    });

    // Handle errors cleanly
    socket.on('connect_error', done);

    socket.on('connect', () => {
      socket.emit('booking:create', {
        userId: 'u1',
        slotId: 'slot42',
      });
    });

    socket.on('booking:confirmed', (data: { bookingId: string }) => {
      expect(data).toHaveProperty('bookingId');
      expect(typeof data.bookingId).toBe('string');
      socket.disconnect();
      done();
    });
  }, 5000); // Optional: custom timeout
});
