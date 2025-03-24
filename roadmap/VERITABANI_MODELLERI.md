# IT Destek Sistemi Veritabanı Modelleri

Bu doküman, IT destek ve sorun takip sistemi için tüm veritabanı modellerini ve aralarındaki ilişkileri tanımlamaktadır.

## Mevcut Modeller

### User
Sistemdeki tüm kullanıcıların temel bilgilerini içerir.

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // İlişkiler
  personel      Personel?
  soruns        Sorun[]
}

enum Role {
  USER
  ADMIN
  TECH
}
```

### Personel
Şirket içi personellerin detaylı bilgilerini içerir.

```prisma
model Personel {
  id           String     @id @default(cuid())
  ad           String
  soyad        String
  telefon      String?
  pozisyon     String?
  departmanId  String
  userId       String     @unique
  
  // İlişkiler
  departman    Departman  @relation(fields: [departmanId], references: [id])
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  atananSorunlar Sorun[]  @relation("AtananPersonel")
}
```

### Departman
Şirket içi departmanları tanımlar.

```prisma
model Departman {
  id        String     @id @default(cuid())
  ad        String
  aciklama  String?
  
  // İlişkiler
  personeller Personel[]
  sorunlar    Sorun[]
}
```

### Kategori
Sorunların sınıflandırıldığı kategorileri tanımlar.

```prisma
model Kategori {
  id        String    @id @default(cuid())
  ad        String
  aciklama  String?
  
  // İlişkiler
  sorunlar  Sorun[]
}
```

### SLAKural
Hizmet Seviyesi Anlaşması kurallarını tanımlar.

```prisma
model SLAKural {
  id          String   @id @default(cuid())
  ad          String
  aciklama    String?
  oncelik     Oncelik
  hedefSure   Int      // dakika cinsinden
  
  // İlişkiler
  sorunlar    Sorun[]
}

enum Oncelik {
  DUSUK
  ORTA
  YUKSEK
  KRITIK
}
```

### Sorun
Sistemde kaydedilen IT sorunlarını veya destek taleplerini içerir.

```prisma
model Sorun {
  id            String      @id @default(cuid())
  baslik        String
  aciklama      String
  durum         SorunDurum  @default(ACIK)
  oncelik       Oncelik     @default(ORTA)
  departmanId   String
  kategoriId    String
  bildiren      String
  atananId      String?
  slaKuralId    String?
  olusturuldu   DateTime    @default(now())
  guncellendi   DateTime    @updatedAt
  kapatildi     DateTime?
  
  // İlişkiler
  departman     Departman   @relation(fields: [departmanId], references: [id])
  kategori      Kategori    @relation(fields: [kategoriId], references: [id])
  bildirenUser  User        @relation(fields: [bildiren], references: [id])
  atanan        Personel?   @relation("AtananPersonel", fields: [atananId], references: [id])
  slaKural      SLAKural?   @relation(fields: [slaKuralId], references: [id])
  yorumlar      SorunYorum[]
  cozumler      SorunCozum[]
  adimlar       SorunAdim[]
}

enum SorunDurum {
  ACIK
  ATANDI
  BEKLEMEDE
  KAPATILDI
  REDDEDILDI
  COZULDU
}
```

### SorunYorum
Sorunlara yapılan yorumları içerir.

```prisma
model SorunYorum {
  id          String   @id @default(cuid())
  icerik      String
  sorunId     String
  yazan       String
  olusturuldu DateTime @default(now())
  
  // İlişkiler
  sorun       Sorun    @relation(fields: [sorunId], references: [id], onDelete: Cascade)
}
```

## Yeni Eklenen/Eklenecek Modeller

### SorunCozum
Sorunların çözüm bilgilerini içerir.

```prisma
model SorunCozum {
  id          String   @id @default(cuid())
  baslik      String
  aciklama    String
  cozumSuresi Int?     // Dakika cinsinden
  sorunId     String
  cozuldu     Boolean  @default(false)
  olusturuldu DateTime @default(now())
  guncellendi DateTime @updatedAt
  
  // İlişkiler
  sorun       Sorun    @relation(fields: [sorunId], references: [id], onDelete: Cascade)
  adimlar     SorunAdim[]
}
```

### SorunAdim
Sorun çözüm sürecindeki adımları içerir.

```prisma
model SorunAdim {
  id          String     @id @default(cuid())
  baslik      String
  aciklama    String
  durum       AdimDurum  @default(BEKLEMEDE)
  sorunId     String
  cozumId     String?
  sira        Int
  olusturuldu DateTime   @default(now())
  guncellendi DateTime   @updatedAt
  
  // İlişkiler
  sorun       Sorun      @relation(fields: [sorunId], references: [id], onDelete: Cascade)
  cozum       SorunCozum? @relation(fields: [cozumId], references: [id])
}

enum AdimDurum {
  BEKLEMEDE
  DEVAM_EDIYOR
  TAMAMLANDI
  BASARISIZ
}
```

### SorunSablonu
Sık karşılaşılan sorunlar için önceden hazırlanmış şablonları içerir.

```prisma
model SorunSablonu {
  id          String   @id @default(cuid())
  baslik      String
  aciklama    String
  kategoriId  String
  oncelik     Oncelik  @default(ORTA)
  
  // İlişkiler
  kategori    Kategori @relation(fields: [kategoriId], references: [id])
  cozumAdimlar SablonAdim[]
}
```

### SablonAdim
Sorun şablonlarına ait standart çözüm adımlarını içerir.

```prisma
model SablonAdim {
  id            String  @id @default(cuid())
  baslik        String
  aciklama      String
  sablonId      String
  sira          Int
  
  // İlişkiler
  sorunSablonu  SorunSablonu @relation(fields: [sablonId], references: [id], onDelete: Cascade)
}
```

### BilgiBankasi
Teknik bilgilerin ve çözümlerin saklandığı bilgi bankasını içerir.

```prisma
model BilgiBankasi {
  id          String   @id @default(cuid())
  baslik      String
  icerik      String   @db.Text
  kategoriId  String
  etiketler   String?
  goruntulenme Int      @default(0)
  fayda       Int      @default(0)
  olusturan   String
  olusturuldu DateTime @default(now())
  guncellendi DateTime @updatedAt
  
  // İlişkiler
  kategori    Kategori @relation(fields: [kategoriId], references: [id])
  olusturanUser User   @relation(fields: [olusturan], references: [id])
}
```

### Bildirim
Kullanıcılara gönderilen bildirimleri içerir.

```prisma
model Bildirim {
  id          String         @id @default(cuid())
  baslik      String
  icerik      String
  tip         BildirimTipi
  aliciId     String
  okundu      Boolean        @default(false)
  olusturuldu DateTime       @default(now())
  
  // İlişkiler
  alici       User           @relation(fields: [aliciId], references: [id])
}

enum BildirimTipi {
  YENI_SORUN
  SORUN_ATAMA
  SORUN_GUNCELLEME
  YENI_YORUM
  SLA_UYARI
  SISTEM
}
```

## Veritabanı İlişki Şeması

Aşağıda sistemdeki ana modeller ve aralarındaki ilişkiler gösterilmiştir:

```
User 1--1 Personel
User 1--N Sorun (bildiren)
User 1--N BilgiBankasi (olusturan)
User 1--N Bildirim (alici)

Personel N--1 Departman
Personel 1--N Sorun (atanan)

Departman 1--N Sorun

Kategori 1--N Sorun
Kategori 1--N SorunSablonu
Kategori 1--N BilgiBankasi

SLAKural 1--N Sorun

Sorun 1--N SorunYorum
Sorun 1--N SorunCozum
Sorun 1--N SorunAdim

SorunSablonu 1--N SablonAdim

SorunCozum 1--N SorunAdim
```

## Veri Tipleri ve Kısıtlamalar

- **ID**: Tüm modellerde `cuid()` formatında otomatik oluşturulan benzersiz tanımlayıcılar kullanılır.
- **Tarih Alanları**: 
  - `olusturuldu`: Kayıt oluşturulduğunda otomatik zaman damgası atanır.
  - `guncellendi`: Kayıt her güncellendiğinde otomatik olarak güncellenir.
- **İlişkiler**:
  - İlişkilerin çoğu, yabancı anahtar kısıtlamalarıyla korunur.
  - Kullanıcı silindiğinde, bağlı personel kaydı da otomatik olarak silinir (Cascade).
  - Sorun silindiğinde, bağlı yorumlar, çözümler ve adımlar da otomatik olarak silinir (Cascade).

## Genişletilebilirlik

Bu veritabanı şeması, gelecekteki gereksinimler için aşağıdaki alanlarda genişletilebilir:

1. **Varlık İzleme**: IT envanteri ve varlık yönetimi için modeller eklenebilir.
2. **Dosya Yönetimi**: Sorunlara ve çözümlere eklenebilecek dosyalar için modeller eklenebilir.
3. **İş Akışı Motorları**: Gelişmiş durum değişiklikleri ve otomatik atamalar için iş akışı tanımları eklenebilir.
4. **Ekip Yönetimi**: Ekipler ve ekip üyeleri için ilave modeller eklenebilir. 