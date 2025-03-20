"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

interface Kullanici {
  isim: string;
  eposta: string;
}

export default function KontrolPaneliSayfasi() {
  const [kullanici, setKullanici] = useState<Kullanici | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const yonlendirici = useRouter();

  useEffect(() => {
    const yetkiKontrol = () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      // Hem eski (user) hem de yeni (kullanici) anahtarları kontrol edelim
      const kullaniciVerisi = localStorage.getItem("user") || sessionStorage.getItem("user") || 
                             localStorage.getItem("kullanici") || sessionStorage.getItem("kullanici");

      if (!token || !kullaniciVerisi) {
        console.log("Token veya kullanıcı verisi bulunamadı");
        yonlendirici.replace("/auth/giris");
        return;
      }

      try {
        const ayrıstirilmisKullanici = JSON.parse(kullaniciVerisi);
        // Eski veri yapısını yeni yapıya dönüştürelim
        const kullaniciData = {
          isim: ayrıstirilmisKullanici.name || ayrıstirilmisKullanici.isim,
          eposta: ayrıstirilmisKullanici.email || ayrıstirilmisKullanici.eposta
        };
        console.log("Kullanıcı verisi yüklendi:", kullaniciData);
        setKullanici(kullaniciData);
      } catch (hata) {
        console.error("Kullanıcı verisi ayrıştırma hatası:", hata);
        yonlendirici.replace("/auth/giris");
      } finally {
        setYukleniyor(false);
      }
    };

    yetkiKontrol();
  }, [yonlendirici]);

  if (yukleniyor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!kullanici) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Kullanıcı bilgileri yüklenemedi.</p>
          <button 
            onClick={() => yonlendirici.replace("/auth/giris")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Giriş Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Karşılama Kartı */}
      <Card className="p-6 col-span-full bg-white">
        <h2 className="text-xl font-semibold text-gray-800">
          Hoş geldin, {kullanici.isim}!
        </h2>
        <p className="mt-2 text-gray-600">
          Destek taleplerini buradan yönetebilirsin.
        </p>
      </Card>

      {/* İstatistik Kartları */}
      <Card className="p-6 bg-white">
        <h3 className="text-lg font-medium text-gray-800">Açık Talepler</h3>
        <p className="mt-2 text-3xl font-bold text-blue-600">12</p>
      </Card>

      <Card className="p-6 bg-white">
        <h3 className="text-lg font-medium text-gray-800">Devam Eden</h3>
        <p className="mt-2 text-3xl font-bold text-yellow-600">5</p>
      </Card>

      <Card className="p-6 bg-white">
        <h3 className="text-lg font-medium text-gray-800">Çözülen</h3>
        <p className="mt-2 text-3xl font-bold text-green-600">28</p>
      </Card>

      {/* Son Aktiviteler */}
      <Card className="p-6 col-span-full bg-white">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Son Aktiviteler</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between py-2 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-800">Talep #{item}</p>
                <p className="text-sm text-gray-600">Ağ bağlantı sorunu</p>
              </div>
              <span className="px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
                Devam Ediyor
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 