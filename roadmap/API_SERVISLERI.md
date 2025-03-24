# IT Destek Sistemi API Servisleri

Bu doküman, IT destek ve sorun takip sistemi için tüm API servislerini ve endpointlerini tanımlamaktadır.

## API Yapısı ve Mimarisi

API'ler Next.js API rotaları kullanılarak oluşturulmuştur. Tüm API'ler `/api` prefix'i ile başlar ve RESTful prensiplere uygun şekilde tasarlanmıştır.

```
/api
├── auth/              # Kimlik doğrulama ile ilgili API'ler
│   ├── login          # Kullanıcı girişi
│   ├── logout         # Kullanıcı çıkışı
│   └── verify         # Token doğrulama
├── users/             # Kullanıcı yönetimi API'leri
├── personel/          # Personel yönetimi API'leri  
├── departmanlar/      # Departman yönetimi API'leri
├── kategoriler/       # Kategori yönetimi API'leri
├── sorunlar/          # Sorun yönetimi API'leri
├── yorumlar/          # Yorum yönetimi API'leri
├── sla/               # SLA yönetimi API'leri
└── dashboard/         # Dashboard istatistikleri API'leri
```

## API Endpoint'leri

### Kimlik Doğrulama (Auth) API'leri

#### POST /api/auth/login
Kullanıcı girişi yapar ve JWT token döner.

**İstek (Request):**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Yanıt (Response):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clv1234abcd",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "ADMIN"
  }
}
```

#### POST /api/auth/logout
Kullanıcı oturumunu sonlandırır.

**Yanıt (Response):**
```json
{
  "success": true,
  "message": "Oturum başarıyla sonlandırıldı"
}
```

#### GET /api/auth/verify
JWT token'ın geçerliliğini kontrol eder ve kullanıcı bilgisini döner.

**Yanıt (Response):**
```json
{
  "authenticated": true,
  "user": {
    "id": "clv1234abcd",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "ADMIN"
  }
}
```

### Kullanıcı Yönetimi API'leri

#### GET /api/users
Tüm kullanıcıları listeler.

**Yanıt (Response):**
```json
{
  "users": [
    {
      "id": "clv1234abcd",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "ADMIN"
    },
    {
      "id": "clv5678efgh",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "TECH"
    }
  ]
}
```

#### GET /api/users/:id
Belirli bir kullanıcının detaylarını getirir.

**Yanıt (Response):**
```json
{
  "id": "clv1234abcd",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "ADMIN",
  "createdAt": "2023-01-01T10:00:00.000Z",
  "updatedAt": "2023-01-10T15:30:00.000Z",
  "personel": {
    "id": "clp1234abcd",
    "ad": "John",
    "soyad": "Doe",
    "telefon": "+905551234567",
    "pozisyon": "IT Yöneticisi",
    "departman": {
      "id": "cld1234abcd",
      "ad": "IT Departmanı"
    }
  }
}
```

#### POST /api/users
Yeni bir kullanıcı oluşturur.

**İstek (Request):**
```json
{
  "name": "New User",
  "email": "new.user@example.com",
  "password": "secure_password",
  "role": "TECH"
}
```

**Yanıt (Response):**
```json
{
  "id": "clv9012ijkl",
  "name": "New User",
  "email": "new.user@example.com",
  "role": "TECH",
  "createdAt": "2023-06-15T09:30:00.000Z"
}
```

#### PUT /api/users/:id
Kullanıcı bilgilerini günceller.

**İstek (Request):**
```json
{
  "name": "Updated Name",
  "role": "ADMIN"
}
```

**Yanıt (Response):**
```json
{
  "id": "clv9012ijkl",
  "name": "Updated Name",
  "email": "new.user@example.com",
  "role": "ADMIN",
  "updatedAt": "2023-06-16T14:20:00.000Z"
}
```

#### DELETE /api/users/:id
Bir kullanıcıyı siler.

**Yanıt (Response):**
```json
{
  "success": true,
  "message": "Kullanıcı başarıyla silindi"
}
```

### Sorun Yönetimi API'leri

#### GET /api/sorunlar
Sorunları listeler ve filtreleme imkanı sunar.

**Sorgu Parametreleri:**
- `durum`: Sorun durumu filtresi (örn. ACIK, ATANDI, COZULDU)
- `oncelik`: Sorun önceliği filtresi (örn. DUSUK, ORTA, YUKSEK, KRITIK)
- `departmanId`: Departman ID'sine göre filtreleme
- `kategoriId`: Kategori ID'sine göre filtreleme
- `bildiren`: Bildiren kullanıcı ID'sine göre filtreleme
- `atananId`: Atanan personel ID'sine göre filtreleme
- `page`: Sayfa numarası (varsayılan: 1)
- `limit`: Sayfa başına sonuç sayısı (varsayılan: 10)
- `sortBy`: Sıralama alanı (örn. olusturuldu, guncellenme)
- `sortDir`: Sıralama yönü (ASC veya DESC)

**Yanıt (Response):**
```json
{
  "sorunlar": [
    {
      "id": "cls1234abcd",
      "baslik": "Bilgisayar açılmıyor",
      "durum": "ACIK",
      "oncelik": "YUKSEK",
      "olusturuldu": "2023-06-10T08:30:00.000Z",
      "departman": {
        "id": "cld1234abcd",
        "ad": "Muhasebe"
      },
      "kategori": {
        "id": "clk1234abcd",
        "ad": "Donanım"
      },
      "bildirenUser": {
        "id": "clv5678efgh",
        "name": "Jane Smith"
      },
      "atanan": null
    },
    {
      "id": "cls5678efgh",
      "baslik": "E-posta erişim sorunu",
      "durum": "ATANDI",
      "oncelik": "ORTA",
      "olusturuldu": "2023-06-09T14:20:00.000Z",
      "departman": {
        "id": "cld5678efgh",
        "ad": "Satış"
      },
      "kategori": {
        "id": "clk5678efgh",
        "ad": "E-posta"
      },
      "bildirenUser": {
        "id": "clv9012ijkl",
        "name": "Robert Johnson"
      },
      "atanan": {
        "id": "clp1234abcd",
        "ad": "John",
        "soyad": "Doe"
      }
    }
  ],
  "toplam": 42,
  "sayfaSayisi": 5,
  "mevcutSayfa": 1,
  "sayfaBasinaLimit": 10
}
```

#### GET /api/sorunlar/:id
Belirli bir sorunun detaylarını getirir.

**Yanıt (Response):**
```json
{
  "id": "cls1234abcd",
  "baslik": "Bilgisayar açılmıyor",
  "aciklama": "Bilgisayarım bu sabah açılmadı, güç düğmesine bastığımda hiç tepki vermiyor.",
  "durum": "ACIK",
  "oncelik": "YUKSEK",
  "olusturuldu": "2023-06-10T08:30:00.000Z",
  "guncellendi": "2023-06-10T08:30:00.000Z",
  "departman": {
    "id": "cld1234abcd",
    "ad": "Muhasebe"
  },
  "kategori": {
    "id": "clk1234abcd",
    "ad": "Donanım"
  },
  "bildirenUser": {
    "id": "clv5678efgh",
    "name": "Jane Smith",
    "email": "jane@example.com"
  },
  "atanan": null,
  "slaKural": {
    "id": "clsla1234abcd",
    "ad": "Yüksek Öncelikli Donanım Sorunu",
    "hedefSure": 120
  },
  "yorumlar": [
    {
      "id": "cly1234abcd",
      "icerik": "Lütfen güç kablosunun takılı olduğunu kontrol edebilir misiniz?",
      "olusturuldu": "2023-06-10T09:15:00.000Z",
      "yazan": "John Doe"
    }
  ],
  "cozumler": [],
  "adimlar": []
}
```

#### POST /api/sorunlar
Yeni bir sorun kaydı oluşturur.

**İstek (Request):**
```json
{
  "baslik": "Yazıcı kağıt sıkışması",
  "aciklama": "3. kattaki yazıcıda kağıt sıkışması var, çıkartamıyorum.",
  "oncelik": "ORTA",
  "departmanId": "cld5678efgh",
  "kategoriId": "clk1234wxyz"
}
```

**Yanıt (Response):**
```json
{
  "id": "cls9012ijkl",
  "baslik": "Yazıcı kağıt sıkışması",
  "aciklama": "3. kattaki yazıcıda kağıt sıkışması var, çıkartamıyorum.",
  "durum": "ACIK",
  "oncelik": "ORTA",
  "olusturuldu": "2023-06-16T11:45:00.000Z",
  "departmanId": "cld5678efgh",
  "kategoriId": "clk1234wxyz",
  "bildiren": "clv5678efgh"
}
```

#### PUT /api/sorunlar/:id
Bir sorunun bilgilerini günceller.

**İstek (Request):**
```json
{
  "durum": "ATANDI",
  "atananId": "clp1234abcd",
  "oncelik": "YUKSEK"
}
```

**Yanıt (Response):**
```json
{
  "id": "cls9012ijkl",
  "baslik": "Yazıcı kağıt sıkışması",
  "durum": "ATANDI",
  "oncelik": "YUKSEK",
  "guncellendi": "2023-06-16T12:30:00.000Z",
  "atananId": "clp1234abcd"
}
```

#### POST /api/sorunlar/:id/yorum
Bir soruna yorum ekler.

**İstek (Request):**
```json
{
  "icerik": "Yazıcının güç kablosunu çekip tekrar takmayı deneyin."
}
```

**Yanıt (Response):**
```json
{
  "id": "cly5678efgh",
  "icerik": "Yazıcının güç kablosunu çekip tekrar takmayı deneyin.",
  "sorunId": "cls9012ijkl",
  "yazan": "John Doe",
  "olusturuldu": "2023-06-16T13:00:00.000Z"
}
```

#### POST /api/sorunlar/:id/cozum
Bir soruna çözüm ekler.

**İstek (Request):**
```json
{
  "baslik": "Yazıcı kağıt sıkışması çözüldü",
  "aciklama": "Yazıcının arka kapağı açılarak sıkışan kağıt çıkartıldı ve sistem sıfırlandı.",
  "cozumSuresi": 15
}
```

**Yanıt (Response):**
```json
{
  "id": "clc1234abcd",
  "baslik": "Yazıcı kağıt sıkışması çözüldü",
  "aciklama": "Yazıcının arka kapağı açılarak sıkışan kağıt çıkartıldı ve sistem sıfırlandı.",
  "cozumSuresi": 15,
  "sorunId": "cls9012ijkl",
  "cozuldu": true,
  "olusturuldu": "2023-06-16T13:30:00.000Z"
}
```

#### POST /api/sorunlar/:id/adim
Bir soruna çözüm adımı ekler.

**İstek (Request):**
```json
{
  "baslik": "Kağıdı çıkarma",
  "aciklama": "Yazıcının arka kapağını açarak sıkışan kağıdı çıkartın.",
  "sira": 1,
  "cozumId": "clc1234abcd"
}
```

**Yanıt (Response):**
```json
{
  "id": "cla1234abcd",
  "baslik": "Kağıdı çıkarma",
  "aciklama": "Yazıcının arka kapağını açarak sıkışan kağıdı çıkartın.",
  "durum": "BEKLEMEDE",
  "sorunId": "cls9012ijkl",
  "cozumId": "clc1234abcd",
  "sira": 1,
  "olusturuldu": "2023-06-16T13:35:00.000Z"
}
```

### SLA Yönetimi API'leri

#### GET /api/sla
SLA kurallarını listeler.

**Yanıt (Response):**
```json
{
  "slaKurallar": [
    {
      "id": "clsla1234abcd",
      "ad": "Yüksek Öncelikli Donanım Sorunu",
      "aciklama": "Donanım ile ilgili yüksek öncelikli sorunlar için SLA",
      "oncelik": "YUKSEK",
      "hedefSure": 120
    },
    {
      "id": "clsla5678efgh",
      "ad": "Kritik Yazılım Sorunu",
      "aciklama": "Yazılım ile ilgili kritik sorunlar için SLA",
      "oncelik": "KRITIK",
      "hedefSure": 60
    }
  ]
}
```

#### GET /api/sla/:id
Belirli bir SLA kuralının detaylarını getirir.

**Yanıt (Response):**
```json
{
  "id": "clsla1234abcd",
  "ad": "Yüksek Öncelikli Donanım Sorunu",
  "aciklama": "Donanım ile ilgili yüksek öncelikli sorunlar için SLA",
  "oncelik": "YUKSEK",
  "hedefSure": 120,
  "createdAt": "2023-01-01T10:00:00.000Z",
  "updatedAt": "2023-01-10T15:30:00.000Z"
}
```

#### POST /api/sla
Yeni bir SLA kuralı oluşturur.

**İstek (Request):**
```json
{
  "ad": "Düşük Öncelikli Yazılım Sorunu",
  "aciklama": "Yazılım ile ilgili düşük öncelikli sorunlar için SLA",
  "oncelik": "DUSUK",
  "hedefSure": 480
}
```

**Yanıt (Response):**
```json
{
  "id": "clsla9012ijkl",
  "ad": "Düşük Öncelikli Yazılım Sorunu",
  "aciklama": "Yazılım ile ilgili düşük öncelikli sorunlar için SLA",
  "oncelik": "DUSUK",
  "hedefSure": 480,
  "createdAt": "2023-06-16T14:00:00.000Z"
}
```

### Dashboard API'leri

#### GET /api/dashboard/ozet
Dashboard için özet istatistikleri getirir.

**Yanıt (Response):**
```json
{
  "acikSorunlar": 15,
  "cozulenSorunlar": 120,
  "bekleyenSorunlar": 8,
  "bugunkiYeniSorunlar": 5,
  "ortalamaCozumSuresi": 128,
  "slaUyumYuzdesi": 92.5
}
```

#### GET /api/dashboard/kategori-dagilimi
Sorunların kategori dağılımını getirir.

**Yanıt (Response):**
```json
{
  "kategoriler": [
    {
      "id": "clk1234abcd",
      "ad": "Donanım",
      "sorunSayisi": 45
    },
    {
      "id": "clk5678efgh",
      "ad": "E-posta",
      "sorunSayisi": 30
    },
    {
      "id": "clk9012ijkl",
      "ad": "Yazılım",
      "sorunSayisi": 28
    },
    {
      "id": "clk3456mnop",
      "ad": "Ağ",
      "sorunSayisi": 25
    },
    {
      "id": "clk7890qrst",
      "ad": "Diğer",
      "sorunSayisi": 12
    }
  ]
}
```

#### GET /api/dashboard/departman-dagilimi
Sorunların departman dağılımını getirir.

**Yanıt (Response):**
```json
{
  "departmanlar": [
    {
      "id": "cld1234abcd",
      "ad": "Muhasebe",
      "sorunSayisi": 35
    },
    {
      "id": "cld5678efgh",
      "ad": "Satış",
      "sorunSayisi": 28
    },
    {
      "id": "cld9012ijkl",
      "ad": "İnsan Kaynakları",
      "sorunSayisi": 22
    },
    {
      "id": "cld3456mnop",
      "ad": "Üretim",
      "sorunSayisi": 18
    },
    {
      "id": "cld7890qrst",
      "ad": "Pazarlama",
      "sorunSayisi": 15
    }
  ]
}
```

#### GET /api/dashboard/zaman-serisi
Belirli bir zaman dilimi için sorun sayılarını getirir.

**Sorgu Parametreleri:**
- `baslangic`: Başlangıç tarihi (ISO formatında)
- `bitis`: Bitiş tarihi (ISO formatında)
- `aralik`: Zaman aralığı (gun, hafta, ay)

**Yanıt (Response):**
```json
{
  "zaman_serisi": [
    {
      "tarih": "2023-06-10",
      "acikSorunlar": 3,
      "cozulenSorunlar": 5
    },
    {
      "tarih": "2023-06-11",
      "acikSorunlar": 2,
      "cozulenSorunlar": 4
    },
    {
      "tarih": "2023-06-12",
      "acikSorunlar": 5,
      "cozulenSorunlar": 2
    },
    {
      "tarih": "2023-06-13",
      "acikSorunlar": 4,
      "cozulenSorunlar": 3
    },
    {
      "tarih": "2023-06-14",
      "acikSorunlar": 2,
      "cozulenSorunlar": 6
    },
    {
      "tarih": "2023-06-15",
      "acikSorunlar": 1,
      "cozulenSorunlar": 3
    },
    {
      "tarih": "2023-06-16",
      "acikSorunlar": 5,
      "cozulenSorunlar": 2
    }
  ]
}
```

### Yeni Eklenecek API'ler

#### Sorun Şablonları API'leri

#### GET /api/sorun-sablonlari
Tüm sorun şablonlarını listeler.

#### GET /api/sorun-sablonlari/:id
Belirli bir sorun şablonunun detaylarını getirir.

#### POST /api/sorun-sablonlari
Yeni bir sorun şablonu oluşturur.

#### PUT /api/sorun-sablonlari/:id
Sorun şablonu bilgilerini günceller.

#### DELETE /api/sorun-sablonlari/:id
Bir sorun şablonunu siler.

#### Bilgi Bankası API'leri

#### GET /api/bilgi-bankasi
Bilgi bankası makalelerini listeler ve arama yapar.

#### GET /api/bilgi-bankasi/:id
Belirli bir bilgi bankası makalesinin detaylarını getirir.

#### POST /api/bilgi-bankasi
Yeni bir bilgi bankası makalesi oluşturur.

#### PUT /api/bilgi-bankasi/:id
Bilgi bankası makalesi bilgilerini günceller.

#### DELETE /api/bilgi-bankasi/:id
Bir bilgi bankası makalesini siler.

#### POST /api/bilgi-bankasi/:id/goruntulenme
Bir makalenin görüntülenme sayısını artırır.

#### POST /api/bilgi-bankasi/:id/fayda
Bir makalenin fayda puanını artırır.

#### Bildirim API'leri

#### GET /api/bildirimler
Kullanıcının bildirimlerini listeler.

#### GET /api/bildirimler/okunmamis
Kullanıcının okunmamış bildirimlerini listeler.

#### PUT /api/bildirimler/:id/okundu
Bir bildirimi okundu olarak işaretler.

#### PUT /api/bildirimler/toplu-okundu
Tüm bildirimleri okundu olarak işaretler.

## API Güvenliği

- Tüm API istekleri JWT (JSON Web Token) ile yetkilendirilir.
- Her API isteği, Authorization header'ında Bearer token içermelidir: `Authorization: Bearer <token>`
- Token geçerli değilse veya süresi dolmuşsa, API 401 Unauthorized hatası döner.
- API'ler, kullanıcı rolüne göre erişim kontrolü uygular (ADMIN, TECH, USER).

## Hata İşleme

Tüm API'ler aynı hata yanıt formatını kullanır:

```json
{
  "error": true,
  "message": "Hata mesajı",
  "statusCode": 400,
  "details": {
    "field": "Hata detayı"
  }
}
```

## Sayfalama

Listeleme API'leri sayfalama destekler:

- `page`: Sayfa numarası (varsayılan: 1)
- `limit`: Sayfa başına sonuç sayısı (varsayılan: 10, maksimum: 100)

Sayfalama yanıtı aşağıdaki meta bilgileri içerir:

```json
{
  "toplam": 42,        // Toplam kayıt sayısı
  "sayfaSayisi": 5,    // Toplam sayfa sayısı
  "mevcutSayfa": 1,    // Mevcut sayfa numarası
  "sayfaBasinaLimit": 10  // Sayfa başına kayıt limiti
}
```

## API Versiyonlama

Gelecekte API versiyonlaması `/api/v1/`, `/api/v2/` gibi URL path'leri kullanılarak yapılacaktır. 