/*
  Warnings:

  - You are about to drop the `TalepEk` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TalepGuncelleme` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TalepYorum` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bildirimler` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `destek_talepleri` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `kullanicilar` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mesajlar` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[ad]` on the table `Departman` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Talep" DROP CONSTRAINT "Talep_atananId_fkey";

-- DropForeignKey
ALTER TABLE "TalepEk" DROP CONSTRAINT "TalepEk_talepId_fkey";

-- DropForeignKey
ALTER TABLE "TalepGuncelleme" DROP CONSTRAINT "TalepGuncelleme_talepId_fkey";

-- DropForeignKey
ALTER TABLE "TalepGuncelleme" DROP CONSTRAINT "TalepGuncelleme_userId_fkey";

-- DropForeignKey
ALTER TABLE "TalepYorum" DROP CONSTRAINT "TalepYorum_talepId_fkey";

-- DropForeignKey
ALTER TABLE "TalepYorum" DROP CONSTRAINT "TalepYorum_userId_fkey";

-- DropForeignKey
ALTER TABLE "bildirimler" DROP CONSTRAINT "bildirimler_kullaniciId_fkey";

-- DropForeignKey
ALTER TABLE "destek_talepleri" DROP CONSTRAINT "destek_talepleri_olusturanId_fkey";

-- DropForeignKey
ALTER TABLE "mesajlar" DROP CONSTRAINT "mesajlar_olusturanId_fkey";

-- DropForeignKey
ALTER TABLE "mesajlar" DROP CONSTRAINT "mesajlar_talepId_fkey";

-- DropTable
DROP TABLE "TalepEk";

-- DropTable
DROP TABLE "TalepGuncelleme";

-- DropTable
DROP TABLE "TalepYorum";

-- DropTable
DROP TABLE "bildirimler";

-- DropTable
DROP TABLE "destek_talepleri";

-- DropTable
DROP TABLE "kullanicilar";

-- DropTable
DROP TABLE "mesajlar";

-- DropEnum
DROP TYPE "UserRole";

-- CreateIndex
CREATE UNIQUE INDEX "Departman_ad_key" ON "Departman"("ad");

-- AddForeignKey
ALTER TABLE "Talep" ADD CONSTRAINT "Talep_atananId_fkey" FOREIGN KEY ("atananId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
