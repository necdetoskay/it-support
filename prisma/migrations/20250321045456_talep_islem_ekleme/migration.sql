-- CreateEnum
CREATE TYPE "TalepIslemTipi" AS ENUM ('ACIKLAMA', 'DURUM_DEGISIKLIGI', 'ATAMA', 'COZUM');

-- CreateTable
CREATE TABLE "TalepIslem" (
    "id" TEXT NOT NULL,
    "tip" "TalepIslemTipi" NOT NULL,
    "aciklama" TEXT NOT NULL,
    "durum" "TalepDurum",
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellenmeTarihi" TIMESTAMP(3) NOT NULL,
    "talepId" TEXT NOT NULL,
    "yapanKullaniciId" TEXT NOT NULL,

    CONSTRAINT "TalepIslem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalepIslemDosya" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "boyut" INTEGER NOT NULL,
    "tip" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellenmeTarihi" TIMESTAMP(3) NOT NULL,
    "islemId" TEXT NOT NULL,

    CONSTRAINT "TalepIslemDosya_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TalepIslem_talepId_idx" ON "TalepIslem"("talepId");

-- CreateIndex
CREATE INDEX "TalepIslem_yapanKullaniciId_idx" ON "TalepIslem"("yapanKullaniciId");

-- CreateIndex
CREATE INDEX "TalepIslemDosya_islemId_idx" ON "TalepIslemDosya"("islemId");

-- AddForeignKey
ALTER TABLE "TalepIslem" ADD CONSTRAINT "TalepIslem_talepId_fkey" FOREIGN KEY ("talepId") REFERENCES "Talep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalepIslem" ADD CONSTRAINT "TalepIslem_yapanKullaniciId_fkey" FOREIGN KEY ("yapanKullaniciId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalepIslemDosya" ADD CONSTRAINT "TalepIslemDosya_islemId_fkey" FOREIGN KEY ("islemId") REFERENCES "TalepIslem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
