-- DropForeignKey
ALTER TABLE "AdminRegistrationRequest" DROP CONSTRAINT "AdminRegistrationRequest_userId_fkey";

-- AddForeignKey
ALTER TABLE "AdminRegistrationRequest" ADD CONSTRAINT "AdminRegistrationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
