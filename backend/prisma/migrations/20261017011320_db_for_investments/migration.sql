/*
  Warnings:

  - You are about to drop the column `balance` on the `investment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `category_item_id` on the `investment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `type_investment` on the `investment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `where_investment` on the `investment_accounts` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `investment_accounts` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the column `expect_amount` on the `movements` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `movements_investment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `movements_investment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `movements_investment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `movements_investment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `type_movement` on the `movements_investment_accounts` table. All the data in the column will be lost.
  - Added the required column `category` to the `investment_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `horizon` to the `investment_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `investment_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goal` to the `movements_investment_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `movement_id` to the `movements_investment_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_amount` to the `movements_investment_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `movements_investment_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `movements_investment_accounts` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InvestmentCategory" AS ENUM ('VARIABLE', 'FIXED');

-- CreateEnum
CREATE TYPE "InvestmentType" AS ENUM ('CRYPTO', 'STOCK', 'COMMODITY', 'FIXED_TERM', 'REAL_ESTATE', 'LOAN');

-- CreateEnum
CREATE TYPE "InvestmentHorizon" AS ENUM ('SHORT', 'MEDIUM', 'LONG');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('BUY', 'SELL', 'DEPOSIT', 'WITHDRAWAL');

-- DropForeignKey
ALTER TABLE "investment_accounts" DROP CONSTRAINT "investment_accounts_category_item_id_fkey";

-- AlterTable
ALTER TABLE "investment_accounts" DROP COLUMN "balance",
DROP COLUMN "category_item_id",
DROP COLUMN "type_investment",
DROP COLUMN "where_investment",
ADD COLUMN     "category" "InvestmentCategory" NOT NULL,
ADD COLUMN     "horizon" "InvestmentHorizon" NOT NULL,
ADD COLUMN     "type" "InvestmentType" NOT NULL,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "movements" DROP COLUMN "expect_amount",
ADD COLUMN     "movements_investment_id" UUID;

-- AlterTable
ALTER TABLE "movements_investment_accounts" DROP COLUMN "amount",
DROP COLUMN "created_at",
DROP COLUMN "date",
DROP COLUMN "reason",
DROP COLUMN "type_movement",
ADD COLUMN     "goal" DECIMAL(18,2) NOT NULL,
ADD COLUMN     "movement_id" UUID NOT NULL,
ADD COLUMN     "quantity" DECIMAL(18,8) NOT NULL DEFAULT 0,
ADD COLUMN     "total_amount" DECIMAL(18,2) NOT NULL,
ADD COLUMN     "transaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "type" "TransactionType" NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropEnum
DROP TYPE "typeInvestment";

-- DropEnum
DROP TYPE "typeMovementSave";

-- CreateTable
CREATE TABLE "market_prices" (
    "id" UUID NOT NULL,
    "ticker" TEXT NOT NULL,
    "current_price" DECIMAL(18,2) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_prices_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_movements_investment_id_fkey" FOREIGN KEY ("movements_investment_id") REFERENCES "movements_investment_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
