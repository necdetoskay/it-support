# ModernCRUDTemplate

Bu template, modern ve kullanıcı dostu bir CRUD (Create, Read, Update, Delete) arayüzü oluşturmak için kullanılabilir. Template, aşağıdaki özellikleri içerir:

## Özellikler

- 🎨 Üç farklı görünüm seçeneği (Tablo, Liste, Kart)
- 📱 Tam responsive tasarım
- 🔍 Anlık arama
- 📄 Sayfalama
- 📊 Kayıt sayısı seçimi
- ✨ Modern animasyonlar
- 🎯 Kolay kullanım
- 🔒 Veri doğrulama
- 🚀 API entegrasyonu

## Dosya Yapısı

```
src/
├── app/
│   ├── api/
│   │   └── [moduleName]/
│   │       ├── route.ts
│   │       └── [id]/
│   │           └── route.ts
│   └── dashboard/
│       └── [moduleName]/
│           ├── page.tsx
│           └── [ModuleName]Modal.tsx
```

## Kullanım

1. `[moduleName]` klasörlerini oluşturun
2. Template dosyalarını kopyalayın
3. Aşağıdaki değişkenleri güncelleyin:
   - `ModuleName` -> Modül adı (PascalCase)
   - `moduleName` -> Modül adı (camelCase)
   - Interface tanımları
   - API endpoint'leri
   - Validasyon kuralları
   - Tablo/Liste/Kart görünümlerindeki alanlar

## Interface Örneği

```typescript
interface Item {
  id: string;
  ad: string;
  aciklama: string | null;
  // ... diğer alanlar
}

interface Sayfalama {
  toplamKayit: number;
  toplamSayfa: number;
  mevcutSayfa: number;
  limit: number;
}
```

## API Route Yapısı

### GET /api/[moduleName]
- Tüm kayıtları listeler
- Sayfalama desteği
- Arama desteği
- İlişkili kayıt sayılarını içerir

### POST /api/[moduleName]
- Yeni kayıt oluşturur
- Veri doğrulama
- Benzersizlik kontrolü

### GET /api/[moduleName]/[id]
- Tek bir kaydın detaylarını getirir
- İlişkili kayıtları içerir

### PUT /api/[moduleName]/[id]
- Kaydı günceller
- Veri doğrulama
- Benzersizlik kontrolü

### DELETE /api/[moduleName]/[id]
- Kaydı siler
- İlişki kontrolü
- Silme koruması

## Validasyon Şeması Örneği

```typescript
const schema = z.object({
  ad: z.string()
    .min(3, "Ad en az 3 karakter olmalıdır")
    .max(50, "Ad en fazla 50 karakter olabilir")
    .regex(/^[a-zA-ZğĞüÜşŞıİöÖçÇ0-9\s-]+$/, "Sadece harf, rakam, boşluk ve - içerebilir"),
  
  aciklama: z.string()
    .max(200, "Açıklama en fazla 200 karakter olabilir")
    .optional()
});
```

## Görünüm Bileşenleri

### Tablo Görünümü
- Sütun başlıkları
- Sıralama
- Satır hover efekti
- İşlem butonları

### Liste Görünümü
- Kompakt tasarım
- Detaylı bilgi
- İşlem butonları

### Kart Görünümü
- Grid layout
- Görsel tasarım
- Hover efektleri
- İşlem butonları

## Modal Yapısı

- Form validasyonu
- Yükleniyor durumu
- Hata yönetimi
- Başarı bildirimleri

## Stil ve Animasyonlar

- Tailwind CSS
- shadcn/ui bileşenleri
- Geçiş animasyonları
- Loading spinners
- Toast bildirimleri

## Özelleştirme

Template'i kullanırken aşağıdaki alanları özelleştirebilirsiniz:

1. Görünüm tasarımı
2. Validasyon kuralları
3. API response formatı
4. İlişkili kayıt yapısı
5. Arama ve filtreleme mantığı
6. Sayfalama parametreleri

## Best Practices

1. Her zaman veri doğrulama kullanın
2. API yanıtlarını formatlayın
3. Hata yönetimini düzgün yapın
4. İlişkili kayıtları kontrol edin
5. Kullanıcı deneyimini optimize edin
6. Performans optimizasyonları yapın

## Örnek Kullanım

```typescript
// pages/dashboard/[moduleName]/page.tsx
import { ModuleNameModal } from "./ModuleNameModal";

export default function ModuleNamePage() {
  // ... template kodunu kopyalayıp özelleştirin
}

// components/ModuleNameModal.tsx
export function ModuleNameModal() {
  // ... template kodunu kopyalayıp özelleştirin
}

// api/[moduleName]/route.ts
export async function GET(request: Request) {
  // ... template kodunu kopyalayıp özelleştirin
}
``` 