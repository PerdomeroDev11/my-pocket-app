/*
  Warnings:

  - Added the required column `fee_payed` to the `movements_investment_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interest` to the `movements_investment_accounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "movements_investment_accounts" ADD COLUMN     "fee" INTEGER,
ADD COLUMN     "fee_payed" INTEGER NOT NULL,
ADD COLUMN     "interest" DECIMAL(8,4) NOT NULL,
ALTER COLUMN "goal" DROP NOT NULL,
ALTER COLUMN "quantity" DROP NOT NULL;
