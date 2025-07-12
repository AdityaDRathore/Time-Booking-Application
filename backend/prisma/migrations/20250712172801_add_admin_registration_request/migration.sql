-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "AdminRegistrationRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "org_name" TEXT NOT NULL,
    "org_type" TEXT NOT NULL,
    "org_location" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminRegistrationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminRegistrationRequest_userId_key" ON "AdminRegistrationRequest"("userId");

-- AddForeignKey
ALTER TABLE "AdminRegistrationRequest" ADD CONSTRAINT "AdminRegistrationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
