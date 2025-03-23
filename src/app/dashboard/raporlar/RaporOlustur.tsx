"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileBarChart, FileLineChart, FilePieChart, PlusCircle, Trash2, Save, ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Rapor tipleri
const RAPOR_TIPLERI = [
  { id: "talep", etiket: "Talep Raporu", ikon: <FileBarChart className="h-4 w-4" /> },
  { id: "performans", etiket: "Performans Raporu", ikon: <FileLineChart className="h-4 w-4" /> },
  { id: "departman", etiket: "Departman Raporu", ikon: <FilePieChart className="h-4 w-4" /> }
];

// Grafik türleri
const GRAFIK_TURLERI = [
  { id: "cizgi", etiket: "Çizgi Grafiği" },
  { id: "sutun", etiket: "Sütun Grafiği" },
  { id: "pasta", etiket: "Pasta Grafiği" },
  { id: "alan", etiket: "Alan Grafiği" },
  { id: "cubuk", etiket: "Çubuk Grafiği" },
  { id: "radar", etiket: "Radar Grafiği" }
];

// Mevcut kaydedilmiş raporlar (örnek veri)
const MEVCUT_RAPORLAR = [
  { 
    id: "1", 
    ad: "Aylık Performans Özeti", 
    aciklama: "Aylık personel performans verilerini gösteren interaktif rapor", 
    tip: "performans", 
    grafik: "sutun",
    metrikler: ["cozum_suresi", "talep_sayisi", "sla_uyumu"]
  },
  { 
    id: "2", 
    ad: "Departman Bazlı Talep Analizi", 
    aciklama: "Departmanlara göre talep dağılımı ve çözüm süreleri", 
    tip: "departman", 
    grafik: "pasta",
    metrikler: ["talep_sayisi", "cozum_suresi", "personel_dagilimi"]
  },
  { 
    id: "3", 
    ad: "Haftalık SLA Performansı", 
    aciklama: "Son 4 haftanın SLA uyum performansı", 
    tip: "performans", 
    grafik: "cizgi",
    metrikler: ["sla_uyumu", "gecikme_orani"]
  },
];

interface RaporOlusturProps {
  anaSayfayaDon: () => void;
}

export default function RaporOlustur({ anaSayfayaDon }: RaporOlusturProps) {
  const [adim, setAdim] = useState<"liste" | "yeni" | "onizleme">("liste");
  const [seciliRapor, setSeciliRapor] = useState<any>(null);
  const [yeniRapor, setYeniRapor] = useState({
    ad: "",
    aciklama: "",
    tip: "talep",
    grafik: "sutun",
    metrikler: [] as string[],
    filtreler: {
      tarihAraligi: "son30gun",
      otomatikYenileme: false,
      varsayilanGorunum: "grafik"
    }
  });
  
  // Tüm metrikler
  const METRIKLER = {
    talep: [
      { id: "talep_sayisi", etiket: "Talep Sayısı" },
      { id: "cozum_suresi", etiket: "Çözüm Süresi" },
      { id: "durum_dagilimi", etiket: "Durum Dağılımı" },
      { id: "kategori_dagilimi", etiket: "Kategori Dağılımı" },
      { id: "oncelik_dagilimi", etiket: "Öncelik Dağılımı" },
      { id: "gecikme_orani", etiket: "Gecikme Oranı" }
    ],
    performans: [
      { id: "cozum_suresi", etiket: "Çözüm Süresi" },
      { id: "talep_sayisi", etiket: "Talep Sayısı" },
      { id: "sla_uyumu", etiket: "SLA Uyumu" },
      { id: "ilk_yanit_suresi", etiket: "İlk Yanıt Süresi" },
      { id: "personel_performansi", etiket: "Personel Performansı" },
      { id: "gecikme_orani", etiket: "Gecikme Oranı" }
    ],
    departman: [
      { id: "talep_sayisi", etiket: "Talep Sayısı" },
      { id: "cozum_suresi", etiket: "Çözüm Süresi" },
      { id: "personel_dagilimi", etiket: "Personel Dağılımı" },
      { id: "sla_uyumu", etiket: "SLA Uyumu" },
      { id: "departman_karsilastirma", etiket: "Departman Karşılaştırma" }
    ]
  };
  
  // Metrik seçimini değiştirme
  const metrikSeciminiDegistir = (metrikId: string) => {
    setYeniRapor(curr => {
      const metrikVar = curr.metrikler.includes(metrikId);
      
      if (metrikVar) {
        return {
          ...curr,
          metrikler: curr.metrikler.filter(id => id !== metrikId)
        };
      } else {
        return {
          ...curr,
          metrikler: [...curr.metrikler, metrikId]
        };
      }
    });
  };
  
  // Yeni rapor oluşturma
  const yeniRaporOlustur = () => {
    setYeniRapor({
      ad: "",
      aciklama: "",
      tip: "talep",
      grafik: "sutun",
      metrikler: [],
      filtreler: {
        tarihAraligi: "son30gun",
        otomatikYenileme: false,
        varsayilanGorunum: "grafik"
      }
    });
    setAdim("yeni");
  };
  
  // Rapor düzenleme
  const raporDuzenle = (rapor: any) => {
    setSeciliRapor(rapor);
    setYeniRapor({
      ad: rapor.ad,
      aciklama: rapor.aciklama,
      tip: rapor.tip,
      grafik: rapor.grafik,
      metrikler: [...rapor.metrikler],
      filtreler: {
        tarihAraligi: "son30gun",
        otomatikYenileme: false,
        varsayilanGorunum: "grafik"
      }
    });
    setAdim("yeni");
  };
  
  // Rapor silme
  const raporSil = (id: string) => {
    // Burada API çağrısı yapılabilir
    console.log(`Rapor silindi: ${id}`);
  };
  
  // Rapor kaydetme
  const raporKaydet = () => {
    // Burada API çağrısı yapılabilir
    console.log("Rapor kaydedildi:", yeniRapor);
    anaSayfayaDon();
  };
  
  // Önizleme oluşturma
  const raporOnizleme = () => {
    setAdim("onizleme");
  };
  
  return (
    <div className="space-y-4">
      {adim === "liste" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Kaydedilmiş Raporlar</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={anaSayfayaDon}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Gösterge Paneline Dön
              </Button>
              <Button 
                onClick={yeniRaporOlustur} 
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                Yeni Rapor Oluştur
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MEVCUT_RAPORLAR.map((rapor) => (
              <Card key={rapor.id} className="transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{rapor.ad}</CardTitle>
                      <CardDescription>{rapor.aciklama}</CardDescription>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Raporu Silmek İstediğinize Emin Misiniz?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bu işlem geri alınamaz. Bu rapor kalıcı olarak silinecek.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => raporSil(rapor.id)}
                          >
                            Raporu Sil
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-2 my-2">
                    {rapor.metrikler.map((metrik) => {
                      // Metrik etiketini bul
                      const metrikNesnesi = METRIKLER[rapor.tip as keyof typeof METRIKLER]
                        .find(m => m.id === metrik);
                      return (
                        <Badge key={metrik} variant="outline">
                          {metrikNesnesi?.etiket || metrik}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-0">
                  <Button variant="ghost" size="sm" onClick={() => raporDuzenle(rapor)}>
                    Düzenle
                  </Button>
                  <Button size="sm">Görüntüle</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
      
      {adim === "yeni" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {seciliRapor ? "Rapor Düzenle" : "Yeni Rapor Oluştur"}
            </h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setAdim("liste")}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Listeye Dön
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Rapor Detayları</CardTitle>
                <CardDescription>Raporunuzu tanımlayan bilgileri girin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rapor-adi">Rapor Adı</Label>
                  <Input 
                    id="rapor-adi" 
                    placeholder="Rapor adını girin" 
                    value={yeniRapor.ad}
                    onChange={(e) => setYeniRapor(curr => ({ ...curr, ad: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rapor-aciklama">Açıklama</Label>
                  <Textarea 
                    id="rapor-aciklama" 
                    placeholder="Rapor açıklamasını girin" 
                    value={yeniRapor.aciklama}
                    onChange={(e) => setYeniRapor(curr => ({ ...curr, aciklama: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rapor-tip">Rapor Tipi</Label>
                  <Select 
                    value={yeniRapor.tip} 
                    onValueChange={(tip) => setYeniRapor(curr => ({ 
                      ...curr, 
                      tip, 
                      metrikler: [] 
                    }))}
                  >
                    <SelectTrigger id="rapor-tip">
                      <SelectValue placeholder="Rapor tipini seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {RAPOR_TIPLERI.map((tip) => (
                        <SelectItem key={tip.id} value={tip.id}>
                          <div className="flex items-center gap-2">
                            {tip.ikon}
                            <span>{tip.etiket}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rapor-grafik">Grafik Türü</Label>
                  <Select 
                    value={yeniRapor.grafik} 
                    onValueChange={(grafik) => setYeniRapor(curr => ({ ...curr, grafik }))}
                  >
                    <SelectTrigger id="rapor-grafik">
                      <SelectValue placeholder="Grafik türünü seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRAFIK_TURLERI.map((grafik) => (
                        <SelectItem key={grafik.id} value={grafik.id}>
                          {grafik.etiket}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Metrikler ve Filtreler</CardTitle>
                <CardDescription>Raporda görüntülenecek verileri seçin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Gösterilecek Metrikler</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {METRIKLER[yeniRapor.tip as keyof typeof METRIKLER].map((metrik) => (
                      <div key={metrik.id} className="flex items-center space-x-2">
                        <Switch 
                          id={`metrik-${metrik.id}`}
                          checked={yeniRapor.metrikler.includes(metrik.id)}
                          onCheckedChange={() => metrikSeciminiDegistir(metrik.id)}
                        />
                        <Label htmlFor={`metrik-${metrik.id}`}>{metrik.etiket}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tarih-araligi">Varsayılan Tarih Aralığı</Label>
                  <Select 
                    value={yeniRapor.filtreler.tarihAraligi} 
                    onValueChange={(tarihAraligi) => setYeniRapor(curr => ({ 
                      ...curr, 
                      filtreler: { 
                        ...curr.filtreler, 
                        tarihAraligi 
                      }
                    }))}
                  >
                    <SelectTrigger id="tarih-araligi">
                      <SelectValue placeholder="Tarih aralığını seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bugun">Bugün</SelectItem>
                      <SelectItem value="dun">Dün</SelectItem>
                      <SelectItem value="hafta">Bu Hafta</SelectItem>
                      <SelectItem value="son7gun">Son 7 Gün</SelectItem>
                      <SelectItem value="ay">Bu Ay</SelectItem>
                      <SelectItem value="son30gun">Son 30 Gün</SelectItem>
                      <SelectItem value="yil">Bu Yıl</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label>Genel Ayarlar</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="otomatik-yenileme"
                        checked={yeniRapor.filtreler.otomatikYenileme}
                        onCheckedChange={(otomatikYenileme) => setYeniRapor(curr => ({ 
                          ...curr, 
                          filtreler: { 
                            ...curr.filtreler, 
                            otomatikYenileme 
                          }
                        }))}
                      />
                      <Label htmlFor="otomatik-yenileme">Otomatik Yenileme</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="varsayilan-gorunum-grafik"
                        checked={yeniRapor.filtreler.varsayilanGorunum === "grafik"}
                        onCheckedChange={(checked) => setYeniRapor(curr => ({ 
                          ...curr, 
                          filtreler: { 
                            ...curr.filtreler, 
                            varsayilanGorunum: checked ? "grafik" : "tablo"
                          }
                        }))}
                      />
                      <Label htmlFor="varsayilan-gorunum-grafik">
                        Varsayılan görünüm: 
                        <span className="ml-1 font-semibold">
                          {yeniRapor.filtreler.varsayilanGorunum === "grafik" ? "Grafik" : "Tablo"}
                        </span>
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setAdim("liste")}>İptal</Button>
            <Button variant="outline" onClick={raporOnizleme}>Önizleme</Button>
            <Button 
              onClick={raporKaydet}
              disabled={!yeniRapor.ad || yeniRapor.metrikler.length === 0}
            >
              <Save className="mr-2 h-4 w-4" />
              Raporu Kaydet
            </Button>
          </div>
        </>
      )}
      
      {adim === "onizleme" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Rapor Önizleme: {yeniRapor.ad}</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setAdim("yeni")}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Düzenlemeye Dön
              </Button>
              <Button 
                onClick={raporKaydet}
                disabled={!yeniRapor.ad || yeniRapor.metrikler.length === 0}
              >
                <Save className="mr-2 h-4 w-4" />
                Raporu Kaydet
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>{yeniRapor.ad}</CardTitle>
              <CardDescription>{yeniRapor.aciklama}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="grafik">
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="grafik">Grafik</TabsTrigger>
                    <TabsTrigger value="tablo">Tablo</TabsTrigger>
                  </TabsList>
                  
                  <div className="text-sm text-muted-foreground">
                    Seçilen metrikler: {yeniRapor.metrikler.map(m => {
                      const metrikNesnesi = METRIKLER[yeniRapor.tip as keyof typeof METRIKLER]
                        .find(metrik => metrik.id === m);
                      return metrikNesnesi?.etiket;
                    }).join(", ")}
                  </div>
                </div>
                
                <TabsContent value="grafik" className="mt-0">
                  <div className="h-[400px] flex items-center justify-center bg-slate-50 rounded-md">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2">Grafik Önizleme</div>
                      <p className="text-muted-foreground">
                        Gerçek veriler rapor kaydedildikten sonra burada görüntülenecek
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="tablo" className="mt-0">
                  <div className="h-[400px] flex items-center justify-center bg-slate-50 rounded-md">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2">Tablo Önizleme</div>
                      <p className="text-muted-foreground">
                        Gerçek veriler rapor kaydedildikten sonra burada görüntülenecek
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 