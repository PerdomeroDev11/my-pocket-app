/*
  Warnings:

  - You are about to drop the column `expected_amount` on the `Categories` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `Categories` table. All the data in the column will be lost.
  - You are about to drop the column `pageId` on the `Categories` table. All the data in the column will be lost.
  - You are about to drop the column `section_id` on the `Categories` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Categories` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Categories" DROP CONSTRAINT "Categories_pageId_fkey";

-- AlterTable
ALTER TABLE "Categories" DROP COLUMN "expected_amount",
DROP COLUMN "order",
DROP COLUMN "pageId",
DROP COLUMN "section_id",
ADD COLUMN     "userId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "Categories" ADD CONSTRAINT "Categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
