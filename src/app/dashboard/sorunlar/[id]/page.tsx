"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, MessageSquare, History, FileText } from "lucide-react";

interface Sorun {
  id: string;
  baslik: string;
  aciklama: string;
  durum: string;
  oncelik: string;
  kategori: string;
  departman: string;
  atanan: string;
  olusturan: string;
  olusturmaTarihi: string;
  slaDurumu: string;
}

interface Yorum {
  id: string;
  icerik: string;
  olusturan: string;
  olusturmaTarihi: string;
}

export default function SorunDetayPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [sorun, setSorun] = useState<Sorun | null>(null);
  const [yorumlar, setYorumlar] = useState<Yorum[]>([]);
  const [yeniYorum, setYeniYorum] = useState("");
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    getSorunDetay();
    getYorumlar();
  }, [params.id]);

  const getSorunDetay = async () => {
    try {
      const response = await fetch(`/api/sorunlar/${params.id}`);
      if (!response.ok) throw new Error("Sorun detayı yüklenirken hata oluştu");
      const data = await response.json();
      setSorun(data);
    } catch (error) {
      console.error("Hata:", error);
      toast.error("Sorun detayı yüklenirken hata oluştu");
    } finally {
      setYukleniyor(false);
    }
  };

  const getYorumlar = async () => {
    try {
      const response = await fetch(`/api/sorunlar/${params.id}/yorumlar`);
      if (!response.ok) throw new Error("Yorumlar yüklenirken hata oluştu");
      const data = await response.json();
      setYorumlar(data);
    } catch (error) {
      console.error("Hata:", error);
      toast.error("Yorumlar yüklenirken hata oluştu");
    }
  };

  const handleYorumEkle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/sorunlar/${params.id}/yorumlar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ icerik: yeniYorum }),
      });

      if (!response.ok) throw new Error("Yorum eklenirken hata oluştu");
      
      setYeniYorum("");
      getYorumlar();
      toast.success("Yorum başarıyla eklendi");
    } catch (error) {
      console.error("Hata:", error);
      toast.error("Yorum eklenirken hata oluştu");
    }
  };

  if (yukleniyor) {
    return <div>Yükleniyor...</div>;
  }

  if (!sorun) {
    return <div>Sorun bulunamadı</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/sorunlar")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{sorun.baslik}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            variant={
              sorun.durum === "acik"
                ? "default"
                : sorun.durum === "beklemede"
                ? "secondary"
                : sorun.durum === "cozuldu"
                ? "success"
                : "destructive"
            }
          >
            {sorun.durum}
          </Badge>
          <Badge
            variant={
              sorun.oncelik === "acil"
                ? "destructive"
                : sorun.oncelik === "yuksek"
                ? "default"
                : sorun.oncelik === "normal"
                ? "secondary"
                : "outline"
            }
          >
            {sorun.oncelik}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Açıklama</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{sorun.aciklama}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Kategori</p>
                <p>{sorun.kategori}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Departman</p>
                <p>{sorun.departman}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Atanan</p>
                <p>{sorun.atanan}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Oluşturan</p>
                <p>{sorun.olusturan}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Oluşturma Tarihi</p>
                <p>
                  {new Date(sorun.olusturmaTarihi).toLocaleDateString("tr-TR")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">SLA Durumu</p>
                <Badge
                  variant={
                    sorun.slaDurumu === "normal"
                      ? "success"
                      : sorun.slaDurumu === "uyari"
                      ? "warning"
                      : "destructive"
                  }
                >
                  {sorun.slaDurumu}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="yorumlar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="yorumlar">
            <MessageSquare className="w-4 h-4 mr-2" />
            Yorumlar
          </TabsTrigger>
          <TabsTrigger value="gecmis">
            <History className="w-4 h-4 mr-2" />
            Geçmiş
          </TabsTrigger>
          <TabsTrigger value="makaleler">
            <FileText className="w-4 h-4 mr-2" />
            Makaleler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="yorumlar" className="space-y-4">
          <div className="space-y-4">
            {yorumlar.map((yorum) => (
              <Card key={yorum.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{yorum.olusturan}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(yorum.olusturmaTarihi).toLocaleDateString(
                          "tr-TR"
                        )}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap">{yorum.icerik}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <form onSubmit={handleYorumEkle} className="space-y-4">
            <Textarea
              placeholder="Yorum ekle..."
              value={yeniYorum}
              onChange={(e) => setYeniYorum(e.target.value)}
              required
              rows={3}
            />
            <Button type="submit">Yorum Ekle</Button>
          </form>
        </TabsContent>

        <TabsContent value="gecmis">
          <Card>
            <CardContent className="pt-6">
              <p>Geçmiş bilgisi bulunamadı</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="makaleler">
          <Card>
            <CardContent className="pt-6">
              <p>İlgili makale bulunamadı</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 