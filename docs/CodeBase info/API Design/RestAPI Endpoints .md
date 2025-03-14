# RESTful API Endpoints Documentation

This document outlines all the RESTful API endpoints for the Time-Booking Application, organized by feature and resource type.

## Authentication & User Management

### Authentication

| Method | Endpoint | Description | Request Body | Response | Access |
|--------|----------|-------------|-------------|----------|--------|
| POST | `/api/auth/register` | Register new user | `{user_name, user_email, user_password, organizationId?}` | `{user, token}` | Public |
| POST | `/api/auth/login` | User login | `{email, password}` | `{user, token}` | Public |
| POST | `/api/auth/logout` | User logout | None | `{success: true}` | User |
| POST | `/api/auth/refresh-token` | Refresh JWT token | None (uses refresh token in cookie) | `{token}` | User |
| POST | `/api/auth/forgot-password` | Request password reset | `{email}` | `{success: true}` | Public |
| POST | `/api/auth/reset-password` | Reset password | `{token, newPassword}` | `{success: true}` | Public |

### User Management

| Method | Endpoint | Description | Request Body | Response | Access |
|--------|----------|-------------|-------------|----------|--------|
| GET | `/api/users/me` | Get current user profile | None | `{user}` | User |
| PUT | `/api/users/me` | Update user profile | `{user_name?, email?}` | `{user}` | User |
| PUT | `/api/users/me/password` | Change password | `{currentPassword, newPassword}` | `{success: true}` | User |
| DELETE | `/api/users/me` | Delete user account | None | `{success: true}` | User |

### Admin User Management

| Method | Endpoint | Description | Request Body | Response | Access |
|--------|----------|-------------|-------------|----------|--------|
| GET | `/api/admin/users` | List all users | None | `{users: User[]}` | Admin |
| GET | `/api/admin/users/:id` | Get user details | None | `{user}` | Admin |
| PUT | `/api/admin/users/:id` | Update user | `{user_name?, user_email?, user_role?}` | `{user}` | Admin |
| DELETE | `/api/admin/users/:id` | Delete user | None | `{success: true}` | Admin |
| POST | `/api/admin/users/:id/reset-password` | Reset user password | None | `{tempPassword}` | Admin |

### Admin Management (Super Admin Only)

| Method | Endpoint | Description | Request Body | Response | Access |
|--------|----------|-------------|-------------|----------|--------|
| GET | `/api/super-admin/admins` | List all admins | None | `{admins: Admin[]}` | Super Admin |
| POST | `/api/super-admin/admins` | Create admin | `{admin_name, admin_email, admin_password, organizationId}` | `{admin}` | Super Admin |
| GET | `/api/super-admin/admins/:id` | Get admin details | None | `{admin}` | Super Admin |
| PUT | `/api/super-admin/admins/:id` | Update admin | `{admin_name?, admin_email?}` | `{admin}` | Super Admin |
| DELETE | `/api/super-admin/admins/:id` | Delete admin | None | `{success: true}` | Super Admin |

## Organization Management

| Method | Endpoint | Description | Request Body | Response | Access |
|--------|----------|-------------|-------------|----------|--------|
| GET | `/api/organizations` | List all organizations | None | `{organizations: Organization[]}` | Admin |
| GET | `/api/organizations/:id` | Get organization details | None | `{organization}` | Admin |
| POST | `/api/organizations` | Create organization | `{org_name, org_type, org_location}` | `{organization}` | Super Admin |
| PUT | `/api/organizations/:id` | Update organization | `{org_name?, org_type?, org_location?}` | `{organization}` | Super Admin |
| DELETE | `/api/organizations/:id` | Delete organization | None | `{success: true}` | Super Admin |

## Lab Management

| Method | Endpoint | Description | Request Body | Response | Access |
|--------|----------|-------------|-------------|----------|--------|
| GET | `/api/labs` | List all labs | None | `{labs: Lab[]}` | User |
| GET | `/api/labs/:id` | Get lab details | None | `{lab}` | User |
| POST | `/api/labs` | Create new lab | `{lab_name, lab_capacity, location, description, organizationId, adminId}` | `{lab}` | Admin |
| PUT | `/api/labs/:id` | Update lab | `{lab_name?, lab_capacity?, location?, description?, status?}` | `{lab}` | Admin |
| DELETE | `/api/labs/:id` | Delete lab | None | `{success: true}` | Admin |
| GET | `/api/labs/:id/availability` | Get lab availability for date range | `{startDate, endDate}` (query) | `{availability: TimeSlot[]}` | User |

## Time Slot Management

| Method | Endpoint | Description | Request Body | Response | Access |
|--------|----------|-------------|-------------|----------|--------|
| GET | `/api/time-slots` | List all time slots | `{labId?, date?}` (query) | `{timeSlots: TimeSlot[]}` | User |
| GET | `/api/time-slots/:id` | Get time slot details | None | `{timeSlot}` | User |
| POST | `/api/labs/:id/time-slots` | Create time slot | `{date, start_time, end_time}` | `{timeSlot}` | Admin |
| POST | `/api/labs/:id/time-slots/bulk` | Create multiple time slots | `{slots: {date, start_time, end_time}[]}` | `{timeSlots: TimeSlot[]}` | Admin |
| PUT | `/api/time-slots/:id` | Update time slot | `{date?, start_time?, end_time?, status?}` | `{timeSlot}` | Admin |
| DELETE | `/api/time-slots/:id` | Delete time slot | None | `{success: true}` | Admin |

## Booking Management

| Method | Endpoint | Description | Request Body | Response | Access |
|--------|----------|-------------|-------------|----------|--------|
| GET | `/api/bookings` | List all bookings | `{userId?, slotId?, status?, startDate?, endDate?}` (query) | `{bookings: Booking[]}` | Admin |
| GET | `/api/bookings/me` | List current user bookings | `{status?, startDate?, endDate?}` (query) | `{bookings: Booking[]}` | User |
| GET | `/api/bookings/:id` | Get booking details | None | `{booking}` | User (own) / Admin |
| POST | `/api/bookings` | Create booking | `{slot_id}` | `{booking}` | User |
| PUT | `/api/bookings/:id` | Update booking status | `{booking_status}` | `{booking}` | User (own) / Admin |
| DELETE | `/api/bookings/:id` | Cancel booking | None | `{success: true}` | User (own) / Admin |

## Waitlist Management

| Method | Endpoint | Description | Request Body | Response | Access |
|--------|----------|-------------|-------------|----------|--------|
| GET | `/api/waitlists` | List all waitlists | `{slotId?, userId?}` (query) | `{waitlists: Waitlist[]}` | Admin |
| GET | `/api/waitlists/me` | List current user waitlists | None | `{waitlists: Waitlist[]}` | User |
| POST | `/api/waitlists` | Join waitlist | `{slot_id}` | `{waitlist}` | User |
| DELETE | `/api/waitlists/:id` | Leave waitlist | None | `{success: true}` | User (own) / Admin |
| GET | `/api/time-slots/:id/waitlist-position` | Check position in waitlist | None | `{position: number}` | User |

## Notification Management

| Method | Endpoint | Description | Request Body | Response | Access |
|--------|----------|-------------|-------------|----------|--------|
| GET | `/api/notifications` | Get all notifications for admin | `{startDate?, endDate?}` (query) | `{notifications: Notification[]}` | Admin |
| GET | `/api/notifications/me` | Get current user notifications | `{read?}` (query) | `{notifications: Notification[]}` | User |
| POST | `/api/notifications` | Send notification | `{user_id, notification_type, notification_message}` | `{notification}` | Admin |
| POST | `/api/notifications/bulk` | Send bulk notifications | `{user_ids: string[], notification_type, notification_message}` | `{count: number}` | Admin |
| PUT | `/api/notifications/:id/read` | Mark notification as read | None | `{notification}` | User (own) |
| PUT | `/api/notifications/me/read-all` | Mark all notifications as read | None | `{count: number}` | User |

## Reports and Analytics (Admin/Super Admin)

| Method | Endpoint | Description | Request Body | Response | Access |
|--------|----------|-------------|-------------|----------|--------|
| GET | `/api/reports/labs/usage` | Lab usage statistics | `{startDate, endDate, labId?}` (query) | `{usage: {...}}` | Admin |
| GET | `/api/reports/users/activity` | User activity report | `{startDate, endDate, organizationId?}` (query) | `{activity: {...}}` | Admin |
| GET | `/api/reports/bookings/summary` | Booking summary | `{startDate, endDate, organizationId?}` (query) | `{summary: {...}}` | Admin |
| GET | `/api/reports/waitlists/analysis` | Waitlist analysis | `{startDate, endDate, labId?}` (query) | `{analysis: {...}}` | Admin |
| GET | `/api/reports/system/performance` | System performance metrics | `{startDate, endDate}` (query) | `{metrics: {...}}` | Super Admin |

## WebSocket Endpoints for Real-time Updates

| Event | Description | Payload | Access |
|-------|-------------|---------|--------|
| `booking:created` | New booking created | `{booking}` | Admin |
| `booking:updated` | Booking status changed | `{booking}` | User (own) / Admin |
| `booking:cancelled` | Booking cancelled | `{bookingId}` | User (own) / Admin |
| `time-slot:updated` | Time slot availability changed | `{timeSlot}` | User / Admin |
| `waitlist:position-changed` | Waitlist position updated | `{waitlist}` | User (own) |
| `notification:new` | New notification received | `{notification}` | User (own) / Admin |