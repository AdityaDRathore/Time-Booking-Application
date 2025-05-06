# Frontend Implementation Roadmap: Time-Booking Application

This document provides a phase-by-phase breakdown of tasks for implementing the frontend of the Time-Booking Application, aligning with the previously defined Frontend Development Plan and integrating with the backend implementation roadmap.

This roadmap assumes you are following the recommended technology stack and architecture.

## PHASE 1: Project Setup & Core Structure (Estimated: 3 Days)

The goal of this phase is to set up the frontend project, configure essential tools, and establish the basic application structure and routing.

* **Day 1: Project Initialization and Basic Configuration**
    * [ ] Task 1.1: Initialize Vite + React + TypeScript project (`npm create vite@latest frontend --template react-ts`).
    * [ ] Task 1.2: Navigate into the `frontend` directory and install initial dependencies (`npm install`).
    * [ ] Task 1.3: Install core dependencies: `react-router-dom`, `axios`, `@tanstack/react-query`, `zustand`, `zod`, and chosen UI library (e.g., `@mui/material`, `@emotion/react`, `@emotion/styled`).
    * [ ] Task 1.4: Install and configure Tailwind CSS (or setup alternative styling).
    * [ ] Task 1.5: Install development dependencies (ESLint, Prettier, testing tools) based on the updated `package.json`.
    * [ ] Task 1.6: Configure ESLint and Prettier, ensuring they extend the shared base config and include frontend-specific rules.
* **Day 2: Core Application Setup**
    * [ ] Task 2.1: Clean up default boilerplate in `src/App.tsx` and `src/main.tsx`.
    * [ ] Task 2.2: Set up `QueryClientProvider` for React Query in `src/main.tsx`.
    * [ ] Task 2.3: Set up basic routing using `react-router-dom` in `src/main.tsx` and define initial route structure in `src/routes.tsx` (e.g., `/`, `/login`, `/register`, `/dashboard`).
    * [ ] Task 2.4: Create placeholder components for initial pages (e.g., `src/pages/HomePage.tsx`, `src/pages/LoginPage.tsx`, `src/pages/DashboardPage.tsx`).
    * [ ] Task 2.5: Implement a basic `MainLayout` component in `src/components/templates/`.
* **Day 3: API Client and Basic Utilities**
    * [ ] Task 3.1: Set up the central Axios client instance in `src/api/index.ts`, including basic configuration.
    * [ ] Task 3.2: Create placeholder files for API functions (`src/api/auth.ts`, `src/api/labs.ts`, etc.).
    * [ ] Task 3.3: Implement basic utility functions (e.g., date formatting helpers) in `src/utils/`.
    * [ ] Task 3.4: Define initial TypeScript interfaces/types in `src/types/`, potentially mirroring backend types.
    * [ ] Task 3.5: Verify project builds (`npm run build`) and runs locally (`npm run dev`) without errors.

## PHASE 2: Authentication Implementation (Estimated: 4-5 Days)

This phase focuses on building the user authentication flow, integrating with the already completed backend Authentication System (Backend Phase 4).

* **Day 1: Auth State Management and API Functions**
    * [ ] Task 1.1: Set up the Zustand `authStore` in `src/state/authStore.ts` to manage authentication status, user info, and token.
    * [ ] Task 1.2: Implement `login`, `register`, and `logout` functions in `src/api/auth.ts` using the Axios client. Handle successful responses (extract token, user data) and basic error cases.
    * [ ] Task 1.3: Add Axios request interceptor to automatically attach the access token from the auth store to outgoing requests.
    * [ ] Task 1.4: Add Axios response interceptor to catch 401 Unauthorized errors and trigger a logout action in the auth store.
* **Day 2: Login and Registration UI & Logic**
    * [ ] Task 2.1: Create the `LoginPage` component in `src/pages/`.
    * [ ] Task 2.2: Implement the login form UI using React Hook Form and your chosen UI library components.
    * [ ] Task 2.3: Define a Zod schema for login form validation.
    * [ ] Task 2.4: Implement login form submission logic: validate with Zod, call `api.auth.login`, update `authStore` on success, redirect to dashboard, handle and display API errors.
    * [ ] Task 2.5: Create the `RegisterPage` component in `src/pages/`.
* **Day 3: Registration UI & Logic, Logout**
    * [ ] Task 3.1: Implement the registration form UI using React Hook Form and your chosen UI library.
    * [ ] Task 3.2: Define a Zod schema for registration form validation.
    * [ ] Task 3.3: Implement registration form submission logic: validate with Zod, call `api.auth.register`, update `authStore` on success (or redirect to login), handle and display API errors.
    * [ ] Task 3.4: Implement Logout functionality (e.g., a button in the Header/Sidebar) that calls `api.auth.logout` (if backend has this endpoint) and clears the `authStore`.
    * [ ] Task 3.5: Add links between Login, Register, and Forgot Password (placeholder) pages.
* **Day 4: Protected Routes and Auth Context/Provider**
    * [ ] Task 4.1: Create a `ProtectedRoute` component (or custom hook/render prop) that checks `authStore.isLoggedIn` and redirects to `/login` if false.
    * [ ] Task 4.2: Apply `ProtectedRoute` to the `/dashboard` route and any other routes requiring authentication.
    * [ ] Task 4.3: Implement a basic user profile display on the dashboard, using user data from the `authStore`.
    * [ ] Task 4.4: Add placeholder UI for "Forgot Password" and "Reset Password" pages/modals, outlining the flow but deferring full implementation if backend endpoints are not yet ready.
    * [ ] Task 4.5: Write basic unit tests for `authStore` and `ProtectedRoute`.

## PHASE 3: Lab & Slot Browse (Estimated: 5-6 Days)

Implement the core functionality for users to view available labs and time slots. This integrates with backend APIs for Labs and Time Slots (part of Backend Phase 7).

* **Day 1: Lab List View**
    * [ ] Task 1.1: Create `getLabs` function in `src/api/labs.ts`.
    * [ ] Task 1.2: Set up Mock Service Worker (MSW) handlers for `/api/labs` (if backend API is not ready).
    * [ ] Task 1.3: Create `LabList` component (`organisms/LabList.tsx`).
    * [ ] Task 1.4: Use `useQuery(['labs'], getLabs)` in `LabList` to fetch labs. Handle loading and error states.
    * [ ] Task 1.5: Render the list of labs, including basic details (name, capacity).
    * [ ] Task 1.6: Add links from each lab in the list to a Lab Details page (`/labs/:id`). Define the route in `src/routes.tsx`.
* **Day 2: Lab Details Page and Time Slot API**
    * [ ] Task 2.1: Create `LabDetailsPage` component (`src/pages/LabDetailsPage.tsx`). Use `useParams` from React Router to get the lab ID from the URL.
    * [ ] Task 2.2: Create `getLabDetails(labId)` function in `src/api/labs.ts`. Use `useQuery(['lab', labId], () => getLabDetails(labId))` in the page component.
    * [ ] Task 2.3: Display lab details (name, capacity, description, status) on the page.
    * [ ] Task 2.4: Create `getTimeSlots(labId, dateRange)` function in `src/api/time-slots.ts`.
    * [ ] Task 2.5: Set up MSW handlers for `/api/time-slots` (if backend API is not ready).
* **Day 3: Calendar Component and Slot Display**
    * [ ] Task 3.1: Install and set up a calendar library (e.g., `react-big-calendar`) or build a simple date picker.
    * [ ] Task 3.2: Create a component for displaying the calendar/date picker on the `LabDetailsPage`.
    * [ ] Task 3.3: Use `useQuery(['timeSlots', labId, selectedDateRange], () => getTimeSlots(labId, selectedDateRange))` to fetch slots based on the selected date(s) from the calendar.
    * [ ] Task 3.4: Create a component to display the list of available time slots for the selected date(s) below the calendar. Show start/end time and availability.
    * [ ] Task 3.5: Handle loading and error states for time slots query.
* **Day 4: Slot Availability and Styling**
    * [ ] Task 4.1: Refine the display of time slots to clearly indicate available vs. fully booked slots based on the data from the backend API.
    * [ ] Task 4.2: Implement filtering/sorting options for time slots if needed (e.g., by time of day).
    * [ ] Task 4.3: Apply comprehensive styling using Tailwind CSS or your chosen UI library to the Lab List, Lab Details, Calendar, and Slot List components, ensuring responsiveness.
    * [ ] Task 4.4: Write unit/integration tests for lab and time slot API functions (using MSW) and presentation components.

## PHASE 4: Booking Workflow (Estimated: 5-7 Days)

Implement the process for users to book and potentially cancel lab time slots. This integrates with backend APIs for Bookings (part of Backend Phase 7).

* **Day 1: Booking API Functions and UI Trigger**
    * [ ] Task 1.1: Create `createBooking(slotId)`, `cancelBooking(bookingId)`, `updateBookingStatus(bookingId, status)` functions in `src/api/bookings.ts`.
    * [ ] Task 1.2: Set up MSW handlers for `/api/bookings` (POST, PUT, DELETE) if backend APIs are not ready.
    * [ ] Task 1.3: Add a "Book" button or clickable element next to available time slots displayed in the Slot List component (from Phase 3).
    * [ ] Task 1.4: Implement click handler for the "Book" button to trigger the booking process (e.g., open a confirmation modal).
* **Day 2: Booking Confirmation Modal/Page**
    * [ ] Task 2.1: Create a `BookingConfirmationModal` component.
    * [ ] Task 2.2: Display details of the selected time slot in the modal.
    * [ ] Task 2.3: Add a "Confirm Booking" button inside the modal.
* **Day 3: Create Booking Logic (Mutation)**
    * [ ] Task 3.1: Use `useMutation(createBooking)` (React Query) in the `LabDetailsPage` or a custom hook.
    * [ ] Task 3.2: On "Confirm Booking" button click, trigger the mutation with the `slotId`.
    * [ ] Task 3.3: Handle mutation `onSuccess`: Invalidate relevant queries (`['timeSlots', ...]` to update availability, `['bookings', userId]` to show the new booking), show a success message (toast), close the modal.
    * [ ] Task 3.4: Handle mutation `onError`: Display an error message (toast).
    * [ ] Task 3.5: Show a loading state while the mutation is in progress.
* **Day 4: Booking Cancellation UI & Logic**
    * [ ] Task 4.1: Add a "Cancel" button to the display of booked slots (will be shown in "My Bookings" page later, but implement the button/modal logic now).
    * [ ] Task 4.2: Implement a `CancelConfirmationModal`.
    * [ ] Task 4.3: Use `useMutation(cancelBooking)` (React Query).
    * [ ] Task 4.4: On "Confirm Cancellation", trigger the mutation.
    * [ ] Task 4.5: Handle mutation `onSuccess`: Invalidate relevant queries (`['bookings', userId]`, `['timeSlots', ...]` for slot availability if needed, `['waitlists', slotId]` if cancellation triggers waitlist spot), show success message. Handle `onError`.
* **Day 5: Advanced Booking Business Rules & UI Feedback**
    * [ ] Task 5.1: Implement client-side validation based on business rules (e.g., limit one booking per slot, limit bookings per week - though backend must enforce this). Use Zod for this.
    * [ ] Task 5.2: Provide clear UI feedback when a slot is fully booked or when a user already has a booking during that time.
    * [ ] Task 5.3: Refine loading, error, and success states across the booking workflow.
    * [ ] Task 5.4: Write unit/integration tests for booking API functions (with MSW) and booking related components/hooks.

## PHASE 5: User Bookings & Waitlist Management (Estimated: 4-5 Days)

Build the sections for users to view and manage their own bookings and join/leave waitlists. Integrates with backend APIs for Bookings and Waitlists (part of Backend Phase 7).

* **Day 1: My Bookings Page**
    * [ ] Task 1.1: Create `getUserBookings(userId, filter)` function in `src/api/bookings.ts`.
    * [ ] Task 1.2: Set up MSW handlers for `/api/bookings/me` (if backend not ready).
    * [ ] Task 1.3: Create `MyBookingsPage` component (`src/pages/`). Add a route for this page and protect it.
    * [ ] Task 1.4: Use `useQuery(['bookings', 'me', filter], () => getUserBookings(userId, filter))` to fetch the current user's bookings.
    * [ ] Task 1.5: Create `MyBookingsList` component (`organisms/MyBookingsList.tsx`) to display the list of bookings. Show details (Lab, Date, Time, Status).
    * [ ] Task 1.6: Integrate the Cancel button/modal logic developed in Phase 4 into the `MyBookingsList`.
* **Day 2: Waitlist API Functions and UI**
    * [ ] Task 2.1: Create `joinWaitlist(slotId)`, `leaveWaitlist(waitlistId)`, `getUserWaitlists(userId)` functions in `src/api/waitlists.ts`.
    * [ ] Task 2.2: Set up MSW handlers for `/api/waitlists` and `/api/waitlists/me`.
    * [ ] Task 2.3: In the Slot List component (Phase 3), add a "Join Waitlist" button for slots that are fully booked but have a waitlist available.
    * [ ] Task 2.4: Use `useMutation(joinWaitlist)` for the "Join Waitlist" button. Handle success (invalidate waitlist queries, show message) and error.
* **Day 3: My Waitlists Page**
    * [ ] Task 3.1: Create `MyWaitlistsPage` component (`src/pages/`). Add a route and protect it.
    * [ ] Task 3.2: Use `useQuery(['waitlists', 'me'], () => getUserWaitlists(userId))` to fetch the current user's waitlist entries.
    * [ ] Task 3.3: Create `MyWaitlistsList` component (`organisms/MyWaitlistsList.tsx`) to display the list of waitlist entries. Show details (Lab, Slot, Position).
    * [ ] Task 3.4: Add a "Leave Waitlist" button to the `MyWaitlistsList`.
    * [ ] Task 3.5: Use `useMutation(leaveWaitlist)` for the "Leave Waitlist" button. Handle success (invalidate waitlist queries) and error.
* **Day 4: Waitlist Position Display and Refinement**
    * [ ] Task 4.1: Create `getWaitlistPosition(slotId, userId)` function in `src/api/waitlists.ts`.
    * [ ] Task 4.2: On the Lab Details page (Phase 3), potentially display the current user's position on the waitlist for a specific slot if they are on it (using `useQuery`).
    * [ ] Task 4.3: Add filtering/sorting/pagination to My Bookings and My Waitlists pages if needed.
    * [ ] Task 4.4: Write unit/integration tests for booking/waitlist API functions (with MSW) and related components.

## PHASE 6: Notifications & Real-time Updates (Estimated: 3-4 Days)

Implement displaying user notifications and integrating real-time updates via WebSockets. Integrates with backend WebSockets (Phase 5) and Notification APIs (part of Phase 7).

* **Day 1: Notification API and Basic Display**
    * [ ] Task 1.1: Create `getUserNotifications(userId, filter)`, `markNotificationAsRead(notificationId)`, `markAllNotificationsAsRead(userId)` functions in `src/api/notifications.ts`.
    * [ ] Task 1.2: Set up MSW handlers for `/api/notifications/me`.
    * [ ] Task 1.3: Use `useQuery(['notifications', 'me', filter], () => getUserNotifications(userId, filter))` to fetch user notifications (e.g., in a Header component or a dedicated Notifications page).
    * [ ] Task 1.4: Create a component (`organisms/NotificationList.tsx` or `molecules/NotificationItem.tsx`) to display notifications. Show type, message, timestamp.
* **Day 2: WebSocket Client Setup**
    * [ ] Task 2.1: Install Socket.IO client (`socket.io-client`).
    * [ ] Task 2.2: Create a custom hook or utility to manage the Socket.IO connection (e.g., `src/hooks/useSocket.ts`).
    * [ ] Task 2.3: Implement connection logic, including passing the JWT access token for authentication (use `authStore`). Handle connection, disconnection, and error events.
    * [ ] Task 2.4: Ensure the socket client connects when the user is authenticated and disconnects on logout.
* **Day 3: Real-time Event Handling**
    * [ ] Task 3.1: Implement listeners for key WebSocket events (e.g., `booking:created`, `booking:updated`, `booking:cancelled`, `time-slot:updated`, `waitlist:spot-available`, `notification:new`, `system:announcement`).
    * [ ] Task 3.2: On receiving events, use `queryClient.invalidateQueries()` for the relevant data to trigger UI updates (e.g., `invalidateQueries(['bookings', userId])` on booking events, `invalidateQueries(['timeSlots', labId, ...])` on `time-slot:updated`).
    * [ ] Task 3.3: For `notification:new` events, update the notification list query data or add the new notification to a local state/Zustand store for immediate display (e.g., a small indicator in the header).
    * [ ] Task 3.4: Implement the Mark as Read UI and integrate with the `markNotificationAsRead`/`markAllNotificationsAsRead` mutations.
* **Day 4: UI Integration and Refinement**
    * [ ] Task 4.1: Create a Notification Center page (`src/pages/NotificationsPage.tsx`) to display all notifications.
    * [ ] Task 4.2: Add a notification indicator (e.g., an icon with a badge for unread count) in the Header. Use `useQuery` for unread count or derive from notification state.
    * [ ] Task 4.3: Integrate the socket connection management (`useSocket` hook) into the main application component (`App.tsx`) or a Provider.
    * [ ] Task 4.4: Write unit/integration tests for notification API functions (with MSW) and the socket connection/event handling logic (can use `socket.io-client` for testing server-side emissions).

## PHASE 7: Admin & Super Admin Features (Estimated: 7-10 Days)

Implement the user interfaces and logic for administrative tasks. This integrates with backend Admin/Super Admin APIs (part of Backend Phase 7). This phase can be scoped down for an MVP if needed.

* **Day 1: Admin Layout and Protected Routes**
    * [ ] Task 1.1: Create `AdminLayout` component (`src/components/templates/`) with a dedicated admin sidebar navigation.
    * [ ] Task 1.2: Create `AdminRoute` and `SuperAdminRoute` components that check the user's role from the auth store.
    * [ ] Task 1.3: Define admin routes (`/admin`, `/admin/labs`, `/admin/users`, `/admin/reports`) and wrap them with `AdminRoute`.
* **Day 2-3: Lab Management (Admin)**
    * [ ] Task 2.1: Create Admin API functions for Lab management (`src/api/admin/labs.ts`): `createLab`, `updateLab`, `deleteLab`, `getAllLabs`.
    * [ ] Task 2.2: Set up MSW handlers for admin lab APIs.
    * [ ] Task 2.3: Create `AdminLabsPage` component (`src/pages/admin/`).
    * [ ] Task 2.4: Use `useQuery` to fetch all labs. Display in a table.
    * [ ] Task 2.5: Implement "Add New Lab" functionality (modal/form using React Hook Form/Zod, `useMutation`).
    * [ ] Task 2.6: Implement "Edit Lab" functionality (modal/form, `useMutation`).
    * [ ] Task 2.7: Implement "Delete Lab" functionality (button, confirmation, `useMutation`). Invalidate lab queries on success.
* **Day 4-5: Time Slot Management (Admin)**
    * [ ] Task 4.1: Create Admin API functions for Time Slot management (`src/api/admin/timeSlots.ts`): `createTimeSlot`, `createBulkTimeSlots`, `updateTimeSlot`, `deleteTimeSlot`, `getLabTimeSlots`.
    * [ ] Task 4.2: Set up MSW handlers for admin time slot APIs.
    * [ ] Task 4.3: Integrate time slot management into `AdminLabsPage` or create a separate `AdminLabTimeSlotsPage`.
    * [ ] Task 4.4: Implement viewing time slots for a specific lab (using `useQuery`).
    * [ ] Task 4.5: Implement "Add Single Slot" and "Add Bulk Slots" functionality (forms, `useMutation`).
    * [ ] Task 4.6: Implement "Edit Slot" and "Delete Slot" functionality (using `useMutation`). Invalidate time slot queries on success.
* **Day 6-7: Booking & User Monitoring (Admin)**
    * [ ] Task 6.1: Create Admin API functions for Booking/User monitoring (`src/api/admin/bookings.ts`, `src/api/admin/users.ts`): `getAllBookings`, `updateBookingStatus` (Admin version), `getAllUsers`, `getUserDetails`.
    * [ ] Task 6.2: Set up MSW handlers.
    * [ ] Task 6.3: Create `AdminBookingsPage` to view all bookings (using `useQuery`). Add filtering/sorting.
    * [ ] Task 6.4: Implement functionality to update booking status (e.g., Confirm, Cancel, Complete) from the admin view (using `useMutation`). Invalidate bookings/time slot/waitlist queries on success.
    * [ ] Task 6.5: Create `AdminUsersPage` to view/search all users (using `useQuery`). Link to user details.
* **Day 8-9: Reporting (Admin/Super Admin)**
    * [ ] Task 8.1: Create API functions for Reports (`src/api/reports.ts`): `getLabUsageReport`, `getUserActivityReport`, etc.
    * [ ] Task 8.2: Set up MSW handlers.
    * [ ] Task 8.3: Create `AdminReportsPage` (`src/pages/admin/`).
    * [ ] Task 8.4: Use `useQuery` to fetch report data based on selected parameters (date range, lab ID, org ID).
    * [ ] Task 8.5: Display report data (tables, charts - potentially using a charting library like Chart.js or Recharts).
* **Day 10: Super Admin Features (Manage Admins/Organizations)**
    * [ ] Task 10.1: Create Super Admin API functions (`src/api/superAdmin/`).
    * [ ] Task 10.2: Set up MSW handlers.
    * [ ] Task 10.3: Create `SuperAdminAdminsPage` and `SuperAdminOrganizationsPage` (protected by `SuperAdminRoute`).
    * [ ] Task 10.4: Implement CRUD operations for Admins and Organizations using `useQuery`/`useMutation`.

## PHASE 8: Refinement, Testing, Optimization, Deployment Prep (Estimated: 5-7 Days)

This final phase focuses on polishing the application, ensuring its reliability, performance, and preparing it for deployment.

* **Day 1-2: Unit and Integration Testing**
    * [ ] Task 1.1: Write comprehensive unit tests for components (focus on rendering, events), custom hooks, and utility functions using Jest and React Testing Library.
    * [ ] Task 1.2: Write integration tests for API calls (using MSW), component interactions, and state management flows.
    * [ ] Task 1.3: Ensure good test coverage for critical components and logic.
* **Day 3: End-to-End Testing**
    * [ ] Task 3.1: Set up Cypress or Playwright project.
    * [ ] Task 3.2: Write E2E tests for the most critical user workflows (User registration -> login -> book slot -> view booking; Admin login -> manage lab -> view booking).
    * [ ] Task 3.3: Integrate E2E tests into the GitHub Actions CI workflow.
* **Day 4: Performance Optimization**
    * [ ] Task 4.1: Implement route-based code splitting (`React.lazy`, dynamic imports).
    * [ ] Task 4.2: Review and optimize component rendering using React Developer Tools Profiler. Apply `React.memo`, `useMemo`, `useCallback` where beneficial.
    * [ ] Task 4.3: Optimize images and assets.
    * [ ] Task 4.4: Review React Query cache configurations (`staleTime`, `cacheTime`).
* **Day 5: UI/UX Refinement and Accessibility**
    * [ ] Task 5.1: Conduct a thorough review of the UI across different screen sizes, refining styles and layouts.
    * [ ] Task 5.2: Test accessibility using browser tools and automated linters. Address identified issues (keyboard navigation, ARIA attributes, contrast).
    * [ ] Task 5.3: Refine error message display and user feedback across the application.
* **Day 6: Build Configuration and Documentation**
    * [ ] Task 6.1: Finalize Vite build configuration (`vite.config.ts`) for production optimization.
    * [ ] Task 6.2: Create or update documentation for frontend setup, architecture, component usage, and API integration patterns.
    * [ ] Task 6.3: Ensure README includes instructions for running the frontend.
* **Day 7: Deployment Preparation**
    * [ ] Task 7.1: Verify the production build (`npm run build`) works correctly.
    * [ ] Task 7.2: Configure the backend to serve the frontend static files (if using that deployment approach).
    * [ ] Task 7.3: Finalize GitHub Actions CI/CD workflow for frontend build and deployment.
    * [ ] Task 7.4: Create a pre-deployment checklist.

## OUTCOME

Following this frontend implementation roadmap will guide you through building the complete user interface and logic for the Time-Booking Application. It's designed to integrate systematically with your backend progress, leveraging tools and practices that promote code quality, testability, and maintainability. Remember to use MSW for features where the backend API is not yet completed and switch to the real API as it becomes available.

This plan provides a detailed path; adjust task durations and break them down further if needed based on your daily progress.