# ModernCRUDTemplate Kullanım Kılavuzu

Bu template, modern ve kullanıcı dostu bir CRUD (Create, Read, Update, Delete) arayüzü oluşturmak için kullanılabilir.

## Nasıl Kullanılır?

1. Template dosyalarını yeni modül için kopyalayın:
   ```bash
   # API route'ları için
   cp -r docs/templates/api/[moduleName] src/app/api/[yeniModulAdi]
   
   # Sayfa ve modal bileşenleri için
   cp -r docs/templates/dashboard/[moduleName] src/app/dashboard/[yeniModulAdi]
   ```

2. Dosya ve klasör isimlerini güncelleyin:
   - `[moduleName]` -> `[yeniModulAdi]` (örn: `personeller`, `talepler`)
   - `ItemModal.tsx` -> `[YeniModulAdi]Modal.tsx` (örn: `PersonelModal.tsx`, `TalepModal.tsx`)
   - `MODEL_NAME` -> Prisma model adı (örn: `personel`, `talep`)

3. Dosyaların içeriğini güncelleyin:
   - Interface tanımlarını güncelleyin
   - API endpoint'lerini güncelleyin
   - Validasyon kurallarını güncelleyin
   - İlişkili kayıt alanlarını ekleyin/güncelleyin
   - Görünüm bileşenlerini özelleştirin

4. Menü bağlantısı ekleyin:
   ```typescript
   // src/app/dashboard/layout.tsx
   const menuLinkleri = [
     // ... diğer linkler
     {
       href: "/dashboard/[yeniModulAdi]",
       etiket: "[Yeni Modül Adı]",
       ikon: <Icon className="w-5 h-5" />
     }
   ];
   ```

## Özelleştirme Örnekleri

### Interface Tanımı
```typescript
interface Item {
  id: string;
  ad: string;
  aciklama: string | null;
  // Yeni alanlar ekleyin
  email: string;
  telefon: string;
  durum: "aktif" | "pasif";
  // İlişkili kayıt sayıları
  talepSayisi: number;
  mesajSayisi: number;
}
```

### Validasyon Şeması
```typescript
const schema = z.object({
  ad: z.string()
    .min(3, "Ad en az 3 karakter olmalıdır")
    .max(50, "Ad en fazla 50 karakter olabilir"),
  email: z.string()
    .email("Geçerli bir e-posta adresi giriniz"),
  telefon: z.string()
    .regex(/^[0-9]{10}$/, "Telefon 10 haneli olmalıdır"),
  durum: z.enum(["aktif", "pasif"]),
  aciklama: z.string()
    .max(200, "Açıklama en fazla 200 karakter olabilir")
    .optional()
});
```

### İlişkili Kayıtlar
```typescript
// API route'unda
const items = await prisma.MODEL_NAME.findMany({
  include: {
    talepler: true,
    mesajlar: true,
    _count: {
      select: {
        talepler: true,
        mesajlar: true
      }
    }
  }
});

// Görünüm bileşeninde
<TableCell className="text-center">
  <div className="flex items-center justify-center gap-2">
    <div className="bg-blue-50 p-1 rounded-md">
      <MessageSquare className="w-3 h-3 text-blue-600" />
    </div>
    {item.mesajSayisi}
  </div>
</TableCell>
```

### Modal Form Alanları
```typescript
<div className="space-y-2">
  <label htmlFor="email" className="text-sm font-medium">
    E-posta
  </label>
  <Input
    id="email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
  />
</div>

<div className="space-y-2">
  <label htmlFor="durum" className="text-sm font-medium">
    Durum
  </label>
  <Select value={durum} onValueChange={setDurum}>
    <SelectTrigger>
      <SelectValue placeholder="Durum seçin" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="aktif">Aktif</SelectItem>
      <SelectItem value="pasif">Pasif</SelectItem>
    </SelectContent>
  </Select>
</div>
```

## Önemli Notlar

1. Template'i kullanırken, modülünüzün ihtiyaçlarına göre özelleştirme yapın.
2. Validasyon kurallarını modülünüze uygun şekilde güncelleyin.
3. İlişkili kayıtları ve sayılarını doğru şekilde ekleyin.
4. Görünüm bileşenlerini ihtiyaca göre özelleştirin.
5. API endpoint'lerini ve Prisma sorgularını güncelleyin.
6. Menü bağlantısını eklemeyi unutmayın.

## Örnek Kullanım

```bash
# Personel modülü için
cp -r docs/templates/api/[moduleName] src/app/api/personeller
cp -r docs/templates/dashboard/[moduleName] src/app/dashboard/personeller

# Dosya isimlerini güncelle
mv src/app/dashboard/personeller/ItemModal.tsx src/app/dashboard/personeller/PersonelModal.tsx

# Dosyaları düzenle ve özelleştir
# - Interface'leri güncelle
# - API endpoint'lerini güncelle
# - Validasyon kurallarını güncelle
# - Görünüm bileşenlerini özelleştir
# - Menü bağlantısını ekle
``` 