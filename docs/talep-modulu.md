# Destek/Talep Modülü Dokümantasyonu

## 1. Veri Yapısı

### Talep Tablosu
```typescript
model Talep {
  id          String   @id @default(cuid())
  baslik      String
  aciklama    String
  durum       String   // Talebin genel durumu
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // İlişkiler
  personelId  String   // İlgili personel
  personel    Personel @relation(fields: [personelId], references: [id])
  
  kategoriId  String   // Talep kategorisi
  kategori    Kategori @relation(fields: [kategoriId], references: [id])
  
  createdById String   // Talebi oluşturan kullanıcı
  createdBy   User     @relation("CreatedTickets", fields: [createdById], references: [id])

  // Yapılan işlemler
  islemler    TalepIslem[]
}
```

### TalepIslem Tablosu
```typescript
model TalepIslem {
  id          String   @id @default(cuid())
  aciklama    String   // Yapılan işlemin açıklaması
  islemTipi   String   // Yapılan işlemin türü
  durum       String   // İşlemin durumu
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // İlişkiler
  talepId     String   // Hangi talebe ait olduğu
  talep       Talep    @relation(fields: [talepId], references: [id])
  
  userId      String   // İşlemi yapan kullanıcı
  user        User     @relation(fields: [userId], references: [id])

  // Dosya ekleri
  ekler       TalepIslemEk[]
}
```

### TalepIslemEk Tablosu
```typescript
model TalepIslemEk {
  id            String     @id @default(cuid())
  dosyaAdi      String     // Orijinal dosya adı
  dosyaYolu     String     // Sunucudaki dosya yolu
  dosyaTipi     String     // Dosya türü (IMAGE, VIDEO)
  boyut         Int        // Dosya boyutu (bytes)
  createdAt     DateTime   @default(now())

  // İlişkiler
  talepIslemId  String     // Hangi işleme ait olduğu
  talepIslem    TalepIslem @relation(fields: [talepIslemId], references: [id])
}
```

### Enum Tanımlamaları
```typescript
enum IslemTipi {
  INCELEME = "INCELEME"      // İlk inceleme
  COZUM = "COZUM"           // Çözüm uygulandı
  GUNCELLEME = "GUNCELLEME" // Durum güncellendi
  RED = "RED"               // Talep reddedildi
  BEKLEMEDE = "BEKLEMEDE"   // İşlem beklemede
  TAMAMLANDI = "TAMAMLANDI" // İşlem tamamlandı
}

enum IslemDurum {
  DEVAM_EDIYOR = "DEVAM_EDIYOR"
  TAMAMLANDI = "TAMAMLANDI"
  BEKLEMEDE = "BEKLEMEDE"
  IPTAL = "IPTAL"
}
```

## 2. Arayüz Tasarımları

### Ana Sayfa (Talep Listesi)
```
+------------------------------------------------------------------+
| Talepler                                    [Tablo][Liste][Grid]   |
+------------------------------------------------------------------+
| +--------------------------------------------------------------+ |
| |                      Filtreler                                | |
| | [Arama...]  [Departman ▼]  [Personel ▼]  [Kategori ▼]        | |
| |             [Durum ▼]      [Sayfa Boyutu ▼]  [+ Yeni Talep]  | |
| +--------------------------------------------------------------+ |
|                                                                    |
| +------------------------+ +------------------------+              |
| | Talep #1              | | Talep #2              |              |
| | Başlık                | | Başlık                |              |
| | Departman - Personel  | | Departman - Personel  |              |
| | Kategori              | | Kategori              |              |
| | Durum: Açık          | | Durum: Beklemede      |              |
| | Son İşlem: 2s önce   | | Son İşlem: 1s önce    |              |
| | [Detay] [Düzenle]    | | [Detay] [Düzenle]     |              |
| +------------------------+ +------------------------+              |
+------------------------------------------------------------------+
```

### Talep Detay Sayfası
```
+------------------------------------------------------------------+
| ← Talepler                                                         |
+------------------------------------------------------------------+
| Talep #123 - Sistem Erişim Sorunu                                 |
+------------------------------------------------------------------+
|                                                                    |
| +------------------------+  +----------------------------------+   |
| | Talep Bilgileri       |  | Talep Durumu                     |   |
| |------------------------|  |----------------------------------|   |
| | Oluşturan: A. Yılmaz  |  | Durum: Açık                      |   |
| | Tarih: 12.03.2024     |  | Son İşlem: 14.03.2024 15:30      |   |
| | Personel: Can Aksoy   |  | İşlem Sayısı: 3                  |   |
| | Kategori: Erişim      |  |                                  |   |
| +------------------------+  +----------------------------------+   |
|                                                                    |
| Açıklama                                                          |
| +--------------------------------------------------------------+ |
| | Sistem erişiminde sorun yaşıyorum. Giriş yapamıyorum.        | |
| +--------------------------------------------------------------+ |
|                                                                    |
| [Yeni İşlem Ekle]                                                 |
|                                                                    |
| İşlem Geçmişi                                                     |
| +--------------------------------------------------------------+ |
| | #3 - 14.03.2024 15:30                                        | |
| | İşlemi Yapan: Ahmet Yılmaz                                   | |
| | Tür: COZUM                                                   | |
| | Durum: TAMAMLANDI                                            | |
| |                                                              | |
| | Kullanıcı şifresi sıfırlandı ve erişim sağlandı.           | |
| |                                                              | |
| | Ekler:                                                       | |
| | [📷 ekran.jpg] [📹 cozum.mp4]                               | |
| +--------------------------------------------------------------+ |
```

### Yeni İşlem Ekleme Formu
```
+------------------------------------------------------------------+
|  ╔═ Yeni İşlem Ekle ═╗                                   [X]       |
|  ╟-------------------╢                                              |
|  |                                                                 |
|  | İşlem Türü*                                                    |
|  | [Seçiniz... ▼________________]                                 |
|  | ◉ INCELEME  ◉ COZUM  ◉ GUNCELLEME  ◉ RED  ◉ BEKLEMEDE        |
|  |                                                                 |
|  | Durum*                                                         |
|  | [Seçiniz... ▼________________]                                 |
|  | ◉ DEVAM_EDIYOR  ◉ TAMAMLANDI  ◉ BEKLEMEDE  ◉ IPTAL           |
|  |                                                                 |
|  | Açıklama*                                                      |
|  | +--------------------------------------------------------+    |
|  | |                                                         |    |
|  | |                                                         |    |
|  | +--------------------------------------------------------+    |
|  |                                                                 |
|  | Dosya Ekle                                                     |
|  | [+ Dosya Seç]                                                  |
|  |                                                                 |
|  | Seçilen Dosyalar:                                              |
|  | ⊠ ekran.jpg (2.4MB) [Sil]                                     |
|  | ⊠ cozum.mp4 (15MB) [Sil]                                      |
|  |                                                                 |
|  | [İptal] [Kaydet]                                               |
|  +----------------------------------------------------------------
+------------------------------------------------------------------+
```

## 3. İş Akışı

1. **Talep Oluşturma:**
   - Kullanıcı yeni talep oluşturur
   - Departman ve personel seçimi yapar
   - Kategori seçimi yapar
   - Başlık ve açıklama girer

2. **Talep İşlemleri:**
   - Her talep için birden fazla işlem kaydedilebilir
   - Her işlem için:
     - İşlem türü seçilir
     - Durum belirlenir
     - Açıklama girilir
     - İsteğe bağlı dosya(lar) eklenir

3. **Dosya Yönetimi:**
   - Her işlem için birden fazla dosya eklenebilir
   - Desteklenen dosya türleri: Resim, Video
   - Dosya boyutu ve türü kontrol edilir

4. **Durum Takibi:**
   - Talebin genel durumu izlenir
   - Her işlemin ayrı durumu takip edilir
   - Kronolojik işlem geçmişi tutulur

## 4. Güvenlik ve Doğrulama

1. **Yetkilendirme:**
   - Talep oluşturma: Tüm kullanıcılar
   - İşlem ekleme: Yetkili kullanıcılar
   - Talep silme: Sadece yöneticiler

2. **Doğrulama Kuralları:**
   - Zorunlu alanlar: Başlık, açıklama, personel, kategori
   - Dosya boyutu limitleri
   - Desteklenen dosya formatları

## 5. Raporlama

1. **Talep Raporları:**
   - Personel bazlı talep dağılımı
   - Kategori bazlı talep dağılımı
   - Durum bazlı talep dağılımı
   - Zaman bazlı talep analizi

2. **İşlem Raporları:**
   - İşlem türlerine göre dağılım
   - Çözüm süreleri analizi
   - Personel performans analizi 