# Permission Matrix for Time Booking Application

## Roles
- **SuperAdmin**: Full system access
- **Admin**: Manage users and bookings
- **User**: Manage own bookings

## Resources & Actions
| Resource | Actions                          |
|----------|---------------------------------|
| Booking  | Create, Read Own, Read All, Update Own, Update All, Delete Own, Delete All |
| User     | Read, Update, Delete            |
| Lab      | Read, Manage                   |

## Permission Matrix

| Role       | Booking: Create | Booking: Read Own | Booking: Read All | ... |
|------------|-----------------|-------------------|-------------------|-----|
| User       | Yes             | Yes               | No                | ... |
| Admin      | Yes             | Yes               | Yes               | ... |
| SuperAdmin | Yes             | Yes               | Yes               | ... |

## Ownership Rules
- Users can only update or delete their **own bookings**.
- Admins can manage **all bookings**.
- ...

## Special Cases and Exceptions
- Time-based access restrictions (if any).
- Delegated permissions (if implemented).
