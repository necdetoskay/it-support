// API test dosyası
async function testEtiketAPI() {
  console.log("API Test Başlıyor...");

  // Test Etiket ID - Gerçek bir ID yerine gelmesi gerekir
  const etiketID = "cltohizm60000uhbw7wdjr2ht"; // Gerçek bir etiket ID ile değiştirin

  // 1. Etiket detay API'si testi
  console.log(`\n1. Etiket Detay API Testi (ID: ${etiketID})`);
  try {
    const detayResponse = await fetch(`/api/etiketler/${etiketID}`);
    console.log("Durum Kodu:", detayResponse.status);
    
    if (detayResponse.ok) {
      const detayData = await detayResponse.json();
      console.log("Etiket Detay Verisi:", detayData);
    } else {
      const errorData = await detayResponse.text();
      console.error("Etiket Detay Hatası:", errorData);
    }
  } catch (error) {
    console.error("Etiket Detay İstek Hatası:", error);
  }

  // 2. Talep Etiketleri API'si testi (/api/talepler/etiketleri)
  console.log(`\n2. Talep Etiketleri API Testi (/api/talepler/etiketleri/${etiketID})`);
  try {
    const talepEtiketleriResponse = await fetch(`/api/talepler/etiketleri/${etiketID}`);
    console.log("Durum Kodu:", talepEtiketleriResponse.status);
    
    if (talepEtiketleriResponse.ok) {
      const talepEtiketleriData = await talepEtiketleriResponse.json();
      console.log("Talep Etiketleri Verisi:", talepEtiketleriData);
      
      if (talepEtiketleriData.talepler) {
        console.log(`Talep Sayısı: ${talepEtiketleriData.talepler.length}`);
      }
    } else {
      const errorData = await talepEtiketleriResponse.text();
      console.error("Talep Etiketleri Hatası:", errorData);
    }
  } catch (error) {
    console.error("Talep Etiketleri İstek Hatası:", error);
  }

  // 3. Alternatif Etiket API'si testi (/api/talepler/etiketler)
  console.log(`\n3. Alternatif Etiket API Testi (/api/talepler/etiketler/${etiketID})`);
  try {
    const altEtiketResponse = await fetch(`/api/talepler/etiketler/${etiketID}`);
    console.log("Durum Kodu:", altEtiketResponse.status);
    
    if (altEtiketResponse.ok) {
      const altEtiketData = await altEtiketResponse.json();
      console.log("Alternatif Etiket Verisi:", altEtiketData);
      
      if (altEtiketData.talepler) {
        console.log(`Talep Sayısı: ${altEtiketData.talepler.length}`);
      }
    } else {
      const errorData = await altEtiketResponse.text();
      console.error("Alternatif Etiket Hatası:", errorData);
    }
  } catch (error) {
    console.error("Alternatif Etiket İstek Hatası:", error);
  }
  
  console.log("\nAPI Test Tamamlandı");
}

// Sayfa yüklendiğinde testi çalıştır
document.addEventListener('DOMContentLoaded', function() {
  // Test butonunu oluştur
  const testButton = document.createElement('button');
  testButton.textContent = 'API Testini Çalıştır';
  testButton.style.position = 'fixed';
  testButton.style.top = '10px';
  testButton.style.right = '10px';
  testButton.style.zIndex = '9999';
  testButton.style.padding = '10px';
  testButton.style.backgroundColor = '#4CAF50';
  testButton.style.color = 'white';
  testButton.style.border = 'none';
  testButton.style.borderRadius = '5px';
  testButton.style.cursor = 'pointer';
  
  testButton.addEventListener('click', testEtiketAPI);
  
  document.body.appendChild(testButton);
}); 