# IT Destek Sistemi Kullanıcı Arayüzü Tasarımı

Bu doküman, IT destek ve sorun takip sistemi için kullanıcı arayüzü tasarımını ve kullanıcı deneyimi planını içermektedir.

## Tasarım İlkeleri

Arayüz tasarımında aşağıdaki temel tasarım ilkeleri göz önünde bulundurulacaktır:

1. **Basitlik ve Netlik**: Kullanıcıların en sık kullandığı işlevleri ön planda tutarak karmaşık arayüzlerden kaçınılacaktır.
2. **Tutarlılık**: Tüm sayfalarda benzer öğeler için aynı tasarım dili kullanılacaktır.
3. **Erişilebilirlik**: Arayüz WCAG 2.1 standartlarına uygun şekilde tasarlanacaktır.
4. **Duyarlı Tasarım**: Tüm sayfalar mobil cihazlardan masaüstü bilgisayarlara kadar farklı ekran boyutlarıyla uyumlu olacaktır.
5. **Hızlı Geri Bildirim**: Kullanıcı eylemleri anında görsel geri bildirimlerle desteklenecektir.

## Renk Şeması

Ana renk şeması aşağıdaki gibi olacaktır:

- **Ana Renk (Primary)**: #3B82F6 (Mavi)
- **İkincil Renk (Secondary)**: #10B981 (Yeşil)
- **Uyarı Rengi (Warning)**: #F59E0B (Turuncu)
- **Hata Rengi (Error)**: #EF4444 (Kırmızı)
- **Bilgi Rengi (Info)**: #6366F1 (Indigo)
- **Arka Plan (Background)**: #F9FAFB (Açık Gri)
- **Kart Arka Planı (Card Background)**: #FFFFFF (Beyaz)
- **Metin Rengi (Text Primary)**: #1F2937 (Koyu Gri)
- **İkincil Metin Rengi (Text Secondary)**: #6B7280 (Gri)

Ayrıca, durum bildirimleri için aşağıdaki renkler kullanılacaktır:
- **Açık Durum**: #3B82F6 (Mavi)
- **Atanmış Durum**: #8B5CF6 (Mor)
- **Beklemede Durum**: #F59E0B (Turuncu)
- **Çözülmüş Durum**: #10B981 (Yeşil)
- **Kapatılmış Durum**: #6B7280 (Gri)
- **Reddedilmiş Durum**: #EF4444 (Kırmızı)

## Tipografi

Web uygulamasında aşağıdaki yazı tipi ailesi kullanılacaktır:

- **Ana Yazı Tipi**: Inter
- **Monospace Yazı Tipi**: JetBrains Mono (kod blokları ve teknik bilgiler için)

Yazı boyutları için aşağıdaki ölçekler kullanılacaktır:
- Başlık 1: 2rem (32px)
- Başlık 2: 1.5rem (24px)
- Başlık 3: 1.25rem (20px)
- Normal metin: 1rem (16px)
- Küçük metin: 0.875rem (14px)
- Çok küçük metin: 0.75rem (12px)

## Simgeler ve İkonlar

Tüm uygulama genelinde [Heroicons](https://heroicons.com/) ve [Lucide Icons](https://lucide.dev/) kütüphaneleri kullanılacaktır. Tutarlılığı sağlamak için her simge tipi için belirli bir stil seçilecektir.

## Sayfa Yapısı ve Düzeni

### Genel Sayfa Yapısı

Tüm sayfalarda aşağıdaki genel yapı kullanılacaktır:

```
+---------------------------------------+
| Üst Çubuk (Header)                    |
+---------------------------------------+
| Kenar Menü | İçerik Alanı             |
| (Sidebar)  |                          |
|            |                          |
|            |                          |
|            |                          |
|            |                          |
+------------+--------------------------+
| Alt Bilgi (Footer)                    |
+---------------------------------------+
```

### Üst Çubuk (Header)

Üst çubuk aşağıdaki öğeleri içerecektir:
- Logo ve sistem adı (sol tarafta)
- Arama kutusu (orta)
- Bildirim zili (sağda)
- Kullanıcı menüsü (sağda, avatar ile)

### Kenar Menü (Sidebar)

Kenar menü, kullanıcı rolüne göre uyarlanacak ve aşağıdaki ana menü öğelerini içerecektir:
- Dashboard
- Sorunlar / Talepler
- Bilgi Bankası
- Raporlar
- Ayarlar
  - Kullanıcılar
  - Departmanlar
  - Kategoriler
  - SLA Kuralları
  - Şablonlar

### İçerik Alanı

İçerik alanı, seçilen menü öğesine göre dinamik olarak yüklenecektir. İçerik alanı sayfanın ana içeriğini gösterecek ve mobil cihazlarda tam genişlikte (kenar menüsü kapalı) olacaktır.

### Alt Bilgi (Footer)

Alt bilgi, aşağıdaki bilgileri içerecektir:
- Telif hakkı bilgisi
- Sistem versiyonu
- Yardım/Destek bağlantısı

## Anahtar Sayfalar ve Bileşenler

### 1. Giriş Sayfası (Login)

![Giriş Sayfası Mockup]

Giriş sayfası minimal bir tasarıma sahip olacak ve aşağıdaki öğeleri içerecektir:
- Logo ve sistem adı
- E-posta/kullanıcı adı alanı
- Şifre alanı
- "Beni Hatırla" seçeneği
- Giriş butonu
- Şifremi unuttum bağlantısı

### 2. Dashboard

![Dashboard Mockup]

Dashboard, kullanıcı rolüne göre özelleştirilmiş bir genel bakış sunacaktır:

- **Üst Kısım**: Özet kartları (açık sorunlar, çözülen sorunlar, bekleyen sorunlar, SLA uyum oranı)
- **Orta Kısım**: 
  - Sol: Sorun dağılımı grafiği (kategori bazlı)
  - Sağ: Sorun durumu zaman serisi grafiği
- **Alt Kısım**:
  - Sol: Son eklenen sorunlar listesi
  - Orta: Departman bazlı sorun dağılımı
  - Sağ: SLA uyarıları ve yaklaşan son tarihler

### 3. Sorunlar Listesi

![Sorunlar Listesi Mockup]

Sorunlar listesi, filtrelenebilir ve sıralanabilir bir tablo şeklinde sunulacaktır:

- **Üst Kısım**: 
  - Filtre araçları (durum, öncelik, kategori, departman, atanan kişi)
  - Arama alanı
  - "Yeni Sorun" butonu
- **Tablo**:
  - ID
  - Başlık (tıklanabilir)
  - Durum (renk kodlu rozet ile)
  - Öncelik (renk kodlu rozet ile)
  - Kategori
  - Departman
  - Bildiren
  - Atanan
  - Oluşturulma Tarihi
  - SLA Durumu
- **Alt Kısım**: Sayfalama kontrolü

### 4. Sorun Detayı

![Sorun Detayı Mockup]

Sorun detay sayfası, bir sorunun tüm bilgilerini ve geçmişini gösterecektir:

- **Üst Kısım**:
  - Sorun başlığı
  - Durum değiştirme menüsü
  - Atama/yeniden atama butonu
  - İşlem düğmeleri (düzenle, çözüm ekle, kapat)
- **Bilgi Kartı**:
  - Oluşturulma tarihi
  - Bildiren
  - Departman
  - Kategori
  - Öncelik
  - SLA hedef süresi/kalan süre
- **Açıklama Bölümü**: Sorun açıklaması
- **Sekmeler**:
  - Yorumlar
  - Çözüm ve Adımlar
  - Tarihçe
  - İlişkili Bilgi Bankası Makaleleri
- **Yorum/Çözüm Ekleme**: Alt kısımda form

### 5. Yeni Sorun Oluşturma

![Yeni Sorun Mockup]

Yeni sorun formunda aşağıdaki alanlar bulunacaktır:

- Başlık
- Açıklama (zengin metin editörü)
- Departman (seçim kutusu)
- Kategori (seçim kutusu)
- Öncelik (seçim kutusu)
- Dosya yükleme alanı
- Gönder/İptal butonları

### 6. Bilgi Bankası Ana Sayfası

![Bilgi Bankası Mockup]

Bilgi bankası ana sayfası aşağıdaki bölümleri içerecektir:

- **Üst Kısım**:
  - Arama kutusu (büyük)
  - Kategori filtreleri
  - "Yeni Makale Ekle" butonu
- **Popüler Makaleler**: En çok görüntülenen makalelerin kartları
- **Son Eklenen Makaleler**: Son eklenen makalelerin listesi
- **Kategorilere Göre Gözat**: Kategori kartları ve her biri altında ilgili makaleler

### 7. Bilgi Bankası Makale Detayı

![Makale Detayı Mockup]

Makale detay sayfası aşağıdaki bölümleri içerecektir:

- **Üst Kısım**:
  - Makale başlığı
  - Yazarı ve oluşturulma tarihi
  - Kategori etiketi
  - Düzenle/Sil butonları (yetkisi olanlar için)
- **İçerik Bölümü**: Zengin metin içeriği (resimler, kod blokları, listeler vb.)
- **Alt Kısım**:
  - "Bu makale faydalı mıydı?" oylaması
  - İlgili makaleler
  - Etiketler

### 8. Raporlar Sayfası

![Raporlar Mockup]

Raporlar sayfası, çeşitli rapor türlerini ve filtreleme seçeneklerini sunacaktır:

- **Üst Kısım**:
  - Rapor türü seçimi (açılır liste)
  - Tarih aralığı seçimi
  - Diğer filtreler (departman, kategori vb.)
  - "Rapor Oluştur" butonu
- **Grafikler ve Tablolar**: Seçilen rapora göre dinamik içerik
- **Alt Kısım**: PDF/Excel olarak dışa aktarma seçenekleri

## Responsive Tasarım Yaklaşımı

Uygulama, aşağıdaki ekran boyutları için optimize edilecektir:

- **Mobil**: < 640px
- **Tablet**: 640px - 1024px
- **Masaüstü**: > 1024px

Mobil cihazlarda:
- Kenar menü varsayılan olarak gizli olacak, hamburger simgesi ile açılabilecek
- Tablolar yatay kaydırma yerine kart görünümüne dönüşecek
- Formlar tek sütun olarak gösterilecek
- Grafikler ve kartlar tam genişlikte görüntülenecek

## Animasyonlar ve Geçişler

Kullanıcı deneyimini zenginleştirmek için aşağıdaki animasyonlar kullanılacaktır:

- Sayfa geçişleri için hafif soldurma
- Modal pencereler için ölçeklendirme animasyonu
- Bildirimler için kayarak girme
- Durum değişikliklerinde hafif vurgulama animasyonu
- Veri yüklenirken iskelet yükleyiciler (skeleton loaders)

## Erişilebilirlik Özellikleri

Uygulama, çeşitli erişilebilirlik özelliklerini içerecektir:

- Tüm giriş alanları için açıklayıcı etiketler
- Yeterli renk kontrastı
- Klavye navigasyon desteği
- Ekran okuyucu uyumluluğu
- Büyütülmüş metin desteği
- Alternatif metin (alt text) tüm anlamlı görseller için

## Mobil Deneyim İyileştirmeleri

Mobil kullanıcı deneyimini iyileştirmek için:

- Daha büyük dokunma hedefleri
- Alt tarafta sabitlenen eylem butonları
- Sürüklenebilir tablolar yerine kart görünümleri
- Hızlı eylemler için kaydırma hareketleri
- Mobil cihazlar için optimize edilmiş formlar

## UI Bileşen Kütüphanesi

Uygulama, aşağıdaki bileşen kütüphanesi üzerine inşa edilecektir:

- [shadcn/ui](https://ui.shadcn.com/) - Temel bileşen seti
- [React Hook Form](https://react-hook-form.com/) - Form yönetimi
- [Recharts](https://recharts.org/) - Grafikler ve veri görselleştirme
- [React Table](https://react-table.tanstack.com/) - Tablo ve veri listesi

## Kullanıcı Deneyimi Akışları

### 1. Sorun Bildirme Akışı
```
Ana Sayfa -> "Yeni Sorun" butonu -> Form doldurma -> Gönder -> Onay sayfası
```

### 2. Sorun Çözme Akışı
```
Sorunlar Listesi -> Sorun seçme -> Detayları inceleme -> Durumu "Atandı" olarak değiştirme -> 
Çözüm adımları ekleme -> Çözüm ekleme -> Durumu "Çözüldü" olarak değiştirme
```

### 3. Bilgi Bankası Kullanım Akışı
```
Sorun inceleme -> İlgili makaleleri görüntüleme -> Makaleyi açma -> 
Çözümü uygulama -> Sorun detayına dönme -> Çözüm ekleme
```

## Prototip ve Test Planı

1. **Düşük Sadakatli (Low-Fidelity) Prototip**:
   - Temel sayfa düzenleri için wireframe'ler
   - Ana kullanıcı akışlarının doğrulanması

2. **Yüksek Sadakatli (High-Fidelity) Prototip**:
   - Tam renk şeması ve tipografi ile tasarım
   - Etkileşimli prototip oluşturma
   - İç kullanıcılarla kullanılabilirlik testleri

3. **Test Planı**:
   - Görev tabanlı kullanılabilirlik testleri
   - A/B testleri (alternatif tasarımlar için)
   - Isı haritaları ve tıklama analizleri

## Gelecek İyileştirmeler

UI/UX'in ilk sürümünden sonra düşünülecek potansiyel iyileştirmeler:

- Tema desteği (açık/koyu mod)
- Kişiselleştirilebilir dashboard
- Gelişmiş veri görselleştirme araçları
- Etkileşimli walkthrough'lar ve kullanıcı rehberleri
- Sesli komut desteği
- Offline mod desteği 