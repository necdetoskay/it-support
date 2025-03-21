const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Önce veritabanını temizle
  await prisma.$transaction([
    prisma.talep.deleteMany(),
    prisma.sorunEtiket.deleteMany(),
    prisma.cozumEtiket.deleteMany(),
    prisma.sLAKural.deleteMany(),
    prisma.personel.deleteMany(),
    prisma.kategori.deleteMany(),
    prisma.departman.deleteMany(),
    prisma.user.deleteMany(),
  ])

  // Departmanlar
  const departmanlar = await Promise.all([
    prisma.departman.create({
      data: {
        ad: 'Bilgi İşlem',
        aciklama: 'Bilgi İşlem Departmanı',
      },
    }),
    prisma.departman.create({
      data: {
        ad: 'İnsan Kaynakları',
        aciklama: 'İnsan Kaynakları Departmanı',
      },
    }),
    prisma.departman.create({
      data: {
        ad: 'Muhasebe',
        aciklama: 'Muhasebe Departmanı',
      },
    }),
  ])

  // Kategoriler
  const kategoriler = await Promise.all([
    prisma.kategori.create({
      data: {
        ad: 'Donanım',
        kod: 'DONANIM',
        aciklama: 'Donanım ile ilgili talepler',
      },
    }),
    prisma.kategori.create({
      data: {
        ad: 'Yazılım',
        kod: 'YAZILIM',
        aciklama: 'Yazılım ile ilgili talepler',
      },
    }),
    prisma.kategori.create({
      data: {
        ad: 'Ağ',
        kod: 'AG',
        aciklama: 'Ağ ile ilgili talepler',
      },
    }),
    prisma.kategori.create({
      data: {
        ad: 'Erişim',
        kod: 'ERISIM',
        aciklama: 'Erişim ile ilgili talepler',
      },
    }),
  ])

  // SLA Kuralları
  const slaKurallari = await Promise.all([
    prisma.sLAKural.create({
      data: {
        kategoriId: kategoriler[0].id, // Donanım
        oncelik: 'ACIL',
        yanitlamaSuresi: 1,
        cozumSuresi: 4,
      },
    }),
    prisma.sLAKural.create({
      data: {
        kategoriId: kategoriler[1].id, // Yazılım
        oncelik: 'YUKSEK',
        yanitlamaSuresi: 2,
        cozumSuresi: 8,
      },
    }),
    prisma.sLAKural.create({
      data: {
        kategoriId: kategoriler[2].id, // Ağ
        oncelik: 'ACIL',
        yanitlamaSuresi: 1,
        cozumSuresi: 4,
      },
    }),
  ])

  // Web Kullanıcıları
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu9.m', // "password123"
        role: 'ADMIN',
        isApproved: true,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Mehmet Kaya',
        email: 'mehmet@example.com',
        password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu9.m', // "password123"
        role: 'USER',
        isApproved: true,
      },
    }),
  ])

  // Personel
  const personeller = await Promise.all([
    prisma.personel.create({
      data: {
        ad: 'Ahmet',
        soyad: 'Yılmaz',
        departmanId: departmanlar[0].id,
        telefon: '555-0001',
      },
    }),
    prisma.personel.create({
      data: {
        ad: 'Mehmet',
        soyad: 'Kaya',
        departmanId: departmanlar[1].id,
        telefon: '555-0002',
      },
    }),
  ])

  // Problem ve Çözüm Etiketleri
  const sorunEtiketleri = await Promise.all([
    prisma.sorunEtiket.create({
      data: {
        ad: 'Donanım Arızası',
        aciklama: 'Donanım ile ilgili sorunlar',
      },
    }),
    prisma.sorunEtiket.create({
      data: {
        ad: 'Yazılım Hatası',
        aciklama: 'Yazılım ile ilgili sorunlar',
      },
    }),
    prisma.sorunEtiket.create({
      data: {
        ad: 'Ağ Bağlantı Sorunu',
        aciklama: 'Ağ bağlantısı ile ilgili sorunlar',
      },
    }),
  ])

  const cozumEtiketleri = await Promise.all([
    prisma.cozumEtiket.create({
      data: {
        ad: 'Donanım Değişimi',
        aciklama: 'Donanım değişimi ile çözülen sorunlar',
      },
    }),
    prisma.cozumEtiket.create({
      data: {
        ad: 'Yazılım Güncelleme',
        aciklama: 'Yazılım güncellemesi ile çözülen sorunlar',
      },
    }),
    prisma.cozumEtiket.create({
      data: {
        ad: 'Ağ Yapılandırması',
        aciklama: 'Ağ yapılandırması ile çözülen sorunlar',
      },
    }),
  ])

  // Talepler
  const talepler = await Promise.all([
    prisma.talep.create({
      data: {
        baslik: 'Bilgisayar Açılmıyor',
        aciklama: 'Bilgisayar açılmıyor, ekran siyah kalıyor',
        kategoriId: kategoriler[0].id,
        departmanId: departmanlar[0].id,
        oncelik: 'ACIL',
        raporEdenId: personeller[0].id,
        sorunDetay: 'Bilgisayar açılışta siyah ekran veriyor',
      },
    }),
    prisma.talep.create({
      data: {
        baslik: 'Excel Programı Çalışmıyor',
        aciklama: 'Excel programı açılmıyor',
        kategoriId: kategoriler[1].id,
        departmanId: departmanlar[1].id,
        oncelik: 'YUKSEK',
        raporEdenId: personeller[1].id,
        sorunDetay: 'Excel programı açılışta hata veriyor',
      },
    }),
    prisma.talep.create({
      data: {
        baslik: 'İnternet Bağlantısı Yok',
        aciklama: 'İnternet bağlantısı çalışmıyor',
        kategoriId: kategoriler[2].id,
        departmanId: departmanlar[0].id,
        oncelik: 'ACIL',
        raporEdenId: personeller[0].id,
        sorunDetay: 'İnternet bağlantısı kesik',
      },
    }),
  ])

  // Talep İşlemleri
  const talepIslemleri = await Promise.all([
    prisma.talepIslem.create({
      data: {
        tip: 'INCELEME',
        aciklama: 'Bilgisayar incelendi',
        durum: 'DEVAM_EDIYOR',
        talepId: talepler[0].id,
        yapanKullaniciId: users[0].id,
      },
    }),
    prisma.talepIslem.create({
      data: {
        tip: 'COZUM',
        aciklama: 'Excel programı yeniden yüklendi',
        durum: 'TAMAMLANDI',
        talepId: talepler[1].id,
        yapanKullaniciId: users[0].id,
      },
    }),
    prisma.talepIslem.create({
      data: {
        tip: 'INCELEME',
        aciklama: 'Ağ bağlantısı kontrol edildi',
        durum: 'DEVAM_EDIYOR',
        talepId: talepler[2].id,
        yapanKullaniciId: users[0].id,
      },
    }),
  ])

  // Talep-Sorun Etiketleri ilişkilerini oluştur
  await Promise.all([
    prisma.talep.update({
      where: { id: talepler[0].id },
      data: {
        sorunEtiketleri: {
          connect: { id: sorunEtiketleri[0].id },
        },
      },
    }),
    prisma.talep.update({
      where: { id: talepler[1].id },
      data: {
        sorunEtiketleri: {
          connect: { id: sorunEtiketleri[1].id },
        },
      },
    }),
    prisma.talep.update({
      where: { id: talepler[2].id },
      data: {
        sorunEtiketleri: {
          connect: { id: sorunEtiketleri[2].id },
        },
      },
    }),
  ])

  // Talep-Çözüm Etiketleri ilişkilerini oluştur
  await Promise.all([
    prisma.talep.update({
      where: { id: talepler[1].id },
      data: {
        cozumEtiketleri: {
          connect: { id: cozumEtiketleri[1].id },
        },
      },
    }),
  ])

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 