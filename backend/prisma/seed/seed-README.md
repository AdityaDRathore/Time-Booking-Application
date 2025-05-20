# Seed Data Documentation

This document provides information about the seed data structure, relationships, and usage for the Time-Booking Application.

## Overview

The seeding system populates the database with realistic test data for development and testing purposes. The seed data is environment-aware and will create different amounts of data based on the `NODE_ENV` environment variable.

## Running Seed Scripts

```bash
# Seed with development data (default)
npm run seed

# Seed with development data explicitly
npm run seed:dev

# Seed with minimal test data
npm run seed:test

# Reset database and re-seed
npm run db:reset
```

## Seed Data Structure

The seed data follows these entity relationships:

1. **Users** (Regular Users, Admins, SuperAdmin)
   - Regular users can make bookings and be on waitlists
   - Admin users are associated with organizations
   - One SuperAdmin user manages the entire system

2. **Organizations**
   - Each organization is associated with the SuperAdmin
   - Each admin is associated with one organization

3. **Labs**
   - Each lab belongs to an organization
   - Each lab is managed by an admin

4. **TimeSlots**
   - Each time slot belongs to a lab
   - Time slots span the next 14 days (or 7 days in test environment)
   - Each day has 4 time slots (9-11, 11-13, 14-16, 16-18)

5. **Bookings**
   - Each booking is made by a user
   - Each booking is for a specific time slot
   - Bookings have various statuses (PENDING, CONFIRMED, CANCELLED, COMPLETED)

6. **Waitlists**
   - Users can be on waitlists for fully booked time slots
   - Waitlists have statuses (ACTIVE, FULFILLED, CANCELLED)

7. **Notifications**
   - User notifications for various events
   - Organization notifications for system-wide announcements

## Default Credentials

### SuperAdmin
- Email: superadmin@mpgovt.in
- Password: SuperAdmin123!

### Admin Users
- Email: rajesh.admin@example.com
- Password: AdminPass123!

- Email: sunita.admin@example.com
- Password: AdminPass123!

- Email: mohan.admin@example.com
- Password: AdminPass123!

### Regular Users
- Pattern: [name].user@example.com
- Password: Password123!

## Configuration

Seed data quantities are configured in `prisma/seed/seed-config.ts` and vary by environment:

- **Development**: Comprehensive data set for full application testing
- **Test**: Minimal data set for fast unit tests
- **Production**: No seed data (empty configuration)

## Customizing Seed Data

To customize the seed data:

1. Modify the configuration in `seed-config.ts`
2. Edit the individual seed files in the `prisma/seed/` directory
3. Run the appropriate seed command

## Manual Setup Steps

No additional manual setup is required after running the seed scripts.