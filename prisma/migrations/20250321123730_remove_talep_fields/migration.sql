/*
  Warnings:

  - You are about to drop the column `aciklama` on the `Talep` table. All the data in the column will be lost.
  - You are about to drop the column `cozum` on the `Talep` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Talep" DROP COLUMN "aciklama",
DROP COLUMN "cozum";
