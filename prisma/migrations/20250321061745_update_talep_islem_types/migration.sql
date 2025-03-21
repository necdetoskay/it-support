/*
  Warnings:

  - The values [ACIK,ISLEMDE,KULLANICI_BEKLIYOR,UCUNCU_TARAF_BEKLIYOR,COZULDU,KAPANDI] on the enum `TalepDurum` will be removed. If these variants are still used in the database, this will fail.
  - The values [ACIKLAMA,DURUM_DEGISIKLIGI,ATAMA] on the enum `TalepIslemTipi` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `durum` on table `TalepIslem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TalepDurum_new" AS ENUM ('DEVAM_EDIYOR', 'TAMAMLANDI', 'BEKLEMEDE', 'IPTAL');
ALTER TABLE "Talep" ALTER COLUMN "durum" DROP DEFAULT;
ALTER TABLE "Talep" ALTER COLUMN "durum" TYPE "TalepDurum_new" USING ("durum"::text::"TalepDurum_new");
ALTER TABLE "TalepIslem" ALTER COLUMN "durum" TYPE "TalepDurum_new" USING ("durum"::text::"TalepDurum_new");
ALTER TYPE "TalepDurum" RENAME TO "TalepDurum_old";
ALTER TYPE "TalepDurum_new" RENAME TO "TalepDurum";
DROP TYPE "TalepDurum_old";
ALTER TABLE "Talep" ALTER COLUMN "durum" SET DEFAULT 'DEVAM_EDIYOR';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TalepIslemTipi_new" AS ENUM ('INCELEME', 'COZUM', 'GUNCELLEME', 'RED', 'BEKLEMEDE', 'TAMAMLANDI');
ALTER TABLE "TalepIslem" ALTER COLUMN "tip" TYPE "TalepIslemTipi_new" USING ("tip"::text::"TalepIslemTipi_new");
ALTER TYPE "TalepIslemTipi" RENAME TO "TalepIslemTipi_old";
ALTER TYPE "TalepIslemTipi_new" RENAME TO "TalepIslemTipi";
DROP TYPE "TalepIslemTipi_old";
COMMIT;

-- AlterTable
ALTER TABLE "Talep" ALTER COLUMN "durum" SET DEFAULT 'DEVAM_EDIYOR';

-- AlterTable
ALTER TABLE "TalepIslem" ALTER COLUMN "durum" SET NOT NULL;
