-- CreateTable
CREATE TABLE "Personel" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "departmanId" TEXT NOT NULL,
    "olusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellemeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Personel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Personel" ADD CONSTRAINT "Personel_departmanId_fkey" FOREIGN KEY ("departmanId") REFERENCES "Departman"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
