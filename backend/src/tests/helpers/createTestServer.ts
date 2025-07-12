import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Namespace } from 'socket.io';
import { AddressInfo } from 'net';
import app from '@src/app';
import { initSocket } from '@src/socket';
import { ClientToServerEvents, ServerToClientEvents } from '@src/socket/events/event.types';

export async function createTestServer(): Promise<{
  io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
  notificationNS: Namespace<ClientToServerEvents, ServerToClientEvents>;
  server: HTTPServer;
  port: number;
  close: () => Promise<void>;
}> {
  const server = new HTTPServer(app);

  // 🔌 Initialize socket.io on this server
  const { io, notificationNS } = await initSocket(server);

  return new Promise((resolve) => {
    server.listen(() => {
      const { port } = server.address() as AddressInfo;

      resolve({
        io,
        notificationNS,
        server,
        port,
        close: async () => {
          await io.close();
          await new Promise((res) => server.close(res));
        },
      });
    });
  });
}
