# WebSocket API (Namespace: /notifications)

## Authentication
- JWT required via `auth.token` during socket connection.

## Events

### Client ➡️ Server

| Event Name         | Payload                          | Description               |
|--------------------|----------------------------------|---------------------------|
| send:notification  | `{ title, message }`             | Send a system notification |
| booking:create     | `{ userId, slotId }`             | Create a booking          |

### Server ➡️ Client

| Event Name         | Payload                          | Description               |
|--------------------|----------------------------------|---------------------------|
| notification:new   | `{ title, message }`             | Notification broadcast    |
| booking:confirmed  | `{ bookingId }`                  | Booking confirmation      |
| lab:status         | `{ labId, isOccupied }`          | Lab occupancy updates     |

## Rooms
- `user:{userId}`
- `role:{role}`
- `lab:{labId}`
