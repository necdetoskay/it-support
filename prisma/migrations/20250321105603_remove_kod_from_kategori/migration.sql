/*
  Warnings:

  - You are about to drop the column `kod` on the `Kategori` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Kategori_kod_key";

-- AlterTable
ALTER TABLE "Kategori" DROP COLUMN "kod";
