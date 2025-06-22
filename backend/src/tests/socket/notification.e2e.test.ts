import { createServer } from 'http';
import { io as ClientIO } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import { config } from '@src/config/environment';
import { AddressInfo } from 'net';
import { initSocket } from '@src/socket';

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

test('🔔 Sends a notification to student room', (done) => {
  const token = jwt.sign({ userId: 'student-42', role: 'STUDENT' }, config.JWT_SECRET);
  const socket = ClientIO(`http://localhost:${port}/notifications`, {
    auth: { token },
    reconnection: false,
  });

  socket.on('connect', () => {
    socket.emit('send:notification', {
      title: 'Exam Alert',
      message: 'CS101 test at 10 AM',
    });
  });

  socket.on('notification:new', (data) => {
    expect(data.title).toBe('Exam Alert');
    expect(data.message).toBe('CS101 test at 10 AM');
    socket.disconnect();
    done();
  });

  socket.on('connect_error', done);
});
