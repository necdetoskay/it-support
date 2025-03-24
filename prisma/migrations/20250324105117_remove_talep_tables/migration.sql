/*
  Warnings:

  - You are about to drop the `Talep` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TalepIslem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TalepIslemDosya` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TalepCozumEtiketleri` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TalepSorunEtiketleri` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Talep" DROP CONSTRAINT "Talep_atananId_fkey";

-- DropForeignKey
ALTER TABLE "Talep" DROP CONSTRAINT "Talep_departmanId_fkey";

-- DropForeignKey
ALTER TABLE "Talep" DROP CONSTRAINT "Talep_kategoriId_fkey";

-- DropForeignKey
ALTER TABLE "Talep" DROP CONSTRAINT "Talep_raporEdenId_fkey";

-- DropForeignKey
ALTER TABLE "TalepIslem" DROP CONSTRAINT "TalepIslem_talepId_fkey";

-- DropForeignKey
ALTER TABLE "TalepIslem" DROP CONSTRAINT "TalepIslem_yapanKullaniciId_fkey";

-- DropForeignKey
ALTER TABLE "TalepIslemDosya" DROP CONSTRAINT "TalepIslemDosya_islemId_fkey";

-- DropForeignKey
ALTER TABLE "_TalepCozumEtiketleri" DROP CONSTRAINT "_TalepCozumEtiketleri_A_fkey";

-- DropForeignKey
ALTER TABLE "_TalepCozumEtiketleri" DROP CONSTRAINT "_TalepCozumEtiketleri_B_fkey";

-- DropForeignKey
ALTER TABLE "_TalepSorunEtiketleri" DROP CONSTRAINT "_TalepSorunEtiketleri_A_fkey";

-- DropForeignKey
ALTER TABLE "_TalepSorunEtiketleri" DROP CONSTRAINT "_TalepSorunEtiketleri_B_fkey";

-- DropTable
DROP TABLE "Talep";

-- DropTable
DROP TABLE "TalepIslem";

-- DropTable
DROP TABLE "TalepIslemDosya";

-- DropTable
DROP TABLE "_TalepCozumEtiketleri";

-- DropTable
DROP TABLE "_TalepSorunEtiketleri";

-- DropEnum
DROP TYPE "TalepDurum";

-- DropEnum
DROP TYPE "TalepIslemTipi";

-- CreateTable
CREATE TABLE "DatabaseBackup" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "tables" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellenmeTarihi" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "DatabaseBackup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DatabaseBackup" ADD CONSTRAINT "DatabaseBackup_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
