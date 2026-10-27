/*
  Warnings:

  - You are about to drop the column `fee` on the `movements_investment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `fee_payed` on the `movements_investment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `goal` on the `movements_investment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `interest` on the `movements_investment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `movements_investment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `total_amount` on the `movements_investment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `value_fee` on the `movements_investment_accounts` table. All the data in the column will be lost.
  - Added the required column `total_amount` to the `investment_accounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "investment_accounts" ADD COLUMN     "goal" DECIMAL(18,2),
ADD COLUMN     "total_amount" DECIMAL(18,2) NOT NULL;

-- AlterTable
ALTER TABLE "movements_investment_accounts" DROP COLUMN "fee",
DROP COLUMN "fee_payed",
DROP COLUMN "goal",
DROP COLUMN "interest",
DROP COLUMN "quantity",
DROP COLUMN "total_amount",
DROP COLUMN "value_fee",
ADD COLUMN     "categorie_fixed_id" UUID,
ADD COLUMN     "categorie_variable_id" UUID;

-- CreateTable
CREATE TABLE "investment_category_variable" (
    "id" UUID NOT NULL,
    "symbol" TEXT NOT NULL,
    "quantity" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investment_category_variable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_category_fixed" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "fee_paid" INTEGER NOT NULL,
    "fee" INTEGER NOT NULL,
    "interest" DECIMAL(8,4),
    "value_fee" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investment_category_fixed_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "movements_investment_accounts" ADD CONSTRAINT "movements_investment_accounts_categorie_variable_id_fkey" FOREIGN KEY ("categorie_variable_id") REFERENCES "investment_category_variable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements_investment_accounts" ADD CONSTRAINT "movements_investment_accounts_categorie_fixed_id_fkey" FOREIGN KEY ("categorie_fixed_id") REFERENCES "investment_category_fixed"("id") ON DELETE SET NULL ON UPDATE CASCADE;
