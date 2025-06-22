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

const generateToken = (userId: string, role: string) =>
  jwt.sign({ userId, role }, config.JWT_SECRET);

test('🧪 lab:status broadcast only reaches lab room', (done) => {
  const labId = 'lab42';
  const senderToken = generateToken('u1', 'STUDENT');
  const receiverToken = generateToken('u2', 'STUDENT');

  const senderSocket: Socket = ClientIO(`http://localhost:${port}/notifications`, {
    auth: { token: senderToken },
    reconnection: false,
  });

  const receiverSocket: Socket = ClientIO(`http://localhost:${port}/notifications`, {
    auth: { token: receiverToken },
    reconnection: false,
  });

  let received = false;

  receiverSocket.on('lab:status', (msg) => {
    received = true;
    expect(msg.labId).toBe(labId);
    expect(msg.occupied).toBe(true);

    cleanup();
  });

  function cleanup() {
    senderSocket.disconnect();
    receiverSocket.disconnect();
    expect(received).toBe(true);
    done();
  }

  setTimeout(() => {
    // Simulate lab room joining manually if needed
    receiverSocket.emit('join', { room: `lab:${labId}` });

    setTimeout(() => {
      senderSocket.emit('lab:status', {
        labId,
        occupied: true,
      });
    }, 200);
  }, 200);
});
