# Frontend Development Plan for Time-Booking Application

This document outlines the strategic plan for developing the frontend of the Time-Booking Application, covering technology choices, architecture, key considerations, and synchronization strategies with the backend implementation.

## 1. Technology Stack Selection

Based on the project's requirements, the backend stack (Node.js, TypeScript), and the goal of maintainability and scalability for a single developer, the following technology stack is recommended:

* **Core Library:** React (with TypeScript)
    * **Pros:** Component-based, large ecosystem, strong community support, integrates well with TypeScript, excellent for dynamic UIs, widely used for complex applications.
    * **Cons:** Requires supplementary libraries for routing and state management (addressed by recommendations below).
* **Build Tool:** Vite
    * **Rationale:** Provides a significantly faster development experience compared to tools like Create React App and efficient production builds.
* **State Management:** React Query (for server state/caching) and Zustand (for simple global UI state)
    * **Rationale:** React Query dramatically simplifies managing asynchronous data fetching, caching, synchronization, and background updates. Zustand offers a lightweight and straightforward approach for managing non-server-related global UI state like authentication status.
* **UI Component Library:** Material UI or Ant Design
    * **Rationale:** Accelerates UI development with pre-built, accessible, and responsive components, ensuring visual consistency and adherence to modern design principles without starting from scratch.
* **API Communication:** Axios
    * **Rationale:** A robust, promise-based HTTP client ideal for making API requests, handling request/response interception (e.g., adding auth tokens), and centralized error handling.
* **Form Management:** React Hook Form
    * **Rationale:** Offers efficient form handling with minimal re-renders, easy validation integration, and a clean API.
* **Validation:** Zod (Reuse from backend)
    * **Rationale:** Ensures consistency in data validation logic between frontend input and backend processing, leveraging TypeScript for type safety end-to-end.
* **Routing:** React Router DOM v6+
    * **Rationale:** The standard and flexible library for client-side routing in React applications.
* **Real-time Communication:** Socket.IO Client
    * **Rationale:** Aligns with the backend's use of Socket.IO, providing reliable real-time communication with features like automatic reconnection.

## 2. Architecture and Structure

**Recommended Architecture:** Component-Based Architecture following **Atomic Design Principles**, with clear separation of concerns.

* **Approach:** Build UI from small, reusable **atoms** (buttons, text), combine them into **molecules** (forms, cards), assemble molecules into complex **organisms** (sections, lists), arrange organisms into **templates** (page layouts), and finally populate templates to create full **pages**.
* **Rationale:** This promotes modularity, reusability, and maintainability by creating a predictable hierarchy and clear responsibilities for each component level.
* **Separation of Concerns:**
    * **API Layer:** Dedicated module for all API calls (`src/api`).
    * **State Layer:** Centralized state management (`src/state` for Zustand, hooks/providers for React Query).
    * **UI Layer:** Components organized by Atomic Design (`src/components`).
    * **Page Layer:** Integrates UI components, fetches data, manages page-specific logic (`src/pages`).
    * **Utility Layer:** Pure helper functions (`src/utils`).
    * **Hooks Layer:** Custom React hooks to encapsulate reusable logic (`src/hooks`).

**Suggested Folder Structure:**

/frontend
├── public/             # Static assets (index.html, favicon)
├── src/
│   ├── api/            # Centralized API client setup (axios instance)
│   │   ├── index.ts    # Axios instance configuration
│   │   ├── auth.ts     # Functions for auth endpoints (/api/auth/*)
│   │   ├── users.ts    # Functions for user endpoints (/api/users/*)
│   │   ├── labs.ts     # Functions for lab endpoints (/api/labs/*)
│   │   ├── bookings.ts # Functions for booking endpoints (/api/bookings/*)
│   │   ├── waitlists.ts# Functions for waitlist endpoints (/api/waitlists/*)
│   │   └── ...         # Other resource APIs
│   ├── assets/         # Images, fonts, icons
│   ├── components/     # Reusable UI components organized by Atomic Design
│   │   ├── atoms/      # Button, Input, Text, Icon, LoadingSpinner, etc.
│   │   ├── molecules/  # FormField (Input + Label), Card, Modal, NavigationItem, etc.
│   │   ├── organisms/  # LoginForm, RegistrationForm, LabList, BookingCalendar, Header, Footer, Sidebar, etc.
│   │   └── templates/  # Layout components (AuthLayout, MainLayout with Header/Sidebar/Footer)
│   ├── config/         # Application configurations (API base URL, constants)
│   ├── contexts/       # React Contexts (e.g., AuthContext if not using Zustand/React Query for primary auth state)
│   ├── hooks/          # Custom React Hooks (e.g., useAuthStatus, useLabsQuery - if not solely relying on React Query hooks)
│   ├── pages/          # Page-level components, combine organisms/templates (Login.tsx, Dashboard.tsx, LabDetails.tsx, MyBookings.tsx)
│   ├── providers/      # Context/Provider components (e.g., ReactQueryProvider, AuthProvider)
│   ├── state/          # Zustand stores or Redux slices
│   │   ├── authStore.ts# Zustand store for auth status/user info
│   │   └── ...         # Other global state stores
│   ├── styles/         # Tailwind CSS configuration, global CSS, theme variables
│   │   ├── index.css
│   │   └── tailwind.config.js
│   ├── types/          # TypeScript interfaces and types (matching backend where applicable)
│   ├── utils/          # Helper functions (date formatting, validation helpers)
│   ├── App.tsx         # Root component, sets up Providers, Router
│   ├── main.tsx        # Entry point (replaces index.tsx if using Vite/CRA)
│   └── routes.tsx      # Centralized routing configuration
└── package.json
└── tsconfig.json
└── vite.config.ts      # Vite configuration
└── postcss.config.js   # Tailwind CSS config
└── ...eslint, prettier config files

### 3. User Interface (UI) and User Experience (UX) Considerations

Designing a user-friendly interface is critical for this application's success.

* **User-Centric Design:**
    * Map out key user flows (e.g., "As a User, I want to book a lab slot").
    * Create simple wireframes or mockups for core pages (Login, Dashboard, Lab Details, Booking Confirmation, My Bookings) to plan layout and navigation before coding.
* **Consistency:**
    * Define a visual style guide early (colors, typography, spacing).
    * Use a UI component library to provide a consistent look and feel.
    * Utilize Tailwind CSS utilities and configuration for consistent styling.
* **Responsiveness:**
    * Design and build for mobile-first, ensuring the layout adapts gracefully to tablet and desktop screen sizes using responsive design techniques (CSS media queries, Flexbox, Grid, Tailwind's responsive utilities).
* **Accessibility (WCAG):**
    * Implement semantic HTML.
    * Ensure sufficient color contrast.
    * Provide keyboard navigation support.
    * Use ARIA attributes where necessary.
    * Leverage built-in accessibility features of the chosen UI library.
    * Utilize linters (`eslint-plugin-jsx-a11y`).

### 4. State Management

Managing application data and UI state effectively is key to responsiveness and predictability.

* **Server State (Data):** **React Query** is the primary tool for managing data fetched from your backend APIs. It handles caching, loading/error states, background updates, and data synchronization.
    * Use `useQuery` hooks for GET requests (fetching labs, slots, bookings).
    * Use `useMutation` hooks for CUD (Create, Update, Delete) requests (booking, cancelling, joining waitlist).
    * Utilize `queryClient.invalidateQueries()` to automatically refetch data when relevant changes occur (e.g., after a successful booking or cancellation).
* **UI State:** **Zustand** or React's Context API (`useReducer`) can manage simple global UI state.
    * Use for: Authentication status (`isLoggedIn`, `user`), global loading indicators, theme settings, modal visibility.
* **Local Component State:** Use React's built-in `useState` and `useReducer` for state local to a single component or hook (e.g., form input values, selected date in calendar).
* **Data Flow:** Unidirectional flow: UI interaction -> Call API function (via React Query mutation) or dispatch state action -> Backend processes (triggers DB changes/WS events) -> React Query invalidates/refetches or Zustand store updates -> Components re-render. WebSocket events also trigger state updates (often via `queryClient.invalidateQueries`).

### 5. API Integration

* **Centralized Axios Client:** Create a configured Axios instance in `src/api/index.ts` with the backend `baseURL`. Use request interceptors to add the JWT access token (from your auth state) to the `Authorization` header for protected routes. Use response interceptors for global error handling (e.g., detecting 401 responses to trigger a logout).
* **Typed API Functions:** Create functions in `src/api/*.ts` for each resource. These functions call the Axios instance and return promises. Use TypeScript interfaces for data types.
* **Integration with React Query:** Wrap your API calls within `useQuery` and `useMutation` hooks. This abstracts away the manual data fetching lifecycle management.
* **Error Handling:** Implement a centralized error handling strategy in your Axios interceptor or API functions. Use a notification library (e.g., react-toastify) to display user-friendly error messages for API failures. Handle specific backend error responses (e.g., validation errors).

### 6. Routing and Navigation

* **Client-Side Routing:** Implement navigation without full page reloads using `react-router-dom`.
* **Setup:** Configure routes in `src/routes.tsx` using `<BrowserRouter>`, `<Routes>`, and `<Route>`.
* **Protected Routes:** Create wrapper components (`ProtectedRoute`, `AdminRoute`, `SuperAdminRoute`) that check the user's authentication status and role (from your auth state) before rendering the target page. Redirect to the login page or an unauthorized page if the user doesn't have access.
* **Navigation:** Use the `<Link>` component for standard navigation links and the `useNavigate` hook for programmatic navigation (e.g., after form submission).

### 7. Testing Strategy

A multi-faceted testing strategy ensures reliability.

* **Unit Tests:**
    * **Scope:** Individual components (rendering, props), custom hooks, utility functions, API functions (mocking Axios calls).
    * **Tools:** Jest, React Testing Library.
    * **Focus:** Verify small, isolated units of code function correctly.
* **Integration Tests:**
    * **Scope:** Interactions between components, components integrated with state management, components integrated with mocked APIs.
    * **Tools:** Jest, React Testing Library, Mock Service Worker (MSW).
    * **Focus:** Verify that different parts of the frontend work together as expected, especially data flow from API (mocked) to UI. MSW is crucial for testing API integration without a live backend.
* **End-to-End (E2E) Tests:**
    * **Scope:** Test complete user workflows in a real browser (e.g., sign up, log in, book a lab, view bookings).
    * **Tools:** Cypress or Playwright.
    * **Focus:** Verify the entire application flow from the user's perspective, catching issues that unit/integration tests might miss.

**Recommendation:** Start with Unit and Integration tests using Jest, React Testing Library, and MSW. Add E2E tests with Cypress for critical user journeys as features are completed. Integrate tests into your CI workflow.

### 8. Build and Deployment Process

* **Build:** Use `npm run build` (configured by Vite) to create a production-ready build in the `dist` directory.
* **Deployment:**
    * **Option 1 (Recommended for Solo Dev):** Serve the `frontend/dist` static files directly from your backend Express server. Configure an Express static middleware pointing to this directory. Your backend deployment process will then include building and serving the frontend.
    * **Option 2:** Deploy the `dist` directory to a static hosting service (Netlify, Vercel). Requires configuring backend CORS.
* **CI/CD (GitHub Actions):**
    * Create a separate GitHub Actions workflow for the frontend (triggered on push to `main` in the `frontend` directory).
    * Include steps for: Setup Node.js, install dependencies (`npm ci`), run lint, run tests, build (`npm run build`).
    * Integrate deployment: This workflow can either deploy the static files directly (if using a service like Netlify) or signal the backend workflow to deploy, ensuring the latest frontend build is included.

### 9. Performance Optimization

* **Code Splitting:** Implement route-based code splitting using `React.lazy()` and dynamic imports (`import()`) with React Router to load code chunks only when needed.
* **React Query Caching:** Configure `staleTime` and `cacheTime` for queries to serve cached data instantly while fetching updates in the background.
* **Asset Optimization:** Compress images, use modern formats (WebP), lazy load images below the fold.
* **Minimize Bundle Size:** Regularly analyze your bundle size (tools like `rollup-plugin-visualizer` for Vite) and remove unnecessary dependencies.
* **Memoization:** Use `React.memo`, `useMemo`, and `useCallback` judiciously to prevent expensive re-renders and recalculations, particularly in lists and components with many props or complex children.
* **Virtualized Lists:** For displaying potentially large lists of bookings or users, use libraries like `react-window` to render only visible items.

### 10. Security Considerations

* **Client-Side Validation (UX only):** Implement Zod validation on forms for immediate feedback, but **always re-validate on the backend.**
* **XSS:** Rely on React's automatic escaping. Avoid `dangerouslySetInnerHTML` unless strictly necessary and with sanitized input.
* **Authentication Tokens:** Store the access token in memory (in a Zustand store, not localStorage/sessionStorage). The refresh token should be in an HttpOnly, Secure cookie managed by the backend.
* **Role-Based UI:** Hide/show UI elements based on the user's role from the auth state (decoded from JWT). **Do not rely on this for security; backend RBAC must enforce all access controls.**
* **CORS:** Strict backend CORS policy allowing only your frontend origin(s).
* **Dependency Audits:** Regularly run `npm audit` on the frontend project.

### 11. Scalability and Maintainability

* **Consistent Coding Standards:** Strictly follow your ESLint and Prettier rules. Use TypeScript effectively.
* **Modular and Reusable Components:** The Atomic Design structure promotes building a library of reusable components.
* **Predictable State:** Using React Query and Zustand provides a clear and predictable way to manage application state.
* **Clear Naming:** Use descriptive and consistent naming for files, components, variables, and functions.
* **Documentation:** Document complex logic, custom hooks, API interactions, and state management flows.

### 12. Synchronization with Backend Development

As a single developer, effective synchronization is key to avoiding roadblocks.

* **Strategy: Vertical Slices + Mocking:**
    * Develop the application feature by feature ("vertical slices").
    * For each feature, prioritize the backend API implementation first (or ensure the contract is clearly defined in `Restapi.md`).
    * While the backend API is being built/refined, develop the frontend UI and logic for that feature using **Mock Service Worker (MSW)** to intercept API calls and return realistic mock data based on the expected API contract.
    * Once the backend API for a feature is ready and tested, swap out the MSW handler for the real API calls. React Query makes this transition smooth as your frontend code is already using the `useQuery`/`useMutation` pattern.
* **Integration Points:** Focus on integrating as soon as the backend API for a specific feature or group of features is stable.
    * **Immediate:** Frontend Authentication (integrates with completed Backend Phase 4). This is your starting point.
    * **Next:** Frontend Lab/Slot Browse (integrates with Backend Lab/TimeSlot APIs - part of Phase 7).
    * **Then:** Frontend Booking/Waitlist (integrates with Backend Booking/Waitlist APIs - part of Phase 7).
    * **Later:** Frontend Notifications/Real-time (integrates with Backend Notifications API and WebSocket implementation - Phase 5 & part of Phase 7).
    * **Finally (for MVP):** Admin/Super Admin features (integrates with Backend Admin APIs - part of Phase 7).
* **Communication (Self):** Regularly refer back to your Backend Implementation Roadmap and `Restapi.md`. Understand which backend tasks are completed or in progress to know when to switch from mocking to real API calls on the frontend.
* **Project Tracking:** Keep a single task list (like your Project Tracking Document or a simple board) that includes tasks for both frontend and backend features side-by-side. This helps visualize dependencies and overall progress.

