# Database Guide for Time-Booking Application

This guide provides information on the database setup, schema design, and maintenance procedures for the Time-Booking Application.

## Database Schema

The application uses PostgreSQL with Prisma ORM. The main entities in our schema are:

- **User**: Represents system users (students, researchers)
- **Admin**: Represents lab administrators
- **SuperAdmin**: System-wide administrators with highest privileges
- **Organization**: Organizations that own labs
- **Lab**: Physical coding labs that can be booked
- **TimeSlot**: Available time periods for lab bookings
- **Booking**: Reservations made by users for specific time slots
- **Waitlist**: Queues for users waiting for availability

For the complete schema, refer to the Prisma schema file: `/backend/prisma/schema.prisma`

## Index Strategy

The following indexes improve query performance:

1. **User Table**:
   - `user_email`: Unique index for fast login and lookup
   - `organizationId`: For filtering users by organization

2. **Booking Table**:
   - Compound index on `(userId, status)`: Optimizes queries for user bookings
   - Compound index on `(timeSlotId, status)`: Optimizes availability checking

3. **TimeSlot Table**:
   - Compound index on `(labId, startTime, endTime)`: Optimizes slot lookup

## Database Setup for New Developers

### Prerequisites
- Docker and Docker Compose installed
- Node.js (v18+) and npm installed

### Setup Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/time-booking-application.git
   cd time-booking-application
   ```

2. **Set up environment variables**:

  - Copy `.env.example` to `.env`
  - Configure database connection string

3. **Start the database using Docker**:
   ```bash
   docker-compose up -d postgres
   ```

4. **Initialize the database**:
  ```bash
  cd backend
  npm install 
  npx prisma migrate dev
  ```
5. **Seed the database with initial data**:
  ```bash
  npx prisma client
  ```

## Database Maintenance Guidelines

### Regular Maintenance Tasks

1. **Backups**:

- Daily automated backups are configured in production
- To manually create a backup:
  ```bash
  docker exec tb-postgres pg_dump -U postgres time_booking > backup_$(date +%Y%m%d).sql
  ```

2. **Schema Migrations**:

- Always use Prisma migrations for schema changes:
  ```bash
    npx prisma migrate dev --name descriptive_name
    ```

- Test migrations in development before applying to production

3. **Performance Monitoring**:

- Review performance reports in `/performance-reports/`
- Check for slow queries and optimize as needed

### Troubleshooting Common Issues

1. **Connection Issues**:

- Verify DATABASE_URL in .env file
- Check if PostgreSQL container is running
- Ensure port 5432 is available

2. **Migration Failures**:

- Reset the database (development only):
  ```bash
  npx prisma migrate reset
  ```

- Check migration logs for specific errors

3. **Performance Issues**:

- Review indexes for frequently accessed data
- Check for N+1 query problems in API endpoints
- Consider query optimization or denormalization for hotspots