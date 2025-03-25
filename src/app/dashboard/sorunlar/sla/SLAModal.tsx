"use client";
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// SLA kuralı tipi tanımı
export type SLAKurali = {
  id: string;
  kategoriId: string;
  oncelik: string;
  yanitlamaSuresi: number;
  cozumSuresi: number;
  kategori?: {
    ad: string;
  };
};

// Kategori tipi tanımı
export type Kategori = {
  id: string;
  ad: string;
};

// Form doğrulama şeması
export const slaFormSchema = z.object({
  kategoriId: z.string().min(1, "Kategori seçimi zorunludur"),
  oncelik: z.string().min(1, "Öncelik seçimi zorunludur"),
  yanitlamaSuresi: z.coerce.number().min(1, "En az 1 saat olmalıdır"),
  cozumSuresi: z.coerce.number().min(1, "En az 1 saat olmalıdır"),
});

type SLAModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duzenlemeModu: boolean;
  seciliSLA: SLAKurali | null;
  kategoriler: Kategori[];
  yenile: () => void;
};

export function SLAModal({
  open,
  onOpenChange,
  duzenlemeModu,
  seciliSLA,
  kategoriler,
  yenile
}: SLAModalProps) {
  const [islemYapiliyor, setIslemYapiliyor] = useState(false);

  // Form tanımı
  const form = useForm<z.infer<typeof slaFormSchema>>({
    resolver: zodResolver(slaFormSchema),
    defaultValues: {
      kategoriId: duzenlemeModu && seciliSLA ? seciliSLA.kategoriId : kategoriler.length > 0 ? kategoriler[0].id : "placeholder",
      oncelik: duzenlemeModu && seciliSLA ? seciliSLA.oncelik : "DUSUK",
      yanitlamaSuresi: duzenlemeModu && seciliSLA ? seciliSLA.yanitlamaSuresi : 1,
      cozumSuresi: duzenlemeModu && seciliSLA ? seciliSLA.cozumSuresi : 1,
    },
  });

  // Düzenleme modunda formu doldur
  useEffect(() => {
    if (duzenlemeModu && seciliSLA) {
      form.reset({
        kategoriId: seciliSLA.kategoriId,
        oncelik: seciliSLA.oncelik,
        yanitlamaSuresi: seciliSLA.yanitlamaSuresi,
        cozumSuresi: seciliSLA.cozumSuresi,
      });
    } else if (kategoriler.length > 0) {
      // Eğer kategoriler yüklendiyse, ilk kategoriyi seçili hale getir
      form.reset({
        kategoriId: kategoriler[0].id,
        oncelik: "DUSUK", // Varsayılan öncelik
        yanitlamaSuresi: 1,
        cozumSuresi: 1,
      });
    }
  }, [duzenlemeModu, seciliSLA, kategoriler, form]);

  // SLA kuralı ekle/düzenle
  const slaKaydini = async (values: z.infer<typeof slaFormSchema>) => {
    try {
      setIslemYapiliyor(true);
      
      const endpoint = duzenlemeModu && seciliSLA 
        ? `/api/sla/${seciliSLA.id}` 
        : "/api/sla";
      
      const method = duzenlemeModu ? "PUT" : "POST";
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Bir hata oluştu");
      }
      
      toast.success(duzenlemeModu
        ? "SLA kuralı başarıyla güncellendi"
        : "SLA kuralı başarıyla eklendi"
      );
      
      // Modali kapat ve listeyi yenile
      onOpenChange(false);
      yenile();
    } catch (error: any) {
      console.error("SLA işlemi başarısız:", error);
      toast.error(error.message || (duzenlemeModu
        ? "SLA kuralı güncellenirken bir hata oluştu"
        : "SLA kuralı eklenirken bir hata oluştu")
      );
    } finally {
      setIslemYapiliyor(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {duzenlemeModu ? "SLA Kuralını Düzenle" : "Yeni SLA Kuralı Ekle"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(slaKaydini)} className="space-y-4">
            <FormField
              control={form.control}
              name="kategoriId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={islemYapiliyor}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {kategoriler.length > 0 ? (
                        kategoriler.map((kategori) => (
                          <SelectItem key={kategori.id} value={kategori.id}>
                            {kategori.ad}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="placeholder">Kategori yükleniyor...</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="oncelik"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Öncelik</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={islemYapiliyor}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Öncelik seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DUSUK">Düşük</SelectItem>
                      <SelectItem value="ORTA">Orta</SelectItem>
                      <SelectItem value="YUKSEK">Yüksek</SelectItem>
                      <SelectItem value="ACIL">Acil</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="yanitlamaSuresi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yanıtlama Süresi (saat)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      {...field} 
                      disabled={islemYapiliyor} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cozumSuresi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Çözüm Süresi (saat)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      {...field} 
                      disabled={islemYapiliyor} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-3 pt-3">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                type="button"
                disabled={islemYapiliyor}
              >
                İptal
              </Button>
              <Button 
                type="submit"
                disabled={islemYapiliyor}
              >
                {islemYapiliyor ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {duzenlemeModu ? "Güncelleniyor..." : "Ekleniyor..."}
                  </>
                ) : (
                  duzenlemeModu ? "Güncelle" : "Ekle"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 