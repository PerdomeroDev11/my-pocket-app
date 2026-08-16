/*
  Warnings:

  - The values [TRANSFER] on the enum `TypeMovement` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `balance_section_id` on the `financial_pages` table. All the data in the column will be lost.
  - You are about to drop the column `type_period` on the `financial_pages` table. All the data in the column will be lost.
  - Added the required column `category_id` to the `financial_pages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `financial_pages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TypeMovement_new" AS ENUM ('INCOME', 'EXPENSE', 'SAVING', 'INVESTMENT');
ALTER TABLE "movements" ALTER COLUMN "type_movement" TYPE "TypeMovement_new" USING ("type_movement"::text::"TypeMovement_new");
ALTER TABLE "movements_investment_accounts" ALTER COLUMN "type_movement" TYPE "TypeMovement_new" USING ("type_movement"::text::"TypeMovement_new");
ALTER TYPE "TypeMovement" RENAME TO "TypeMovement_old";
ALTER TYPE "TypeMovement_new" RENAME TO "TypeMovement";
DROP TYPE "public"."TypeMovement_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "financial_pages" DROP CONSTRAINT "financial_pages_balance_section_id_fkey";

-- AlterTable
ALTER TABLE "financial_pages" DROP COLUMN "balance_section_id",
DROP COLUMN "type_period",
ADD COLUMN     "category_id" UUID NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "end_date" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "currency" DROP NOT NULL,
ALTER COLUMN "type_period" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "financial_pages" ADD CONSTRAINT "financial_pages_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
