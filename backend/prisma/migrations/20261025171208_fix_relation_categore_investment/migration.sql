/*
  Warnings:

  - You are about to drop the column `categorie_fixed_id` on the `movements_investment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `categorie_variable_id` on the `movements_investment_accounts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "movements_investment_accounts" DROP CONSTRAINT "movements_investment_accounts_categorie_fixed_id_fkey";

-- DropForeignKey
ALTER TABLE "movements_investment_accounts" DROP CONSTRAINT "movements_investment_accounts_categorie_variable_id_fkey";

-- AlterTable
ALTER TABLE "investment_accounts" ADD COLUMN     "categorie_fixed_id" UUID,
ADD COLUMN     "categorie_variable_id" UUID;

-- AlterTable
ALTER TABLE "movements_investment_accounts" DROP COLUMN "categorie_fixed_id",
DROP COLUMN "categorie_variable_id";

-- AddForeignKey
ALTER TABLE "investment_accounts" ADD CONSTRAINT "investment_accounts_categorie_variable_id_fkey" FOREIGN KEY ("categorie_variable_id") REFERENCES "investment_category_variable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_accounts" ADD CONSTRAINT "investment_accounts_categorie_fixed_id_fkey" FOREIGN KEY ("categorie_fixed_id") REFERENCES "investment_category_fixed"("id") ON DELETE SET NULL ON UPDATE CASCADE;
