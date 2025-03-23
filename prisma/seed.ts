import { PrismaClient, Oncelik, TalepDurum } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Departmanlar
  const departmanlar = [
    { ad: 'Bilgi İşlem', kod: 'IT' },
    { ad: 'İnsan Kaynakları', kod: 'HR' },
    { ad: 'Muhasebe', kod: 'ACC' },
    { ad: 'Satış', kod: 'SALES' },
    { ad: 'Pazarlama', kod: 'MKT' },
    { ad: 'Üretim', kod: 'PROD' },
    { ad: 'Lojistik', kod: 'LOG' },
    { ad: 'Ar-Ge', kod: 'RND' },
    { ad: 'Kalite Kontrol', kod: 'QA' },
    { ad: 'Yönetim', kod: 'MGT' }
  ]

  for (const dep of departmanlar) {
    await prisma.departman.create({
      data: {
        ad: dep.ad,
        kod: dep.kod,
        aciklama: `${dep.ad} departmanı`
      }
    })
  }

  // Kategoriler
  const kategoriler = [
    { ad: 'Donanım', kod: 'HW', aciklama: 'Donanım ile ilgili talepler' },
    { ad: 'Yazılım', kod: 'SW', aciklama: 'Yazılım ile ilgili talepler' },
    { ad: 'Network', kod: 'NET', aciklama: 'Ağ ile ilgili talepler' },
    { ad: 'Yazıcı', kod: 'PRN', aciklama: 'Yazıcı sorunları' },
    { ad: 'E-posta', kod: 'MAIL', aciklama: 'E-posta sorunları' },
    { ad: 'Erişim', kod: 'ACC', aciklama: 'Erişim yetkilendirme talepleri' },
    { ad: 'Güvenlik', kod: 'SEC', aciklama: 'Güvenlik ile ilgili talepler' },
    { ad: 'Telefon', kod: 'PHN', aciklama: 'Telefon sorunları' },
    { ad: 'VPN', kod: 'VPN', aciklama: 'VPN sorunları' },
    { ad: 'Diğer', kod: 'OTH', aciklama: 'Diğer talepler' }
  ]

  for (const kat of kategoriler) {
    await prisma.kategori.create({
      data: {
        ad: kat.ad,
        kod: kat.kod,
        aciklama: kat.aciklama
      }
    })
  }

  // SLA Kuralları
  const departmanlar_data = await prisma.departman.findMany()
  const kategoriler_data = await prisma.kategori.findMany()

  for (const kat of kategoriler_data) {
    await prisma.sLAKural.create({
      data: {
        kategoriId: kat.id,
        oncelik: Oncelik.YUKSEK,
        yanitlamaSuresi: 30, // 30 dakika
        cozumSuresi: 240 // 4 saat
      }
    })
  }

  // Personel
  const personeller = [
    { ad: 'Ahmet Yılmaz', telefon: '5551112233', departmanKod: 'IT' },
    { ad: 'Ayşe Demir', telefon: '5551112234', departmanKod: 'HR' },
    { ad: 'Mehmet Kaya', telefon: '5551112235', departmanKod: 'ACC' },
    { ad: 'Fatma Şahin', telefon: '5551112236', departmanKod: 'SALES' },
    { ad: 'Ali Öztürk', telefon: '5551112237', departmanKod: 'MKT' },
    { ad: 'Zeynep Çelik', telefon: '5551112238', departmanKod: 'PROD' },
    { ad: 'Mustafa Aydın', telefon: '5551112239', departmanKod: 'LOG' },
    { ad: 'Elif Yıldız', telefon: '5551112240', departmanKod: 'RND' },
    { ad: 'Can Aksoy', telefon: '5551112241', departmanKod: 'QA' },
    { ad: 'Selin Koç', telefon: '5551112242', departmanKod: 'MGT' }
  ]

  for (const per of personeller) {
    const departman = departmanlar_data.find(d => d.kod === per.departmanKod)
    if (departman) {
      await prisma.personel.create({
        data: {
          ad: per.ad,
          telefon: per.telefon,
          departmanId: departman.id
        }
      })
    }
  }

  // Web Kullanıcıları
  const users = [
    { name: 'Admin User', email: 'admin@example.com', role: 'ADMIN' },
    { name: 'Normal User 1', email: 'user1@example.com', role: 'USER' },
    { name: 'Normal User 2', email: 'user2@example.com', role: 'USER' },
    { name: 'Normal User 3', email: 'user3@example.com', role: 'USER' },
    { name: 'Normal User 4', email: 'user4@example.com', role: 'USER' },
    { name: 'Normal User 5', email: 'user5@example.com', role: 'USER' },
    { name: 'Normal User 6', email: 'user6@example.com', role: 'USER' },
    { name: 'Normal User 7', email: 'user7@example.com', role: 'USER' },
    { name: 'Normal User 8', email: 'user8@example.com', role: 'USER' },
    { name: 'Normal User 9', email: 'user9@example.com', role: 'USER' }
  ]

  for (const user of users) {
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: await hash('password123', 12),
        role: user.role
      }
    })
  }

  // Problem ve Çözüm Etiketleri
  const sorunEtiketler = [
    'Bağlantı Sorunu',
    'Performans',
    'Hata Mesajı',
    'Güncelleme',
    'Kurulum',
    'Yapılandırma',
    'Veri Kaybı',
    'Erişim Sorunu',
    'Güvenlik Uyarısı',
    'Sistem Hatası'
  ]

  const cozumEtiketler = [
    'Yeniden Başlatma',
    'Güncelleme',
    'Yapılandırma',
    'Parça Değişimi',
    'Yetkilendirme',
    'Veri Kurtarma',
    'Eğitim',
    'Bakım',
    'Yükseltme',
    'Optimizasyon'
  ]

  for (const etiket of sorunEtiketler) {
    await prisma.sorunEtiket.create({
      data: {
        ad: etiket,
        aciklama: `${etiket} ile ilgili sorunlar`
      }
    })
  }

  for (const etiket of cozumEtiketler) {
    await prisma.cozumEtiket.create({
      data: {
        ad: etiket,
        aciklama: `${etiket} çözüm yöntemi`
      }
    })
  }

  // Örnek Talepler
  const personel_data = await prisma.personel.findMany()
  const users_data = await prisma.user.findMany()
  const sorunEtiketler_data = await prisma.sorunEtiket.findMany()
  const cozumEtiketler_data = await prisma.cozumEtiket.findMany()

  const talepOrnekleri = [
    {
      baslik: 'Yazıcı çalışmıyor',
      aciklama: 'Departman yazıcısı kağıt sıkışması hatası veriyor',
      kategoriKod: 'PRN',
      departmanKod: 'HR',
      oncelik: Oncelik.ORTA
    },
    {
      baslik: 'E-posta erişim sorunu',
      aciklama: 'E-postalara erişilemiyor',
      kategoriKod: 'MAIL',
      departmanKod: 'SALES',
      oncelik: Oncelik.YUKSEK
    },
    {
      baslik: 'Bilgisayar açılmıyor',
      aciklama: 'Bilgisayar açılışta mavi ekran hatası veriyor',
      kategoriKod: 'HW',
      departmanKod: 'ACC',
      oncelik: Oncelik.ACIL
    },
    {
      baslik: 'Internet bağlantısı yok',
      aciklama: 'Departman internet bağlantısı kesik',
      kategoriKod: 'NET',
      departmanKod: 'MKT',
      oncelik: Oncelik.YUKSEK
    },
    {
      baslik: 'Sistem erişim yetkisi',
      aciklama: 'Yeni personel için sistem erişim yetkisi',
      kategoriKod: 'ACC',
      departmanKod: 'HR',
      oncelik: Oncelik.ORTA
    },
    {
      baslik: 'VPN bağlantı sorunu',
      aciklama: 'Uzaktan çalışma VPN bağlantısı kurulamıyor',
      kategoriKod: 'VPN',
      departmanKod: 'RND',
      oncelik: Oncelik.YUKSEK
    },
    {
      baslik: 'Yazılım güncelleme',
      aciklama: 'Muhasebe yazılımı güncellemesi gerekiyor',
      kategoriKod: 'SW',
      departmanKod: 'ACC',
      oncelik: Oncelik.DUSUK
    },
    {
      baslik: 'Telefon arızası',
      aciklama: 'IP telefon çalışmıyor',
      kategoriKod: 'PHN',
      departmanKod: 'SALES',
      oncelik: Oncelik.ORTA
    },
    {
      baslik: 'Virüs uyarısı',
      aciklama: 'Bilgisayarda virüs tespit edildi',
      kategoriKod: 'SEC',
      departmanKod: 'MKT',
      oncelik: Oncelik.YUKSEK
    },
    {
      baslik: 'Dosya sunucusu hatası',
      aciklama: 'Paylaşılan dosyalara erişilemiyor',
      kategoriKod: 'NET',
      departmanKod: 'PROD',
      oncelik: Oncelik.ACIL
    }
  ]

  for (const talep of talepOrnekleri) {
    const kategori = kategoriler_data.find(k => k.kod === talep.kategoriKod)
    const departman = departmanlar_data.find(d => d.kod === talep.departmanKod)
    const raporEden = personel_data.find(p => p.departmanId === departman?.id)
    const atanan = users_data[Math.floor(Math.random() * users_data.length)]
    
    if (kategori && departman && raporEden) {
      const yeniTalep = await prisma.talep.create({
        data: {
          baslik: talep.baslik,
          aciklama: talep.aciklama,
          sorunDetay: `${talep.aciklama} - Detaylı açıklama`,
          kategoriId: kategori.id,
          departmanId: departman.id,
          oncelik: talep.oncelik,
          durum: TalepDurum.ACIK,
          raporEdenId: raporEden.id,
          atananId: atanan.id,
          sorunEtiketleri: {
            connect: [{ id: sorunEtiketler_data[Math.floor(Math.random() * sorunEtiketler_data.length)].id }]
          }
        }
      })

      // Talep yorumu ekle
      await prisma.talepYorum.create({
        data: {
          talepId: yeniTalep.id,
          userId: atanan.id,
          icerik: 'Talep inceleniyor...',
          dahili: false
        }
      })

      // Talep güncellemesi ekle
      await prisma.talepGuncelleme.create({
        data: {
          talepId: yeniTalep.id,
          userId: atanan.id,
          durum: TalepDurum.ISLEMDE,
          aciklama: 'Talep işleme alındı'
        }
      })
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 