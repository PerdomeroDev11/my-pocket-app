/*
  Warnings:

  - You are about to drop the column `goal_savings` on the `balance_sections` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `balance_sections` table. All the data in the column will be lost.
  - You are about to drop the column `balance` on the `financial_pages` table. All the data in the column will be lost.
  - You are about to drop the column `end_balance` on the `financial_pages` table. All the data in the column will be lost.
  - You are about to drop the column `start_balance` on the `financial_pages` table. All the data in the column will be lost.
  - Added the required column `name_balance` to the `balance_sections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `balance_sections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `balance_section_id` to the `financial_pages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type_period` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "nameBalance" AS ENUM ('AVAILABLE', 'TOTAL', 'SAVINGS', 'INVESTMENTS', 'GOALSAVING');

-- AlterTable
ALTER TABLE "balance_sections" DROP COLUMN "goal_savings",
DROP COLUMN "name",
ADD COLUMN     "name_balance" "nameBalance" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "financial_pages" DROP COLUMN "balance",
DROP COLUMN "end_balance",
DROP COLUMN "start_balance",
ADD COLUMN     "balance_section_id" UUID NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "country" TEXT DEFAULT 'COL',
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'COP',
ADD COLUMN     "type_period" "typePeriod" NOT NULL,
ALTER COLUMN "language" SET DEFAULT 'ES';

-- AddForeignKey
ALTER TABLE "financial_pages" ADD CONSTRAINT "financial_pages_balance_section_id_fkey" FOREIGN KEY ("balance_section_id") REFERENCES "balance_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
