/*
  Warnings:

  - You are about to drop the column `end_date` on the `financial_pages` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `financial_pages` table. All the data in the column will be lost.
  - You are about to alter the column `total_income` on the `financial_pages` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `total_expenses` on the `financial_pages` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - Added the required column `jti` to the `sessions_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "financial_pages" DROP COLUMN "end_date",
DROP COLUMN "start_date",
ALTER COLUMN "total_income" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "total_expenses" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "sessions_users" ADD COLUMN     "is_current" BOOLEAN,
ADD COLUMN     "jti" TEXT NOT NULL;
