# 🧩 Prisma Service Layer – Documentation

This document provides a complete overview of the service layer implemented in the **Time Booking Application**. It follows a modular architecture using the **Repository-Service pattern**, integrates **Prisma ORM**, and includes full test coverage.

---

## 📁 Folder Structure Reference

Key locations in the codebase:

src/
├── services/
│ ├── Booking/
│ ├── Lab/
│ ├── Notification/
│ ├── TimeSlot/
│ ├── User/
│ ├── Waitlist/
│ └── Integeration/
├── repository/
├── tests/
│ └── Repository/
│ └── helpers/
│ └── database/


---

## 🔧 Service Layer Purpose

The service layer acts as the **business logic hub**. It interacts with repositories (data layer), performs validation, enforces rules, and exposes clean methods for use in controllers or workflows.

---

## 🧱 Responsibilities of Each Service

### 1. **BookingService**
- Create bookings with checks for duplicates
- Handle auto-waitlisting if lab is full
- Promote waitlisted user on booking deletion
- Methods:
  - `createBooking(dto)`
  - `updateBooking(id, dto)`
  - `getBookingById(id)`
  - `deleteBooking(id)`
  - `getAllBookings()`

### 2. **LabService**
- CRUD for labs
- Includes validation for capacity
- Methods:
  - `createLab()`
  - `updateLab()`
  - `getAllLabs()`

### 3. **TimeSlotService**
- Create and fetch time slots
- Prevent overlapping time slots
- Methods:
  - `createTimeSlot()`
  - `getTimeSlotById()`
  - `getAllSlotsByLab()`

### 4. **UserService**
- CRUD for users
- Role handling (optional future)
- Methods:
  - `createUser()`
  - `getUserById()`
  - `updateUser()`

### 5. **WaitlistService**
- Add/remove/promote users in waitlist
- Maintain queue order per slot
- Methods:
  - `addToWaitlist()`
  - `removeFromWaitlist()`
  - `promoteFirstInWaitlist()`

### 6. **NotificationService**
- Handles sending notifications (email/DB)
- Methods:
  - `sendNotification()`
  - `getNotificationsForUser()`

---

## 🔁 Design Principles

| Principle              | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| Separation of Concerns | Each service handles business logic only, leaving data access to repository |
| Reusability            | Services can be reused across routes/controllers                            |
| Testability            | Each service is independently testable (see `__tests__` folders)            |
| Consistency            | Common patterns and interfaces used across all services                     |

---

## 🔬 Testing Structure

| Layer       | Location                                   |
|-------------|--------------------------------------------|
| Unit Tests  | `services/<Entity>/__tests__`              |
| Integration | `services/Integeration/booking-flow.test.ts`|
| Repository  | `tests/Repository/`                        |

Use `Vitest` and `vi.mock()` for mocking dependencies and `prisma-mock.ts` for simulating DB.

---

## 📦 Integration Services

### `LabTimeSlotIntegrationService.ts`
- Used for flow-based operations that span multiple services like creating a lab and adding slots in a single action.

---

## 🚀 Usage Example

```ts
const bookingService = new BookingService();

await bookingService.createBooking({
  user_id: 'abc123',
  slot_id: 'slot456',
  purpose: 'Project Discussion',
});
