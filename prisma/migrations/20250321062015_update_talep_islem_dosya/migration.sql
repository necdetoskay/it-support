/*
  Warnings:

  - You are about to drop the column `ad` on the `TalepIslemDosya` table. All the data in the column will be lost.
  - You are about to drop the column `boyut` on the `TalepIslemDosya` table. All the data in the column will be lost.
  - You are about to drop the column `tip` on the `TalepIslemDosya` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `TalepIslemDosya` table. All the data in the column will be lost.
  - Added the required column `dosyaAdi` to the `TalepIslemDosya` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dosyaBoyutu` to the `TalepIslemDosya` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dosyaTipi` to the `TalepIslemDosya` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dosyaYolu` to the `TalepIslemDosya` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TalepIslemDosya" DROP COLUMN "ad",
DROP COLUMN "boyut",
DROP COLUMN "tip",
DROP COLUMN "url",
ADD COLUMN     "dosyaAdi" TEXT NOT NULL,
ADD COLUMN     "dosyaBoyutu" INTEGER NOT NULL,
ADD COLUMN     "dosyaTipi" TEXT NOT NULL,
ADD COLUMN     "dosyaYolu" TEXT NOT NULL;
