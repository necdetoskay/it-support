const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')

const prisma = new PrismaClient()

async function main() {
  console.log('Veritabanı seed işlemi başlatılıyor...')

  // Departmanlar
  const departmanlar = [
    { id: uuidv4(), ad: 'Bilgi Teknolojileri', aciklama: 'IT departmanı' },
    { id: uuidv4(), ad: 'İnsan Kaynakları', aciklama: 'HR departmanı' },
    { id: uuidv4(), ad: 'Muhasebe', aciklama: 'Finans departmanı' },
    { id: uuidv4(), ad: 'Satış', aciklama: 'Satış departmanı' },
    { id: uuidv4(), ad: 'Pazarlama', aciklama: 'Pazarlama departmanı' },
  ]

  for (const departman of departmanlar) {
    await prisma.departman.upsert({
      where: { id: departman.id },
      update: {},
      create: departman,
    })
  }
  
  console.log('Departmanlar oluşturuldu')

  // Kategoriler
  const kategoriler = [
    { id: uuidv4(), ad: 'Donanım', aciklama: 'Donanım sorunları' },
    { id: uuidv4(), ad: 'Yazılım', aciklama: 'Yazılım sorunları' },
    { id: uuidv4(), ad: 'Ağ', aciklama: 'Ağ sorunları' },
    { id: uuidv4(), ad: 'Güvenlik', aciklama: 'Güvenlik sorunları' },
    { id: uuidv4(), ad: 'Diğer', aciklama: 'Diğer sorunlar' },
  ]

  for (const kategori of kategoriler) {
    await prisma.kategori.upsert({
      where: { id: kategori.id },
      update: {},
      create: kategori,
    })
  }
  
  console.log('Kategoriler oluşturuldu')

  // Personeller
  const personeller = [
    {
      id: uuidv4(),
      ad: 'Ahmet',
      soyad: 'Yılmaz',
      departmanId: (await prisma.departman.findFirst({ where: { ad: 'Bilgi Teknolojileri' } })).id,
      telefon: '5551234567',
    },
    {
      id: uuidv4(),
      ad: 'Mehmet',
      soyad: 'Kaya',
      departmanId: (await prisma.departman.findFirst({ where: { ad: 'İnsan Kaynakları' } })).id,
      telefon: '5551234568',
    },
    {
      id: uuidv4(),
      ad: 'Ayşe',
      soyad: 'Demir',
      departmanId: (await prisma.departman.findFirst({ where: { ad: 'Muhasebe' } })).id,
      telefon: '5551234569',
    },
  ]

  for (const personel of personeller) {
    await prisma.personel.upsert({
      where: { id: personel.id },
      update: {},
      create: personel,
    })
  }
  
  console.log('Personeller oluşturuldu')

  // SLA Kuralları
  const slaKurallari = [
    {
      id: uuidv4(),
      kategoriId: (await prisma.kategori.findFirst({ where: { ad: 'Donanım' } })).id,
      oncelik: 'YUKSEK',
      yanitlamaSuresi: 2,
      cozumSuresi: 8,
    },
    {
      id: uuidv4(),
      kategoriId: (await prisma.kategori.findFirst({ where: { ad: 'Yazılım' } })).id,
      oncelik: 'ORTA',
      yanitlamaSuresi: 4,
      cozumSuresi: 16,
    },
    {
      id: uuidv4(),
      kategoriId: (await prisma.kategori.findFirst({ where: { ad: 'Ağ' } })).id,
      oncelik: 'ACIL',
      yanitlamaSuresi: 1,
      cozumSuresi: 4,
    },
  ]

  for (const sla of slaKurallari) {
    await prisma.sLAKural.upsert({
      where: { id: sla.id },
      update: {},
      create: sla,
    })
  }
  
  console.log('SLA kuralları oluşturuldu')

  // Admin kullanıcısı
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      id: uuidv4(),
      name: 'Admin',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
      isApproved: true,
    },
  })
  console.log('Admin kullanıcısı oluşturuldu')
}

main()
  .catch(e => {
    console.error('Seed işlemi sırasında hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 