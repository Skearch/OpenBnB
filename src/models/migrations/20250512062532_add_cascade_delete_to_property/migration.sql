-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_ownerId_fkey";

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
