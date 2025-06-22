import { createServer } from 'http';
import { io as ClientIO } from 'socket.io-client';
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

const generateToken = (userId: string, role: string) =>
  jwt.sign({ userId, role }, config.JWT_SECRET);

test('🗑️ Slot cancel emits cancellation and availability', (done) => {
  const senderToken = generateToken('u1', 'STUDENT');
  const receiverToken = generateToken('u2', 'STUDENT');

  const senderSocket = ClientIO(`http://localhost:${port}/notifications`, {
    auth: { token: senderToken },
    reconnection: false,
  });

  const receiverSocket = ClientIO(`http://localhost:${port}/notifications`, {
    auth: { token: receiverToken },
    reconnection: false,
  });

  let receivedCancel = false;
  let receivedAvailable = false;

  receiverSocket.on('booking:cancelled', (data) => {
    expect(data.bookingId).toBe('booking-123');
    receivedCancel = true;
  });

  receiverSocket.on('slot:available', (data) => {
    expect(data.slotId).toBe('slot-123');
    receivedAvailable = true;
  });

  setTimeout(() => {
    senderSocket.emit('slot:cancel', {
      bookingId: 'booking-123',
    });

    setTimeout(() => {
      expect(receivedCancel).toBe(true);
      expect(receivedAvailable).toBe(true);

      senderSocket.disconnect();
      receiverSocket.disconnect();
      done();
    }, 300);
  }, 200);
});
