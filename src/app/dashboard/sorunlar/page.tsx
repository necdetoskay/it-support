"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Sorun {
  id: string;
  baslik: string;
  durum: string;
  oncelik: string;
  kategori: string;
  departman: string;
  atanan: string;
  olusturan: string;
  olusturmaTarihi: string;
  slaDurumu: string;
}

export default function SorunlarPage() {
  const [sorunlar, setSorunlar] = useState<Sorun[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [aramaMetni, setAramaMetni] = useState("");
  const [durum, setDurum] = useState<string>("");
  const [oncelik, setOncelik] = useState<string>("");
  const [kategori, setKategori] = useState<string>("");
  const [departman, setDepartman] = useState<string>("");
  const [atanan, setAtanan] = useState<string>("");

  useEffect(() => {
    getSorunlar();
  }, [aramaMetni, durum, oncelik, kategori, departman, atanan]);

  const getSorunlar = async () => {
    try {
      setYukleniyor(true);
      const params = new URLSearchParams();
      if (aramaMetni) params.append("arama", aramaMetni);
      if (durum) params.append("durum", durum);
      if (oncelik) params.append("oncelik", oncelik);
      if (kategori) params.append("kategori", kategori);
      if (departman) params.append("departman", departman);
      if (atanan) params.append("atanan", atanan);

      const response = await fetch(`/api/sorunlar?${params.toString()}`);
      if (!response.ok) throw new Error("Sorunlar yüklenirken hata oluştu");
      
      const data = await response.json();
      setSorunlar(data);
    } catch (error) {
      console.error("Hata:", error);
      toast.error("Sorunlar yüklenirken hata oluştu");
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sorunlar</h1>
        <Link href="/dashboard/sorunlar/yeni">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Sorun
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Sorun ara..."
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={durum} onValueChange={setDurum}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tümü</SelectItem>
              <SelectItem value="acik">Açık</SelectItem>
              <SelectItem value="beklemede">Beklemede</SelectItem>
              <SelectItem value="cozuldu">Çözüldü</SelectItem>
              <SelectItem value="kapandi">Kapandı</SelectItem>
            </SelectContent>
          </Select>

          <Select value={oncelik} onValueChange={setOncelik}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Öncelik" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tümü</SelectItem>
              <SelectItem value="dusuk">Düşük</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="yuksek">Yüksek</SelectItem>
              <SelectItem value="acil">Acil</SelectItem>
            </SelectContent>
          </Select>

          <Select value={kategori} onValueChange={setKategori}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tümü</SelectItem>
              <SelectItem value="donanim">Donanım</SelectItem>
              <SelectItem value="yazilim">Yazılım</SelectItem>
              <SelectItem value="ag">Ağ</SelectItem>
              <SelectItem value="diger">Diğer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={departman} onValueChange={setDepartman}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Departman" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tümü</SelectItem>
              <SelectItem value="it">IT</SelectItem>
              <SelectItem value="muhasebe">Muhasebe</SelectItem>
              <SelectItem value="insanKaynaklari">İnsan Kaynakları</SelectItem>
              <SelectItem value="satis">Satış</SelectItem>
            </SelectContent>
          </Select>

          <Select value={atanan} onValueChange={setAtanan}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Atanan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tümü</SelectItem>
              <SelectItem value="ahmet">Ahmet Yılmaz</SelectItem>
              <SelectItem value="mehmet">Mehmet Demir</SelectItem>
              <SelectItem value="ayse">Ayşe Kaya</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Başlık</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Öncelik</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Departman</TableHead>
              <TableHead>Atanan</TableHead>
              <TableHead>Oluşturan</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead>SLA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {yukleniyor ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center">
                  Yükleniyor...
                </TableCell>
              </TableRow>
            ) : sorunlar.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center">
                  Sorun bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              sorunlar.map((sorun) => (
                <TableRow key={sorun.id}>
                  <TableCell>{sorun.id}</TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/sorunlar/${sorun.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {sorun.baslik}
                    </Link>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>{sorun.kategori}</TableCell>
                  <TableCell>{sorun.departman}</TableCell>
                  <TableCell>{sorun.atanan}</TableCell>
                  <TableCell>{sorun.olusturan}</TableCell>
                  <TableCell>
                    {new Date(sorun.olusturmaTarihi).toLocaleDateString("tr-TR")}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 