/*
  Warnings:

  - The values [COMMODITY,FIXED_TERM] on the enum `InvestmentType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `ticker` to the `investment_accounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "InvestmentType_new" AS ENUM ('CRYPTO', 'STOCK', 'CDT', 'REAL_ESTATE', 'LOAN');
ALTER TABLE "investment_accounts" ALTER COLUMN "type" TYPE "InvestmentType_new" USING ("type"::text::"InvestmentType_new");
ALTER TYPE "InvestmentType" RENAME TO "InvestmentType_old";
ALTER TYPE "InvestmentType_new" RENAME TO "InvestmentType";
DROP TYPE "public"."InvestmentType_old";
COMMIT;

-- AlterTable
ALTER TABLE "investment_accounts" ADD COLUMN     "ticker" TEXT NOT NULL;
