/*
  Warnings:

  - You are about to drop the column `balance_now` on the `financial_institutions` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "typeIntitution" ADD VALUE 'DIGITALWILLET';

-- AlterTable
ALTER TABLE "financial_institutions" DROP COLUMN "balance_now";
