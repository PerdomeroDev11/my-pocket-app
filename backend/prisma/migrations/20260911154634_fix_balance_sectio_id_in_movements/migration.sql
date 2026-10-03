/*
  Warnings:

  - You are about to drop the column `balance_section_id` on the `movements` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "movements" DROP CONSTRAINT "movements_balance_section_id_fkey";

-- AlterTable
ALTER TABLE "movements" DROP COLUMN "balance_section_id";
