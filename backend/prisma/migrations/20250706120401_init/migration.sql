-- DropIndex
DROP INDEX "Booking_booking_status_idx";

-- DropIndex
DROP INDEX "Booking_managedBy_idx";

-- DropIndex
DROP INDEX "Booking_slot_id_idx";

-- DropIndex
DROP INDEX "Booking_user_id_idx";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "purpose" TEXT;

-- AlterTable
ALTER TABLE "Lab" ADD COLUMN     "isOccupied" BOOLEAN NOT NULL DEFAULT false;
