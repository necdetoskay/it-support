"use client";

import { HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function YedeklemeYardim() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HelpCircle className="mr-2 h-4 w-4" />
          Yardım
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Veritabanı Yedekleme Yardımı</DialogTitle>
          <DialogDescription>
            Veritabanı yedekleme ve geri yükleme işlemleri hakkında yardım
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 max-h-[70vh] overflow-y-auto pr-2">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Yedekleme tipleri nelerdir?</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">
                  <strong>Tam Yedek (Full Backup):</strong> Veritabanının şema yapısı ve tüm verileri yedeklenir.
                </p>
                <p className="mb-2">
                  <strong>Sadece Veri (Data-Only):</strong> Yalnızca veritabanındaki veriler yedeklenir, tablo yapıları ve diğer şema nesneleri yedeklenmez.
                </p>
                <p className="mb-2">
                  <strong>Sadece Şema (Schema-Only):</strong> Yalnızca veritabanı yapısı yedeklenir, içindeki veriler dahil edilmez.
                </p>
                <p className="mb-2">
                  <strong>Seçili Tablolar:</strong> Yalnızca seçtiğiniz tabloların tam yedeği (şema + veri) alınır.
                </p>
                <p className="mb-2">
                  <strong>JSON Yedek:</strong> Veriler JSON formatında yedeklenir. PostgreSQL araçları (pg_dump) gerekmez ama sadece verileri kaydeder, ilişkisel yapı ve veri bütünlüğü garantisi yoktur.
                </p>
                <p className="mb-2">
                  <strong>Node.js ile pg_dump:</strong> Node.js kütüphanesi kullanarak pg_dump aracını çalıştırır. Sistemde PostgreSQL araçlarının kurulu olması gerekmez.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Ne sıklıkta yedek almalıyım?</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">
                  Yedekleme sıklığı, veritabanınızın kritikliğine ve veri değişim hızına bağlıdır:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Yüksek kritiklik:</strong> Günlük tam yedek, saatlik artımlı yedek</li>
                  <li><strong>Orta kritiklik:</strong> Haftalık tam yedek, günlük artımlı yedek</li>
                  <li><strong>Düşük kritiklik:</strong> Aylık tam yedek</li>
                </ul>
                <p className="mt-2">
                  Otomatik yedekleme ayarlarını kullanarak düzenli yedekleme planı oluşturabilirsiniz.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Yedekleri nasıl güvenli saklarım?</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">
                  Yedeklerinizi güvende tutmak için şu adımları izleyin:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Yedekleri farklı fiziksel lokasyonlarda saklayın</li>
                  <li>Bulut depolama hizmetlerine (Google Drive, Dropbox, vb.) düzenli olarak yedekleyin</li>
                  <li>Yedekleri şifreleyin</li>
                  <li>Yedeklerin düzenli olarak doğruluğunu kontrol edin</li>
                  <li>Yedekleme ve geri yükleme prosedürlerini düzenli olarak test edin</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Geri yükleme işlemi nasıl çalışır?</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">
                  Geri yükleme işlemi, yedek dosyasını kullanarak veritabanını belirli bir noktadaki durumuna döndürür:
                </p>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>Geri yüklemek istediğiniz yedeği seçin</li>
                  <li>Geri yükleme öncesi mevcut durumun otomatik yedeğinin alınmasını öneriyoruz</li>
                  <li>Sistem, seçilen yedeği kullanarak veritabanını yeniden oluşturur</li>
                  <li>İşlem tamamlandığında veritabanı seçilen yedekteki durumuna geri dönmüş olur</li>
                </ol>
                <p className="mt-2 text-yellow-600">
                  <strong>Uyarı:</strong> Geri yükleme işlemi mevcut veritabanının üzerine yazacaktır. Bu işlem geri alınamaz!
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Hangi yedeği geri yüklemeliyim?</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">
                  Doğru yedeği seçmek için şunları göz önünde bulundurun:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Son bilinen iyi durum:</strong> Veritabanının sorunsuz çalıştığı en son noktaya ait yedeği seçin</li>
                  <li><strong>Zaman çizelgesi:</strong> "Tarih" sekmesini kullanarak belirli bir tarihte alınmış yedekleri bulabilirsiniz</li>
                  <li><strong>Yedek tipi:</strong> Genellikle tam yedekler (full backup) geri yükleme için en güvenli seçenektir</li>
                  <li><strong>Yedek açıklaması:</strong> Yedek alırken girilen açıklamalar, doğru yedeği seçmenize yardımcı olabilir</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger>Sorun giderme</AccordionTrigger>
              <AccordionContent>
                <p className="font-semibold mb-2">Sık karşılaşılan sorunlar ve çözümleri:</p>
                
                <div className="mb-3">
                  <p className="font-medium">Yedekleme hatası: "pg_dump command not found"</p>
                  <p className="text-sm">Çözüm: JSON yedekleme tipini seçin veya Node.js pg_dump seçeneklerini deneyin. Bu seçenekler PostgreSQL bağımlılığı olmadan çalışır.</p>
                </div>
                
                <div className="mb-3">
                  <p className="font-medium">Geri yükleme hatası: "pg_restore command not found"</p>
                  <p className="text-sm">Çözüm: JSON yedekleme tipini seçin ve onunla alınmış bir yedeği geri yükleyin.</p>
                </div>
                
                <div className="mb-3">
                  <p className="font-medium">Yedek dosyası bulunamadı hatası</p>
                  <p className="text-sm">Çözüm: Yedekleme dizini değişmiş veya yedek dosyası silinmiş olabilir. Mevcut yedekleri kontrol edin.</p>
                </div>
                
                <div className="mb-3">
                  <p className="font-medium">Geri yükleme sırasında "veritabanı kullanımda" hatası</p>
                  <p className="text-sm">Çözüm: Geri yükleme öncesinde veritabanına bağlı tüm uygulamaları kapatın.</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
} 