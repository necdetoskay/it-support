/*
  Warnings:

  - Added the required column `soyad` to the `Personel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Personel" ADD COLUMN     "soyad" TEXT NOT NULL;
