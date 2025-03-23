"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { TalepAnaliz } from "./_components/talep-analiz";

const formSchema = z.object({
  baslik: z.string().min(5, "Başlık en az 5 karakter olmalıdır"),
  sorunDetay: z.string().min(10, "Sorun detayı en az 10 karakter olmalıdır"),
  departmanId: z.string().min(1, "Lütfen bir departman seçin"),
  kategoriId: z.string().min(1, "Lütfen bir kategori seçin"),
  oncelik: z.enum(["DUSUK", "ORTA", "YUKSEK", "ACIL"]),
  talepTipi: z.enum(["ARIZA_BILDIRIMI", "DESTEK_TALEBI", "BILGI_ISTEGI", "DEGISIKLIK_ISTEGI"]),
  personelId: z.string().optional(),
  ekDosyalar: z.array(z.any()).optional(),
});

export default function YeniTalepPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kategoriler, setKategoriler] = useState([
    { id: "1", ad: "Donanım" },
    { id: "2", ad: "Yazılım" },
    { id: "3", ad: "Ağ" },
    { id: "4", ad: "Sistem" },
  ]);
  const [departmanlar, setDepartmanlar] = useState([
    { id: "1", ad: "Bilgi Teknolojileri" },
    { id: "2", ad: "İnsan Kaynakları" },
    { id: "3", ad: "Muhasebe" },
    { id: "4", ad: "Satış ve Pazarlama" },
  ]);
  const [personeller, setPersoneller] = useState([
    { id: "1", ad: "Ahmet Yılmaz" },
    { id: "2", ad: "Mehmet Demir" },
    { id: "3", ad: "Ayşe Kaya" },
    { id: "4", ad: "Fatma Çelik" },
  ]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      baslik: "",
      sorunDetay: "",
      departmanId: "",
      kategoriId: "",
      oncelik: "ORTA",
      talepTipi: "ARIZA_BILDIRIMI",
      personelId: "",
      ekDosyalar: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      // API isteği simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Form değerleri:", values);
      
      // Başarılı işlem
      toast.success("Talebiniz başarıyla oluşturuldu.");
      form.reset();
    } catch (error) {
      console.error("Form gönderiminde hata:", error);
      toast.error("Talebiniz oluşturulurken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const { control, handleSubmit, setValue, watch } = form;
  const sorunDetay = watch("sorunDetay");
  const selectedKategoriId = watch("kategoriId");
  const selectedDepartmanId = watch("departmanId");
  const selectedPersonelId = watch("personelId");

  const handleKategoriChange = (kategoriId: string) => {
    setValue("kategoriId", kategoriId);
  };

  const handleDepartmanChange = (departmanId: string) => {
    setValue("departmanId", departmanId);
  };

  const handlePersonelChange = (personelId: string) => {
    setValue("personelId", personelId);
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Yeni Talep Oluştur</h1>
          <p className="text-muted-foreground">
            Destek talebinizi oluşturun, en kısa sürede yanıtlanacaktır.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/talepler">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Taleplerim
          </Link>
        </Button>
      </div>

      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Sorun Detayı</CardTitle>
              <CardDescription>
                Lütfen sorununuzu ayrıntılı bir şekilde açıklayın. Detaylı açıklama, doğru kategori önerileri için önemlidir.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={control}
                name="baslik"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Başlık</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Sorun başlığı..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Talebinizi en iyi şekilde özetleyen kısa bir başlık
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="sorunDetay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sorun Açıklaması</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Lütfen sorununuzu detaylı bir şekilde açıklayın... Örneğin: Bilgisayarım dün öğleden beri açılmıyor, ekranda mavi bir hata ekranı gösteriyor ve sürekli yeniden başlıyor."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Yaşadığınız sorunu ne zaman başladığı, hangi cihazda olduğu gibi detaylarla açıklayın
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <TalepAnaliz 
            sorunDetay={sorunDetay}
            onKategoriChange={handleKategoriChange}
            onDepartmanChange={handleDepartmanChange}
            onPersonelChange={handlePersonelChange}
            selectedKategoriId={selectedKategoriId}
            selectedDepartmanId={selectedDepartmanId}
            selectedPersonelId={selectedPersonelId}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Talep Detayları</CardTitle>
                <CardDescription>
                  Lütfen talebiniz hakkında gerekli bilgileri doldurun.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={control}
                    name="departmanId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>İlgili Departman</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Departman seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(departmanlar) && departmanlar.map((departman) => (
                              <SelectItem key={departman.id} value={departman.id}>
                                {departman.ad}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="kategoriId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategori</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Kategori seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(kategoriler) && kategoriler.map((kategori) => (
                              <SelectItem key={kategori.id} value={kategori.id}>
                                {kategori.ad}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="oncelik"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Öncelik</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
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
                    control={control}
                    name="talepTipi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Talep Tipi</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Talep tipini seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ARIZA_BILDIRIMI">Arıza Bildirimi</SelectItem>
                            <SelectItem value="DESTEK_TALEBI">Destek Talebi</SelectItem>
                            <SelectItem value="BILGI_ISTEGI">Bilgi İsteği</SelectItem>
                            <SelectItem value="DEGISIKLIK_ISTEGI">Değişiklik İsteği</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name="personelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Atanacak Personel (Opsiyonel)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Personel seçin (opsiyonel)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {personeller.map((personel) => (
                            <SelectItem key={personel.id} value={personel.id}>
                              {personel.ad}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Eğer biliyorsanız, sorununuzla ilgilenecek personeli seçebilirsiniz
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="ekDosyalar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ekli Dosyalar (Opsiyonel)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          multiple
                          onChange={(e) => {
                            const files = e.target.files ? Array.from(e.target.files) : [];
                            field.onChange(files);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Ekran görüntüsü, hata raporu veya ilgili belgeler
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isSubmitting} size="lg">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Talebi Gönder
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sistem Nasıl Çalışır?</CardTitle>
                  <CardDescription>
                    Talep analiz sistemi hakkında bilgi
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-green-200 bg-green-50 mr-3 shrink-0">
                      <span className="text-green-600 font-medium">1</span>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Sorununuzu detaylı açıklayın</p>
                      <p className="text-muted-foreground">
                        Formun en üstündeki sorun detayı alanına probleminizi ayrıntılı olarak yazın
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-green-200 bg-green-50 mr-3 shrink-0">
                      <span className="text-green-600 font-medium">2</span>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Sorun analizini kullanın</p>
                      <p className="text-muted-foreground">
                        Detaylı açıklama girdikten sonra, sistem otomatik olarak analiz yapacak ve size uygun öneriler sunacak
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-green-200 bg-green-50 mr-3 shrink-0">
                      <span className="text-green-600 font-medium">3</span>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Önerileri kullanın</p>
                      <p className="text-muted-foreground">
                        Önerilen kategorilere tıklayarak form alanlarının otomatik olarak doldurulmasını sağlayın
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-green-200 bg-green-50 mr-3 shrink-0">
                      <span className="text-green-600 font-medium">4</span>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Formu tamamlayın</p>
                      <p className="text-muted-foreground">
                        Geri kalan alanları doldurarak talebinizi gönderin ve en kısa sürede yanıt alın
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
} 