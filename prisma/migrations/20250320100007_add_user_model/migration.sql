/*
  Warnings:

  - You are about to drop the column `kod` on the `Departman` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Talep" DROP CONSTRAINT "Talep_atananId_fkey";

-- DropForeignKey
ALTER TABLE "TalepGuncelleme" DROP CONSTRAINT "TalepGuncelleme_userId_fkey";

-- DropForeignKey
ALTER TABLE "TalepYorum" DROP CONSTRAINT "TalepYorum_userId_fkey";

-- DropIndex
DROP INDEX "Departman_kod_key";

-- AlterTable
ALTER TABLE "Departman" DROP COLUMN "kod";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kullanicilar" (
    "id" TEXT NOT NULL,
    "isim" TEXT NOT NULL,
    "eposta" TEXT NOT NULL,
    "sifre" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'kullanici',
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellemeTarihi" TIMESTAMP(3) NOT NULL,
    "onaylandi" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "kullanicilar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destek_talepleri" (
    "id" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'beklemede',
    "oncelik" TEXT NOT NULL DEFAULT 'normal',
    "kategori" TEXT NOT NULL,
    "olusturanId" TEXT NOT NULL,
    "atananId" TEXT,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellemeTarihi" TIMESTAMP(3) NOT NULL,
    "cozulmeTarihi" TIMESTAMP(3),

    CONSTRAINT "destek_talepleri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mesajlar" (
    "id" TEXT NOT NULL,
    "icerik" TEXT NOT NULL,
    "olusturanId" TEXT NOT NULL,
    "talepId" TEXT NOT NULL,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellemeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mesajlar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bildirimler" (
    "id" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "icerik" TEXT NOT NULL,
    "okundu" BOOLEAN NOT NULL DEFAULT false,
    "kullaniciId" TEXT NOT NULL,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bildirimler_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "kullanicilar_eposta_key" ON "kullanicilar"("eposta");

-- AddForeignKey
ALTER TABLE "Talep" ADD CONSTRAINT "Talep_atananId_fkey" FOREIGN KEY ("atananId") REFERENCES "kullanicilar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalepGuncelleme" ADD CONSTRAINT "TalepGuncelleme_userId_fkey" FOREIGN KEY ("userId") REFERENCES "kullanicilar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalepYorum" ADD CONSTRAINT "TalepYorum_userId_fkey" FOREIGN KEY ("userId") REFERENCES "kullanicilar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destek_talepleri" ADD CONSTRAINT "destek_talepleri_olusturanId_fkey" FOREIGN KEY ("olusturanId") REFERENCES "kullanicilar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesajlar" ADD CONSTRAINT "mesajlar_olusturanId_fkey" FOREIGN KEY ("olusturanId") REFERENCES "kullanicilar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesajlar" ADD CONSTRAINT "mesajlar_talepId_fkey" FOREIGN KEY ("talepId") REFERENCES "destek_talepleri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bildirimler" ADD CONSTRAINT "bildirimler_kullaniciId_fkey" FOREIGN KEY ("kullaniciId") REFERENCES "kullanicilar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
