/*
  Warnings:

  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Ticket` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "Oncelik" AS ENUM ('DUSUK', 'ORTA', 'YUKSEK', 'ACIL');

-- CreateEnum
CREATE TYPE "TalepDurum" AS ENUM ('ACIK', 'ISLEMDE', 'KULLANICI_BEKLIYOR', 'UCUNCU_TARAF_BEKLIYOR', 'COZULDU', 'KAPANDI', 'IPTAL');

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "name" SET NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- DropTable
DROP TABLE "Ticket";

-- CreateTable
CREATE TABLE "Personel" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "departmanId" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellenmeTarihi" TIMESTAMP(3) NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Personel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Departman" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "kod" TEXT NOT NULL,
    "aciklama" TEXT,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellenmeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Departman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kategori" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "kod" TEXT NOT NULL,
    "aciklama" TEXT,
    "ustKategoriId" TEXT,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellenmeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SLAKural" (
    "id" TEXT NOT NULL,
    "kategoriId" TEXT NOT NULL,
    "oncelik" "Oncelik" NOT NULL,
    "yanitlamaSuresi" INTEGER NOT NULL,
    "cozumSuresi" INTEGER NOT NULL,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellenmeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SLAKural_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SorunEtiket" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "aciklama" TEXT,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellenmeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SorunEtiket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CozumEtiket" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "aciklama" TEXT,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellenmeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CozumEtiket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Talep" (
    "id" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "kategoriId" TEXT NOT NULL,
    "departmanId" TEXT NOT NULL,
    "oncelik" "Oncelik" NOT NULL DEFAULT 'ORTA',
    "durum" "TalepDurum" NOT NULL DEFAULT 'ACIK',
    "raporEdenId" TEXT NOT NULL,
    "atananId" TEXT,
    "sonTarih" TIMESTAMP(3),
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellenmeTarihi" TIMESTAMP(3) NOT NULL,
    "kapatilmaTarihi" TIMESTAMP(3),
    "sorunDetay" TEXT NOT NULL,
    "cozum" TEXT,

    CONSTRAINT "Talep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalepGuncelleme" (
    "id" TEXT NOT NULL,
    "talepId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "durum" "TalepDurum" NOT NULL,
    "aciklama" TEXT NOT NULL,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TalepGuncelleme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalepYorum" (
    "id" TEXT NOT NULL,
    "talepId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "icerik" TEXT NOT NULL,
    "dahili" BOOLEAN NOT NULL DEFAULT false,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellenmeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TalepYorum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalepEk" (
    "id" TEXT NOT NULL,
    "talepId" TEXT NOT NULL,
    "dosyaAdi" TEXT NOT NULL,
    "dosyaUrl" TEXT NOT NULL,
    "dosyaTipi" TEXT NOT NULL,
    "dosyaBoyutu" INTEGER NOT NULL,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TalepEk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TalepSorunEtiketleri" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TalepSorunEtiketleri_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TalepCozumEtiketleri" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TalepCozumEtiketleri_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Departman_kod_key" ON "Departman"("kod");

-- CreateIndex
CREATE UNIQUE INDEX "Kategori_kod_key" ON "Kategori"("kod");

-- CreateIndex
CREATE UNIQUE INDEX "SorunEtiket_ad_key" ON "SorunEtiket"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "CozumEtiket_ad_key" ON "CozumEtiket"("ad");

-- CreateIndex
CREATE INDEX "_TalepSorunEtiketleri_B_index" ON "_TalepSorunEtiketleri"("B");

-- CreateIndex
CREATE INDEX "_TalepCozumEtiketleri_B_index" ON "_TalepCozumEtiketleri"("B");

-- AddForeignKey
ALTER TABLE "Personel" ADD CONSTRAINT "Personel_departmanId_fkey" FOREIGN KEY ("departmanId") REFERENCES "Departman"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kategori" ADD CONSTRAINT "Kategori_ustKategoriId_fkey" FOREIGN KEY ("ustKategoriId") REFERENCES "Kategori"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SLAKural" ADD CONSTRAINT "SLAKural_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "Kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Talep" ADD CONSTRAINT "Talep_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "Kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Talep" ADD CONSTRAINT "Talep_departmanId_fkey" FOREIGN KEY ("departmanId") REFERENCES "Departman"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Talep" ADD CONSTRAINT "Talep_raporEdenId_fkey" FOREIGN KEY ("raporEdenId") REFERENCES "Personel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Talep" ADD CONSTRAINT "Talep_atananId_fkey" FOREIGN KEY ("atananId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalepGuncelleme" ADD CONSTRAINT "TalepGuncelleme_talepId_fkey" FOREIGN KEY ("talepId") REFERENCES "Talep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalepGuncelleme" ADD CONSTRAINT "TalepGuncelleme_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalepYorum" ADD CONSTRAINT "TalepYorum_talepId_fkey" FOREIGN KEY ("talepId") REFERENCES "Talep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalepYorum" ADD CONSTRAINT "TalepYorum_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalepEk" ADD CONSTRAINT "TalepEk_talepId_fkey" FOREIGN KEY ("talepId") REFERENCES "Talep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TalepSorunEtiketleri" ADD CONSTRAINT "_TalepSorunEtiketleri_A_fkey" FOREIGN KEY ("A") REFERENCES "SorunEtiket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TalepSorunEtiketleri" ADD CONSTRAINT "_TalepSorunEtiketleri_B_fkey" FOREIGN KEY ("B") REFERENCES "Talep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TalepCozumEtiketleri" ADD CONSTRAINT "_TalepCozumEtiketleri_A_fkey" FOREIGN KEY ("A") REFERENCES "CozumEtiket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TalepCozumEtiketleri" ADD CONSTRAINT "_TalepCozumEtiketleri_B_fkey" FOREIGN KEY ("B") REFERENCES "Talep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
