/*
  Warnings:

  - You are about to drop the column `is_permanent` on the `Categories` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `balance_sections` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `financial_pages` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "balance_sections" DROP CONSTRAINT "balance_sections_category_id_fkey";

-- DropForeignKey
ALTER TABLE "financial_pages" DROP CONSTRAINT "financial_pages_category_id_fkey";

-- AlterTable
ALTER TABLE "Categories" DROP COLUMN "is_permanent";

-- AlterTable
ALTER TABLE "balance_sections" DROP COLUMN "category_id";

-- AlterTable
ALTER TABLE "financial_pages" DROP COLUMN "category_id";
