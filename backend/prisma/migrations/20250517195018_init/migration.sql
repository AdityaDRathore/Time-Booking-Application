-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "WaitlistStatus" AS ENUM ('ACTIVE', 'FULFILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LabStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_CONFIRMATION', 'BOOKING_CANCELLATION', 'WAITLIST_NOTIFICATION', 'GENERAL_ANNOUNCEMENT', 'SLOT_AVAILABLE', 'SYSTEM_NOTIFICATION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "user_password" TEXT NOT NULL,
    "user_role" "UserRole" NOT NULL DEFAULT 'USER',
    "validation_key" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "admin_name" TEXT NOT NULL,
    "admin_email" TEXT NOT NULL,
    "admin_password" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuperAdmin" (
    "id" TEXT NOT NULL,
    "super_admin_name" TEXT NOT NULL,
    "super_admin_email" TEXT NOT NULL,
    "super_admin_password" TEXT NOT NULL,
    "validation_key" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuperAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "org_id" TEXT NOT NULL,
    "org_name" TEXT NOT NULL,
    "org_type" TEXT NOT NULL,
    "org_location" TEXT NOT NULL,
    "superAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("org_id")
);

-- CreateTable
CREATE TABLE "OrganizationNotification" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "notification_type" "NotificationType" NOT NULL,
    "notification_message" TEXT NOT NULL,
    "notification_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lab" (
    "id" TEXT NOT NULL,
    "lab_name" TEXT NOT NULL,
    "lab_capacity" INTEGER NOT NULL,
    "status" "LabStatus" NOT NULL DEFAULT 'ACTIVE',
    "location" TEXT,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSlot" (
    "id" TEXT NOT NULL,
    "lab_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "slot_id" TEXT NOT NULL,
    "booking_status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "booking_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "managedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waitlist" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "slot_id" TEXT NOT NULL,
    "waitlist_position" INTEGER NOT NULL,
    "waitlist_status" "WaitlistStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "notification_type" "NotificationType" NOT NULL,
    "notification_message" TEXT NOT NULL,
    "notification_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_user_email_key" ON "User"("user_email");

-- CreateIndex
CREATE UNIQUE INDEX "User_validation_key_key" ON "User"("validation_key");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");

-- CreateIndex
CREATE INDEX "User_user_email_idx" ON "User"("user_email");

-- CreateIndex
CREATE INDEX "User_validation_key_idx" ON "User"("validation_key");

-- CreateIndex
CREATE INDEX "User_resetToken_idx" ON "User"("resetToken");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_admin_email_key" ON "Admin"("admin_email");

-- CreateIndex
CREATE INDEX "Admin_admin_email_idx" ON "Admin"("admin_email");

-- CreateIndex
CREATE INDEX "Admin_organizationId_idx" ON "Admin"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdmin_super_admin_email_key" ON "SuperAdmin"("super_admin_email");

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdmin_validation_key_key" ON "SuperAdmin"("validation_key");

-- CreateIndex
CREATE INDEX "SuperAdmin_super_admin_email_idx" ON "SuperAdmin"("super_admin_email");

-- CreateIndex
CREATE INDEX "Organization_org_name_idx" ON "Organization"("org_name");

-- CreateIndex
CREATE INDEX "Organization_superAdminId_idx" ON "Organization"("superAdminId");

-- CreateIndex
CREATE INDEX "OrganizationNotification_organizationId_idx" ON "OrganizationNotification"("organizationId");

-- CreateIndex
CREATE INDEX "Lab_organizationId_idx" ON "Lab"("organizationId");

-- CreateIndex
CREATE INDEX "Lab_adminId_idx" ON "Lab"("adminId");

-- CreateIndex
CREATE INDEX "TimeSlot_lab_id_idx" ON "TimeSlot"("lab_id");

-- CreateIndex
CREATE INDEX "TimeSlot_date_idx" ON "TimeSlot"("date");

-- CreateIndex
CREATE INDEX "TimeSlot_lab_id_date_idx" ON "TimeSlot"("lab_id", "date");

-- CreateIndex
CREATE INDEX "Booking_user_id_idx" ON "Booking"("user_id");

-- CreateIndex
CREATE INDEX "Booking_slot_id_idx" ON "Booking"("slot_id");

-- CreateIndex
CREATE INDEX "Booking_booking_status_idx" ON "Booking"("booking_status");

-- CreateIndex
CREATE INDEX "Booking_managedBy_idx" ON "Booking"("managedBy");

-- CreateIndex
CREATE INDEX "Waitlist_user_id_idx" ON "Waitlist"("user_id");

-- CreateIndex
CREATE INDEX "Waitlist_slot_id_idx" ON "Waitlist"("slot_id");

-- CreateIndex
CREATE INDEX "Waitlist_waitlist_status_idx" ON "Waitlist"("waitlist_status");

-- CreateIndex
CREATE INDEX "Waitlist_slot_id_waitlist_position_idx" ON "Waitlist"("slot_id", "waitlist_position");

-- CreateIndex
CREATE INDEX "Notification_user_id_idx" ON "Notification"("user_id");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("org_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("org_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "SuperAdmin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationNotification" ADD CONSTRAINT "OrganizationNotification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("org_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lab" ADD CONSTRAINT "Lab_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("org_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lab" ADD CONSTRAINT "Lab_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "Lab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "TimeSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_managedBy_fkey" FOREIGN KEY ("managedBy") REFERENCES "SuperAdmin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waitlist" ADD CONSTRAINT "Waitlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waitlist" ADD CONSTRAINT "Waitlist_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "TimeSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
