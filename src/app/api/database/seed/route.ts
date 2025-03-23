import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';
import { faker } from '@faker-js/faker';

// Tablo başına oluşturulabilecek maksimum kayıt sayısı
const MAX_RECORDS_PER_TABLE = 100;

// Seed yapılacak tablo listesi
interface SeedTable {
  table_name: string;
  count: number;
}

export async function POST(request: Request) {
  try {
    console.log("Seed API çağrıldı");
    
    // Yetkilendirme kontrolü
    const user = await getUser();
    if (!user || user.role !== 'ADMIN') {
      console.log("Yetkilendirme hatası: Kullanıcı ADMIN değil", user);
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      );
    }

    console.log("Kullanıcı yetkilendirmesi başarılı:", user.id);
    
    // İstek gövdesini al
    const body = await request.json();
    const { tables } = body as { tables: SeedTable[] };
    console.log("İstek gövdesi alındı, tablolar:", tables);

    if (!tables || !Array.isArray(tables) || tables.length === 0) {
      console.log("Geçersiz tablo listesi");
      return NextResponse.json(
        { error: 'Geçerli bir tablo listesi belirtilmelidir' },
        { status: 400 }
      );
    }

    // User tablosunu listeye eklenmesini engelle
    const filteredTables = tables.filter(t => t.table_name !== 'User');
    console.log("Filtreli tablolar:", filteredTables);

    // Seed işlemini başlat
    console.log("Seed işlemi başlıyor...");
    const results = await seedTables(filteredTables);
    console.log("Seed işlemi tamamlandı, sonuçlar:", results);

    return NextResponse.json({
      success: true,
      message: 'Seed verisi başarıyla oluşturuldu',
      results
    });
  } catch (error: any) {
    console.error('Seed verisi oluşturulurken hata:', error);
    return NextResponse.json(
      { 
        error: 'Seed verisi oluşturulurken bir hata oluştu',
        details: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Seed işlemini gerçekleştiren fonksiyon
async function seedTables(tables: SeedTable[]) {
  const results: Record<string, any> = {};

  try {
    console.log("Seed işlemi başlatılıyor, foreign key kısıtlamaları devre dışı bırakılacak");
    
    // Foreign key kısıtlamalarını geçici olarak devre dışı bırak
    const constraintsDisabled = await disableForeignKeyConstraints();
    if (!constraintsDisabled) {
      console.warn("Foreign key kısıtlamaları devre dışı bırakılamadı. Bu bazı tabloların seed işlemini etkileyebilir.");
    }
    
    // Tabloları doğru sırada işleyebilmek için sırala
    // İlişkisel tablolar için doğru sıra önemli
    const orderedTables = orderTablesForSeed(tables);
    console.log("Seed işlenecek sıralanmış tablolar:", orderedTables.map(t => t.table_name));
    
    // Her tablo için seed işlemini gerçekleştir
    for (const table of orderedTables) {
      try {
        console.log(`"${table.table_name}" tablosu işleniyor...`);
        
        // Tablonun içeriğini temizle (User tablosu hariç)
        if (table.table_name !== 'User') {
          // Tablonun foreign key kısıtlamalarını kontrol et ve düzgün bir sırayla sil
          try {
            await truncateTable(table.table_name);
          } catch (truncateError) {
            console.error(`"${table.table_name}" tablosu temizlenirken hata oluştu. Bu tablo için seed işlemine devam edilmeyecek.`, truncateError);
            results[table.table_name] = {
              status: 'error',
              error: `Tablo temizleme hatası: ${truncateError.message}`
            };
            continue; // Bu tabloyu atla, diğerine geç
          }
        }

        // Kayıt sayısını sınırla
        const count = Math.min(table.count, MAX_RECORDS_PER_TABLE);
        
        // Tablo için uygun seed fonksiyonunu çağır
        const seedFunction = getSeedFunctionForTable(table.table_name);
        if (seedFunction) {
          console.log(`"${table.table_name}" tablosuna ${count} kayıt ekleniyor...`);
          
          try {
            const records = await seedFunction(count);
            console.log(`"${table.table_name}" tablosuna ${records.length} kayıt eklendi.`);
            
            results[table.table_name] = {
              status: 'success',
              count: records.length
            };
          } catch (seedError) {
            console.error(`"${table.table_name}" seed işlemi başarısız:`, seedError);
            results[table.table_name] = {
              status: 'error',
              error: seedError.message
            };
          }
        } else {
          console.log(`"${table.table_name}" tablosu için seed fonksiyonu bulunamadı, atlanıyor.`);
          results[table.table_name] = {
            status: 'skipped',
            reason: 'Uygun seed fonksiyonu bulunamadı'
          };
        }
      } catch (error: any) {
        console.error(`${table.table_name} tablosu için beklenmeyen hata:`, error);
        results[table.table_name] = {
          status: 'error',
          error: error.message
        };
      }
    }
    
    // Oluşturulan verileri özetleyen log
    console.log("========== SEED İŞLEMİ SONUÇLARI ==========");
    for (const tableName in results) {
      const result = results[tableName];
      if (result.status === 'success') {
        console.log(`✅ ${tableName}: ${result.count} kayıt başarıyla oluşturuldu`);
      } else if (result.status === 'error') {
        console.log(`❌ ${tableName}: HATA - ${result.error}`);
      } else if (result.status === 'skipped') {
        console.log(`⚠️ ${tableName}: ATLANDI - ${result.reason}`);
      }
    }
    console.log("===========================================");
  } catch (error) {
    console.error("Seed işleminde beklenmeyen bir hata oluştu:", error);
  } finally {
    // Foreign key kısıtlamalarını geri etkinleştir
    console.log("Foreign key kısıtlamaları yeniden etkinleştiriliyor...");
    await enableForeignKeyConstraints();
  }

  return results;
}

// Tabloları seed etme sırasına göre sıralar
function orderTablesForSeed(tables: SeedTable[]): SeedTable[] {
  // İlişkisel bağımlılık sırası:
  // 1. Önce temel tablolar (Departman, Kategori, vs)
  // 2. Sonra ilişkili tablolar (Personel, SLAKural, vs)
  // 3. En son karmaşık ilişkilere sahip tablolar (Talep, TalepIslem, vs)
  
  const tableOrder: Record<string, number> = {
    'Departman': 1,
    'Kategori': 2, 
    'SorunEtiket': 3,
    'CozumEtiket': 4,
    'Personel': 5,
    'SLAKural': 6,
    'Talep': 7,
    'TalepIslem': 8,
    'TalepIslemDosya': 9
  };
  
  // Sıralama fonksiyonu
  return [...tables].sort((a, b) => {
    const orderA = tableOrder[a.table_name] || 100; // Bilinmeyen tablolar en sona
    const orderB = tableOrder[b.table_name] || 100;
    return orderA - orderB;
  });
}

// Tabloyu temizleme fonksiyonu (foreign key ilişkilerini dikkate alarak)
async function truncateTable(tableName: string) {
  try {
    console.log(`"${tableName}" tablosu temizleniyor...`);
    
    try {
      // Önce DELETE ile tüm verileri silmeyi dene
      const result = await prisma.$executeRawUnsafe(`DELETE FROM "${tableName}";`);
      console.log(`"${tableName}" tablosu DELETE ile temizlendi`);
      return true;
    } catch (deleteError) {
      console.error(`DELETE hatası (${tableName}):`, deleteError);
      
      // DELETE başarısız olursa, CASCADE ile TRUNCATE kullanmayı dene
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" CASCADE;`);
      console.log(`"${tableName}" tablosu TRUNCATE CASCADE ile temizlendi`);
      return true;
    }
  } catch (error: any) {
    console.error(`"${tableName}" tablosu temizlenirken hata:`, error);
    
    if (error.code) {
      console.error('Hata kodu:', error.code);
    }
    
    throw new Error(`Tablo temizleme hatası: ${error.message}`);
  }
}

// Tablo için uygun seed fonksiyonunu belirler
function getSeedFunctionForTable(tableName: string) {
  console.log(`${tableName} için seed fonksiyonu aranıyor...`);
  
  // Tablo adını kontrol et
  if (!tableName || typeof tableName !== 'string') {
    console.error('Geçersiz tablo adı:', tableName);
    return null;
  }
  
  // Bilinen tüm tablolar
  const knownTables = ['Departman', 'Personel', 'Kategori', 'SorunEtiket', 'CozumEtiket', 
                      'SLAKural', 'Talep', 'TalepIslem', 'TalepIslemDosya', 'User'];
  
  // Bilinmeyen tablo kontrolü
  if (!knownTables.includes(tableName)) {
    console.warn(`Dikkat: "${tableName}" bilinen tablolar arasında değil.`);
  }
  
  const seedFunctions: Record<string, (count: number) => Promise<any[]>> = {
    // Departman tablosu için seed fonksiyonu
    'Departman': async (count: number) => {
      const departments = [];
      const departmentNames = [
        'Bilgi İşlem', 'Muhasebe', 'İnsan Kaynakları', 'Pazarlama', 
        'Satış', 'Üretim', 'Ar-Ge', 'Lojistik', 'Kalite Kontrol', 'Yönetim',
        'Hukuk', 'Müşteri Hizmetleri', 'Güvenlik', 'Teknik Destek', 'Saha Operasyonları'
      ];
      
      // Önce benzersiz departman isimleri oluştur
      const uniqueNames = new Set<string>();
      while (uniqueNames.size < Math.min(count, departmentNames.length)) {
        uniqueNames.add(departmentNames[uniqueNames.size]);
      }
      
      // Departmanları oluştur
      for (const name of Array.from(uniqueNames)) {
        const department = await prisma.departman.create({
          data: {
            ad: name,
            aciklama: `${name} departmanı açıklaması`
          }
        });
        departments.push(department);
      }
      
      return departments;
    },
    
    // Personel tablosu için seed fonksiyonu
    'Personel': async (count: number) => {
      const personnel = [];
      
      // Önce departmanları al
      const departments = await prisma.departman.findMany();
      if (departments.length === 0) {
        throw new Error('Personel oluşturmak için önce Departman tablosuna veri ekleyin.');
      }
      
      for (let i = 0; i < count; i++) {
        const randomDept = departments[Math.floor(Math.random() * departments.length)];
        
        const person = await prisma.personel.create({
          data: {
            ad: faker.person.firstName(),
            soyad: faker.person.lastName(),
            telefon: `5${faker.string.numeric(9)}`,
            departmanId: randomDept.id,
            aktif: Math.random() < 0.9 // %90 ihtimalle aktif
          }
        });
        personnel.push(person);
      }
      
      return personnel;
    },
    
    // Kategori tablosu için seed fonksiyonu
    'Kategori': async (count: number) => {
      const categories = [];
      const categoryNames = [
        'Donanım', 'Yazılım', 'Ağ', 'Erişim', 'E-posta', 
        'Güvenlik', 'Eğitim', 'Veri', 'Mobil', 'Diğer',
        'Sunucu', 'Yazıcı', 'Telefon', 'Kablosuz Ağ', 'VPN'
      ];
      
      // Önce benzersiz kategori isimleri oluştur
      const uniqueNames = new Set<string>();
      while (uniqueNames.size < Math.min(count, categoryNames.length)) {
        uniqueNames.add(categoryNames[uniqueNames.size]);
      }
      
      // Kategorileri oluştur
      for (const name of Array.from(uniqueNames)) {
        const category = await prisma.kategori.create({
          data: {
            ad: name,
            aciklama: `${name} kategorisi açıklaması`
          }
        });
        categories.push(category);
      }
      
      return categories;
    },
    
    // SorunEtiket tablosu için seed fonksiyonu
    'SorunEtiket': async (count: number) => {
      const tags = [];
      const tagNames = [
        'Bağlantı Sorunu', 'Performans', 'Çökme', 'Hata Mesajı', 'Ekran Donması',
        'Oturum Açamama', 'Veri Kaybı', 'Yavaşlık', 'Güncelleme Hatası', 'Senkronizasyon',
        'Ses Sorunu', 'Görüntü Sorunu', 'Yazıcı Hatası', 'E-posta Teslim Edilemedi', 'Virüs/Malware'
      ];
      
      // Önce benzersiz etiket isimleri oluştur
      const uniqueNames = new Set<string>();
      while (uniqueNames.size < Math.min(count, tagNames.length)) {
        uniqueNames.add(tagNames[uniqueNames.size]);
      }
      
      // Etiketleri oluştur
      for (const name of Array.from(uniqueNames)) {
        const tag = await prisma.sorunEtiket.create({
          data: {
            ad: name,
            aciklama: `${name} sorunu için etiket`
          }
        });
        tags.push(tag);
      }
      
      return tags;
    },
    
    // CozumEtiket tablosu için seed fonksiyonu
    'CozumEtiket': async (count: number) => {
      const tags = [];
      const tagNames = [
        'Yeniden Başlatma', 'Yazılım Güncelleme', 'Donanım Değişimi', 'Yeniden Kurulum',
        'Sürücü Güncelleme', 'Virüs Temizleme', 'Veri Kurtarma', 'Şifre Sıfırlama', 'Eğitim',
        'Network Yapılandırma', 'Önbellek Temizleme', 'Dosya Onarma', 'Yedekten Geri Yükleme',
        'Uzaktan Destek', 'Yerinde Destek'
      ];
      
      // Önce benzersiz etiket isimleri oluştur
      const uniqueNames = new Set<string>();
      while (uniqueNames.size < Math.min(count, tagNames.length)) {
        uniqueNames.add(tagNames[uniqueNames.size]);
      }
      
      // Etiketleri oluştur
      for (const name of Array.from(uniqueNames)) {
        const tag = await prisma.cozumEtiket.create({
          data: {
            ad: name,
            aciklama: `${name} çözümü için etiket`
          }
        });
        tags.push(tag);
      }
      
      return tags;
    },
    
    // SLAKural tablosu için seed fonksiyonu
    'SLAKural': async (count: number) => {
      const rules = [];
      
      // Önce kategorileri al
      const categories = await prisma.kategori.findMany();
      if (categories.length === 0) {
        throw new Error('SLA kuralları oluşturmak için önce Kategori tablosuna veri ekleyin.');
      }
      
      // Öncelik türleri
      const priorityTypes = ['DUSUK', 'ORTA', 'YUKSEK', 'ACIL'];
      
      // Her kategori için öncelik türleri ile SLA kuralları oluştur
      // Count sınırına kadar maksimum sayıda kural oluştur
      let rulesCreated = 0;
      
      for (const category of categories) {
        for (const priority of priorityTypes) {
          if (rulesCreated >= count) break;
          
          // Her kategori-öncelik kombinasyonu için rastgele yanıtlama ve çözüm süreleri belirle
          let responseTime: number;
          let resolutionTime: number;
          
          switch (priority) {
            case 'DUSUK':
              responseTime = faker.number.int({ min: 12, max: 24 });
              resolutionTime = faker.number.int({ min: 48, max: 72 });
              break;
            case 'ORTA':
              responseTime = faker.number.int({ min: 4, max: 12 });
              resolutionTime = faker.number.int({ min: 24, max: 48 });
              break;
            case 'YUKSEK':
              responseTime = faker.number.int({ min: 2, max: 6 });
              resolutionTime = faker.number.int({ min: 12, max: 24 });
              break;
            case 'ACIL':
              responseTime = faker.number.int({ min: 1, max: 2 });
              resolutionTime = faker.number.int({ min: 4, max: 12 });
              break;
          }
          
          // Aynı kategori-öncelik kombinasyonu için kural zaten var mı kontrol et
          const existingRule = await prisma.sLAKural.findFirst({
            where: {
              kategoriId: category.id,
              oncelik: priority as any
            }
          });
          
          if (!existingRule) {
            const rule = await prisma.sLAKural.create({
              data: {
                kategoriId: category.id,
                oncelik: priority as any,
                yanitlamaSuresi: responseTime,
                cozumSuresi: resolutionTime
              }
            });
            rules.push(rule);
            rulesCreated++;
          }
        }
      }
      
      return rules;
    },
    
    // Talep tablosu için seed fonksiyonu
    'Talep': async (count: number) => {
      const tickets = [];
      
      // Gerekli verileri al
      const categories = await prisma.kategori.findMany();
      console.log(`Bulunan kategori sayısı: ${categories.length}`);
      
      const departments = await prisma.departman.findMany();
      console.log(`Bulunan departman sayısı: ${departments.length}`);
      
      const personnel = await prisma.personel.findMany();
      console.log(`Bulunan personel sayısı: ${personnel.length}`);
      
      // User tablosundan veri alma ve kullanma yaklaşımını değiştirelim
      // Önce tüm user'ları alalım, sonra role filtresi yapalım
      const allUsers = await prisma.user.findMany();
      console.log(`Bulunan toplam kullanıcı sayısı: ${allUsers.length}`);
      
      // USER rolüne sahip kullanıcıları filtrele
      const users = allUsers.filter(user => user.role === 'USER' || user.role === 'ADMIN');
      console.log(`Filtre sonrası kullanıcı sayısı: ${users.length}, Kullanıcılar:`, users.map(u => ({ id: u.id, role: u.role })));
      
      const sorunEtiketler = await prisma.sorunEtiket.findMany();
      console.log(`Bulunan sorun etiketi sayısı: ${sorunEtiketler.length}`);
      
      const cozumEtiketler = await prisma.cozumEtiket.findMany();
      console.log(`Bulunan çözüm etiketi sayısı: ${cozumEtiketler.length}`);
      
      // Kontrol
      if (categories.length === 0) throw new Error('Talep oluşturmak için önce Kategori tablosuna veri ekleyin.');
      if (departments.length === 0) throw new Error('Talep oluşturmak için önce Departman tablosuna veri ekleyin.');
      if (personnel.length === 0) throw new Error('Talep oluşturmak için önce Personel tablosuna veri ekleyin.');
      
      // Kullanıcı yoksa atanan kısmını null bırakabiliriz
      if (users.length === 0) {
        console.warn('Hiç USER veya ADMIN rolüne sahip kullanıcı bulunamadı. Atanan alanı null olarak işlenecek.');
      }
      
      // Talep başlıkları
      const requestTitles = [
        'Bilgisayarım açılmıyor', 'İnternet bağlantısı yok', 'E-posta alamıyorum',
        'Yazıcı yazdırmıyor', 'Şifre sıfırlama', 'Program çalışmıyor',
        'Dosyalarım açılmıyor', 'Virüs uyarısı alıyorum', 'Bilgisayarım yavaş',
        'Ekran donuyor', 'Ses gelmiyor', 'Klavye çalışmıyor', 'Fare çalışmıyor', 
        'Uygulama güncelleme sorunu', 'Veri kaybı yaşıyorum'
      ];
      
      // Durum türleri
      const statusTypes = ['DEVAM_EDIYOR', 'TAMAMLANDI', 'BEKLEMEDE', 'IPTAL'];
      
      // Öncelik türleri
      const priorityTypes = ['DUSUK', 'ORTA', 'YUKSEK', 'ACIL'];
      
      for (let i = 0; i < count; i++) {
        try {
          const randomCategory = categories[Math.floor(Math.random() * categories.length)];
          const randomDepartment = departments[Math.floor(Math.random() * departments.length)];
          const randomReporter = personnel[Math.floor(Math.random() * personnel.length)];
          const randomTitle = requestTitles[Math.floor(Math.random() * requestTitles.length)];
          const randomStatus = statusTypes[Math.floor(Math.random() * statusTypes.length)];
          const randomPriority = priorityTypes[Math.floor(Math.random() * priorityTypes.length)];
          
          // Tarih hesaplamaları
          const createdAt = faker.date.past({ years: 1 });
          const updatedAt = new Date(createdAt.getTime() + faker.number.int({ min: 1, max: 72 }) * 60 * 60 * 1000);
          const closedAt = randomStatus === 'TAMAMLANDI' ? 
            new Date(updatedAt.getTime() + faker.number.int({ min: 1, max: 24 }) * 60 * 60 * 1000) : null;
          
          // Sorun ve çözüm etiketleri
          const randomSorunEtiketCount = Math.min(1, sorunEtiketler.length);
          const randomCozumEtiketCount = randomStatus === 'TAMAMLANDI' && cozumEtiketler.length > 0 ? 1 : 0;
          
          // Etiketleri karıştır ve seç (eğer etiket varsa)
          const shuffledSorunEtiketler = sorunEtiketler.length > 0 ? 
            [...sorunEtiketler].sort(() => 0.5 - Math.random()) : [];
          
          const shuffledCozumEtiketler = cozumEtiketler.length > 0 ? 
            [...cozumEtiketler].sort(() => 0.5 - Math.random()) : [];
          
          const selectedSorunEtiketler = shuffledSorunEtiketler.slice(0, randomSorunEtiketCount);
          const selectedCozumEtiketler = shuffledCozumEtiketler.slice(0, randomCozumEtiketCount);
          
          // Atanan kısmını belirleme (kullanıcı yoksa null bırak)
          const atananId = users.length > 0 ? 
            users[Math.floor(Math.random() * users.length)].id : null;
          
          console.log(`Talep #${i+1} oluşturuluyor - Kategori: ${randomCategory.ad}, Departman: ${randomDepartment.ad}`);
          console.log(`Raporlayan: ${randomReporter.ad}, Atanan: ${atananId || 'Atanmadı'}`);
          
          // Talebi oluştur
          const createData: any = {
            baslik: randomTitle,
            kategoriId: randomCategory.id,
            departmanId: randomDepartment.id,
            raporEdenId: randomReporter.id,
            atananId: atananId,
            durum: randomStatus as any,
            oncelik: randomPriority as any,
            sorunDetay: faker.lorem.paragraph(),
            olusturulmaTarihi: createdAt,
            guncellenmeTarihi: updatedAt,
            kapatilmaTarihi: closedAt,
          };
          
          // Etiketleri sadece varsa ekle
          if (selectedSorunEtiketler.length > 0) {
            createData.sorunEtiketleri = {
              connect: selectedSorunEtiketler.map(etiket => ({ id: etiket.id }))
            };
          }
          
          if (selectedCozumEtiketler.length > 0) {
            createData.cozumEtiketleri = {
              connect: selectedCozumEtiketler.map(etiket => ({ id: etiket.id }))
            };
          }
          
          const talep = await prisma.talep.create({
            data: createData
          });
          
          console.log(`Talep #${i+1} oluşturuldu, ID: ${talep.id}`);
          tickets.push(talep);
        } catch (error) {
          console.error(`Talep ${i+1} oluşturulurken hata:`, error);
        }
      }
      
      return tickets;
    },
    
    // TalepIslem tablosu için seed fonksiyonu
    'TalepIslem': async (count: number) => {
      const operations = [];
      
      // Gerekli verileri al
      console.log("TalepIslem seed işlemi başlıyor...");
      
      const talepler = await prisma.talep.findMany({
        include: { islemler: true }
      });
      console.log(`Bulunan talep sayısı: ${talepler.length}`);
      
      const allUsers = await prisma.user.findMany();
      console.log(`Bulunan toplam kullanıcı sayısı: ${allUsers.length}`);
      
      // Filtreleme
      const users = allUsers.filter(user => user.role === 'USER' || user.role === 'ADMIN');
      console.log(`Filtreli kullanıcı sayısı: ${users.length}`);
      
      // Kontrol
      if (talepler.length === 0) {
        console.error('TalepIslem oluşturmak için önce Talep tablosuna veri ekleyin.');
        return [];
      }
      
      if (users.length === 0) {
        console.error('TalepIslem oluşturmak için en az bir USER veya ADMIN rolünde kullanıcı olmalıdır.');
        return [];
      }
      
      // İşlem tipleri
      const operationTypes = ['INCELEME', 'COZUM', 'GUNCELLEME', 'RED', 'BEKLEMEDE', 'TAMAMLANDI'];
      
      // Durum tipleri
      const statusTypes = ['DEVAM_EDIYOR', 'TAMAMLANDI', 'BEKLEMEDE', 'IPTAL'];
      
      // Önce her talep için en az bir işlem oluştur, sonra rastgele taleplere ek işlemler ekle
      let opsCreated = 0;
      
      // Her talep için bir işlem ekle
      console.log("Her talep için işlem oluşturuluyor...");
      for (const talep of talepler) {
        if (opsCreated >= count) break;
        
        try {
          const randomUser = users[Math.floor(Math.random() * users.length)];
          const randomType = operationTypes[Math.floor(Math.random() * operationTypes.length)];
          
          // Talebin durumuna uygun bir durum seçimi yap
          let opStatus: string;
          
          if (talep.durum === 'TAMAMLANDI') {
            opStatus = 'TAMAMLANDI';
          } else if (talep.durum === 'BEKLEMEDE') {
            opStatus = 'BEKLEMEDE';
          } else if (talep.durum === 'IPTAL') {
            opStatus = 'IPTAL';
          } else {
            opStatus = 'DEVAM_EDIYOR';
          }
          
          const createdAt = new Date(talep.olusturulmaTarihi.getTime() + 1000 * 60 * 10); // 10 dakika sonra
          
          console.log(`Talep işlemi oluşturuluyor - Talep ID: ${talep.id}, Tip: ${randomType}`);
          
          const operation = await prisma.talepIslem.create({
            data: {
              tip: randomType as any,
              aciklama: faker.lorem.paragraph(),
              durum: opStatus as any,
              talepId: talep.id,
              yapanKullaniciId: randomUser.id,
              olusturulmaTarihi: createdAt,
              guncellenmeTarihi: createdAt
            }
          });
          
          console.log(`Talep işlemi oluşturuldu - İşlem ID: ${operation.id}`);
          
          operations.push(operation);
          opsCreated++;
        } catch (error) {
          console.error(`Talep ${talep.id} için işlem oluşturulurken hata:`, error);
        }
      }
      
      // Bazı taleplere ek işlemler ekle
      const remainingOps = count - opsCreated;
      if (remainingOps > 0 && talepler.length > 0) {
        console.log(`${remainingOps} adet ek işlem oluşturuluyor...`);
        
        // Rastgele talepleri seç
        const shuffledTalepler = [...talepler].sort(() => 0.5 - Math.random());
        const selectedTalepler = shuffledTalepler.slice(0, Math.min(remainingOps, talepler.length));
        
        for (const talep of selectedTalepler) {
          if (opsCreated >= count) break;
          
          try {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomType = operationTypes[Math.floor(Math.random() * operationTypes.length)];
            const randomStatus = statusTypes[Math.floor(Math.random() * statusTypes.length)];
            
            // Mevcut işlemlerin sayısını al
            const existingOps = talep.islemler.length;
            
            // Tarih hesaplamaları (mevcut işlem sayısına göre artarak)
            const createdAt = new Date(talep.olusturulmaTarihi.getTime() + (existingOps + 1) * 1000 * 60 * 60 * 3); // İlk işlemden 3 saat sonra
            
            console.log(`Ek talep işlemi oluşturuluyor - Talep ID: ${talep.id}, Tip: ${randomType}`);
            
            const operation = await prisma.talepIslem.create({
              data: {
                tip: randomType as any,
                aciklama: faker.lorem.paragraph(),
                durum: randomStatus as any,
                talepId: talep.id,
                yapanKullaniciId: randomUser.id,
                olusturulmaTarihi: createdAt,
                guncellenmeTarihi: createdAt
              }
            });
            
            console.log(`Ek talep işlemi oluşturuldu - İşlem ID: ${operation.id}`);
            
            operations.push(operation);
            opsCreated++;
          } catch (error) {
            console.error(`Talep ${talep.id} için ek işlem oluşturulurken hata:`, error);
          }
        }
      }
      
      console.log(`TalepIslem seed işlemi tamamlandı, toplam ${operations.length} işlem oluşturuldu.`);
      return operations;
    }
  };
  
  // Seed fonksiyonu kontrolü
  const seedFunction = seedFunctions[tableName];
  if (!seedFunction) {
    console.warn(`${tableName} için uygun seed fonksiyonu bulunamadı.`);
    return null;
  }
  
  console.log(`${tableName} için seed fonksiyonu bulundu.`);
  return seedFunction;
}

// Foreign key kısıtlamalarını geçici olarak devre dışı bırakma
async function disableForeignKeyConstraints() {
  try {
    console.log("Foreign key kısıtlamaları devre dışı bırakılıyor...");
    
    // PostgreSQL'de foreign key kontrolünü devre dışı bırak
    await prisma.$executeRawUnsafe('SET session_replication_role = replica;');
    console.log("Foreign key kısıtlamaları devre dışı bırakıldı");
    return true;
  } catch (error) {
    console.error("Foreign key kısıtlamaları devre dışı bırakılırken hata:", error);
    return false;
  }
}

// Foreign key kısıtlamalarını geri etkinleştirme
async function enableForeignKeyConstraints() {
  try {
    console.log("Foreign key kısıtlamaları etkinleştiriliyor...");
    
    // PostgreSQL'de foreign key kontrolünü tekrar etkinleştir
    await prisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;');
    console.log("Foreign key kısıtlamaları etkinleştirildi");
    return true;
  } catch (error) {
    console.error("Foreign key kısıtlamaları etkinleştirilirken hata:", error);
    return false;
  }
} 