// Load .env.test before anything else
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import { initSocket } from '@src/socket';
import { config } from '@src/config/environment';
import { AddressInfo } from 'net';
import { pubClient, subClient } from '@src/socket';

afterAll(async () => {
  await new Promise((resolve) => httpServer.close(resolve));

  // ✅ Clean up Redis clients
  await pubClient?.disconnect?.();
  await subClient?.disconnect?.();
});


let httpServer: ReturnType<typeof createServer>;
let port: number;

beforeAll((done) => {
  httpServer = createServer();
  initSocket(httpServer); // Initialize your actual Socket.IO server logic
  httpServer.listen(() => {
    port = (httpServer.address() as AddressInfo).port;
    done();
  });
});

afterAll(async () => {
  await new Promise((resolve) => httpServer.close(resolve));

  if (pubClient?.isOpen) {
    await pubClient.disconnect();
  }

  if (subClient?.isOpen) {
    await subClient.disconnect();
  }
});


test("✅ valid token connects successfully", (done) => {
  console.log("🧪 JWT_SECRET used in test:", config.JWT_SECRET);

  const token = jwt.sign(
    { userId: "test-user-id", role: "USER" },
    config.JWT_SECRET,
    { expiresIn: "1h" }
  );

  const client = Client(`http://localhost:${port}/notifications`, {
    auth: { token },
    reconnection: false,
  });

  client.on("connect", () => {
    expect(client.connected).toBe(true);
    client.close();
    done();
  });

  client.on("connect_error", (err) => {
    done(err); // Fail test if this is triggered
  });
});

test("❌ invalid token rejected", (done) => {
  const client = Client(`http://localhost:${port}/notifications`, {
    auth: { token: "BAD_TOKEN" },
    reconnection: false,
  });

  client.on("connect", () => {
    done(new Error("Should not connect with invalid token!"));
  });

  client.on("connect_error", (err: any) => {
    expect(err.message).toMatch(/Unauthorized|Invalid/i);
    client.close();
    done();
  });
});
