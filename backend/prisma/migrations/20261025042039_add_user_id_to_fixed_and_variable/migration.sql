/*
  Warnings:

  - Added the required column `user_id` to the `investment_category_fixed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `investment_category_variable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "investment_category_fixed" ADD COLUMN     "user_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "investment_category_variable" ADD COLUMN     "user_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "investment_category_variable" ADD CONSTRAINT "investment_category_variable_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_category_fixed" ADD CONSTRAINT "investment_category_fixed_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
