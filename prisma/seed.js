const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Veritabanı seed işlemi başlatılıyor...')

  // Kullanıcılar oluşturma
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin Kullanıcı',
      email: 'admin@example.com',
      password: await bcrypt.hash('P@ssw0rd', 10),
      role: 'ADMIN',
      isApproved: true
    }
  })

  const supportUser = await prisma.user.upsert({
    where: { email: 'destek@example.com' },
    update: {},
    create: {
      name: 'Destek Uzmanı',
      email: 'destek@example.com',
      password: await bcrypt.hash('P@ssw0rd', 10),
      role: 'USER',
      isApproved: true
    }
  })
  
  const supportUser2 = await prisma.user.upsert({
    where: { email: 'teknisyen@example.com' },
    update: {},
    create: {
      name: 'Teknisyen',
      email: 'teknisyen@example.com',
      password: await bcrypt.hash('P@ssw0rd', 10),
      role: 'USER',
      isApproved: true
    }
  })

  // Departmanlar oluşturma
  const departmanlar = [
    { ad: 'Bilgi İşlem', aciklama: 'BT ve IT hizmetleri' },
    { ad: 'Muhasebe', aciklama: 'Finans ve muhasebe işlemleri' },
    { ad: 'İnsan Kaynakları', aciklama: 'Personel ve işe alım süreçleri' },
    { ad: 'Pazarlama', aciklama: 'Pazarlama ve reklam faaliyetleri' },
    { ad: 'Satış', aciklama: 'Satış ve müşteri ilişkileri' },
    { ad: 'Üretim', aciklama: 'Üretim ve imalat süreçleri' },
    { ad: 'Ar-Ge', aciklama: 'Araştırma ve geliştirme faaliyetleri' },
    { ad: 'Lojistik', aciklama: 'Sevkiyat ve depolama işlemleri' },
    { ad: 'Kalite Kontrol', aciklama: 'Ürün kalite güvence süreçleri' },
    { ad: 'Yönetim', aciklama: 'Şirket yönetimi ve idari işler' }
  ]

  for (const departman of departmanlar) {
    await prisma.departman.upsert({
      where: { ad: departman.ad },
      update: {},
      create: departman
    })
  }
  
  console.log('Departmanlar oluşturuldu')

  // Kategoriler oluşturma
  const kategoriler = [
    { ad: 'Donanım', aciklama: 'Bilgisayar, yazıcı ve diğer donanım sorunları' },
    { ad: 'Yazılım', aciklama: 'Uygulama, işletim sistemi ve yazılım sorunları' },
    { ad: 'Ağ', aciklama: 'İnternet, yerel ağ ve bağlantı sorunları' },
    { ad: 'Erişim', aciklama: 'Sistem erişimi, şifre ve yetkilendirme sorunları' },
    { ad: 'E-posta', aciklama: 'E-posta alımı, gönderimi ve yapılandırma sorunları' },
    { ad: 'Güvenlik', aciklama: 'Virüs, malware ve güvenlik sorunları' },
    { ad: 'Eğitim', aciklama: 'Sistemlerin kullanımı konusunda eğitim talepleri' },
    { ad: 'Veri', aciklama: 'Veri kaybı, yedekleme ve geri yükleme sorunları' },
    { ad: 'Mobil', aciklama: 'Mobil cihazlar ve uygulamalarla ilgili sorunlar' },
    { ad: 'Diğer', aciklama: 'Diğer IT destek talepleri' }
  ]

  for (const kategori of kategoriler) {
    await prisma.kategori.create({
      data: {
        ad: kategori.ad,
        aciklama: kategori.aciklama
      }
    })
  }
  
  console.log('Kategoriler oluşturuldu')

  // Departmanları getir
  const departmanRecords = await prisma.departman.findMany()
  
  // Personeller oluşturma
  const personeller = [
    { ad: 'Ahmet', soyad: 'Yılmaz', telefon: '5551112233', departmanId: departmanRecords[1].id }, // Muhasebe
    { ad: 'Mehmet', soyad: 'Kaya', telefon: '5552223344', departmanId: departmanRecords[0].id }, // Bilgi İşlem
    { ad: 'Ayşe', soyad: 'Demir', telefon: '5553334455', departmanId: departmanRecords[2].id }, // İnsan Kaynakları
    { ad: 'Fatma', soyad: 'Çelik', telefon: '5554445566', departmanId: departmanRecords[3].id }, // Pazarlama
    { ad: 'Ali', soyad: 'Öztürk', telefon: '5555556677', departmanId: departmanRecords[4].id }, // Satış
    { ad: 'Zeynep', soyad: 'Aksoy', telefon: '5556667788', departmanId: departmanRecords[5].id }, // Üretim
    { ad: 'Mustafa', soyad: 'Şahin', telefon: '5557778899', departmanId: departmanRecords[6].id }, // Ar-Ge
    { ad: 'Emine', soyad: 'Yıldız', telefon: '5558889900', departmanId: departmanRecords[7].id }, // Lojistik
    { ad: 'Hasan', soyad: 'Aydın', telefon: '5559990011', departmanId: departmanRecords[8].id }, // Kalite Kontrol
    { ad: 'Hatice', soyad: 'Kılıç', telefon: '5550001122', departmanId: departmanRecords[9].id }  // Yönetim
  ]

  for (const personel of personeller) {
    await prisma.personel.create({
      data: personel
    })
  }
  
  console.log('Personeller oluşturuldu')

  // Personelleri ve kategorileri getir
  const personelRecords = await prisma.personel.findMany()
  const kategoriRecords = await prisma.kategori.findMany()
  
  // SLA kuralları oluşturma
  const slaKurallari = [
    { kategoriId: kategoriRecords[0].id, oncelik: 'DUSUK', yanitlamaSuresi: 24, cozumSuresi: 72 }, // Donanım - Düşük
    { kategoriId: kategoriRecords[0].id, oncelik: 'ORTA', yanitlamaSuresi: 8, cozumSuresi: 48 },   // Donanım - Orta
    { kategoriId: kategoriRecords[0].id, oncelik: 'YUKSEK', yanitlamaSuresi: 4, cozumSuresi: 24 }, // Donanım - Yüksek
    { kategoriId: kategoriRecords[0].id, oncelik: 'ACIL', yanitlamaSuresi: 1, cozumSuresi: 8 },    // Donanım - Acil
    { kategoriId: kategoriRecords[1].id, oncelik: 'DUSUK', yanitlamaSuresi: 24, cozumSuresi: 72 }, // Yazılım - Düşük
    { kategoriId: kategoriRecords[1].id, oncelik: 'ORTA', yanitlamaSuresi: 8, cozumSuresi: 48 },   // Yazılım - Orta
    { kategoriId: kategoriRecords[1].id, oncelik: 'YUKSEK', yanitlamaSuresi: 4, cozumSuresi: 24 }, // Yazılım - Yüksek
    { kategoriId: kategoriRecords[1].id, oncelik: 'ACIL', yanitlamaSuresi: 1, cozumSuresi: 8 },    // Yazılım - Acil
    { kategoriId: kategoriRecords[2].id, oncelik: 'ORTA', yanitlamaSuresi: 8, cozumSuresi: 48 },   // Ağ - Orta
    { kategoriId: kategoriRecords[2].id, oncelik: 'ACIL', yanitlamaSuresi: 1, cozumSuresi: 4 }     // Ağ - Acil
  ]

  for (const sla of slaKurallari) {
    await prisma.sLAKural.create({
      data: sla
    })
  }
  
  console.log('SLA kuralları oluşturuldu')

  // Talepler oluşturma
  const talepler = [
    {
      baslik: 'Bilgisayarım açılmıyor',
      sorunDetay: 'Bilgisayarımı açtığımda siyah ekranda kalıyor ve hiçbir şey olmuyor.',
      kategoriId: kategoriRecords[0].id, // Donanım
      departmanId: departmanRecords[1].id, // Muhasebe
      oncelik: 'YUKSEK',
      durum: 'DEVAM_EDIYOR',
      raporEdenId: personelRecords[0].id, // Ahmet Yılmaz
      atananId: supportUser.id,
      sonTarih: new Date(new Date().setDate(new Date().getDate() + 2))
    },
    {
      baslik: 'Excel dosyası açılmıyor',
      sorunDetay: 'Önemli bir Excel dosyasını açmaya çalıştığımda "dosya bozuk" hatası alıyorum.',
      kategoriId: kategoriRecords[1].id, // Yazılım
      departmanId: departmanRecords[1].id, // Muhasebe
      oncelik: 'ORTA',
      durum: 'BEKLEMEDE',
      raporEdenId: personelRecords[0].id, // Ahmet Yılmaz
      atananId: supportUser.id
    },
    {
      baslik: 'İnternet bağlantısı kesiliyor',
      sorunDetay: 'İnternet bağlantım sürekli kesiliyor ve tekrar bağlanıyor. Çalışmalarımı olumsuz etkiliyor.',
      kategoriId: kategoriRecords[2].id, // Ağ
      departmanId: departmanRecords[4].id, // Satış
      oncelik: 'YUKSEK',
      durum: 'DEVAM_EDIYOR',
      raporEdenId: personelRecords[4].id, // Ali Öztürk
      atananId: supportUser2.id
    },
    {
      baslik: 'E-posta gönderemiyorum',
      sorunDetay: 'Outlook üzerinden e-posta göndermeye çalıştığımda "sunucuya bağlanılamadı" hatası alıyorum.',
      kategoriId: kategoriRecords[4].id, // E-posta
      departmanId: departmanRecords[3].id, // Pazarlama
      oncelik: 'YUKSEK',
      durum: 'TAMAMLANDI',
      raporEdenId: personelRecords[3].id, // Fatma Çelik
      atananId: supportUser.id,
      kapatilmaTarihi: new Date()
    },
    {
      baslik: 'Yazıcı kağıt sıkışması',
      sorunDetay: 'Departman yazıcısında sürekli kağıt sıkışması yaşıyoruz. Acil müdahale gerekiyor.',
      kategoriId: kategoriRecords[0].id, // Donanım
      departmanId: departmanRecords[2].id, // İnsan Kaynakları
      oncelik: 'ORTA',
      durum: 'DEVAM_EDIYOR',
      raporEdenId: personelRecords[2].id, // Ayşe Demir
      atananId: supportUser2.id
    },
    {
      baslik: 'Yeni yazılım kurulumu',
      sorunDetay: 'Tasarım departmanı için Adobe Creative Cloud kurulumu yapılması gerekiyor.',
      kategoriId: kategoriRecords[1].id, // Yazılım
      departmanId: departmanRecords[3].id, // Pazarlama
      oncelik: 'DUSUK',
      durum: 'BEKLEMEDE',
      raporEdenId: personelRecords[3].id, // Fatma Çelik
      atananId: null
    },
    {
      baslik: 'Virüs uyarısı',
      sorunDetay: 'Bilgisayarımda virüs uyarısı alıyorum. Antivirüs yazılımı sürekli uyarı veriyor.',
      kategoriId: kategoriRecords[5].id, // Güvenlik
      departmanId: departmanRecords[6].id, // Ar-Ge
      oncelik: 'ACIL',
      durum: 'TAMAMLANDI',
      raporEdenId: personelRecords[6].id, // Mustafa Şahin
      atananId: supportUser.id,
      kapatilmaTarihi: new Date(new Date().setDate(new Date().getDate() - 1))
    },
    {
      baslik: 'VPN bağlantı sorunu',
      sorunDetay: 'Uzaktan çalışırken VPN bağlantısı kuramıyorum. Şirket kaynaklarına erişemiyorum.',
      kategoriId: kategoriRecords[2].id, // Ağ
      departmanId: departmanRecords[9].id, // Yönetim
      oncelik: 'ACIL',
      durum: 'DEVAM_EDIYOR',
      raporEdenId: personelRecords[9].id, // Hatice Kılıç
      atananId: supportUser2.id
    },
    {
      baslik: 'Yedek alma hatası',
      sorunDetay: 'Otomatik yedekleme sistemi hata veriyor. Veri kaybı yaşanabilir.',
      kategoriId: kategoriRecords[7].id, // Veri
      departmanId: departmanRecords[0].id, // Bilgi İşlem
      oncelik: 'ACIL',
      durum: 'TAMAMLANDI',
      raporEdenId: personelRecords[1].id, // Mehmet Kaya
      atananId: supportUser.id,
      kapatilmaTarihi: new Date(new Date().setDate(new Date().getDate() - 3))
    },
    {
      baslik: 'Şirket telefonu arızası',
      sorunDetay: 'Şirket telefonum şarj olmuyor ve ekran sürekli donuyor.',
      kategoriId: kategoriRecords[8].id, // Mobil
      departmanId: departmanRecords[4].id, // Satış
      oncelik: 'ORTA',
      durum: 'BEKLEMEDE',
      raporEdenId: personelRecords[4].id, // Ali Öztürk
      atananId: supportUser2.id
    }
  ]

  for (const talep of talepler) {
    const createdTalep = await prisma.talep.create({
      data: talep
    })
    
    // Tamamlanan talepler için işlem oluşturma
    if (talep.durum === 'TAMAMLANDI') {
      await prisma.talepIslem.create({
        data: {
          tip: 'TAMAMLANDI',
          aciklama: 'Sorun tespit edildi ve çözüldü.',
          durum: 'TAMAMLANDI',
          talepId: createdTalep.id,
          yapanKullaniciId: talep.atananId
        }
      })
    }
    
    // Beklemede olan talepler için işlem oluşturma
    if (talep.durum === 'BEKLEMEDE') {
      await prisma.talepIslem.create({
        data: {
          tip: 'BEKLEMEDE',
          aciklama: 'Sorun inceleniyor, gerekli parçalar bekleniyor.',
          durum: 'BEKLEMEDE',
          talepId: createdTalep.id,
          yapanKullaniciId: talep.atananId || supportUser.id
        }
      })
    }
    
    // Devam eden talepler için işlem oluşturma
    if (talep.durum === 'DEVAM_EDIYOR') {
      await prisma.talepIslem.create({
        data: {
          tip: 'INCELEME',
          aciklama: 'Sorun üzerinde çalışılıyor.',
          durum: 'DEVAM_EDIYOR',
          talepId: createdTalep.id,
          yapanKullaniciId: talep.atananId || supportUser.id
        }
      })
    }
  }
  
  console.log('Talepler ve işlemler oluşturuldu')

  console.log('Seed işlemi başarıyla tamamlandı!')
}

main()
  .catch(e => {
    console.error('Seed işlemi sırasında hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 