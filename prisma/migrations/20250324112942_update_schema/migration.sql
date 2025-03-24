/*
  Warnings:

  - You are about to drop the column `aliciId` on the `Bildirim` table. All the data in the column will be lost.
  - You are about to drop the column `icerik` on the `Bildirim` table. All the data in the column will be lost.
  - You are about to drop the column `olusturuldu` on the `Bildirim` table. All the data in the column will be lost.
  - You are about to drop the column `fayda` on the `BilgiBankasi` table. All the data in the column will be lost.
  - You are about to drop the column `goruntulenme` on the `BilgiBankasi` table. All the data in the column will be lost.
  - You are about to drop the column `guncellendi` on the `BilgiBankasi` table. All the data in the column will be lost.
  - You are about to drop the column `kategoriId` on the `BilgiBankasi` table. All the data in the column will be lost.
  - You are about to drop the column `olusturan` on the `BilgiBankasi` table. All the data in the column will be lost.
  - You are about to drop the column `olusturuldu` on the `BilgiBankasi` table. All the data in the column will be lost.
  - The `etiketler` column on the `BilgiBankasi` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdAt` on the `DatabaseBackup` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `DatabaseBackup` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `DatabaseBackup` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `DatabaseBackup` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `DatabaseBackup` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `DatabaseBackup` table. All the data in the column will be lost.
  - You are about to drop the column `guncellenmeTarihi` on the `DatabaseBackup` table. All the data in the column will be lost.
  - You are about to drop the column `tables` on the `DatabaseBackup` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `DatabaseBackup` table. All the data in the column will be lost.
  - You are about to drop the column `guncellenmeTarihi` on the `Departman` table. All the data in the column will be lost.
  - You are about to drop the column `olusturulmaTarihi` on the `Departman` table. All the data in the column will be lost.
  - You are about to drop the column `bildiren` on the `Sorun` table. All the data in the column will be lost.
  - You are about to drop the column `guncellendi` on the `Sorun` table. All the data in the column will be lost.
  - You are about to drop the column `kapatildi` on the `Sorun` table. All the data in the column will be lost.
  - You are about to drop the column `kategoriId` on the `Sorun` table. All the data in the column will be lost.
  - You are about to drop the column `olusturuldu` on the `Sorun` table. All the data in the column will be lost.
  - You are about to drop the column `slaKuralId` on the `Sorun` table. All the data in the column will be lost.
  - The `durum` column on the `Sorun` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `oncelik` column on the `Sorun` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `aciklama` on the `SorunAdim` table. All the data in the column will be lost.
  - You are about to drop the column `baslik` on the `SorunAdim` table. All the data in the column will be lost.
  - You are about to drop the column `cozumId` on the `SorunAdim` table. All the data in the column will be lost.
  - You are about to drop the column `durum` on the `SorunAdim` table. All the data in the column will be lost.
  - You are about to drop the column `guncellendi` on the `SorunAdim` table. All the data in the column will be lost.
  - You are about to drop the column `olusturuldu` on the `SorunAdim` table. All the data in the column will be lost.
  - You are about to drop the column `sira` on the `SorunAdim` table. All the data in the column will be lost.
  - You are about to drop the column `aciklama` on the `SorunCozum` table. All the data in the column will be lost.
  - You are about to drop the column `baslik` on the `SorunCozum` table. All the data in the column will be lost.
  - You are about to drop the column `cozuldu` on the `SorunCozum` table. All the data in the column will be lost.
  - You are about to drop the column `cozumSuresi` on the `SorunCozum` table. All the data in the column will be lost.
  - You are about to drop the column `guncellendi` on the `SorunCozum` table. All the data in the column will be lost.
  - You are about to drop the column `olusturuldu` on the `SorunCozum` table. All the data in the column will be lost.
  - You are about to drop the column `olusturuldu` on the `SorunYorum` table. All the data in the column will be lost.
  - You are about to drop the column `yazan` on the `SorunYorum` table. All the data in the column will be lost.
  - You are about to drop the `CozumEtiket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Kategori` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Personel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SLAKural` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SablonAdim` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SorunEtiket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SorunSablonu` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `kullaniciId` to the `Bildirim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mesaj` to the `Bildirim` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `tip` on the `Bildirim` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `guncellemeTarihi` to the `BilgiBankasi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kategori` to the `BilgiBankasi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `olusturanId` to the `BilgiBankasi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `boyut` to the `DatabaseBackup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dosyaAdi` to the `DatabaseBackup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `durum` to the `DatabaseBackup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kullaniciId` to the `DatabaseBackup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guncellemeTarihi` to the `Departman` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guncellemeTarihi` to the `Sorun` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kategori` to the `Sorun` table without a default value. This is not possible if the table is not empty.
  - Added the required column `olusturanId` to the `Sorun` table without a default value. This is not possible if the table is not empty.
  - Made the column `atananId` on table `Sorun` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `icerik` to the `SorunAdim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icerik` to the `SorunCozum` table without a default value. This is not possible if the table is not empty.
  - Added the required column `olusturan` to the `SorunCozum` table without a default value. This is not possible if the table is not empty.
  - Added the required column `olusturanId` to the `SorunYorum` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Bildirim" DROP CONSTRAINT "Bildirim_aliciId_fkey";

-- DropForeignKey
ALTER TABLE "BilgiBankasi" DROP CONSTRAINT "BilgiBankasi_kategoriId_fkey";

-- DropForeignKey
ALTER TABLE "BilgiBankasi" DROP CONSTRAINT "BilgiBankasi_olusturan_fkey";

-- DropForeignKey
ALTER TABLE "DatabaseBackup" DROP CONSTRAINT "DatabaseBackup_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "Kategori" DROP CONSTRAINT "Kategori_ustKategoriId_fkey";

-- DropForeignKey
ALTER TABLE "Personel" DROP CONSTRAINT "Personel_departmanId_fkey";

-- DropForeignKey
ALTER TABLE "SLAKural" DROP CONSTRAINT "SLAKural_kategoriId_fkey";

-- DropForeignKey
ALTER TABLE "SablonAdim" DROP CONSTRAINT "SablonAdim_sablonId_fkey";

-- DropForeignKey
ALTER TABLE "Sorun" DROP CONSTRAINT "Sorun_atananId_fkey";

-- DropForeignKey
ALTER TABLE "Sorun" DROP CONSTRAINT "Sorun_bildiren_fkey";

-- DropForeignKey
ALTER TABLE "Sorun" DROP CONSTRAINT "Sorun_kategoriId_fkey";

-- DropForeignKey
ALTER TABLE "Sorun" DROP CONSTRAINT "Sorun_slaKuralId_fkey";

-- DropForeignKey
ALTER TABLE "SorunAdim" DROP CONSTRAINT "SorunAdim_cozumId_fkey";

-- DropForeignKey
ALTER TABLE "SorunAdim" DROP CONSTRAINT "SorunAdim_sorunId_fkey";

-- DropForeignKey
ALTER TABLE "SorunCozum" DROP CONSTRAINT "SorunCozum_sorunId_fkey";

-- DropForeignKey
ALTER TABLE "SorunSablonu" DROP CONSTRAINT "SorunSablonu_kategoriId_fkey";

-- DropForeignKey
ALTER TABLE "SorunYorum" DROP CONSTRAINT "SorunYorum_sorunId_fkey";

-- DropForeignKey
ALTER TABLE "SorunYorum" DROP CONSTRAINT "SorunYorum_yazan_fkey";

-- AlterTable
ALTER TABLE "Bildirim" DROP COLUMN "aliciId",
DROP COLUMN "icerik",
DROP COLUMN "olusturuldu",
ADD COLUMN     "kullaniciId" TEXT NOT NULL,
ADD COLUMN     "mesaj" TEXT NOT NULL,
ADD COLUMN     "olusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "tip",
ADD COLUMN     "tip" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "BilgiBankasi" DROP COLUMN "fayda",
DROP COLUMN "goruntulenme",
DROP COLUMN "guncellendi",
DROP COLUMN "kategoriId",
DROP COLUMN "olusturan",
DROP COLUMN "olusturuldu",
ADD COLUMN     "faydali" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "faydaliDegil" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "guncellemeTarihi" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "kategori" TEXT NOT NULL,
ADD COLUMN     "olusturanId" TEXT NOT NULL,
ADD COLUMN     "olusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "etiketler",
ADD COLUMN     "etiketler" TEXT[];

-- AlterTable
ALTER TABLE "DatabaseBackup" DROP COLUMN "createdAt",
DROP COLUMN "createdBy",
DROP COLUMN "description",
DROP COLUMN "fileName",
DROP COLUMN "filePath",
DROP COLUMN "fileSize",
DROP COLUMN "guncellenmeTarihi",
DROP COLUMN "tables",
DROP COLUMN "type",
ADD COLUMN     "boyut" INTEGER NOT NULL,
ADD COLUMN     "dosyaAdi" TEXT NOT NULL,
ADD COLUMN     "durum" TEXT NOT NULL,
ADD COLUMN     "kullaniciId" TEXT NOT NULL,
ADD COLUMN     "olusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Departman" DROP COLUMN "guncellenmeTarihi",
DROP COLUMN "olusturulmaTarihi",
ADD COLUMN     "guncellemeTarihi" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "olusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Sorun" DROP COLUMN "bildiren",
DROP COLUMN "guncellendi",
DROP COLUMN "kapatildi",
DROP COLUMN "kategoriId",
DROP COLUMN "olusturuldu",
DROP COLUMN "slaKuralId",
ADD COLUMN     "guncellemeTarihi" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "kategori" TEXT NOT NULL,
ADD COLUMN     "olusturanId" TEXT NOT NULL,
ADD COLUMN     "olusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "slaDurumu" TEXT NOT NULL DEFAULT 'normal',
DROP COLUMN "durum",
ADD COLUMN     "durum" TEXT NOT NULL DEFAULT 'acik',
DROP COLUMN "oncelik",
ADD COLUMN     "oncelik" TEXT NOT NULL DEFAULT 'normal',
ALTER COLUMN "atananId" SET NOT NULL;

-- AlterTable
ALTER TABLE "SorunAdim" DROP COLUMN "aciklama",
DROP COLUMN "baslik",
DROP COLUMN "cozumId",
DROP COLUMN "durum",
DROP COLUMN "guncellendi",
DROP COLUMN "olusturuldu",
DROP COLUMN "sira",
ADD COLUMN     "icerik" TEXT NOT NULL,
ADD COLUMN     "olusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tamamlandi" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SorunCozum" DROP COLUMN "aciklama",
DROP COLUMN "baslik",
DROP COLUMN "cozuldu",
DROP COLUMN "cozumSuresi",
DROP COLUMN "guncellendi",
DROP COLUMN "olusturuldu",
ADD COLUMN     "icerik" TEXT NOT NULL,
ADD COLUMN     "olusturan" TEXT NOT NULL,
ADD COLUMN     "olusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "SorunYorum" DROP COLUMN "olusturuldu",
DROP COLUMN "yazan",
ADD COLUMN     "olusturanId" TEXT NOT NULL,
ADD COLUMN     "olusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "departmanId" TEXT;

-- DropTable
DROP TABLE "CozumEtiket";

-- DropTable
DROP TABLE "Kategori";

-- DropTable
DROP TABLE "Personel";

-- DropTable
DROP TABLE "SLAKural";

-- DropTable
DROP TABLE "SablonAdim";

-- DropTable
DROP TABLE "SorunEtiket";

-- DropTable
DROP TABLE "SorunSablonu";

-- DropEnum
DROP TYPE "AdimDurum";

-- DropEnum
DROP TYPE "BildirimTipi";

-- DropEnum
DROP TYPE "Oncelik";

-- DropEnum
DROP TYPE "SorunDurum";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmanId_fkey" FOREIGN KEY ("departmanId") REFERENCES "Departman"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sorun" ADD CONSTRAINT "Sorun_atananId_fkey" FOREIGN KEY ("atananId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sorun" ADD CONSTRAINT "Sorun_olusturanId_fkey" FOREIGN KEY ("olusturanId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SorunYorum" ADD CONSTRAINT "SorunYorum_olusturanId_fkey" FOREIGN KEY ("olusturanId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SorunYorum" ADD CONSTRAINT "SorunYorum_sorunId_fkey" FOREIGN KEY ("sorunId") REFERENCES "Sorun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SorunCozum" ADD CONSTRAINT "SorunCozum_sorunId_fkey" FOREIGN KEY ("sorunId") REFERENCES "Sorun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SorunAdim" ADD CONSTRAINT "SorunAdim_sorunId_fkey" FOREIGN KEY ("sorunId") REFERENCES "Sorun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BilgiBankasi" ADD CONSTRAINT "BilgiBankasi_olusturanId_fkey" FOREIGN KEY ("olusturanId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bildirim" ADD CONSTRAINT "Bildirim_kullaniciId_fkey" FOREIGN KEY ("kullaniciId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatabaseBackup" ADD CONSTRAINT "DatabaseBackup_kullaniciId_fkey" FOREIGN KEY ("kullaniciId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
