/*
  Warnings:

  - You are about to drop the column `hours` on the `Property` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Property" DROP COLUMN "hours",
ADD COLUMN     "checkInOutTitle" TEXT,
ADD COLUMN     "checkInTime" TEXT,
ADD COLUMN     "checkOutTime" TEXT;
