# Authentication Flow

This document outlines the authentication and authorization flow for the Time-Booking Application, detailing how users authenticate, how sessions are managed, and how role-based access control is implemented.

## Authentication Methods

The application uses a JWT (JSON Web Token) based authentication system combined with Redis for session management, providing both security and scalability.

### Registration and Login Flow


sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database
    participant Redis
    
    User->>Frontend: Fill registration form
    Frontend->>API: POST /api/auth/register
    API->>Database: Check if email exists
    Database-->>API: Email status
    
    alt Email already exists
        API-->>Frontend: Error: Email exists
        Frontend-->>User: Show error message
    else Email is new
        API->>API: Hash password with bcrypt
        API->>Database: Create new user
        Database-->>API: User created
        API->>API: Generate JWT tokens (access + refresh)
        API->>Redis: Store refresh token with user ID
        API-->>Frontend: Return user data & access token
        Frontend->>Frontend: Store token in memory
        Frontend->>Frontend: Store refresh token in HttpOnly cookie
        Frontend-->>User: Redirect to dashboard
    end
    
    Note over User,Redis: Similar flow for login (POST /api/auth/login)

### Token Management

1. Access Token:

Short-lived JWT (15 minutes)
Contains user ID and role claims
Used for API authorization
Stored in memory (not in localStorage/sessionStorage)

2. Refresh Token:

Long-lived token (7 days)
Stored in Redis with user ID association
Delivered to client as HttpOnly, Secure cookie
Used to obtain new access tokens

### Token Refresh Process 

sequenceDiagram
    participant Frontend
    participant API
    participant Redis
    
    Frontend->>API: Request with expired access token
    API-->>Frontend: 401 Unauthorized
    Frontend->>API: POST /api/auth/refresh-token (with cookie)
    API->>API: Extract refresh token from cookie
    API->>Redis: Validate refresh token
    
    alt Valid refresh token
        Redis-->>API: Token valid for user
        API->>API: Generate new access token
        API-->>Frontend: Return new access token
        Frontend->>Frontend: Store new token
        Frontend->>API: Retry original request
    else Invalid/expired refresh token
        Redis-->>API: Token invalid
        API-->>Frontend: 401 Unauthorized
        Frontend->>Frontend: Clear tokens
        Frontend-->>User: Redirect to login
    end

### Password Reset Flow 

sequenceDiagram
    participant Frontend
    participant API
    participant Redis
    
    Frontend->>API: Request with expired access token
    API-->>Frontend: 401 Unauthorized
    Frontend->>API: POST /api/auth/refresh-token (with cookie)
    API->>API: Extract refresh token from cookie
    API->>Redis: Validate refresh token
    
    alt Valid refresh token
        Redis-->>API: Token valid for user
        API->>API: Generate new access token
        API-->>Frontend: Return new access token
        Frontend->>Frontend: Store new token
        Frontend->>API: Retry original request
    else Invalid/expired refresh token
        Redis-->>API: Token invalid
        API-->>Frontend: 401 Unauthorized
        Frontend->>Frontend: Clear tokens
        Frontend-->>User: Redirect to login
    end

    User->>Frontend: Click reset link in email
    Frontend->>Frontend: Show reset password form
    User->>Frontend: Enter new password
    Frontend->>API: POST /api/auth/reset-password
    API->>Database: Verify token validity
    
    alt Token valid
        API->>API: Hash new password
        API->>Database: Update password
        API-->>Frontend: Success message
    else Token invalid/expired
        API-->>Frontend: Error message
    end

## Role-Based Access Control (RBAC)

The application implements three primary user roles with distinct permissions:

### Role Hierarchy

1. User (Regular user):

Access to view available labs
Book, reschedule, and cancel their own bookings
Join and leave waitlists
View their notifications and profile

2. Admin:

All User permissions
Manage labs they oversee
Create and modify time slots
View all bookings for their labs
Override booking statuses
Send notifications to users
Access reports for their labs

3. Super Admin:

All Admin permissions
Create and manage organizations
Create and manage admin accounts
Access system-wide reports and metrics
Apply global settings and policies

### Authorization Flow

sequenceDiagram
    participant Frontend
    participant API Gateway
    participant Auth Middleware
    participant API Endpoint
    
    Frontend->>API Gateway: Request with JWT token
    API Gateway->>Auth Middleware: Validate token
    Auth Middleware->>Auth Middleware: Decode JWT
    
    alt Invalid or expired token
        Auth Middleware-->>API Gateway: 401 Unauthorized
        API Gateway-->>Frontend: 401 Response
    else Valid token
        Auth Middleware->>Auth Middleware: Extract user ID and role
        Auth Middleware->>API Endpoint: Forward request with user context
        
        alt User has permission
            API Endpoint->>API Endpoint: Process request
            API Endpoint-->>Frontend: Success response
        else User lacks permission
            API Endpoint-->>Frontend: 403 Forbidden
        end
    end

