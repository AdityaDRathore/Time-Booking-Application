import { createServer } from 'http';
import { io as ClientIO, Socket } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import { config } from '@src/config/environment';
import { initSocket } from '@src/socket';
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

test('👥 Multiple users book simultaneously and receive confirmation', (done) => {
  const users = ['u1', 'u2', 'u3'].map((id) =>
    jwt.sign({ userId: id, role: 'STUDENT' }, config.JWT_SECRET)
  );

  let confirmations = 0;

  users.forEach((token, index) => {
    const socket: Socket = ClientIO(`http://localhost:${port}/notifications`, {
      auth: { token },
      reconnection: false,
    });

    socket.on('connect', () => {
      socket.emit('booking:create', {
        userId: `u${index + 1}`,
        slotId: `slot-${index + 1}`,
      });
    });

    socket.on('booking:confirmed', (data: { bookingId: string }) => {
      expect(data.bookingId).toBeDefined();
      socket.disconnect();

      confirmations++;
      if (confirmations === users.length) {
        done();
      }
    });

    socket.on('connect_error', done);
  });
});
