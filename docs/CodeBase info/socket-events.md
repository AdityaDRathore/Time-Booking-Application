# 📡 Socket.IO Event Catalog

This document describes the structure of all WebSocket events used in the Time Booking system.

---

## 🔄 Client to Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `send:notification` | `{ title: string, message: string }` | Send a notification to all users in a role (e.g. students). |
| `booking:create` | `{ userId: string, slotId: string }` | Request to create a new booking. |
| `lab:status` | `{ labId: string, isOccupied: boolean }` | Notify system of lab occupancy change. |
| `slot:cancel` | `{ bookingId: string }` | Request to cancel a specific booking. |
| `admin:subscribe` | `()` | Admin subscribes to receive dashboard updates. |

---

## 📡 Server to Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `notification:new` | `{ title: string, message: string }` | Sent when a new notification is broadcast. |
| `booking:confirmed` | `{ bookingId: string }` | Confirms that a booking has been created. |
| `lab:status:update` | `{ labId: string, isOccupied: boolean }` | Broadcast lab occupancy updates. |
| `slot:available` | `{ slotId: string }` | Notify users of newly available time slots. |
| `booking:cancelled` | `{ bookingId: string }` | Confirm a booking has been cancelled. |
| `admin:system:status` | `{ uptime: number, activeUsers: number }` | Sent periodically with system uptime and user count. |
| `admin:analytics` | `{ totalBookings: number, activeLabs: number }` | Broadcast analytics to admin dashboards. |
| `error` | `{ message: string }` | Sent when an operation fails or user is unauthorized. |

---

## 🔐 Authentication

- JWT is required for connecting to the namespace `/notifications`.
- The JWT must contain:  
  ```json
  {
    "userId": "string",
    "role": "STUDENT" | "ADMIN"
  }
