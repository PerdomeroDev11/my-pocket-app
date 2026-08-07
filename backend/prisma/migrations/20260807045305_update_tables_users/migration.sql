/*
  Warnings:

  - The `status` column on the `sessions_users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `password_forgot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users_pending` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "statusSession" AS ENUM ('ON', 'OFF');

-- AlterTable
ALTER TABLE "sessions_users" DROP COLUMN "status",
ADD COLUMN     "status" "statusSession" DEFAULT 'ON';

-- DropTable
DROP TABLE "password_forgot";

-- DropTable
DROP TABLE "users_pending";
