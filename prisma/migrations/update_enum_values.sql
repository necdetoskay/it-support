-- Update TalepDurum values
UPDATE "Talep"
SET "durum" = 'DEVAM_EDIYOR'
WHERE "durum" IN ('ACIK', 'ISLEMDE', 'KULLANICI_BEKLIYOR', 'UCUNCU_TARAF_BEKLIYOR');

UPDATE "Talep"
SET "durum" = 'TAMAMLANDI'
WHERE "durum" IN ('COZULDU', 'KAPANDI');

-- Update TalepIslemTipi values
UPDATE "TalepIslem"
SET "tip" = 'INCELEME'
WHERE "tip" IN ('ACIKLAMA', 'DURUM_DEGISIKLIGI');

UPDATE "TalepIslem"
SET "tip" = 'COZUM'
WHERE "tip" = 'ATAMA'; 