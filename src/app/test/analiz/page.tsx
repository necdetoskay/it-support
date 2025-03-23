"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { TalepAnalizSonuc } from '@/components/talep/TalepAnalizSonuc';

export default function TestAnalizPage() {
  const [metin, setMetin] = useState<string>("");
  const [analizSonuc, setAnalizSonuc] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Analiz testi yap
  const analizYap = async () => {
    if (!metin) {
      setError("Lütfen analiz edilecek bir metin girin.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/talepler/analiz?metin=${encodeURIComponent(metin)}`);
      
      if (!response.ok) {
        throw new Error("Analiz sırasında bir hata oluştu");
      }
      
      const data = await response.json();
      setAnalizSonuc(data);
    } catch (err) {
      setError("Analiz işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
      console.error("Analiz hatası:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Örnek veri oluştur
  const ornekData = {
    kategoriler: [
      { id: "1", ad: "Donanım Sorunları" },
      { id: "2", ad: "Yazılım Sorunları" },
      { id: "3", ad: "Ağ/İnternet Sorunları" }
    ],
    departmanlar: [
      { id: "1", ad: "Bilgi İşlem" },
      { id: "2", ad: "İnsan Kaynakları" },
      { id: "3", ad: "Muhasebe" }
    ],
    personeller: [
      { id: "1", ad: "Ahmet", soyad: "Yılmaz" },
      { id: "2", ad: "Mehmet", soyad: "Kaya" },
      { id: "3", ad: "Ayşe", soyad: "Demir" },
      { id: "4", ad: "Bedirhan", soyad: "Dirik" }
    ]
  };
  
  // Örnek metinleri hızlıca test etmek için
  const ornekMetinler = [
    "Bilgisayarımın ekranı açılmıyor, yardım istiyorum.",
    "İnsan kaynaklarından Bedirhan Dirik'in yazıcısı çalışmıyor.",
    "Muhasebede internet bağlantısı çok yavaş, işlerimizi yapamıyoruz.",
    "Ahmet Yılmaz'ın bilgisayarına Office programı yükler misiniz?",
    "Bilgi işlem departmanına yeni bir bilgisayar siparişi verilecek."
  ];
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-4">Türkçe Metin Analiz Testi</h1>
      <p className="text-muted-foreground mb-6">
        Bu sayfa, talep metinlerini analiz etmek için geliştirilmiş Türkçe metin analiz
        sistemini test etmenize olanak sağlar.
      </p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Metni</CardTitle>
            <CardDescription>
              Analiz etmek istediğiniz metni girin veya örneklerden birini seçin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Analiz edilecek metni buraya yazın..."
              className="min-h-[200px] mb-4"
              value={metin}
              onChange={(e) => setMetin(e.target.value)}
            />
            
            <div className="flex gap-2 flex-wrap mb-4">
              {ornekMetinler.map((ornek, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  size="sm"
                  onClick={() => setMetin(ornek)}
                >
                  Örnek {index + 1}
                </Button>
              ))}
            </div>
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Hata</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={analizYap} disabled={loading || !metin} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analiz Yapılıyor...
                </>
              ) : (
                "Analiz Et"
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <div>
          {analizSonuc && (
            <>
              <TalepAnalizSonuc 
                analiz={analizSonuc.analiz} 
                kategoriler={ornekData.kategoriler}
                departmanlar={ornekData.departmanlar}
                personeller={ornekData.personeller}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>Ham Analiz Sonuçları</CardTitle>
                  <CardDescription>
                    Analiz API'sinden dönen ham JSON sonuçları
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-xs overflow-auto max-h-[400px]">
                    {JSON.stringify(analizSonuc, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 