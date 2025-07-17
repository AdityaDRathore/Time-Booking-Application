/*
  Warnings:

  - The values [WAITLIST_PROMOTION,WAITLIST_REMOVAL] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('BOOKING_CONFIRMATION', 'BOOKING_CANCELLATION', 'WAITLIST_NOTIFICATION', 'WAITLIST_AUTO_CONFIRMATION', 'WAITLIST_ADMIN_CONFIRMATION', 'WAITLIST_AUTO_PROMOTION', 'WAITLIST_ADMIN_PROMOTION', 'WAITLIST_REMOVAL_USER', 'WAITLIST_REMOVAL_ADMIN', 'GENERAL_ANNOUNCEMENT', 'SLOT_AVAILABLE', 'SYSTEM_NOTIFICATION');
ALTER TABLE "OrganizationNotification" ALTER COLUMN "notification_type" TYPE "NotificationType_new" USING ("notification_type"::text::"NotificationType_new");
ALTER TABLE "Notification" ALTER COLUMN "notification_type" TYPE "NotificationType_new" USING ("notification_type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;
