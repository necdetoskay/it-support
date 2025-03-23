/**
 * PostgreSQL Tools Installation Helper
 * 
 * Bu script, veritabanı yedekleme ve geri yükleme araçlarını yüklemek için yönergeler içerir.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Platformu tespit et
const platform = os.platform();
console.log(`Tespit edilen işletim sistemi: ${platform}`);

// PostgreSQL araçlarının yüklü olup olmadığını kontrol et
function checkPgDumpExists() {
  try {
    if (platform === 'win32') {
      execSync('where pg_dump', { stdio: 'ignore' });
    } else {
      execSync('which pg_dump', { stdio: 'ignore' });
    }
    return true;
  } catch (error) {
    return false;
  }
}

// Ana işlev
function main() {
  console.log('PostgreSQL Tools Yükleme Yardımcısı\n');

  const pgDumpExists = checkPgDumpExists();
  
  if (pgDumpExists) {
    let version;
    try {
      version = execSync('pg_dump --version').toString().trim();
      console.log('✅ PostgreSQL Araçları zaten yüklü!');
      console.log(`Versiyon bilgisi: ${version}`);
      console.log('\nYedekleme sistemi sorunsuz çalışmalıdır.');
      return;
    } catch (error) {
      console.log('⚠️ pg_dump bulundu, ancak versiyonu alınırken hata oluştu.');
    }
  }
  
  console.log('❌ PostgreSQL yedekleme araçları (pg_dump/pg_restore) bulunamadı.\n');
  
  // Platform bazlı yükleme talimatları
  if (platform === 'win32') {
    console.log('Windows için PostgreSQL Araçları Yükleme Talimatları:');
    console.log('1. https://www.postgresql.org/download/windows/ adresine gidin');
    console.log('2. PostgreSQL yükleyiciyi indirin ve çalıştırın');
    console.log('3. Kurulum sırasında "PostgreSQL Server" ve "Command Line Tools" bileşenlerini seçtiğinizden emin olun');
    console.log('4. Kurulum tamamlandıktan sonra, PATH çevresel değişkeninin PostgreSQL bin dizinini içerdiğinden emin olun');
    console.log('   Genellikle: C:\\Program Files\\PostgreSQL\\[version]\\bin');
    console.log('\nAlternatif olarak, sadece araçları yüklemek için:');
    console.log('1. https://www.enterprisedb.com/downloads/postgres-postgresql-downloads adresinden "PostgreSQL Database Server" indirin');
    console.log('2. Sadece "Command Line Tools" bileşenini seçerek minimum kurulum yapın');
    console.log('3. Yükleme sonrası yolu PATH değişkenine ekleyin');
  } else if (platform === 'linux') {
    console.log('Linux için PostgreSQL Araçları Yükleme Talimatları:');
    console.log('Debian/Ubuntu:');
    console.log('  sudo apt-get update');
    console.log('  sudo apt-get install postgresql-client');
    console.log('\nRedHat/CentOS/Fedora:');
    console.log('  sudo yum install postgresql-client');
    console.log('\nYükleme sonrası, lütfen sistemi yeniden başlatın veya oturumu kapatıp açın.');
  } else if (platform === 'darwin') {
    console.log('MacOS için PostgreSQL Araçları Yükleme Talimatları:');
    console.log('1. Homebrew ile yükleme (önerilen):');
    console.log('   brew install postgresql');
    console.log('\n2. Alternatif olarak, PostgreSQL.app kullanabilirsiniz:');
    console.log('   https://postgresapp.com/ adresinden indirin ve PATH\'e ekleyin');
  } else {
    console.log('İşletim sisteminiz için otomatik talimatlar sağlanamıyor.');
    console.log('Lütfen PostgreSQL resmi web sitesinden işletim sisteminize uygun kurulum talimatlarını takip edin:');
    console.log('https://www.postgresql.org/download/');
  }
  
  console.log('\nYükleme sonrası, lütfen uygulamayı yeniden başlatın ve yedekleme işlemini tekrar deneyin.');
  console.log('Sorun devam ederse, sistem yöneticinizle iletişime geçin.');
}

// Scripti çalıştır
main(); 