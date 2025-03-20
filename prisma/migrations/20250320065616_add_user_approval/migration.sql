/*
  Warnings:

  - The primary key for the `_TalepCozumEtiketleri` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_TalepSorunEtiketleri` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_TalepCozumEtiketleri` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_TalepSorunEtiketleri` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "_TalepCozumEtiketleri" DROP CONSTRAINT "_TalepCozumEtiketleri_AB_pkey";

-- AlterTable
ALTER TABLE "_TalepSorunEtiketleri" DROP CONSTRAINT "_TalepSorunEtiketleri_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_TalepCozumEtiketleri_AB_unique" ON "_TalepCozumEtiketleri"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_TalepSorunEtiketleri_AB_unique" ON "_TalepSorunEtiketleri"("A", "B");
