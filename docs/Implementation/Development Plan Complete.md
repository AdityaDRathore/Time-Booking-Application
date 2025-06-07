# Unified Development Plan: Time-Booking Application

This document provides a synchronized development plan for the Time-Booking Application, integrating tasks from both the backend and frontend roadmaps. It highlights dependencies and outlines a logical progression for development.

## Legend
- `[x]` Task Completed
- `[ ]` Task Pending

---

## OVERARCHING PHASE 1: Initial Setup & Foundation (Partially Completed)

This phase covers the initial project setup for both backend and frontend, including database configuration and basic application structure.

### Backend: Database & Prisma Setup Foundation
Corresponds to Backend Plan - PHASE 1 (Partially Completed)

*   **Day 1: Database Connection & Schema Finalization (Completed)**
    *   [x] Task 1.1: Database Environment Setup
        *   [x] Verify PostgreSQL connection parameters in `.env` file.
        *   [x] Ensure Docker container for PostgreSQL is running correctly.
        *   [x] Test database connectivity with existing configuration.
    *   [x] Task 1.2: Prisma Schema Review
        *   [x] Review existing schema for any missing fields or relationships.
        *   [x] Verify entity relationships match the ERD documentation.
        *   [x] Ensure all necessary indexes are defined for performance.
    *   [x] Task 1.3: Generate Prisma Client
        *   [x] Run Prisma generate command to create type-safe client.
        *   [x] Verify client generation completes without errors.
        *   [x] Ensure generated types are properly recognized by TypeScript.
    *   [x] Task 1.4: Initial Migration Creation
        *   [x] Create and apply initial migration to establish database schema.
        *   [x] Check migration logs for any issues.
        *   [x] Verify tables are created with correct structure.
*   **Day 2: Seed Data Implementation (Completed)**
    *   [x] Task 2.1: Define Seed Data Requirements
        *   [x] Identify necessary seed data for development (users, labs, time slots).
        *   [x] Determine admin and superadmin test accounts.
        *   [x] Plan realistic lab and time slot configurations.
    *   [x] Task 2.2: Create Seed Script Structure
        *   [x] Define seed script file structure in prisma directory.
        *   [x] Implement password hashing integration for user accounts.
        *   [x] Ensure seed data covers all entity types.
    *   [x] Task 2.3: Implement Testing Configuration
        *   [x] Add seed script to npm scripts for easy execution.
        *   [x] Create separate seed data for testing environment.
        *   [x] Document seed data for development team reference.
    *   [x] Task 2.4: Run and Verify Seed Data
        *   [x] Execute seed script and verify data insertion.
        *   [x] Check relationships between seeded entities.
        *   [x] Document any required manual setup steps.
*   **Day 3: Database Testing & Optimization (Pending)**
    *   [x] Task 3.1: Database Connection Tests
        *   [x] Create comprehensive database connection tests.
        *   [x] Implement environment-aware test configuration.
        *   [x] Add test cases for normal and error scenarios.
    *   [x] Task 3.2: Performance Baseline
        *   [x] Conduct initial query performance tests.
        *   [x] Document baseline performance metrics.
        *   [x] Identify potential query optimization opportunities.
    *   [x] Task 3.3: Database Error Handling
        *   [x] Implement standardized database error handling.
        *   [x] Create custom error types for database operations.
        *   [x] Ensure error messages are appropriate for production.
    *   [x] Task 3.4: Documentation Updates
        *   [x] Update schema documentation with any changes.
        *   [x] Document database setup process for new developers.
        *   [x] Create database maintenance guidelines.

### Frontend: Project Setup & Core Structure (Completed)
Corresponds to Frontend Plan - PHASE 1

*   **Day 1: Project Initialization and Basic Configuration**
    *   [x] Task 1.1: Initialize Vite + React + TypeScript project (`npm create vite@latest frontend --template react-ts`).
    *   [x] Task 1.2: Navigate into the `frontend` directory and install initial dependencies (`npm install`).
    *   [x] Task 1.3: Install core dependencies: `react-router-dom`, `axios`, `@tanstack/react-query`, `zustand`, `zod`, and chosen UI library (e.g., `@mui/material`, `@emotion/react`, `@emotion/styled`).
    *   [x] Task 1.4: Install and configure Tailwind CSS (or setup alternative styling).
    *   [x] Task 1.5: Install development dependencies (ESLint, Prettier, testing tools) based on the updated `package.json`.
    *   [x] Task 1.6: Configure ESLint and Prettier, ensuring they extend the shared base config and include frontend-specific rules.
*   **Day 2: Core Application Setup**
    *   [x] Task 2.1: Clean up default boilerplate in `src/App.tsx` and `src/main.tsx`.
    *   [x] Task 2.2: Set up `QueryClientProvider` for React Query in `src/main.tsx`.
    *   [x] Task 2.3: Set up basic routing using `react-router-dom` in `src/main.tsx` and define initial route structure in `src/routes.tsx` (e.g., `/`, `/login`, `/register`, `/dashboard`).
    *   [x] Task 2.4: Create placeholder components for initial pages (e.g., `src/pages/HomePage.tsx`, `src/pages/LoginPage.tsx`, `src/pages/DashboardPage.tsx`).
    *   [x] Task 2.5: Implement a basic `MainLayout` component in `src/components/templates/`.
*   **Day 3: API Client and Basic Utilities**
    *   [x] Task 3.1: Set up the central Axios client instance in `src/api/index.ts`, including basic configuration.
    *   [x] Task 3.2: Create placeholder files for API functions (`src/api/auth.ts`, `src/api/labs.ts`, etc.).
    *   [x] Task 3.3: Implement basic utility functions (e.g., date formatting helpers) in `src/utils/`.
    *   [x] Task 3.4: Define initial TypeScript interfaces/types in `src/types/`, potentially mirroring backend types.
    *   [x] Task 3.5: Verify project builds (`npm run build`) and runs locally (`npm run dev`) without errors.

---

## OVERARCHING PHASE 2: Core Authentication & Authorization

This phase focuses on implementing the backend authorization systems, foundational service/API structures, and the frontend authentication flow.

### Backend: Authorization, Base Services/APIs, User Auth Implementation
Corresponds to Backend Plan - PHASE 1 (Day 3 Completion), PHASE 2, PHASE 3 (Day 1 & Day 2 partial), PHASE 4 (Day 1 & Day 2-3 partial).

*   **Complete Database Testing & Optimization (Backend PHASE 1 - Day 3)**
    *   [x] Task 3.1: Database Connection Tests
    *   [x] Task 3.2: Performance Baseline
    *   [x] Task 3.3: Database Error Handling
    *   [x] Task 3.4: Documentation Updates
*   **Authorization & RBAC Implementation (Backend PHASE 2)**
    *   **Day 1: Permission Model Design**
        *   [x] Task 1.1: Define Permission Structure
        *   [x] Task 1.2: Role Definitions
        *   [x] Task 1.3: Resource Ownership Rules
        *   [x] Task 1.4: Permission Matrix Documentation
    *   **Day 2: RBAC Middleware Implementation**
        *   [x] Task 2.1: Enhance Role Middleware
        *   [x] Task 2.2: Resource Access Control
        *   [x] Task 2.3: Context-Aware Authorization
        *   [x] Task 2.4: Testing Authorization Logic
    *   **Day 3: Authorization Utilities & Integration**
        *   [x] Task 3.1: Permission Checking Utilities
        *   [x] Task 3.2: Audit Logging
        *   [x] Task 3.3: Route Protection Implementation
        *   [x] Task 3.4: Testing & Documentation
*   **Base Service Layer & API Infrastructure**
    *   **Base Repository Pattern (Backend PHASE 3 - Day 1)**
        *   [ ] Task 1.1: Generic Repository Interface
        *   [ ] Task 1.2: Error Handling Strategy
        *   [ ] Task 1.3: Transaction Support
        *   [ ] Task 1.4: Testing Framework
    *   **Main Router Structure (Backend PHASE 4 - Day 1)**
        *   [ ] Task 1.1: Router Framework
        *   [ ] Task 1.2: Route Organization
        *   [ ] Task 1.3: Error Handling
        *   [ ] Task 1.4: Documentation
*   **User Service for Authentication (Backend PHASE 3 - Day 2 Partial)**
    *   [ ] Task 2.1: User Service Definition (Focus on auth-related parts: creation, finding by email, password management)
    *   [ ] Task 2.2: User Validation (For registration, login, password updates)
    *   [ ] Task 2.3: User Query Methods (e.g., `findByEmail`, `findById`)
    *   [ ] Task 2.4: Testing User Service (Auth-related functionalities)
*   **User API Routes & Controllers for Authentication (Backend PHASE 4 - Day 2-3 Partial)**
    *   [ ] Task 2.1: User Controller Implementation (Endpoints for `/auth/register`, `/auth/login`, `/auth/refresh-token`, `/auth/logout`, `/users/me`)
    *   [ ] Task 2.2: Request Validation (Zod schemas for auth request bodies)
    *   [ ] Task 2.3: Response Formatting (Consistent responses for auth actions)
    *   [ ] Task 2.4: Testing User API (Auth endpoints, token handling, protected `/users/me`)

### Frontend: Authentication Implementation
Corresponds to Frontend Plan - PHASE 2
*Dependency: Backend User Service & API for authentication (register, login, logout, refresh, me) must be available.*

*   **Day 1: Auth State Management and API Functions**
    *   [ ] Task 1.1: Set up the Zustand `authStore` in `src/state/authStore.ts` to manage authentication status, user info, and token.
    *   [ ] Task 1.2: Implement `login`, `register`, and `logout` functions in `src/api/auth.ts` using the Axios client. Handle successful responses (extract token, user data) and basic error cases.
    *   [ ] Task 1.3: Add Axios request interceptor to automatically attach the access token from the auth store to outgoing requests.
    *   [ ] Task 1.4: Add Axios response interceptor to catch 401 Unauthorized errors and trigger a logout action in the auth store (and potentially token refresh).
*   **Day 2: Login and Registration UI & Logic**
    *   [ ] Task 2.1: Create the `LoginPage` component in `src/pages/`.
    *   [ ] Task 2.2: Implement the login form UI using React Hook Form and your chosen UI library components.
    *   [ ] Task 2.3: Define a Zod schema for login form validation.
    *   [ ] Task 2.4: Implement login form submission logic: validate with Zod, call `api.auth.login`, update `authStore` on success, redirect to dashboard, handle and display API errors.
    *   [ ] Task 2.5: Create the `RegisterPage` component in `src/pages/`.
*   **Day 3: Registration UI & Logic, Logout**
    *   [ ] Task 3.1: Implement the registration form UI using React Hook Form and your chosen UI library.
    *   [ ] Task 3.2: Define a Zod schema for registration form validation.
    *   [ ] Task 3.3: Implement registration form submission logic: validate with Zod, call `api.auth.register`, update `authStore` on success (or redirect to login), handle and display API errors.
    *   [ ] Task 3.4: Implement Logout functionality (e.g., a button in the Header/Sidebar) that calls `api.auth.logout` (if backend has this endpoint) and clears the `authStore`.
    *   [ ] Task 3.5: Add links between Login, Register, and Forgot Password (placeholder) pages.
*   **Day 4: Protected Routes and Auth Context/Provider**
    *   [ ] Task 4.1: Create a `ProtectedRoute` component (or custom hook/render prop) that checks `authStore.isLoggedIn` and redirects to `/login` if false.
    *   [ ] Task 4.2: Apply `ProtectedRoute` to the `/dashboard` route and any other routes requiring authentication.
    *   [ ] Task 4.3: Implement a basic user profile display on the dashboard, using user data from the `authStore`.
    *   [ ] Task 4.4: Add placeholder UI for "Forgot Password" and "Reset Password" pages/modals, outlining the flow but deferring full implementation if backend endpoints are not yet ready.
    *   [ ] Task 4.5: Write basic unit tests for `authStore` and `ProtectedRoute`.

---

## OVERARCHING PHASE 3: Lab, Time Slot, Booking, & Waitlist Features (Core User Flow)

This phase implements the core functionalities for users to browse labs, view time slots, make bookings, and manage waitlists.

### Backend: Services & APIs for Labs, Time Slots, Bookings, Waitlists
Corresponds to Backend Plan - PHASE 3 (Days 3, 4, 5) & PHASE 4 (Days 4-5, 6-7, 8).

*   **Lab & TimeSlot Services (Backend PHASE 3 - Day 3)**
    *   [ ] Task 3.1: Lab Service Implementation (CRUD, capacity management)
    *   [ ] Task 3.2: TimeSlot Service (CRUD, availability checking, recurrence)
    *   [ ] Task 3.3: Service Integration (cross-entity validation)
    *   [ ] Task 3.4: Testing Services (Lab, TimeSlot, integration)
*   **Lab & TimeSlot API Routes & Controllers (Backend PHASE 4 - Day 4-5)**
    *   [ ] Task 4.1: Lab Controller Implementation (CRUD, status management)
    *   [ ] Task 4.2: TimeSlot Controller (CRUD, availability, batch operations)
    *   [ ] Task 4.3: Request Validation & Response Formatting (for Labs, TimeSlots)
    *   [ ] Task 4.4: Testing Lab & TimeSlot API
*   **Booking Service (Backend PHASE 3 - Day 4)**
    *   [ ] Task 4.1: Booking Service Implementation (CRUD, workflow logic)
    *   [ ] Task 4.2: Booking Business Rules (capacity, conflicts, policy)
    *   [ ] Task 4.3: Booking Notifications (triggers, confirmation, reminders - service level)
    *   [ ] Task 4.4: Testing Booking Service
*   **Booking API Routes & Controllers (Backend PHASE 4 - Day 6-7)**
    *   [ ] Task 6.1: Booking Controller Implementation (workflow, management, query endpoints)
    *   [ ] Task 6.2: Booking Flow Implementation (multi-step, confirmation, cancellation)
    *   [ ] Task 6.3: Advanced Features (recurring, batch, reports - if applicable)
    *   [ ] Task 6.4: Testing Booking API
*   **Waitlist Service (Backend PHASE 3 - Day 5)**
    *   [ ] Task 5.1: Waitlist Service Implementation (CRUD, position management, auto-notify)
    *   [ ] Task 5.2: Waitlist Business Rules (fairness, priority, expiration)
    *   [ ] Task 5.3: Waitlist-Booking Integration (auto-booking, cancellation, recalculation)
    *   [ ] Task 5.4: Testing Waitlist Service
*   **Waitlist API Routes & Controllers (Backend PHASE 4 - Day 8)**
    *   [ ] Task 8.1: Waitlist Controller Implementation (CRUD, position, notification prefs)
    *   [ ] Task 8.2: Waitlist-Specific Features (auto-join, position check, batch ops)
    *   [ ] Task 8.3: Request Validation & Response Formatting (for Waitlists)
    *   [ ] Task 8.4: Testing Waitlist API

### Frontend: Lab Browse, Slot Display, Booking Workflow, Waitlist Management
Corresponds to Frontend Plan - PHASE 3, PHASE 4, PHASE 5.

*   **Lab & Slot Browse (Frontend PHASE 3)**
    *   *Dependency: Backend Lab & TimeSlot Services & APIs must be available.*
    *   **Day 1: Lab List View**
        *   [ ] Task 1.1: Create `getLabs` function in `src/api/labs.ts`.
        *   [ ] Task 1.2: Set up MSW handlers for `/api/labs` (if backend API is not ready).
        *   [ ] Task 1.3: Create `LabList` component.
        *   [ ] Task 1.4: Use `useQuery` to fetch labs. Handle loading/error states.
        *   [ ] Task 1.5: Render list of labs.
        *   [ ] Task 1.6: Add links to Lab Details page.
    *   **Day 2: Lab Details Page and Time Slot API**
        *   [ ] Task 2.1: Create `LabDetailsPage` component.
        *   [ ] Task 2.2: Create `getLabDetails(labId)` function. Use `useQuery`.
        *   [ ] Task 2.3: Display lab details.
        *   [ ] Task 2.4: Create `getTimeSlots(labId, dateRange)` function.
        *   [ ] Task 2.5: Set up MSW handlers for `/api/time-slots`.
    *   **Day 3: Calendar Component and Slot Display**
        *   [ ] Task 3.1: Install/set up calendar library or date picker.
        *   [ ] Task 3.2: Create calendar/date picker component on `LabDetailsPage`.
        *   [ ] Task 3.3: Use `useQuery` to fetch slots based on selected date(s).
        *   [ ] Task 3.4: Create component to display list of available time slots.
        *   [ ] Task 3.5: Handle loading/error states for time slots.
    *   **Day 4: Slot Availability and Styling**
        *   [ ] Task 4.1: Refine display of time slots (available vs. booked).
        *   [ ] Task 4.2: Implement filtering/sorting for time slots if needed.
        *   [ ] Task 4.3: Apply comprehensive styling.
        *   [ ] Task 4.4: Write unit/integration tests for lab/time slot API functions and components.
*   **Booking Workflow (Frontend PHASE 4)**
    *   *Dependency: Backend Booking Service & API must be available.*
    *   **Day 1: Booking API Functions and UI Trigger**
        *   [ ] Task 1.1: Create `createBooking`, `cancelBooking`, `updateBookingStatus` functions in `src/api/bookings.ts`.
        *   [ ] Task 1.2: Set up MSW handlers for `/api/bookings`.
        *   [ ] Task 1.3: Add "Book" button/element next to available time slots.
        *   [ ] Task 1.4: Implement click handler for "Book" button.
    *   **Day 2: Booking Confirmation Modal/Page**
        *   [ ] Task 2.1: Create `BookingConfirmationModal` component.
        *   [ ] Task 2.2: Display selected time slot details in modal.
        *   [ ] Task 2.3: Add "Confirm Booking" button.
    *   **Day 3: Create Booking Logic (Mutation)**
        *   [ ] Task 3.1: Use `useMutation(createBooking)`.
        *   [ ] Task 3.2: On "Confirm Booking", trigger mutation.
        *   [ ] Task 3.3: Handle mutation `onSuccess` (invalidate queries, show message, close modal).
        *   [ ] Task 3.4: Handle mutation `onError` (display error).
        *   [ ] Task 3.5: Show loading state during mutation.
    *   **Day 4: Booking Cancellation UI & Logic**
        *   [ ] Task 4.1: Add "Cancel" button to booked slots display.
        *   [ ] Task 4.2: Implement `CancelConfirmationModal`.
        *   [ ] Task 4.3: Use `useMutation(cancelBooking)`.
        *   [ ] Task 4.4: On "Confirm Cancellation", trigger mutation.
        *   [ ] Task 4.5: Handle mutation `onSuccess` (invalidate queries, show message). Handle `onError`.
    *   **Day 5: Advanced Booking Business Rules & UI Feedback**
        *   [ ] Task 5.1: Implement client-side validation based on business rules.
        *   [ ] Task 5.2: Provide clear UI feedback for slot status.
        *   [ ] Task 5.3: Refine loading, error, success states.
        *   [ ] Task 5.4: Write unit/integration tests for booking API functions and components.
*   **User Bookings & Waitlist Management (Frontend PHASE 5)**
    *   *Dependency: Backend Booking & Waitlist Services & APIs must be available.*
    *   **Day 1: My Bookings Page**
        *   [ ] Task 1.1: Create `getUserBookings(userId, filter)` function.
        *   [ ] Task 1.2: Set up MSW handlers for `/api/bookings/me`.
        *   [ ] Task 1.3: Create `MyBookingsPage` component.
        *   [ ] Task 1.4: Use `useQuery` to fetch user's bookings.
        *   [ ] Task 1.5: Create `MyBookingsList` component.
        *   [ ] Task 1.6: Integrate Cancel button/modal logic.
    *   **Day 2: Waitlist API Functions and UI**
        *   [ ] Task 2.1: Create `joinWaitlist`, `leaveWaitlist`, `getUserWaitlists` functions in `src/api/waitlists.ts`.
        *   [ ] Task 2.2: Set up MSW handlers for `/api/waitlists` and `/api/waitlists/me`.
        *   [ ] Task 2.3: Add "Join Waitlist" button for fully booked slots.
        *   [ ] Task 2.4: Use `useMutation(joinWaitlist)`. Handle success/error.
    *   **Day 3: My Waitlists Page**
        *   [ ] Task 3.1: Create `MyWaitlistsPage` component.
        *   [ ] Task 3.2: Use `useQuery` to fetch user's waitlist entries.
        *   [ ] Task 3.3: Create `MyWaitlistsList` component.
        *   [ ] Task 3.4: Add "Leave Waitlist" button.
        *   [ ] Task 3.5: Use `useMutation(leaveWaitlist)`. Handle success/error.
    *   **Day 4: Waitlist Position Display and Refinement**
        *   [ ] Task 4.1: Create `getWaitlistPosition(slotId, userId)` function.
        *   [ ] Task 4.2: Display user's waitlist position on Lab Details page.
        *   [ ] Task 4.3: Add filtering/sorting/pagination to My Bookings/Waitlists.
        *   [ ] Task 4.4: Write unit/integration tests for booking/waitlist API functions and components.

---

## OVERARCHING PHASE 4: Notifications & Real-time Updates

This phase implements user notifications and real-time updates via WebSockets.

### Backend: Notification Services, APIs & WebSocket Implementation
Corresponds to Backend Plan - PHASE 3 (Day 6), PHASE 4 (Day 9), PHASE 5.

*   **Notification Service (Backend PHASE 3 - Day 6)**
    *   [ ] Task 6.1: Notification Service Implementation (CRUD, type handling, delivery status)
    *   [ ] Task 6.2: Notification Channels (in-app, email, SMS if required)
    *   [ ] Task 6.3: Notification Templates (system, variable substitution, localization)
    *   [ ] Task 6.4: Testing Notification Service
*   **Notification API Routes & Controllers (Backend PHASE 4 - Day 9)**
    *   [ ] Task 9.1: Notification Controller Implementation (CRUD, preference management, delivery status)
    *   [ ] Task 9.2: Notification-Specific Features (read/unread, notification center, batch ops)
    *   [ ] Task 9.3: Request Validation & Response Formatting (for Notifications)
    *   [ ] Task 9.4: Testing Notification API
*   **WebSocket Implementation (Backend PHASE 5)**
    *   **Day 1: WebSocket Infrastructure**
        *   [ ] Task 1.1: Socket.IO Setup (server, Redis adapter, namespaces)
        *   [ ] Task 1.2: Authentication Integration (socket auth middleware, token validation)
        *   [ ] Task 1.3: Connection Management (tracking, disconnection, reconnection)
        *   [ ] Task 1.4: Testing Infrastructure (connection, auth, reconnection)
    *   **Day 2: Event Handlers Implementation**
        *   [ ] Task 2.1: Core Event Handlers (system, booking, waitlist notifications)
        *   [ ] Task 2.2: Event Registration System (centralized, documentation, typed events)
        *   [ ] Task 2.3: Error Handling (for socket events, standardized responses, logging)
        *   [ ] Task 2.4: Testing Event Handlers
    *   **Day 3: Room Management**
        *   [ ] Task 3.1: Room Structure Implementation (conventions, user-specific, resource-based)
        *   [ ] Task 3.2: Dynamic Room Membership (join/leave, auto-assignment, tracking)
        *   [ ] Task 3.3: Broadcast Strategies (targeted, role-based, throttling)
        *   [ ] Task 3.4: Testing Room Management
    *   **Day 4: Real-Time Features**
        *   [ ] Task 4.1: Lab Status Updates (real-time status, occupancy, emergency)
        *   [ ] Task 4.2: Booking Real-Time Features (slot availability, confirmation, cancellation)
        *   [ ] Task 4.3: Admin Dashboards (real-time monitoring, system status, usage analytics)
        *   [ ] Task 4.4: Testing Real-Time Features
    *   **Day 5: WebSocket Integration & Documentation**
        *   [ ] Task 5.1: Service Integration (connect events to service layer, error handling, transaction integrity)
        *   [ ] Task 5.2: Client Integration Support (doc client connection, event catalog, example clients)
        *   [ ] Task 5.3: Performance Testing (socket server load, Redis adapter, scaling)
        *   [ ] Task 5.4: Documentation (comprehensive WebSocket docs, auth, security)

### Frontend: Notifications Display & Real-time Event Handling
Corresponds to Frontend Plan - PHASE 6.
*Dependency: Backend Notification Service & API, and WebSocket server implementation must be available.*

*   **Day 1: Notification API and Basic Display**
    *   [ ] Task 1.1: Create `getUserNotifications`, `markNotificationAsRead`, `markAllNotificationsAsRead` functions in `src/api/notifications.ts`.
    *   [ ] Task 1.2: Set up MSW handlers for `/api/notifications/me`.
    *   [ ] Task 1.3: Use `useQuery` to fetch user notifications.
    *   [ ] Task 1.4: Create component to display notifications.
*   **Day 2: WebSocket Client Setup**
    *   [ ] Task 2.1: Install Socket.IO client.
    *   [ ] Task 2.2: Create custom hook/utility for Socket.IO connection (`useSocket.ts`).
    *   [ ] Task 2.3: Implement connection logic (including JWT auth). Handle connection/disconnection/error events.
    *   [ ] Task 2.4: Ensure socket connects on auth and disconnects on logout.
*   **Day 3: Real-time Event Handling**
    *   [ ] Task 3.1: Implement listeners for key WebSocket events (booking, time-slot, waitlist, notification, announcement).
    *   [ ] Task 3.2: On receiving events, use `queryClient.invalidateQueries()` for relevant data.
    *   [ ] Task 3.3: For `notification:new` events, update notification list/state.
    *   [ ] Task 3.4: Implement Mark as Read UI and integrate with mutations.
*   **Day 4: UI Integration and Refinement**
    *   [ ] Task 4.1: Create Notification Center page.
    *   [ ] Task 4.2: Add notification indicator (unread count) in Header.
    *   [ ] Task 4.3: Integrate `useSocket` hook into main application component.
    *   [ ] Task 4.4: Write unit/integration tests for notification API functions and socket logic.

---

## OVERARCHING PHASE 5: Admin & Super Admin Features

This phase focuses on building the administrative interfaces and backend support for managing the application.

### Backend: Admin/Super Admin Services & APIs, Service Layer Integration
Corresponds to Backend Plan - PHASE 3 (Day 7 - Service Layer Integration), PHASE 4 (Day 10 - API Integration), and any specific services/controllers for Admin features not explicitly broken out but implied by Frontend Phase 7.

*   **Service Layer Integration & Documentation (Backend PHASE 3 - Day 7)**
    *   [ ] Task 7.1: Cross-Service Integration (review interactions, error handling, transaction integrity)
    *   [ ] Task 7.2: Performance Review (optimize DB ops, caching, transactions)
    *   [ ] Task 7.3: Documentation (service layer architecture, usage examples, business rules)
    *   [ ] Task 7.4: Final Testing (integration tests, complex workflows, error handling)
*   **API Integration & Documentation (Backend PHASE 4 - Day 10)**
    *   [ ] Task 10.1: Route Integration (finalize registration, middleware, error handling)
    *   [ ] Task 10.2: API Documentation Generation (auto-doc, request/response formats, examples)
    *   [ ] Task 10.3: Performance Testing (API performance, bottlenecks, characteristics)
    *   [ ] Task 10.4: Final API Testing (end-to-end, cross-resource, error scenarios)
*   **Development of specific Admin/Super Admin backend functionalities** (These would draw from creating new or extending existing services from Backend Phase 3 and controllers from Backend Phase 4 for resources like Organizations, Admin user management, system-wide reports etc.)
    *   [ ] Define and implement services for Organization management.
    *   [ ] Define and implement services for Admin account management by Super Admins.
    *   [ ] Define and implement services for system-wide reporting.
    *   [ ] Define and implement API controllers for the above admin/super-admin functionalities.
    *   [ ] Ensure appropriate authorization checks (RBAC) are in place for all admin/super-admin endpoints.

### Frontend: Admin & Super Admin Interfaces
Corresponds to Frontend Plan - PHASE 7.
*Dependency: Backend APIs for Lab Management, Time Slot Management, Booking/User Monitoring, Reporting, and Super Admin (Admin/Organization management) must be available.*

*   **Day 1: Admin Layout and Protected Routes**
    *   [ ] Task 1.1: Create `AdminLayout` component.
    *   [ ] Task 1.2: Create `AdminRoute` and `SuperAdminRoute` components.
    *   [ ] Task 1.3: Define admin routes and wrap with role-specific routes.
*   **Day 2-3: Lab Management (Admin)**
    *   [ ] Task 2.1: Create Admin API functions for Lab management.
    *   [ ] Task 2.2: Set up MSW handlers for admin lab APIs.
    *   [ ] Task 2.3: Create `AdminLabsPage` component.
    *   [ ] Task 2.4: Use `useQuery` to fetch all labs. Display in table.
    *   [ ] Task 2.5: Implement "Add New Lab" functionality.
    *   [ ] Task 2.6: Implement "Edit Lab" functionality.
    *   [ ] Task 2.7: Implement "Delete Lab" functionality.
*   **Day 4-5: Time Slot Management (Admin)**
    *   [ ] Task 4.1: Create Admin API functions for Time Slot management.
    *   [ ] Task 4.2: Set up MSW handlers for admin time slot APIs.
    *   [ ] Task 4.3: Integrate time slot management into `AdminLabsPage` or separate page.
    *   [ ] Task 4.4: Implement viewing time slots for a specific lab.
    *   [ ] Task 4.5: Implement "Add Single Slot" and "Add Bulk Slots".
    *   [ ] Task 4.6: Implement "Edit Slot" and "Delete Slot".
*   **Day 6-7: Booking & User Monitoring (Admin)**
    *   [ ] Task 6.1: Create Admin API functions for Booking/User monitoring.
    *   [ ] Task 6.2: Set up MSW handlers.
    *   [ ] Task 6.3: Create `AdminBookingsPage` to view all bookings.
    *   [ ] Task 6.4: Implement functionality to update booking status from admin view.
    *   [ ] Task 6.5: Create `AdminUsersPage` to view/search all users.
*   **Day 8-9: Reporting (Admin/Super Admin)**
    *   [ ] Task 8.1: Create API functions for Reports.
    *   [ ] Task 8.2: Set up MSW handlers.
    *   [ ] Task 8.3: Create `AdminReportsPage`.
    *   [ ] Task 8.4: Use `useQuery` to fetch report data.
    *   [ ] Task 8.5: Display report data (tables, charts).
*   **Day 10: Super Admin Features (Manage Admins/Organizations)**
    *   [ ] Task 10.1: Create Super Admin API functions.
    *   [ ] Task 10.2: Set up MSW handlers.
    *   [ ] Task 10.3: Create `SuperAdminAdminsPage` and `SuperAdminOrganizationsPage`.
    *   [ ] Task 10.4: Implement CRUD operations for Admins and Organizations.

---

## OVERARCHING PHASE 6: Security, Testing, Finalization & Deployment Preparation

This final phase focuses on enhancing security, comprehensive testing, final documentation, and preparing the application for deployment.

### Backend: Security Enhancements, Testing Framework, Final Integration & Documentation
Corresponds to Backend Plan - PHASE 6, PHASE 7, PHASE 8.

*   **Security Enhancements (Backend PHASE 6)**
    *   **Day 1: Request Protection**
        *   [ ] Task 1.1: Rate Limiting Implementation (global, endpoint-specific, user-based)
        *   [ ] Task 1.2: Input Sanitization (review inputs, HTML sanitization, injection protection)
        *   [ ] Task 1.3: CORS Configuration (detailed policy, origin validation, preflight)
        *   [ ] Task 1.4: Testing Security Measures (rate limit, sanitization, CORS)
    *   **Day 2: Security Headers & Protection**
        *   [ ] Task 2.1: Helmet Configuration (appropriate settings, CSP, HSTS)
        *   [ ] Task 2.2: XSS Protection (review, output encoding, X-XSS-Protection header)
        *   [ ] Task 2.3: CSRF Protection (token generation, validation middleware, apply to routes)
        *   [ ] Task 2.4: Testing Protection Measures (headers, CSRF, XSS)
    *   **Day 3: Security Auditing & Documentation**
        *   [ ] Task 3.1: Dependency Audit (npm audit, address vulnerabilities, document remediation)
        *   [ ] Task 3.2: Security Review (code review, auth/authz, data protection)
        *   [ ] Task 3.3: Security Documentation (policy, incident response plan, features for users)
        *   [ ] Task 3.4: Final Security Testing (pen testing if possible, verify measures, document results)
*   **Testing Framework (Backend PHASE 7)**
    *   **Day 1: Testing Infrastructure**
        *   [ ] Task 1.1: Jest Configuration Finalization (different test types, env vars, test DB)
        *   [ ] Task 1.2: Test Utilities (auth helpers, DB seeding, request helpers)
        *   [ ] Task 1.3: Mock Services (external services, test doubles, DI for testing)
        *   [ ] Task 1.4: CI Integration (test running in CI, reporting, code coverage)
    *   **Day 2-3: Unit & Integration Tests**
        *   [ ] Task 2.1: Service Layer Tests (comprehensive unit tests, business logic, error handling)
        *   [ ] Task 2.2: Controller Tests (unit tests, request handling, validation, response formatting)
        *   [ ] Task 2.3: Integration Tests (spanning components, DB interactions, error propagation)
        *   [ ] Task 2.4: Authorization Tests (permission enforcement, RBAC, ownership rules)
    *   **Day 4: End-to-End Tests**
        *   [ ] Task 4.1: API Workflow Tests (complete user workflows, booking E2E, notification delivery)
        *   [ ] Task 4.2: WebSocket Tests (real-time workflows, event broadcasting, socket auth)
        *   [ ] Task 4.3: Admin Operation Tests (admin workflows, reporting, system management)
        *   [ ] Task 4.4: Error Scenario Tests (error handling, system recovery, edge cases)
    *   **Day 5: Performance & Load Tests**
        *   [ ] Task 5.1: API Performance Tests (response times, various load, bottlenecks)
        *   [ ] Task 5.2: Database Performance (query performance, index effectiveness, transaction performance)
        *   [ ] Task 5.3: WebSocket Performance (concurrent connections, broadcast, Redis adapter scaling)
        *   [ ] Task 5.4: Documentation & Remediation (document results, address issues, benchmarks)
*   **Final Integration & Documentation (Backend PHASE 8)**
    *   **Day 1: System Integration**
        *   [ ] Task 1.1: Component Connection Verification (all components work together, cross-component workflows)
        *   [ ] Task 1.2: Configuration Validation (all options, env-specific settings, secure handling)
        *   [ ] Task 1.3: Dependency Review (all dependencies, versions, conflicts/vulnerabilities)
        *   [ ] Task 1.4: Logging & Monitoring (verify implementation, test integration, log levels)
    *   **Day 2: API Documentation**
        *   [ ] Task 2.1: OpenAPI Specification (generate/update, all endpoints, examples)
        *   [ ] Task 2.2: Authentication Documentation (requirements, token handling, security)
        *   [ ] Task 2.3: Error Documentation (all responses, troubleshooting, error codes)
        *   [ ] Task 2.4: WebSocket Documentation (connection, event catalog, auth)
    *   **Day 3: Developer Documentation**
        *   [ ] Task 3.1: Setup Guide (comprehensive instructions, env requirements, troubleshooting)
        *   [ ] Task 3.2: Architecture Documentation (system architecture, component diagrams, design decisions)
        *   [ ] Task 3.3: Contribution Guide (guidelines, code style, PR process)
        *   [ ] Task 3.4: Testing Documentation (approach, test writing guide, CI/CD integration)
    *   **Day 4: Deployment Preparation**
        *   [ ] Task 4.1: Docker Configuration (finalize, production Dockerfile, Docker Compose for local)
        *   [ ] Task 4.2: Environment Configuration (production env template, required vars, secure value handling)
        *   [ ] Task 4.3: CI/CD Pipeline (deployment pipeline, staging env, rollback procedures)
        *   [ ] Task 4.4: Pre-Launch Checklist (checklist, verification steps, post-launch monitoring)

### Frontend: Refinement, Testing, Optimization, Deployment Prep
Corresponds to Frontend Plan - PHASE 8.
*Dependency: Backend should be largely stable and feature-complete for comprehensive E2E testing and deployment prep.*

*   **Day 1-2: Unit and Integration Testing**
    *   [ ] Task 1.1: Write comprehensive unit tests for components, custom hooks, utility functions.
    *   [ ] Task 1.2: Write integration tests for API calls (MSW), component interactions, state management.
    *   [ ] Task 1.3: Ensure good test coverage for critical components/logic.
*   **Day 3: End-to-End Testing**
    *   [ ] Task 3.1: Set up Cypress or Playwright.
    *   [ ] Task 3.2: Write E2E tests for critical user workflows.
    *   [ ] Task 3.3: Integrate E2E tests into GitHub Actions CI workflow.
*   **Day 4: Performance Optimization**
    *   [ ] Task 4.1: Implement route-based code splitting.
    *   [ ] Task 4.2: Review/optimize component rendering (Profiler, memo, useMemo, useCallback).
    *   [ ] Task 4.3: Optimize images and assets.
    *   [ ] Task 4.4: Review React Query cache configurations.
*   **Day 5: UI/UX Refinement and Accessibility**
    *   [ ] Task 5.1: Thorough UI review across screen sizes, refine styles/layouts.
    *   [ ] Task 5.2: Test accessibility (tools, linters). Address issues.
    *   [ ] Task 5.3: Refine error message display and user feedback.
*   **Day 6: Build Configuration and Documentation**
    *   [ ] Task 6.1: Finalize Vite build configuration for production.
    *   [ ] Task 6.2: Create/update frontend documentation (setup, architecture, components, API integration).
    *   [ ] Task 6.3: Ensure README includes instructions for running frontend.
*   **Day 7: Deployment Preparation**
    *   [ ] Task 7.1: Verify production build works correctly.
    *   [ ] Task 7.2: Configure backend to serve frontend static files (if applicable).
    *   [ ] Task 7.3: Finalize GitHub Actions CI/CD workflow for frontend.
    *   [ ] Task 7.4: Create a pre-deployment checklist.

---
This unified plan should provide a clearer, synchronized view of your project's development. Remember to adjust timelines and task priorities based on your team's progress and any emerging requirements.