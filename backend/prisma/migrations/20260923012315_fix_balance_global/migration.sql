/*
  Warnings:

  - A unique constraint covering the columns `[user_id,name_balance]` on the table `balance_sections` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "balance_sections_user_id_name_balance_key" ON "balance_sections"("user_id", "name_balance");
