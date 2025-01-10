/*
  Warnings:

  - The values [STANDARD,DELUXE,SUITE,PRESIDENTIAL] on the enum `RoomCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "IdentityType" ADD VALUE 'AADHAR_CARD';

-- AlterEnum
BEGIN;
CREATE TYPE "RoomCategory_new" AS ENUM ('KUTIA', 'VIP_ROOM', 'SWISS_COTTAGE', 'EP_TENT');
ALTER TABLE "Room" ALTER COLUMN "category" TYPE "RoomCategory_new" USING ("category"::text::"RoomCategory_new");
ALTER TYPE "RoomCategory" RENAME TO "RoomCategory_old";
ALTER TYPE "RoomCategory_new" RENAME TO "RoomCategory";
DROP TYPE "RoomCategory_old";
COMMIT;
