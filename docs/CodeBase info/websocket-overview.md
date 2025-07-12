
---

### 📁 Location: `docs/websocket-overview.md`

```md
# 📘 WebSocket System Overview

This document outlines the WebSocket implementation for real-time updates in the Lab Booking System.

---

## 📦 Architecture

- **Socket.IO** with namespaced endpoint: `/notifications`
- **Redis Adapter** used for multi-instance horizontal scaling.
- **Typed Events** defined in TypeScript via `event.types.ts`.

---

## 🔐 Authentication

### JWT Format
Each socket connection must be authenticated using a JWT via:

```ts
io("/notifications", {
  auth: { token: "JWT_TOKEN_HERE" }
});
