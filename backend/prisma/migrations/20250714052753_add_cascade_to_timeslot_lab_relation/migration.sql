-- DropForeignKey
ALTER TABLE "TimeSlot" DROP CONSTRAINT "TimeSlot_lab_id_fkey";

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "Lab"("id") ON DELETE CASCADE ON UPDATE CASCADE;
