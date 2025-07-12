# Permission Matrix

This document provides a comprehensive overview of permissions in the Time-Booking Application, showing which roles have access to which operations, and how resource ownership affects permissions.

## Role Hierarchy

* **User**: Base role for all authenticated users
* **Admin**: Inherits all User permissions plus admin capabilities
* **Super Admin**: Inherits all Admin permissions plus system-wide capabilities

## Permission Matrix by Resource

### User Management

| Operation | Permission | User | Admin | Super Admin | Ownership Rules |
|-----------|------------|------|-------|-------------|----------------|
| View own profile | users:read_self | ✅ | ✅ | ✅ | Self only |
| Update own profile | users:update_self | ✅ | ✅ | ✅ | Self only |
| Delete own account | users:delete_self | ✅ | ✅ | ✅ | Self only |
| View any user | users:read | ❌ | ✅ | ✅ | N/A |
| Update any user | users:update | ❌ | ✅ | ✅ | Users in same organization |
| Delete any user | users:delete | ❌ | ✅ | ✅ | Users in same organization |
| Reset user password | users:reset_password | ❌ | ✅ | ✅ | Users in same organization |

### Organization Management

| Operation | Permission | User | Admin | Super Admin | Ownership Rules |
|-----------|------------|------|-------|-------------|----------------|
| View organization basic info | organizations:read | ✅ | ✅ | ✅ | Own organization |
| View organization details | organizations:read_details | ❌ | ✅ | ✅ | Own organization |
| Create organization | organizations:create | ❌ | ❌ | ✅ | N/A |
| Update organization | organizations:update | ❌ | ❌ | ✅ | N/A |
| Delete organization | organizations:delete | ❌ | ❌ | ✅ | N/A |

### Lab Management

| Operation | Permission | User | Admin | Super Admin | Ownership Rules |
|-----------|------------|------|-------|-------------|----------------|
| View labs | labs:read | ✅ | ✅ | ✅ | N/A |
| Create lab | labs:create | ❌ | ✅ | ✅ | Within own organization |
| Update lab | labs:update | ❌ | ✅ | ✅ | Labs they manage |
| Delete lab | labs:delete | ❌ | ✅ | ✅ | Labs they manage |

### Time Slot Management

| Operation | Permission | User | Admin | Super Admin | Ownership Rules |
|-----------|------------|------|-------|-------------|----------------|
| View time slots | time_slots:read | ✅ | ✅ | ✅ | N/A |
| Create time slot | time_slots:create | ❌ | ✅ | ✅ | For labs they manage |
| Update time slot | time_slots:update | ❌ | ✅ | ✅ | For labs they manage |
| Delete time slot | time_slots:delete | ❌ | ✅ | ✅ | For labs they manage |

### Booking Management

| Operation | Permission | User | Admin | Super Admin | Ownership Rules |
|-----------|------------|------|-------|-------------|----------------|
| Create booking | bookings:create | ✅ | ✅ | ✅ | N/A |
| View own bookings | bookings:read_own | ✅ | ✅ | ✅ | Self only |
| Update own booking | bookings:update_own | ✅ | ✅ | ✅ | Self only |
| Cancel own booking | bookings:cancel_own | ✅ | ✅ | ✅ | Self only |
| View all bookings | bookings:read_all | ❌ | ✅ | ✅ | Within own organization |
| Update any booking | bookings:update_any | ❌ | ✅ | ✅ | Within own organization |
| Cancel any booking | bookings:cancel_any | ❌ | ✅ | ✅ | Within own organization |

### Waitlist Management

| Operation | Permission | User | Admin | Super Admin | Ownership Rules |
|-----------|------------|------|-------|-------------|----------------|
| Join waitlist | waitlists:join | ✅ | ✅ | ✅ | N/A |
| Leave waitlist | waitlists:leave | ✅ | ✅ | ✅ | Self only |
| View own waitlist position | waitlists:read_own | ✅ | ✅ | ✅ | Self only |
| View all waitlists | waitlists:read_all | ❌ | ✅ | ✅ | Within own organization |
| Manage waitlists | waitlists:manage | ❌ | ✅ | ✅ | Within own organization |

### Notification Management

| Operation | Permission | User | Admin | Super Admin | Ownership Rules |
|-----------|------------|------|-------|-------------|----------------|
| View own notifications | notifications:read_own | ✅ | ✅ | ✅ | Self only |
| Mark own notification as read | notifications:update_own | ✅ | ✅ | ✅ | Self only |
| Send notifications | notifications:send | ❌ | ✅ | ✅ | To users in same organization |

### Admin Management

| Operation | Permission | User | Admin | Super Admin | Ownership Rules |
|-----------|------------|------|-------|-------------|----------------|
| Create admin | admins:create | ❌ | ❌ | ✅ | N/A |
| View admins | admins:read | ❌ | ❌ | ✅ | N/A |
| Update admin | admins:update | ❌ | ❌ | ✅ | N/A |
| Delete admin | admins:delete | ❌ | ❌ | ✅ | N/A |

### Reporting

| Operation | Permission | User | Admin | Super Admin | Ownership Rules |
|-----------|------------|------|-------|-------------|----------------|
| View lab reports | reports:view_lab | ❌ | ✅ | ✅ | Labs they manage |
| View system reports | reports:view_system | ❌ | ❌ | ✅ | N/A |

### System Management

| Operation | Permission | User | Admin | Super Admin | Ownership Rules |
|-----------|------------|------|-------|-------------|----------------|
| Configure system settings | system:configure | ❌ | ❌ | ✅ | N/A |
| Send system announcements | announcements:send | ❌ | ❌ | ✅ | N/A |

## Special Cases and Exceptions

1. **Time-based restrictions**: Some permissions may be restricted based on time. For example:
   - Users can only cancel bookings up to 24 hours before the time slot.
   - Admins can override time-based restrictions in emergency situations.

2. **Capacity constraints**: 
   - Users can only create bookings if capacity is available.
   - Admins can override capacity constraints in special circumstances.

3. **Organizational boundaries**:
   - Admins can only manage resources within their own organization.
   - Super Admins can access resources across all organizations.

4. **Waitlist priority**:
   - Special rules may apply to waitlist positioning based on organizational policies.
   - Admins can override waitlist order in justified cases.

## Visual Representation

```
┌───────────────────┐
│   SUPER ADMIN     │
│                   │
│ - System config   │
│ - All organizations│
│ - Create/manage   │
│   admins          │
└─────────┬─────────┘
          │
          │ Inherits
          ▼
┌───────────────────┐
│      ADMIN        │
│                   │
│ - Manage labs     │
│ - Manage users    │
│ - Override bookings│
│ - View reports    │
└─────────┬─────────┘
          │
          │ Inherits
          ▼
┌───────────────────┐
│       USER        │
│                   │
│ - Book slots      │
│ - Cancel bookings │
│ - Join waitlists  │
│ - View own data   │
└───────────────────┘
```