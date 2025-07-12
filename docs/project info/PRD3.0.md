# Product Requirements Document

## Time-Booking Application for Efficient Lab Access

**Title:** Time-Booking Application for Efficient Lab Access

**Type of Document:** Requirement Specification Document (PRD)

**Version:** 2.0

**Date:** 07/03/2025

## 1. Introduction

The Time-Booking Application is a web-based platform designed to manage user access to Coding Labs in Madhya Pradesh. [cite: 1] The application will allow users to book, reschedule, and cancel lab time slots efficiently, ensuring fair and equitable access to resources. [cite: 2] The system will also include features like waitlisting, notifications, and user authentication to ensure secure and organized lab usage. [cite: 3]

## 2. Goals

* To provide a user-friendly and efficient system for booking lab time slots. [cite: 4]
* To ensure fair and equitable access to lab resources. [cite: 5]
* To reduce administrative overhead associated with manual lab scheduling. [cite: 5]
* To improve lab utilization and minimize downtime. [cite: 6]

## 3. Target Audience

* **Users:** Students, researchers, and other individuals requiring access to Coding Labs in Madhya Pradesh. [cite: 6, 7]
* **Admins:** Lab managers, Lab operators, IT personnel, and other authorized individuals responsible for managing lab schedules and resources of an organization. [cite: 7]

## 4. Scope

The scope includes:

* User registration and authentication. [cite: 8]
* Lab time slot booking, rescheduling, and cancellation. [cite: 8]
* Waitlist management and notifications. [cite: 8, 9]
* Reporting and monitoring for administrators. [cite: 9]
* Web accessibility. [cite: 9]

## 5. Out of Scope

* Integration with external systems beyond basic authentication (e.g., learning management systems). [cite: 9, 10]
* Advanced analytics and predictive modeling for lab usage. [cite: 10]

## 6. Functional Requirements

### 6.1 User Roles

* **User:** Primary user who can book, reschedule, and cancel lab time slots. [cite: 11]
* **Admin:** Responsible for updating lab schedule and computer availability. [cite: 12]
* **System:** Automated role for sending notifications, managing waitlists, and ensuring fair access. [cite: 12]

### 6.2 Core Features

#### 6.2.1 User Authentication and Authorization

* FR-1: The system shall allow users to register on application & allow log in using their ID and password. [cite: 13]
* FR-2: The system shall authenticate users based on their ID and ensure only authorized users can access the booking system. [cite: 13, 14]
* FR-3: The system shall allow admins to log in using a separate admin ID and password. [cite: 15]

#### 6.2.2 Lab Time Slot Booking

* FR-4: The system shall display available time slots for Coding Labs in real-time. [cite: 16]
* FR-5: The system shall allow users to book a time slot based on availability. [cite: 17]
* FR-6: The system shall allow users to view their booked slots in a "My Bookings" section. [cite: 18]
* FR-7: The system shall prevent overbooking by limiting the number of users per time slot. [cite: 19]

#### 6.2.3 Rescheduling and Cancellation

* FR-8: The system shall allow Users to reschedule their booked time slots, subject to availability. [cite: 20, 21]
* FR-9: The system shall allow Users to cancel their booked time slots. [cite: 21]
* FR-10: The system shall automatically free up cancelled slots for other Users to book. [cite: 22]

#### 6.2.4 Waitlist Management

* FR-11: The system shall allow Users to join a waitlist if no slots are available. [cite: 23]
* FR-12: The system shall notify waitlisted Users via email or SMS when a slot becomes available. [cite: 23, 24]
* FR-13: The system shall prioritize waitlisted Users based on their position in the queue. [cite: 25]

#### 6.2.5 Notifications and Reminders

* FR-14: The system shall send confirmation notifications to Users upon successful booking. [cite: 26, 27]
* FR-15: The system shall send reminders to Users 24 hours before their booked time slot. [cite: 27]
* FR-16: The system shall notify Users of any changes to their booked slots (e.g., rescheduling or cancellation). [cite: 28, 29]

#### 6.2.6 Fair Access and Scheduling

* FR-17: The system shall ensure fair access by limiting the number of bookings per user per week. [cite: 29]
* FR-18: The system shall prevent monopolization of resources by enforcing a maximum usage limit per user. [cite: 30]

#### 6.2.7 User-Friendly Interface

* FR-19: The system shall provide a simple and intuitive interface for the web platform. [cite: 31, 32]
* FR-20: The system shall display available time slots in a calendar view for easy selection. [cite: 32]
* FR-21: The system shall provide a search feature to filter available slots by date and time. [cite: 33, 34]

#### 6.2.8 Reporting and Monitoring (Admin Features)

* FR-22: The system shall allow admins to view all booked slots and lab usage statistics. [cite: 34, 35]
* FR-23: The system shall generate reports on lab usage, including peak hours and most active users. [cite: 35, 36]
* FR-24: The system shall allow admins to manually override bookings in case of emergencies or conflicts. [cite: 36, 37]

## 7. Non-Functional Requirements

### 7.1 Performance

* NFR-1: The system shall handle up to 10,000 concurrent users without performance degradation. [cite: 37, 38]
* NFR-2: The system shall respond to user requests within 2 seconds under normal load. [cite: 38, 39]

### 7.2 Security

* NFR-3: The system shall encrypt all user data, including login credentials and booking details. [cite: 39, 40]
* NFR-4: The system shall implement role-based access control to ensure only authorized users can perform specific actions. [cite: 40, 41]

### 7.3 Scalability

* NFR-5: The system shall be scalable to accommodate additional labs and users as the project expands. [cite: 41, 42]

### 7.4 Availability

* NFR-6: The system shall have a 99.9% uptime, ensuring it is always available for bookings. [cite: 42, 43]

### 7.5 Accessibility

* NFR-7: The system shall be accessible on both web platforms, with a responsive design for different screen sizes. [cite: 43, 44]
* NFR-8: The system shall support multiple languages to cater to Users from diverse linguistic backgrounds. [cite: 44, 45]

## 8. Essential Requirements

* ER-1: Dedicated high-end server grade machine with public network access [cite: 45]
* ER-2: Cloud Infrastructure [cite: 45]

## 9. Entity Relationship Diagram (ERD)

* (See the attached ERD image in the original document) [cite: 46]

## 10. Use Cases

### 10.1 User Use Cases

* UC-1: Register for an account. [cite: 46, 47]
* UC-2: Log in to the application. [cite: 47]
* UC-3: View available lab time slots. [cite: 47]
* UC-4: Book a lab time slot. [cite: 47, 48]
* UC-5: View booked lab time slots. [cite: 48]
* UC-6: Reschedule a booked lab time slot. [cite: 48]
* UC-7: Cancel a booked lab time slot. [cite: 48, 49]
* UC-8: Join a waitlist for a lab time slot. [cite: 49]
* UC-9: Receive notifications and reminders. [cite: 49, 50]

### 10.2 Admin Use Case

* UC-10: Log in to the application. [cite: 50]
* UC-11: Update available lab time slots. [cite: 50, 51]
* UC-12: Approve Bookings [cite: 51]

### 10.2 Super Admin Use Cases

* UC-13: Log in to the admin panel. [cite: 51]
* UC-14: View lab usage statistics. [cite: 51, 52]
* UC-15: Generate lab usage reports. [cite: 52]
* UC-16: Manually override bookings. [cite: 52]
* UC-17: System Oversight [cite: 52]

## 11. Technology Stack (Proposed)

* Frontend: React (Web) [cite: 52]
* Backend: Node.js [cite: 52]
* Database: PostgreSQL [cite: 52]
* Cloud Platform: To be determined [cite: 52, 53]

## 12. Assumptions and Dependencies

* Reliable internet connectivity for users and admins. [cite: 53, 54]
* Availability of lab resources according to the schedule. [cite: 54]
* Timely maintenance of the application and infrastructure. [cite: 54]

## 13. Open Issues and Risks

* Potential for user resistance to a new booking system. [cite: 54, 55]
* Security vulnerabilities if not properly addressed. [cite: 55]
* Scalability challenges with rapid user growth. [cite: 55, 56]

## 14. Future Enhancements

* Integration with payment gateways for paid lab access. [cite: 56]
* Advanced analytics and reporting features. [cite: 56, 57]
* Integration with learning management systems. [cite: 57]
* Implementation of a feedback system for users. [cite: 57]
* Developing Mobile Application. [cite: 57, 58]

## 15. Glossary

* **Lab:** Computer Lab in Madhya Pradesh. [cite: 58]
* **Time Slot:** A specific period of time allocated for lab usage. [cite: 58, 59]
* **User:** An individual who uses the lab resources. [cite: 59]
* **Admin:** An individual responsible for managing lab resources of an organization. [cite: 59, 60]
* **Super Admin:** An individual responsible for overall management of the system. [cite: 60]