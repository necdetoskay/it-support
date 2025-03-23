"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Table, 
  TableBody,
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DatabaseIcon, 
  RefreshCw, 
  AlertCircle, 
  Loader2
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

// Tabloyu temsil eden arayüz
interface Table {
  table_name: string;
  isSelected: boolean;
  count: number;
}

export function VeriYonetimi() {
  // State tanımlamaları
  const [tables, setTables] = useState<Table[]>([]);
  const [loadingTables, setLoadingTables] = useState<boolean>(false);
  const [isCreatingSeed, setIsCreatingSeed] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [seedError, setSeedError] = useState<{ message: string; type: string } | null>(null);
  
  // Tabloları yükleme
  const loadTables = async () => {
    try {
      setLoadingTables(true);
      console.log("Tablolar yükleniyor...");
      const response = await fetch("/api/database/tables");
      const data = await response.json();
      console.log("Tablolar API yanıtı:", data);
      
      if (data.tables) {
        // User tablosu hariç tüm tablolar
        const filteredTables = data.tables
          .filter((table: any) => table.table_name !== "User")
          .map((table: any) => ({
            table_name: table.table_name,
            isSelected: false,
            count: 5 // Varsayılan olarak her tablo için 5 kayıt
          }));
        
        console.log("Filtrelenmiş tablo listesi:", filteredTables);
        setTables(filteredTables);
      }
    } catch (error) {
      console.error("Tablolar yüklenirken hata:", error);
      toast.error("Veritabanı tabloları yüklenirken bir hata oluştu.");
    } finally {
      setLoadingTables(false);
    }
  };

  // Tablo seçimi değiştirme
  const handleTableSelection = (tableName: string, isSelected: boolean) => {
    setTables(tables.map(table => 
      table.table_name === tableName 
        ? { ...table, isSelected } 
        : table
    ));
  };

  // Veri sayısı değiştirme
  const handleCountChange = (tableName: string, count: number) => {
    setTables(tables.map(table => 
      table.table_name === tableName 
        ? { ...table, count: Math.max(1, Math.min(100, count)) } 
        : table
    ));
  };

  // Seed verisi oluşturma
  const handleCreateSeed = async () => {
    try {
      setIsCreatingSeed(true);
      setSeedError(null);
      
      const selectedTables = tables
        .filter(table => table.isSelected)
        .map(table => ({
          table_name: table.table_name,
          count: table.count
        }));
      
      if (selectedTables.length === 0) {
        toast.warning("Lütfen en az bir tablo seçin.");
        setIsCreatingSeed(false);
        return;
      }
      
      console.log("Seed isteği gönderiliyor:", selectedTables);
      
      const response = await fetch("/api/database/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tables: selectedTables }),
      });
      
      const data = await response.json();
      console.log("Seed API yanıtı:", data);
      
      if (!response.ok) {
        throw new Error(data.error || "Seed verisi oluşturulurken bir hata oluştu");
      }
      
      // Yanıt verileri
      if (data.results) {
        console.table(data.results);
      }
      
      // Sonuç bilgilerini detaylı göster
      let successCount = 0;
      let errorCount = 0;
      let skippedCount = 0;
      let errorMessages = [];
      
      // Sonuçları kontrol et
      if (data.results) {
        Object.keys(data.results).forEach(tableName => {
          const result = data.results[tableName];
          if (result.status === 'success') {
            successCount++;
            console.log(`✅ ${tableName}: ${result.count} kayıt başarıyla oluşturuldu`);
          } else if (result.status === 'error') {
            errorCount++;
            const errorMessage = `❌ ${tableName}: HATA - ${result.error}`;
            errorMessages.push(errorMessage);
            console.error(errorMessage);
          } else if (result.status === 'skipped') {
            skippedCount++;
            console.warn(`⚠️ ${tableName}: ATLANDI - ${result.reason}`);
          }
        });
      }
      
      let resultMessage = `Seed işlemi tamamlandı. Başarılı: ${successCount}`;
      if (errorCount > 0) resultMessage += `, Hatalı: ${errorCount}`;
      if (skippedCount > 0) resultMessage += `, Atlandı: ${skippedCount}`;
      
      // Hataları göster
      if (errorMessages.length > 0) {
        setSeedError({
          message: `Bazı tablolarda sorunlar oluştu: ${errorMessages.join(' | ')}`,
          type: "warning"
        });
        toast.warning(`Seed işlemi bazı hatalarla tamamlandı. ${errorCount} tabloda sorun oluştu.`);
      } else {
        toast.success(resultMessage);
      }
      
      // Tablonun kaç kayıt içerdiğini göstermek için yeniden yükleme yap
      loadTables();
    } catch (error: any) {
      console.error("Seed verisi oluşturulurken hata:", error);
      setSeedError({
        message: error.message || "Seed verisi oluşturulurken bir hata oluştu",
        type: "error"
      });
      toast.error(error.message || "Seed verisi oluşturulurken bir hata oluştu");
    } finally {
      setIsCreatingSeed(false);
      setShowConfirmDialog(false);
    }
  };
  
  // Tüm tabloları seçme
  const selectAllTables = (isSelected: boolean) => {
    setTables(tables.map(table => ({ ...table, isSelected })));
  };

  // Component yüklendiğinde tabloları getir
  useEffect(() => {
    loadTables();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <DatabaseIcon className="h-5 w-5" />
            Veri Yönetimi
          </CardTitle>
          <CardDescription>
            Veritabanında test amaçlı seed verileri oluşturun. Bu işlem User tablosu dışındaki seçilen tabloları temizleyip yeni veriler ekler.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {seedError && (
              <div className="bg-destructive/15 p-3 rounded-md flex items-start gap-2 text-destructive">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">İşlem sırasında bir hata oluştu</p>
                  <p className="text-sm">{seedError.message}</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="select-all" 
                  checked={tables.length > 0 && tables.every(t => t.isSelected)}
                  onCheckedChange={(checked) => selectAllTables(checked === true)}
                />
                <Label htmlFor="select-all">Tümünü Seç</Label>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={loadTables}
                  disabled={loadingTables}
                >
                  {loadingTables ? <Spinner size="sm" /> : <RefreshCw className="h-4 w-4 mr-1" />}
                  Yenile
                </Button>
                <Button 
                  onClick={() => {
                    const selectedTables = tables.filter(t => t.isSelected);
                    if (selectedTables.length === 0) {
                      toast.warning("Lütfen en az bir tablo seçin.");
                      return;
                    }
                    setShowConfirmDialog(true);
                  }}
                  disabled={isCreatingSeed || loadingTables}
                >
                  {isCreatingSeed ? <Spinner size="sm" /> : "Seed Verileri Oluştur"}
                </Button>
              </div>
            </div>
            
            {loadingTables ? (
              <div className="py-8 flex justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="lg" />
                  <p className="text-sm text-muted-foreground">Tablolar yükleniyor...</p>
                </div>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Seç</TableHead>
                      <TableHead>Tablo Adı</TableHead>
                      <TableHead className="w-[200px]">Veri Sayısı</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tables.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">
                          Hiç tablo bulunamadı.
                        </TableCell>
                      </TableRow>
                    ) : (
                      tables.map((table) => (
                        <TableRow key={table.table_name}>
                          <TableCell>
                            <Checkbox 
                              checked={table.isSelected}
                              onCheckedChange={(checked) => 
                                handleTableSelection(table.table_name, checked === true)
                              }
                            />
                          </TableCell>
                          <TableCell>{table.table_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                value={table.count}
                                onChange={(e) => 
                                  handleCountChange(table.table_name, parseInt(e.target.value) || 1)
                                }
                                disabled={!table.isSelected}
                                className="w-20"
                              />
                              <span className="text-sm text-muted-foreground">kayıt</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            
            <div className="text-sm text-muted-foreground">
              <p>* User tablosu güvenlik nedeniyle bu işlemden etkilenmez.</p>
              <p>* Seed işlemi seçilen tabloları önce temizler, ardından yeni veriler ekler.</p>
              <p>* Her tabloda oluşturulacak veri sayısını 1-100 arasında belirleyebilirsiniz.</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Onay Diyaloğu */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Seed verisi oluşturmayı onaylayın</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem, seçtiğiniz tabloların tüm verilerini <strong>silecek</strong> ve yerlerine yeni 
              test verileri ekleyecektir. User tablosu etkilenmez.
              <br /><br />
              <strong>Seçilen tablolar:</strong>
              <ul className="list-disc pl-5 mt-2">
                {tables
                  .filter(t => t.isSelected)
                  .map(t => (
                    <li key={t.table_name}>
                      {t.table_name} ({t.count} kayıt)
                    </li>
                  ))
                }
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCreatingSeed}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCreateSeed();
              }}
              disabled={isCreatingSeed}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isCreatingSeed ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                "Evet, Seed Verisi Oluştur"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 