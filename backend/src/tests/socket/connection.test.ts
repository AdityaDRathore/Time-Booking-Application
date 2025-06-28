import { io as Client, Socket } from "socket.io-client";
import { initSocket, pubClient, subClient } from "@src/socket";
import { createServer, Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { config } from "@src/config/environment";
import { AddressInfo } from "net";
import { prisma } from "@src/repository/base/transaction";
import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "@src/socket/events/event.types";

let httpServer: HTTPServer;
let ioServer: Server<ClientToServerEvents, ServerToClientEvents>;
let port: number;

const TEST_USER_ID = "test-user";

const generateToken = (userId: string, role: string) =>
  jwt.sign({ userId, role }, config.JWT_SECRET);

beforeAll(async () => {
  httpServer = createServer();
  const { io } = await initSocket(httpServer);
  ioServer = io;

  await prisma.user.create({
    data: {
      id: TEST_USER_ID,
      user_name: "Socket Test User",
      user_email: "socket-user@test.com",
      user_password: "dummy",
      user_role: "USER",
    },
  });

  await new Promise<void>((resolve) => {
    httpServer.listen(() => {
      port = (httpServer.address() as AddressInfo).port;
      resolve();
    });
  });
});

afterAll(async () => {
  await prisma.user.delete({ where: { id: TEST_USER_ID } });
  ioServer?.close();
  httpServer?.close();
  if (pubClient?.isOpen) await pubClient.quit();
  if (subClient?.isOpen) await subClient.quit();
});

test("✅ valid token connects successfully", async () => {
  const token = generateToken(TEST_USER_ID, "USER");

  const client: Socket = Client(`http://localhost:${port}/notifications`, {
    auth: { token },
    reconnection: false,
    forceNew: true,
  });

  await new Promise<void>((resolve, reject) => {
    client.on("connect", () => {
      try {
        expect(client.connected).toBe(true);
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        client.disconnect();
      }
    });

    client.on("connect_error", (err: any) => {
      client.disconnect();
      reject(err);
    });
  });
});

test("❌ invalid token rejected", async () => {
  const client: Socket = Client(`http://localhost:${port}/notifications`, {
    auth: { token: "INVALID_TOKEN" },
    reconnection: false,
    forceNew: true,
  });

  await new Promise<void>((resolve, reject) => {
    client.on("connect", () => {
      client.disconnect();
      reject(new Error("Should not connect with invalid token"));
    });

    client.on("connect_error", (err: any) => {
      try {
        expect(err.message).toMatch(/Unauthorized|Invalid/i);
        resolve();
      } catch (e) {
        reject(e);
      } finally {
        client.disconnect();
      }
    });
  });
});
