/*
  Warnings:

  - Added the required column `name` to the `movements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "movements" ADD COLUMN     "name" TEXT NOT NULL;
