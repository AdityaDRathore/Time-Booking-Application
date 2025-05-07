# Entity Relationship Diagram Description

This document describes the entities and their relationships as depicted in the provided Entity Relationship Diagram (ERD). The ERD outlines the structure of a system, likely for managing access to coding labs.

## Entities and Attributes

* **NOTIFICATION:**
    * Notification ID
    * Notification Type
    * Notification Message
    * Notification Timestamp
* **ADMIN:**
    * Admin ID
    * Admin Name
    * Admin Password
    * Admin Email
* **ORGANISATION:**
    * Org Type
    * Org Location
    * Org Name
* **USER:**
    * User ID
    * User Password
    * Validation Key
* **LAB:**
    * Lab ID
    * Start Time
    * End Time
    * Lab Capacity
    * Date
* **SLOT:**
    * Slot ID
* **BOOKING:**
    * Booking ID
    * Booking Status
    * Booking Timestamp
    * Slot ID
* **WAITLIST:**
    * Waitlist ID
    * Waitlist Status
    * Waitlist Position
    * User ID
    * Slot ID
* **SUPER ADMIN:**
    * Super Admin ID
    * Super Admin Name
    * Super Admin Password
    * Super Admin Email

## Relationships

The entities are related to each other in the following ways:

* **ORGANISATION** belongs to **ADMIN** (One-to-Many: One organization can have multiple admins).
* **ORGANISATION** can receive **NOTIFICATION** (One-to-Many: One organization can receive multiple notifications).
* **ADMIN** approves **USER** (One-to-Many: One admin can approve multiple users).
* **USER** can search (relationship, details not specified).
* **USER** can request **LAB** (Many-to-Many: Many users can request access to many labs).
* **LAB** has **SLOT** (One-to-Many: One lab can have multiple slots).
* **USER** can join **WAITLIST** for a **SLOT** (Many-to-Many: Many users can join the waitlist for many slots).
* **USER** has **BOOKING** through **SLOT** (Many-to-Many through SLOT: Many users can have multiple bookings for different slots).
* **SUPER ADMIN** manages **BOOKING** (One-to-Many: One super admin can manage multiple bookings).
* **SUPER ADMIN** has **ALLOCATION** (relationship, details not specified).
* **SLOT** is part of **BOOKING** (One-to-Many: One slot can have multiple bookings).
* **SLOT** is part of **WAITLIST** (One-to-Many: One slot can have multiple users on the waitlist).

This ERD provides a high-level overview of the data structure and relationships within the lab booking system. Further details about the cardinality and specific constraints of these relationships might be necessary for a complete understanding.