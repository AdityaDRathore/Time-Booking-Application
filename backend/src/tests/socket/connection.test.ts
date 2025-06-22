import { io as Client } from "socket.io-client";
import { initSocket } from "@src/socket";
import { createServer, Server } from "http";
import jwt from "jsonwebtoken";
import { config } from "@src/config/environment";
import { AddressInfo } from "net";

let httpServer: Server;
let ioServer: ReturnType<typeof initSocket>["io"];
let port: number;

// Helper to generate a valid token
const generateToken = (userId: string, role: string) =>
  jwt.sign({ userId, role }, config.JWT_SECRET);

beforeAll((done) => {
  httpServer = createServer();
  const { io } = initSocket(httpServer);
  ioServer = io;

  httpServer.listen(() => {
    port = (httpServer.address() as AddressInfo).port;
    done();
  });
});

afterAll((done) => {
  ioServer.close();
  httpServer.close(done);
});

test("✅ valid token connects successfully", (done) => {
  const token = generateToken("test-user", "STUDENT");

  const client = Client(`http://localhost:${port}/notifications`, {
    auth: { token },
    reconnection: false,
  });

  client.on("connect", () => {
    expect(client.connected).toBe(true);
    client.close();
    done();
  });

  client.on("connect_error", (err: any) => done(err));
});

test("❌ invalid token rejected", (done) => {
  const client = Client(`http://localhost:${port}/notifications`, {
    auth: { token: "BAD_TOKEN" },
    reconnection: false,
  });

  client.on("connect", () => {
    done(new Error("Should not connect!"));
  });

  client.on("connect_error", (err: any) => {
    expect(err.message).toMatch(/Unauthorized|Invalid/i);
    client.close();
    done();
  });
});
