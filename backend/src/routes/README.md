# 🧭 API Routing Structure

## 📌 Base Path
All APIs are versioned and prefixed with:/api/v1

---

## 📂 Route Grouping

| Module        | Path Prefix        | Route File             | Controller(s)               |
|---------------|--------------------|------------------------|-----------------------------|
| 🔐 Auth       | `/auth`            | `auth.routes.ts`       | `auth.controller.ts`        |
| 🧪 Labs       | `/labs`            | `lab.routes.ts`        | `lab.controller.ts`         |
| 👑 SuperAdmin | `/superadmin`      | `superadmin.routes.ts` | `superadmin.controller.ts`  |
| 👤 Users      | `/users`           | `user.routes.ts`       | `user.controller.ts`        |
| 📅 TimeSlots  | `/timeslots`       | `timeslot.routes.ts`   | `timeslot.controller.ts`    |
| 📕 Booking    | `/bookings`        | `booking.routes.ts`    | `booking.controller.ts`     |
| 🕓 Waitlist   | `/waitlist`        | `waitlist.routes.ts`   | `waitlist.controller.ts`    |
| 🔔 Notify     | `/notifications`   | `notification.routes.ts`| `notification.controller.ts`|

All routes are registered centrally in:src/routes/index.ts

---

## 🛡️ Middleware Strategy

Middleware applied globally or per route to ensure consistent access control, validation, and error handling.

### 🌐 Global Middleware (`src/index.ts`)
| Middleware       | Purpose                                 |
|------------------|-----------------------------------------|
| `helmet()`       | Sets secure HTTP headers                |
| `cors()`         | Enables CORS with specified origin      |
| `express.json()` | Parses incoming JSON requests           |
| `urlencoded()`   | Parses URL-encoded payloads             |
| `globalErrorHandler` | Handles thrown errors uniformly     |

### 🔐 Route-Level Middleware
| Middleware       | File Location                   | Purpose                                 |
|------------------|----------------------------------|-----------------------------------------|
| `authMiddleware` | `authorization/middleware/`      | Verifies JWT/session/token auth         |
| `rbacMiddleware` | `authorization/middleware/`      | Enforces role-based resource access     |
| `validate()`     | `middleware/validation.ts`       | Validates request body/query using Zod  |

---

## ✅ Naming Convention

| Resource        | Route File Name      | Notes                              |
|------------------|----------------------|-------------------------------------|
| Labs             | `lab.routes.ts`      | All lab-related routes              |
| Users            | `user.routes.ts`     | CRUD, profile, role-specific ops    |
| Bookings         | `booking.routes.ts`  | Booking, cancellation, listings     |
| TimeSlots        | `timeslot.routes.ts` | CRUD + batch slot operations        |
| Notifications    | `notification.routes.ts` | Push/read status, preferences    |

Controllers follow the naming pattern:  <resource>.controller.ts

---

## 📘 Example API Flow

**GET /api/v1/users/:id**
- ✅ Validated with Zod schema
- 🔐 Authenticated via `authMiddleware`
- 🛂 Authorized via `rbacMiddleware`
- 📤 Responds via `sendSuccess(res, data)`
- ❌ Errors handled via `AppError` + `globalErrorHandler`

---

Let me know if you'd like this automatically added to your project as a markdown file or want help generating Swagger docs (`swagger-jsdoc + swagger-ui-express`).



