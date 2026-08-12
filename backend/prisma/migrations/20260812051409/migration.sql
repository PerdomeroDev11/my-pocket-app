-- AlterTable
ALTER TABLE "Categories" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "movements" ADD COLUMN     "is_pay" BOOLEAN NOT NULL DEFAULT false;
