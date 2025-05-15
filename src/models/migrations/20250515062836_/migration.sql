/*
  Warnings:

  - You are about to drop the column `featuredImage` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Property` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Property" DROP COLUMN "featuredImage",
DROP COLUMN "images",
ADD COLUMN     "featuredImagePath" TEXT,
ADD COLUMN     "imagePaths" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;
