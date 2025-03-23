"use client";

import { useState, useEffect } from "react";
import { Settings, LogOut, FileText, Clock, PieChart, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ProfilePanelProps {
  kullanici: { 
    name: string; 
    email: string;
    rol?: string;
  } | null;
  onCikisYap: () => void;
}

interface TalepOzeti {
  acikTalepler: number;
  bugunAcilanlar: number;
  bugunCozulenler: number;
  bekleyenler: number;
}

interface KategoriOzeti {
  id: string;
  ad: string;
  talepSayisi: number;
}

interface IslemOzeti {
  id: string;
  talepId: string;
  talepBaslik: string;
  tip: string;
  tarih: string;
}

export default function ProfilePanel({ kullanici, onCikisYap }: ProfilePanelProps) {
  const [genisletilmis, setGenisletilmis] = useState(false);
  const [talepOzeti, setTalepOzeti] = useState<TalepOzeti>({
    acikTalepler: 0,
    bugunAcilanlar: 0,
    bugunCozulenler: 0,
    bekleyenler: 0,
  });
  const [kategoriler, setKategoriler] = useState<KategoriOzeti[]>([]);
  const [sonIslemler, setSonIslemler] = useState<IslemOzeti[]>([]);
  const [yedekleme, setYedekleme] = useState<{tarih: string, format: string, boyut: string} | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  // Verileri yükle
  useEffect(() => {
    const veriYukle = async () => {
      setYukleniyor(true);
      try {
        // Talep istatistiklerini al
        const statsRes = await fetch('/api/dashboard/stats');
        const statsData = await statsRes.json();
        
        if (statsData && statsData.talepIstatistikleri) {
          setTalepOzeti({
            acikTalepler: statsData.talepIstatistikleri.acikTalepSayisi || 0,
            bugunAcilanlar: statsData.talepIstatistikleri.bugunAcilanTalepSayisi || 0,
            bugunCozulenler: statsData.talepIstatistikleri.bugunCozulenTalepSayisi || 0,
            bekleyenler: statsData.talepIstatistikleri.bekleyenTalepSayisi || 0,
          });
        }

        // En aktif kategorileri al
        const kategoriRes = await fetch('/api/kategoriler?limit=3&sortBy=talepSayisi&order=desc');
        const kategoriData = await kategoriRes.json();
        
        if (kategoriData && kategoriData.kategoriler) {
          setKategoriler(kategoriData.kategoriler.map((kat: any) => ({
            id: kat.id,
            ad: kat.ad,
            talepSayisi: kat._count?.talepler || 0
          })));
        }

        // Son işlemleri al
        const islemRes = await fetch('/api/talepIslemler?limit=2');
        const islemData = await islemRes.json();
        
        if (islemData && islemData.islemler) {
          setSonIslemler(islemData.islemler.map((islem: any) => ({
            id: islem.id,
            talepId: islem.talepId,
            talepBaslik: islem.talep?.baslik || `Talep #${islem.talepId}`,
            tip: islem.tip,
            tarih: new Date(islem.olusturulmaTarihi).toLocaleString('tr-TR')
          })));
        }

        // Yedekleme bilgilerini al
        const backupRes = await fetch('/api/database/backups?limit=1');
        const backupData = await backupRes.json();
        
        if (backupData && backupData.backups && backupData.backups.length > 0) {
          const sonYedek = backupData.backups[0];
          setYedekleme({
            tarih: new Date(sonYedek.createdAt).toLocaleString('tr-TR'),
            format: sonYedek.type === 'prisma-json' ? 'JSON' : 'SQL',
            boyut: formatFileSize(sonYedek.fileSize)
          });
        }
      } catch (error) {
        console.error('Profil paneli veri yükleme hatası:', error);
      } finally {
        setYukleniyor(false);
      }
    };

    if (genisletilmis) {
      veriYukle();
    }
  }, [genisletilmis]);

  // Dosya boyutunu formatla
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  return (
    <div className="border-t p-4 relative">
      {/* Basit Profil Görünümü - Tıklayınca genişler */}
      <div 
        className={cn(
          "flex items-center space-x-3 cursor-pointer",
          genisletilmis ? "pb-4" : ""
        )}
        onClick={() => setGenisletilmis(!genisletilmis)}
      >
        <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-medium">
          {kullanici?.name?.charAt(0) || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{kullanici?.name || "Misafir"}</p>
          <p className="text-xs text-gray-500 truncate">{kullanici?.email || "-"}</p>
        </div>
        <button 
          className="text-gray-400 hover:text-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            setGenisletilmis(!genisletilmis);
          }}
        >
          {genisletilmis ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up">
              <path d="m18 15-6-6-6 6"/>
            </svg>
          )}
        </button>
      </div>
      
      {/* Genişletilmiş Profil Paneli */}
      {genisletilmis && (
        <div className="mt-3 border-t pt-4 space-y-4 animate-in fade-in-50 duration-300">
          {/* Kullanıcı Rolü */}
          <div className="text-center">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {kullanici?.rol || "IT Yöneticisi"}
            </span>
          </div>
          
          {/* Bölüm: Talep İstatistikleri */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm text-gray-800 font-medium">
              <FileText className="w-4 h-4" />
              <span>Günlük Özet:</span>
            </div>
            
            {yukleniyor ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-gray-600">Açık Talepler:</span>
                  <span className="font-medium text-red-600">{talepOzeti.acikTalepler}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-gray-600">Bugün Açılan:</span>
                  <span className="font-medium text-blue-600">{talepOzeti.bugunAcilanlar}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-gray-600">Bugün Çözülen:</span>
                  <span className="font-medium text-green-600">{talepOzeti.bugunCozulenler}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-gray-600">Beklemede:</span>
                  <span className="font-medium text-amber-600">{talepOzeti.bekleyenler}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Bölüm: Kategori Dağılımı */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm text-gray-800 font-medium">
              <PieChart className="w-4 h-4" />
              <span>Kategori Dağılımı:</span>
            </div>
            
            {yukleniyor ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 text-xs">
                {kategoriler.length > 0 ? (
                  kategoriler.map((kategori) => (
                    <div key={kategori.id} className="flex items-center justify-between">
                      <span className="text-gray-600">{kategori.ad}:</span>
                      <span className="font-medium">{kategori.talepSayisi}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500">Kategori bulunamadı</div>
                )}
              </div>
            )}
          </div>
          
          {/* Bölüm: Son İşlemler */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm text-gray-800 font-medium">
              <Clock className="w-4 h-4" />
              <span>Son İşlemler:</span>
            </div>
            
            {yukleniyor ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {sonIslemler.length > 0 ? (
                  sonIslemler.map((islem) => (
                    <div key={islem.id} className="bg-gray-50 p-2 rounded">
                      <div className="font-medium truncate">{islem.talepBaslik}</div>
                      <div className="flex justify-between mt-1">
                        <span className="text-gray-600">{islem.tip}</span>
                        <span className="text-gray-500">{islem.tarih}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500">İşlem bulunamadı</div>
                )}
              </div>
            )}
          </div>
          
          {/* Bölüm: Yedekleme Bilgisi */}
          {yedekleme && (
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm text-gray-800 font-medium">
                <Database className="w-4 h-4" />
                <span>Son Yedekleme:</span>
              </div>
              
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tarih:</span>
                  <span>{yedekleme.tarih}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-600">Format:</span>
                  <span>{yedekleme.format}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-600">Boyut:</span>
                  <span>{yedekleme.boyut}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Hızlı Erişim Butonları */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link 
              href="/dashboard/ayarlar"
              className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium text-gray-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Ayarlar</span>
            </Link>
            
            <button 
              onClick={onCikisYap}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 rounded text-sm font-medium text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 