# Technical Design Document (TDD)

## 1. Overview
This document outlines the technical design and architecture of the Time-Booking Application for Efficient Lab Access.

## 2. System Architecture
The system follows a microservices-based architecture with a monorepo structure.

### 2.1 Tech Stack
- **Frontend:** React.js (TypeScript, TailwindCSS)
- **Backend:** Node.js (Express, TypeScript, Prisma)
- **Database:** PostgreSQL
- **Authentication:** JWT + OAuth 2.0
- **Infrastructure:** AWS (EC2, RDS, S3, CloudFront)
- **DevOps:** Docker, Kubernetes (optional), GitHub Actions

### 2.2 System Components
- **User Dashboard**
- **Admin Dashboard**
- **Super Admin Dashboard**
- **API Gateway**
- **Database with Prisma ORM**

## 3. API Documentation
Documenting all API endpoints using Swagger/OpenAPI.

### Authentication API
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

### Booking API
- `POST /bookings`
- `GET /bookings`
- `DELETE /bookings/:id`

...

## 4. Database Schema & Migrations
### Entities:
- **Users:** id, name, email, role, password
- **Labs:** id, name, capacity, status
- **Bookings:** id, user_id, lab_id, time_slot

Migrations handled with Prisma ORM.

## 5. Security Policies
- Password hashing with bcrypt
- JWT security best practices
- CSRF protection
- Rate limiting

## 6. Testing Plan
### Unit Tests
- API endpoints
- Database interactions

### Integration Tests
- Booking workflow
- Admin management

### Load Testing
- Simulate 10,000+ users

## 7. Deployment Guide
### Infrastructure Setup
- **EC2 instances for servers**
- **RDS for PostgreSQL**
- **Redis for caching**
- **S3 for assets**
- **CloudFront for CDN**

## 8. Tech Stack Info Document (TID)
- **Frontend:** Next.js (React), TailwindCSS
- **Backend:** NestJS, TypeScript, Prisma
- **Database:** PostgreSQL
- **Auth:** JWT, OAuth 2.0

## 9. Project Tracking Document (PTD)
- **Trello/Jira for tracking tasks**
- **Sprint planning & feature releases**

## 10. DevOps & CI/CD Pipelines
- **GitHub Actions for CI/CD**
- **Docker for containerization**
- **AWS CloudWatch for monitoring**
