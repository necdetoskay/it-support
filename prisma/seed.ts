import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Veritabanı seed işlemi başladı...')
  
  try {
    // Mevcut verileri temizle
    console.log('🧹 Mevcut kayıtlar temizleniyor...')
    await prisma.$executeRaw`TRUNCATE TABLE "Personel" CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "Departman" CASCADE;`
    
    // 10 Departman oluştur
    console.log('🏢 Departmanlar oluşturuluyor...')
    
    const departmanData = [
      { ad: 'Bilgi Teknolojileri', aciklama: 'Şirketin teknolojik altyapısını yöneten departman' },
      { ad: 'İnsan Kaynakları', aciklama: 'Personel ve işe alım süreçlerini yöneten departman' },
      { ad: 'Muhasebe', aciklama: 'Finansal operasyonları yöneten departman' },
      { ad: 'Satış ve Pazarlama', aciklama: 'Ürün ve hizmetleri pazarlayan departman' },
      { ad: 'Müşteri Hizmetleri', aciklama: 'Müşteri sorunlarına destek veren departman' },
      { ad: 'Ar-Ge', aciklama: 'Yeni ürün ve teknoloji geliştiren departman' },
      { ad: 'Üretim', aciklama: 'Ürün üretimini gerçekleştiren departman' },
      { ad: 'Lojistik', aciklama: 'Ürün dağıtım ve tedarik zincirini yöneten departman' },
      { ad: 'Kalite Kontrol', aciklama: 'Ürün ve hizmet kalitesini denetleyen departman' },
      { ad: 'Hukuk', aciklama: 'Şirketin yasal işlerini yürüten departman' }
    ];
    
    // Departmanları oluştur
    await prisma.$transaction(
      departmanData.map(data => 
        prisma.departman.create({
          data
        })
      )
    );
    
    console.log('✅ 10 departman başarıyla oluşturuldu');
    
    // Oluşturulan departmanları al
    const departmanlar = await prisma.departman.findMany();
    
    // 10 Personel oluştur
    console.log('👥 Personeller oluşturuluyor...');
    
    const personelData = [
      { ad: 'Ahmet Yılmaz', telefon: '5551112233', departmanId: departmanlar[0].id, aktif: true },
      { ad: 'Ayşe Kaya', telefon: '5552223344', departmanId: departmanlar[1].id, aktif: true },
      { ad: 'Mehmet Demir', telefon: '5553334455', departmanId: departmanlar[2].id, aktif: true },
      { ad: 'Zeynep Şahin', telefon: '5554445566', departmanId: departmanlar[3].id, aktif: true },
      { ad: 'Ali Öztürk', telefon: '5555556677', departmanId: departmanlar[4].id, aktif: true },
      { ad: 'Fatma Çelik', telefon: '5556667788', departmanId: departmanlar[5].id, aktif: true },
      { ad: 'Mustafa Aydın', telefon: '5557778899', departmanId: departmanlar[6].id, aktif: true },
      { ad: 'Esra Yıldız', telefon: '5558889900', departmanId: departmanlar[7].id, aktif: true },
      { ad: 'Hakan Koç', telefon: '5559990011', departmanId: departmanlar[8].id, aktif: true },
      { ad: 'Selin Aksoy', telefon: '5550001122', departmanId: departmanlar[9].id, aktif: true }
    ];
    
    // Personelleri oluştur
    await prisma.$transaction(
      personelData.map(data => 
        prisma.personel.create({
          data
        })
      )
    );
    
    console.log('✅ 10 personel başarıyla oluşturuldu');
    
    // İstatistik göster
    const departmanSayisi = await prisma.departman.count();
    const personelSayisi = await prisma.personel.count();
    
    console.log('📊 Oluşturulan kayıtların özeti:');
    console.log(`- Toplam departman sayısı: ${departmanSayisi}`);
    console.log(`- Toplam personel sayısı: ${personelSayisi}`);
    
    console.log('🌱 Seed işlemi başarıyla tamamlandı!');
  } catch (error) {
    console.error('❌ Seed işlemi sırasında hata oluştu:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 