"use client";

import { useState, useEffect } from "react";
import { 
  AlertCircle, 
  Check, 
  Loader2, 
  PlusCircle, 
  RefreshCw, 
  Search 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { TalepAnalizSonuc } from "@/components/talep/TalepAnalizSonuc";
import { TalepAnalizi } from "@/lib/talep-analiz";

type YeniKayitOner = {
  departman: string | null;
  kategori: string | null;
  personel: string | null;
};

interface TalepAnalizProps {
  sorunDetay: string;
  onKategoriChange: (kategoriId: string) => void;
  onDepartmanChange: (departmanId: string) => void;
  onPersonelChange: (personelId: string) => void;
  selectedKategoriId?: string;
  selectedDepartmanId?: string;
  selectedPersonelId?: string;
}

export function TalepAnaliz({
  sorunDetay,
  onKategoriChange,
  onDepartmanChange,
  onPersonelChange,
  selectedKategoriId,
  selectedDepartmanId,
  selectedPersonelId
}: TalepAnalizProps) {
  const [analiz, setAnaliz] = useState<TalepAnalizi | null>(null);
  const [yeniKayitOner, setYeniKayitOner] = useState<YeniKayitOner | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ogrenmeDurumu, setOgrenmeDurumu] = useState({
    ogrenildi: false,
    ogrenmeLoading: false
  });
  
  const [kategoriler, setKategoriler] = useState<Array<{ id: string; ad: string }>>([]);
  const [departmanlar, setDepartmanlar] = useState<Array<{ id: string; ad: string }>>([]);
  const [personeller, setPersoneller] = useState<Array<{ id: string; ad: string; soyad: string }>>([]);
  
  // Yeni kayıt oluşturma dialog state'leri
  const [yeniKayitDialog, setYeniKayitDialog] = useState({
    open: false,
    type: "" as "departman" | "kategori" | "personel",
    value: "",
    departmanId: ""
  });
  
  // Referans verilerini yükle
  useEffect(() => {
    const fetchReferansData = async () => {
      try {
        // Kategorileri getir
        const katResponse = await fetch("/api/categories");
        const katData = await katResponse.json();
        setKategoriler(Array.isArray(katData) ? katData : []);
        
        // Departmanları getir
        const depResponse = await fetch("/api/departments");
        const depData = await depResponse.json();
        console.log("API'den gelen departman verisi:", depData);
        // API'den gelen yanıtın dizi olduğundan emin ol
        setDepartmanlar(Array.isArray(depData) ? depData : []);
        
        // Personelleri getir
        const perResponse = await fetch("/api/personeller");
        const perData = await perResponse.json();
        setPersoneller(Array.isArray(perData) ? perData : []);
      } catch (err) {
        console.error("Referans verileri yüklenirken hata:", err);
        // Hata durumunda boş dizi ata
        setKategoriler([]);
        setDepartmanlar([]);
        setPersoneller([]);
      }
    };
    
    fetchReferansData();
  }, []);
  
  // Analiz yapma fonksiyonu
  const analizYap = async () => {
    if (!sorunDetay || sorunDetay.trim().length < 10) {
      setError("Analiz için en az 10 karakter bir sorun detayı gerekiyor");
      return;
    }
    
    setLoading(true);
    setError(null);
    setAnaliz(null);
    setYeniKayitOner(null);
    
    try {
      const response = await fetch("/api/talepler/analiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ metin: sorunDetay }),
      });
      
      if (!response.ok) {
        throw new Error("API yanıt vermedi");
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setAnaliz(data.analiz);
      setYeniKayitOner(data.yeniKayitOner);
      
      // Öneri sonuçlarına göre form alanlarını doldur
      if (data.analiz) {
        // Eğer departman önerisi varsa seç
        if (data.analiz.departmanId && !selectedDepartmanId) {
          onDepartmanChange(data.analiz.departmanId);
        }
        
        // Eğer kategori önerisi varsa seç
        if (data.analiz.kategoriId && !selectedKategoriId) {
          onKategoriChange(data.analiz.kategoriId);
        }
        
        // Eğer personel önerisi varsa seç
        if (data.analiz.personelId && !selectedPersonelId) {
          onPersonelChange(data.analiz.personelId);
        }
      }
      
    } catch (err) {
      setError(`Analiz yapılırken hata oluştu: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Öğrenme fonksiyonu
  const ogrenmeYap = async () => {
    if (!sorunDetay) return;
    
    // En az bir seçim yapılmış olmalı
    if (!selectedKategoriId && !selectedDepartmanId && !selectedPersonelId) {
      toast.error("Öğrenme için en az bir alanı seçmelisiniz");
      return;
    }
    
    setOgrenmeDurumu({ ...ogrenmeDurumu, ogrenmeLoading: true });
    
    try {
      const response = await fetch("/api/talepler/analiz", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          talep: sorunDetay,
          kullaniciSecimleri: {
            kategoriId: selectedKategoriId,
            departmanId: selectedDepartmanId,
            personelId: selectedPersonelId
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error("API yanıt vermedi");
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setOgrenmeDurumu({ ogrenmeLoading: false, ogrenildi: true });
      toast.success("Seçimleriniz başarıyla öğrenildi");
      
    } catch (err) {
      toast.error(`Öğrenme işlemi sırasında hata oluştu: ${(err as Error).message}`);
      setOgrenmeDurumu({ ogrenmeLoading: false, ogrenildi: false });
    }
  };
  
  // Yeni kayıt oluşturma fonksiyonu
  const yeniKayitOlustur = async () => {
    if (!yeniKayitDialog.value) {
      toast.error("Lütfen bir değer girin");
      return;
    }
    
    try {
      const response = await fetch("/api/talepler/analiz", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          yeniKayitlar: {
            [yeniKayitDialog.type]: yeniKayitDialog.value,
            departmanId: yeniKayitDialog.departmanId
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error("API yanıt vermedi");
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      toast.success(`Yeni ${yeniKayitDialog.type} başarıyla oluşturuldu`);
      
      // Yeni oluşturulan kaydı seç
      if (yeniKayitDialog.type === "departman" && data.departman) {
        onDepartmanChange(data.departman.id);
      } else if (yeniKayitDialog.type === "kategori" && data.kategori) {
        onKategoriChange(data.kategori.id);
      } else if (yeniKayitDialog.type === "personel" && data.personel) {
        onPersonelChange(data.personel.id);
      }
      
      // Dialog'u kapat
      setYeniKayitDialog({
        open: false,
        type: "departman",
        value: "",
        departmanId: ""
      });
      
    } catch (err) {
      toast.error(`Yeni kayıt oluşturulurken hata: ${(err as Error).message}`);
    }
  };
  
  // Sorun detayı değiştiğinde analizi temizle
  useEffect(() => {
    setAnaliz(null);
    setYeniKayitOner(null);
    setError(null);
    setOgrenmeDurumu({ ogrenmeLoading: false, ogrenildi: false });
  }, [sorunDetay]);
  
  // Kullanıcı seçimleri değiştiğinde öğrenme durumunu sıfırla
  useEffect(() => {
    setOgrenmeDurumu({ ogrenmeLoading: false, ogrenildi: false });
  }, [selectedKategoriId, selectedDepartmanId, selectedPersonelId]);
  
  // İlk yüklenmede sorun detayı varsa analiz yap
  useEffect(() => {
    if (sorunDetay && sorunDetay.trim().length >= 10) {
      // Bu hook component mount olunca çalışır, kullanıcı yazmaya başladığında değil
      // İlk analizde API çağrısı yapılmaması için yoruma alıyoruz
      // analizYap();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className="space-y-4">
      {/* Analiz Butonu */}
      <div className="flex justify-between items-center">
        <Button 
          onClick={analizYap} 
          disabled={loading || !sorunDetay || sorunDetay.trim().length < 10}
          variant="secondary"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analiz Yapılıyor
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Sorun Analizi Yap
            </>
          )}
        </Button>
        
        {/* Öğrenme Butonu */}
        {!ogrenmeDurumu.ogrenildi ? (
          <Button 
            onClick={ogrenmeYap} 
            disabled={ogrenmeDurumu.ogrenmeLoading || (!selectedKategoriId && !selectedDepartmanId && !selectedPersonelId)}
            variant="ghost"
            size="sm"
          >
            {ogrenmeDurumu.ogrenmeLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Öğreniliyor
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Seçimlerden Öğren
              </>
            )}
          </Button>
        ) : (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Check className="mr-1 h-3 w-3" /> Öğrenildi
          </Badge>
        )}
      </div>
      
      {/* Hata Mesajı */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Hata</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Yükleniyor */}
      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-[120px] w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      )}
      
      {/* Analiz Sonuçları */}
      {!loading && analiz && (
        <>
          <TalepAnalizSonuc 
            analiz={analiz}
            kategoriler={kategoriler}
            departmanlar={departmanlar}
            personeller={personeller}
          />
          
          {/* Form Aksiyonları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Departman Seçimi */}
            {analiz.onerilenDepartmanIdleri.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Departman Seçimi</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {analiz.onerilenDepartmanIdleri.map(id => {
                      const departman = Array.isArray(departmanlar) ? departmanlar.find(d => d.id === id) : undefined;
                      const isSelected = selectedDepartmanId === id;
                      return (
                        <Button 
                          key={id}
                          size="sm"
                          variant={isSelected ? "default" : "outline"}
                          className={isSelected ? "" : "hover:border-primary/50"}
                          onClick={() => onDepartmanChange(id)}
                        >
                          {departman?.ad || id}
                          {isSelected && <Check className="ml-2 h-3 w-3" />}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
                {yeniKayitOner?.departman && (
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setYeniKayitDialog({
                        open: true,
                        type: "departman",
                        value: yeniKayitOner.departman || "",
                        departmanId: ""
                      })}
                    >
                      <PlusCircle className="mr-2 h-3 w-3" />
                      &quot;{yeniKayitOner.departman}&quot; oluştur
                    </Button>
                  </CardFooter>
                )}
              </Card>
            )}
            
            {/* Kategori Seçimi */}
            {analiz.onerilenKategoriIdleri.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Kategori Seçimi</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {analiz.onerilenKategoriIdleri.map(id => {
                      const kategori = Array.isArray(kategoriler) ? kategoriler.find(k => k.id === id) : undefined;
                      const isSelected = selectedKategoriId === id;
                      return (
                        <Button 
                          key={id}
                          size="sm"
                          variant={isSelected ? "default" : "outline"}
                          className={isSelected ? "" : "hover:border-primary/50"}
                          onClick={() => onKategoriChange(id)}
                        >
                          {kategori?.ad || id}
                          {isSelected && <Check className="ml-2 h-3 w-3" />}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
                {yeniKayitOner?.kategori && (
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setYeniKayitDialog({
                        open: true,
                        type: "kategori",
                        value: yeniKayitOner.kategori || "",
                        departmanId: ""
                      })}
                    >
                      <PlusCircle className="mr-2 h-3 w-3" />
                      &quot;{yeniKayitOner.kategori}&quot; oluştur
                    </Button>
                  </CardFooter>
                )}
              </Card>
            )}
            
            {/* Personel Seçimi */}
            {analiz.onerilenPersonelIdleri.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Personel Seçimi</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {analiz.onerilenPersonelIdleri.map(id => {
                      const personel = Array.isArray(personeller) ? personeller.find(p => p.id === id) : undefined;
                      const isSelected = selectedPersonelId === id;
                      return (
                        <Button 
                          key={id}
                          size="sm"
                          variant={isSelected ? "default" : "outline"}
                          className={isSelected ? "" : "hover:border-primary/50"}
                          onClick={() => onPersonelChange(id)}
                        >
                          {personel ? `${personel.ad} ${personel.soyad}` : id}
                          {isSelected && <Check className="ml-2 h-3 w-3" />}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
                {yeniKayitOner?.personel && selectedDepartmanId && (
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setYeniKayitDialog({
                        open: true,
                        type: "personel",
                        value: yeniKayitOner.personel || "",
                        departmanId: selectedDepartmanId
                      })}
                    >
                      <PlusCircle className="mr-2 h-3 w-3" />
                      &quot;{yeniKayitOner.personel}&quot; oluştur
                    </Button>
                  </CardFooter>
                )}
              </Card>
            )}
          </div>
        </>
      )}
      
      {/* Yeni Kayıt Dialog */}
      <Dialog open={yeniKayitDialog.open} onOpenChange={(open) => setYeniKayitDialog({...yeniKayitDialog, open})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {yeniKayitDialog.type === 'departman' && 'Yeni Departman Oluştur'}
              {yeniKayitDialog.type === 'kategori' && 'Yeni Kategori Oluştur'}
              {yeniKayitDialog.type === 'personel' && 'Yeni Personel Oluştur'}
            </DialogTitle>
            <DialogDescription>
              {yeniKayitDialog.type === 'departman' && 'Yeni bir departman oluşturarak sisteme ekleyin.'}
              {yeniKayitDialog.type === 'kategori' && 'Yeni bir kategori oluşturarak sisteme ekleyin.'}
              {yeniKayitDialog.type === 'personel' && 'Yeni bir personel oluşturarak sisteme ekleyin.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Ad
              </Label>
              <Input
                id="name"
                value={yeniKayitDialog.value}
                onChange={(e) => setYeniKayitDialog({...yeniKayitDialog, value: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            {yeniKayitDialog.type === 'personel' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">
                  Departman
                </Label>
                <div className="col-span-3">
                  <select
                    id="department"
                    value={yeniKayitDialog.departmanId}
                    onChange={(e) => setYeniKayitDialog({...yeniKayitDialog, departmanId: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Departman Seçin</option>
                    {Array.isArray(departmanlar) && departmanlar.map((dep) => (
                      <option key={dep.id} value={dep.id}>{dep.ad}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setYeniKayitDialog({...yeniKayitDialog, open: false})}>
              İptal
            </Button>
            <Button onClick={yeniKayitOlustur}>
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 