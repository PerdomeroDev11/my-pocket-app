/*
  Warnings:

  - The values [STOCKS,NEQUI,DAVIPLATA,OTHER] on the enum `typeIntitution` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `category_item_id` on the `balance_sections` table. All the data in the column will be lost.
  - Added the required column `category_id` to the `balance_sections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `balance_section_id` to the `movements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "typeIntitution_new" AS ENUM ('BANK', 'CASH', 'CRYPTO');
ALTER TABLE "financial_institutions" ALTER COLUMN "type" TYPE "typeIntitution_new" USING ("type"::text::"typeIntitution_new");
ALTER TYPE "typeIntitution" RENAME TO "typeIntitution_old";
ALTER TYPE "typeIntitution_new" RENAME TO "typeIntitution";
DROP TYPE "public"."typeIntitution_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "balance_sections" DROP CONSTRAINT "balance_sections_category_item_id_fkey";

-- DropForeignKey
ALTER TABLE "movements" DROP CONSTRAINT "movements_institution_financial_id_fkey";

-- AlterTable
ALTER TABLE "balance_sections" DROP COLUMN "category_item_id",
ADD COLUMN     "category_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "movements" ADD COLUMN     "balance_section_id" UUID NOT NULL,
ALTER COLUMN "institution_financial_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Categories_id_idx" ON "Categories"("id");

-- CreateIndex
CREATE INDEX "Categories_userId_idx" ON "Categories"("userId");

-- CreateIndex
CREATE INDEX "financial_pages_id_idx" ON "financial_pages"("id");

-- CreateIndex
CREATE INDEX "movements_category_id_idx" ON "movements"("category_id");

-- CreateIndex
CREATE INDEX "movements_date_idx" ON "movements"("date");

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_institution_financial_id_fkey" FOREIGN KEY ("institution_financial_id") REFERENCES "financial_institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_balance_section_id_fkey" FOREIGN KEY ("balance_section_id") REFERENCES "balance_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_sections" ADD CONSTRAINT "balance_sections_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
