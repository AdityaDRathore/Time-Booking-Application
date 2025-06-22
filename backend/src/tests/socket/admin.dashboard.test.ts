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

test('🛠️ Admin dashboard receives system status', (done) => {
  const adminToken = jwt.sign({ userId: 'admin-1', role: 'ADMIN' }, config.JWT_SECRET);

  const socket = ClientIO(`http://localhost:${port}/notifications`, {
    auth: { token: adminToken },
    reconnection: false,
  });

  socket.on('connect', () => {
    socket.emit('admin:subscribe');
  });

  socket.on('admin:system:status', (data) => {
    expect(data).toHaveProperty('uptime');
    expect(data).toHaveProperty('activeUsers');
  });

  socket.on('admin:analytics', (data) => {
    expect(data).toHaveProperty('totalBookings');
    expect(data).toHaveProperty('activeLabs');

    socket.disconnect();
    done();
  });

  socket.on('connect_error', done);
});

