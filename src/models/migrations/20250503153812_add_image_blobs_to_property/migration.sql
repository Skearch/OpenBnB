-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "featuredImage" BYTEA,
ADD COLUMN     "images" BYTEA[] DEFAULT ARRAY[]::BYTEA[];
