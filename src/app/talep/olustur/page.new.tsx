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
import { Label } from "@/components/ui/label";
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
  const [analizLoading, setAnalizLoading] = useState(false);
  
  // Örnek veri
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
          <h1 className="text-2xl font-bold mb-1">Yeni Talep Oluştur (Yeni)</h1>
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

          {sorunDetay && sorunDetay.length >= 10 && (
            <Card>
              <CardHeader>
                <CardTitle>Talep Analizi <small>(Bu bölüm yenidir)</small></CardTitle>
                <CardDescription>
                  Sistemimiz talebinizi analiz etti ve aşağıdaki önerileri sunuyor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="font-medium">Departman Önerisi</Label>
                    <Select
                      value={selectedDepartmanId}
                      onValueChange={handleDepartmanChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Departman seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmanlar.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.ad}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="font-medium">Kategori Önerisi</Label>
                    <Select
                      value={selectedKategoriId}
                      onValueChange={handleKategoriChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {kategoriler.map((kat) => (
                          <SelectItem key={kat.id} value={kat.id}>
                            {kat.ad}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="font-medium">Atanan Personel Önerisi</Label>
                    <Select
                      value={selectedPersonelId}
                      onValueChange={handlePersonelChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Personel seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {personeller.map((pers) => (
                          <SelectItem key={pers.id} value={pers.id}>
                            {pers.ad}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Talep Detayları</CardTitle>
                <CardDescription>
                  Talebiniz hakkında gerekli bilgileri doldurun.
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
                            {departmanlar.map((departman) => (
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
                            {kategoriler.map((kategori) => (
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <FormLabel>Atanan Personel</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Personel seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Atama Yapılmadı</SelectItem>
                          {personeller.map((personel) => (
                            <SelectItem key={personel.id} value={personel.id}>
                              {personel.ad}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        İsteğe bağlı olarak bir personel atayabilirsiniz
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ek Dosyalar</CardTitle>
                <CardDescription>
                  Sorununuzla ilgili ekran görüntüleri veya belgeler ekleyebilirsiniz (isteğe bağlı)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    Dosyaları sürükleyip bırakın veya aşağıdaki butona tıklayın
                  </p>
                  <Button variant="outline" type="button">
                    Dosya Seç
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/talepler">İptal</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
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
        </form>
      </Form>
    </div>
  );
}
