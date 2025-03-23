"use client";

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TalepAnalizi } from '@/lib/talep-analiz';

interface TalepAnalizSonucProps {
  analiz: TalepAnalizi;
  kategoriler: Array<{ id: string; ad: string }>;
  departmanlar: Array<{ id: string; ad: string }>;
  personeller: Array<{ id: string; ad: string; soyad: string }>;
}

export function TalepAnalizSonuc({ 
  analiz, 
  kategoriler, 
  departmanlar, 
  personeller 
}: TalepAnalizSonucProps) {
  
  // ID'den ad bulma yardımcı fonksiyonları
  const getKategoriAd = (id: string) => {
    if (!Array.isArray(kategoriler)) return "Bilinmiyor";
    const kategori = kategoriler.find(k => k.id === id);
    return kategori ? kategori.ad : "Bilinmiyor";
  };
  
  const getDepartmanAd = (id: string) => {
    if (!Array.isArray(departmanlar)) return "Bilinmiyor";
    const departman = departmanlar.find(d => d.id === id);
    return departman ? departman.ad : "Bilinmiyor";
  };
  
  const getPersonelAd = (id: string) => {
    if (!Array.isArray(personeller)) return "Bilinmiyor";
    const personel = personeller.find(p => p.id === id);
    return personel ? `${personel.ad} ${personel.soyad}` : "Bilinmiyor";
  };
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3">
          <span>Talep Analizi</span>
          {(analiz.departmanId || analiz.kategoriId || analiz.personelId) ? (
            <Badge className="text-xs" variant="success">Sonuç Bulundu</Badge>
          ) : (
            <Badge className="text-xs" variant="destructive">Eşleşme Bulunamadı</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Yapay zeka destekli analiz sonuçları
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col">
            <span className="text-sm font-semibold mb-1">Departman</span>
            {analiz.departmanId ? (
              <span className="text-primary font-medium">{getDepartmanAd(analiz.departmanId)}</span>
            ) : (
              <span className="text-muted-foreground italic">Belirlenemedi</span>
            )}
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-semibold mb-1">Kategori</span>
            {analiz.kategoriId ? (
              <span className="text-primary font-medium">{getKategoriAd(analiz.kategoriId)}</span>
            ) : (
              <span className="text-muted-foreground italic">Belirlenemedi</span>
            )}
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-semibold mb-1">İlgili Personel</span>
            {analiz.personelId ? (
              <span className="text-primary font-medium">{getPersonelAd(analiz.personelId)}</span>
            ) : (
              <span className="text-muted-foreground italic">Belirlenemedi</span>
            )}
          </div>
        </div>
        
        <Accordion type="single" collapsible className="mt-4">
          <AccordionItem value="detaylar">
            <AccordionTrigger>Analiz Detayları</AccordionTrigger>
            <AccordionContent>
              <h4 className="text-sm font-semibold mt-2 mb-1">Önerilen Departmanlar</h4>
              {analiz.onerilenDepartmanIdleri.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-4">
                  {analiz.onerilenDepartmanIdleri.map(id => (
                    <Badge 
                      key={id} 
                      variant={analiz.departmanId === id ? "default" : "outline"}
                      className="flex items-center gap-1"
                    >
                      {getDepartmanAd(id)}
                      <span className="text-xs opacity-75">
                        ({(analiz.benzerlikPuanlari.departman[id] * 100).toFixed(0)}%)
                      </span>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">Önerilen departman bulunamadı</p>
              )}
              
              <h4 className="text-sm font-semibold mt-2 mb-1">Önerilen Kategoriler</h4>
              {analiz.onerilenKategoriIdleri.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-4">
                  {analiz.onerilenKategoriIdleri.map(id => (
                    <Badge 
                      key={id} 
                      variant={analiz.kategoriId === id ? "default" : "outline"}
                      className="flex items-center gap-1"
                    >
                      {getKategoriAd(id)}
                      <span className="text-xs opacity-75">
                        ({(analiz.benzerlikPuanlari.kategori[id] * 100).toFixed(0)}%)
                      </span>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">Önerilen kategori bulunamadı</p>
              )}
              
              <h4 className="text-sm font-semibold mt-2 mb-1">Önerilen Personeller</h4>
              {analiz.onerilenPersonelIdleri.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-4">
                  {analiz.onerilenPersonelIdleri.map(id => (
                    <Badge 
                      key={id} 
                      variant={analiz.personelId === id ? "default" : "outline"}
                      className="flex items-center gap-1"
                    >
                      {getPersonelAd(id)}
                      <span className="text-xs opacity-75">
                        ({(analiz.benzerlikPuanlari.personel[id] * 100).toFixed(0)}%)
                      </span>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">Önerilen personel bulunamadı</p>
              )}
              
              <h4 className="text-sm font-semibold mt-4 mb-1">Tanımlanan Varlıklar</h4>
              {analiz.tespit.departmanlar.length > 0 || analiz.tespit.personeller.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableCaption>Metinde tanımlanan olası departman ve personeller</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tür</TableHead>
                        <TableHead>Ad</TableHead>
                        <TableHead className="text-right">Benzerlik</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analiz.tespit.departmanlar.map(dep => (
                        <TableRow key={`dep-${dep.id}`}>
                          <TableCell className="font-medium">Departman</TableCell>
                          <TableCell>{dep.ad}</TableCell>
                          <TableCell className="text-right">{(dep.benzerlikPuani * 100).toFixed(0)}%</TableCell>
                        </TableRow>
                      ))}
                      {analiz.tespit.personeller.map(per => (
                        <TableRow key={`per-${per.id}`}>
                          <TableCell className="font-medium">Personel</TableCell>
                          <TableCell>{per.tamAd}</TableCell>
                          <TableCell className="text-right">{(per.benzerlikPuani * 100).toFixed(0)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Tanımlanan varlık bulunamadı</p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
} 