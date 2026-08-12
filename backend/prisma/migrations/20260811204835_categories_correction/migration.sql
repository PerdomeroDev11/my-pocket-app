/*
  Warnings:

  - You are about to drop the column `category_item_id` on the `movements` table. All the data in the column will be lost.
  - You are about to drop the `budget_sections` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `categories_items` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category_id` to the `movements` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "balance_sections" DROP CONSTRAINT "balance_sections_category_item_id_fkey";

-- DropForeignKey
ALTER TABLE "budget_sections" DROP CONSTRAINT "budget_sections_user_id_fkey";

-- DropForeignKey
ALTER TABLE "categories_items" DROP CONSTRAINT "categories_items_section_id_fkey";

-- DropForeignKey
ALTER TABLE "investment_accounts" DROP CONSTRAINT "investment_accounts_category_item_id_fkey";

-- DropForeignKey
ALTER TABLE "movements" DROP CONSTRAINT "movements_category_item_id_fkey";

-- AlterTable
ALTER TABLE "movements" DROP COLUMN "category_item_id",
ADD COLUMN     "category_id" UUID NOT NULL,
ADD COLUMN     "expect_amount" DECIMAL(65,30);

-- DropTable
DROP TABLE "budget_sections";

-- DropTable
DROP TABLE "categories_items";

-- CreateTable
CREATE TABLE "Categories" (
    "id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "pageId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "expected_amount" DECIMAL(65,30) DEFAULT 0.0,
    "is_recurrent" BOOLEAN DEFAULT false,
    "is_permanent" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Categories" ADD CONSTRAINT "Categories_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "financial_pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_sections" ADD CONSTRAINT "balance_sections_category_item_id_fkey" FOREIGN KEY ("category_item_id") REFERENCES "Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_accounts" ADD CONSTRAINT "investment_accounts_category_item_id_fkey" FOREIGN KEY ("category_item_id") REFERENCES "Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
