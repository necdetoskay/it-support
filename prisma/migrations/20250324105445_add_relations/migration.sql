-- CreateEnum
CREATE TYPE "SorunDurum" AS ENUM ('ACIK', 'ATANDI', 'BEKLEMEDE', 'KAPATILDI', 'REDDEDILDI', 'COZULDU');

-- CreateEnum
CREATE TYPE "AdimDurum" AS ENUM ('BEKLEMEDE', 'DEVAM_EDIYOR', 'TAMAMLANDI', 'BASARISIZ');

-- CreateEnum
CREATE TYPE "BildirimTipi" AS ENUM ('YENI_SORUN', 'SORUN_ATAMA', 'SORUN_GUNCELLEME', 'YENI_YORUM', 'SLA_UYARI', 'SISTEM');

-- CreateTable
CREATE TABLE "Sorun" (
    "id" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "durum" "SorunDurum" NOT NULL DEFAULT 'ACIK',
    "oncelik" "Oncelik" NOT NULL DEFAULT 'ORTA',
    "departmanId" TEXT NOT NULL,
    "kategoriId" TEXT NOT NULL,
    "bildiren" TEXT NOT NULL,
    "atananId" TEXT,
    "slaKuralId" TEXT,
    "olusturuldu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellendi" TIMESTAMP(3) NOT NULL,
    "kapatildi" TIMESTAMP(3),

    CONSTRAINT "Sorun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SorunYorum" (
    "id" TEXT NOT NULL,
    "icerik" TEXT NOT NULL,
    "sorunId" TEXT NOT NULL,
    "yazan" TEXT NOT NULL,
    "olusturuldu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SorunYorum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SorunCozum" (
    "id" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "cozumSuresi" INTEGER,
    "sorunId" TEXT NOT NULL,
    "cozuldu" BOOLEAN NOT NULL DEFAULT false,
    "olusturuldu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellendi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SorunCozum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SorunAdim" (
    "id" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "durum" "AdimDurum" NOT NULL DEFAULT 'BEKLEMEDE',
    "sorunId" TEXT NOT NULL,
    "cozumId" TEXT,
    "sira" INTEGER NOT NULL,
    "olusturuldu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellendi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SorunAdim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SorunSablonu" (
    "id" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "kategoriId" TEXT NOT NULL,
    "oncelik" "Oncelik" NOT NULL DEFAULT 'ORTA',

    CONSTRAINT "SorunSablonu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SablonAdim" (
    "id" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "sablonId" TEXT NOT NULL,
    "sira" INTEGER NOT NULL,

    CONSTRAINT "SablonAdim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BilgiBankasi" (
    "id" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "icerik" TEXT NOT NULL,
    "kategoriId" TEXT NOT NULL,
    "etiketler" TEXT,
    "goruntulenme" INTEGER NOT NULL DEFAULT 0,
    "fayda" INTEGER NOT NULL DEFAULT 0,
    "olusturan" TEXT NOT NULL,
    "olusturuldu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellendi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BilgiBankasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bildirim" (
    "id" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "icerik" TEXT NOT NULL,
    "tip" "BildirimTipi" NOT NULL,
    "aliciId" TEXT NOT NULL,
    "okundu" BOOLEAN NOT NULL DEFAULT false,
    "olusturuldu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bildirim_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Sorun" ADD CONSTRAINT "Sorun_departmanId_fkey" FOREIGN KEY ("departmanId") REFERENCES "Departman"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sorun" ADD CONSTRAINT "Sorun_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "Kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sorun" ADD CONSTRAINT "Sorun_bildiren_fkey" FOREIGN KEY ("bildiren") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sorun" ADD CONSTRAINT "Sorun_atananId_fkey" FOREIGN KEY ("atananId") REFERENCES "Personel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sorun" ADD CONSTRAINT "Sorun_slaKuralId_fkey" FOREIGN KEY ("slaKuralId") REFERENCES "SLAKural"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SorunYorum" ADD CONSTRAINT "SorunYorum_sorunId_fkey" FOREIGN KEY ("sorunId") REFERENCES "Sorun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SorunYorum" ADD CONSTRAINT "SorunYorum_yazan_fkey" FOREIGN KEY ("yazan") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SorunCozum" ADD CONSTRAINT "SorunCozum_sorunId_fkey" FOREIGN KEY ("sorunId") REFERENCES "Sorun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SorunAdim" ADD CONSTRAINT "SorunAdim_sorunId_fkey" FOREIGN KEY ("sorunId") REFERENCES "Sorun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SorunAdim" ADD CONSTRAINT "SorunAdim_cozumId_fkey" FOREIGN KEY ("cozumId") REFERENCES "SorunCozum"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SorunSablonu" ADD CONSTRAINT "SorunSablonu_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "Kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SablonAdim" ADD CONSTRAINT "SablonAdim_sablonId_fkey" FOREIGN KEY ("sablonId") REFERENCES "SorunSablonu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BilgiBankasi" ADD CONSTRAINT "BilgiBankasi_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "Kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BilgiBankasi" ADD CONSTRAINT "BilgiBankasi_olusturan_fkey" FOREIGN KEY ("olusturan") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bildirim" ADD CONSTRAINT "Bildirim_aliciId_fkey" FOREIGN KEY ("aliciId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
