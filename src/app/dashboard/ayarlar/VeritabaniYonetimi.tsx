"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
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
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Download, 
  Upload, 
  Trash, 
  Database, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Calendar,
  Settings,
  Save,
  Loader2
} from "lucide-react";
import { formatRelative } from "date-fns";
import { tr } from "date-fns/locale";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import YedeklemeYardim from "./YedeklemeYardim";

// Backup tipi
type BackupType = "pg-backup" | "prisma-json" | "full" | "data-only" | "schema-only" | "selected" | "node-pg-dump-nodejs" | "pg-dump";

// Otomatik yedekleme frekansı
type AutoBackupFrequency = "daily" | "weekly" | "monthly" | "never";

// Tabloyu temsil eden arayüz
interface Table {
  table_name: string;
  isSelected?: boolean;
}

// Yedek kaydını temsil eden arayüz
interface Backup {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  type: BackupType;
  description: string;
  tables: string[];
  createdBy: string;
  createdAt: string;
  fileExists?: boolean;
}

export default function VeritabaniYonetimi() {
  // State tanımlamaları
  const [activeTab, setActiveTab] = useState<string>("backup");
  const [backupType, setBackupType] = useState<BackupType>("pg-backup");
  const [backupDescription, setBackupDescription] = useState<string>("");
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [loadingTables, setLoadingTables] = useState<boolean>(false);
  const [loadingBackups, setLoadingBackups] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [restoring, setRestoring] = useState<boolean>(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState<boolean>(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState<boolean>(false);
  const [autoBackupFrequency, setAutoBackupFrequency] = useState<AutoBackupFrequency>("daily");
  const [autoBackupTime, setAutoBackupTime] = useState<string>("03:00");
  const [autoBackupType, setAutoBackupType] = useState<BackupType>("prisma-json");
  const [isCreatingBackup, setIsCreatingBackup] = useState<boolean>(false);
  const [backupError, setBackupError] = useState<{ message: string; type: string } | null>(null);
  const [restoreError, setRestoreError] = useState<{ message: string; type: string } | null>(null);
  const [createBackupBeforeRestore, setCreateBackupBeforeRestore] = useState<boolean>(true);

  // Tabloları yükleme
  const loadTables = async () => {
    try {
      setLoadingTables(true);
      const response = await fetch("/api/database/tables");
      const data = await response.json();
      
      if (data.tables) {
        setTables(data.tables.map((table: any) => ({
          table_name: table.table_name,
          isSelected: false
        })));
      }
    } catch (error) {
      console.error("Tablolar yüklenirken hata:", error);
      toast.error("Veritabanı tabloları yüklenirken bir hata oluştu.");
    } finally {
      setLoadingTables(false);
    }
  };

  // Yedekleri yükleme
  const loadBackups = async () => {
    try {
      setLoadingBackups(true);
      const response = await fetch("/api/database/backups");
      const data = await response.json();
      
      if (data.backups) {
        setBackups(data.backups);
      }
    } catch (error) {
      console.error("Yedekler yüklenirken hata:", error);
      toast.error("Yedek listesi yüklenirken bir hata oluştu.");
    } finally {
      setLoadingBackups(false);
    }
  };

  // Yedek oluşturma
  const handleBackup = () => {
    setIsCreatingBackup(true);
    setBackupError(null);

    // Yedekleme API'sine istek gönder
    fetch('/api/database/backup')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setBackupError(null);
          toast.success('Veritabanı başarıyla yedeklendi!');
          loadBackups(); // Yedekleme listesini güncelle
        } else {
          throw new Error(data.error || 'Yedekleme sırasında bir hata oluştu.');
        }
      })
      .catch(error => {
        console.error('Yedekleme hatası:', error);
        setBackupError({ message: `Yedekleme sırasında bir hata oluştu: ${error.message}`, type: 'error' });
      })
      .finally(() => {
        setIsCreatingBackup(false);
      });
  };

  // Geri yükleme işlemi
  const handleRestore = (id: string) => {
    if (!id) {
      toast.error("Yedek ID'si belirtilmedi!");
      return;
    }
    
    setRestoring(true);
    setRestoreError(null);

    console.log(`Geri yükleme başlatılıyor, ID: ${id}`);

    fetch('/api/database/restore', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ backupId: id }),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.error || `Sunucu hatası: ${response.status}`);
          });
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          setRestoreError(null);
          toast.success('Veritabanı başarıyla geri yüklendi!');
          setShowRestoreDialog(false);
        } else {
          throw new Error(data.error || 'Geri yükleme sırasında bir hata oluştu.');
        }
      })
      .catch(error => {
        console.error('Geri yükleme hatası:', error);
        setRestoreError({ 
          message: `Geri yükleme sırasında bir hata oluştu: ${error.message}`, 
          type: 'error' 
        });
      })
      .finally(() => {
        setRestoring(false);
      });
  };

  // Yedek silme işlemi
  const handleDeleteBackup = async () => {
    if (!selectedBackup) return;
    
    try {
      setShowDeleteDialog(false);
      
      const response = await fetch(`/api/database/backup/delete?id=${selectedBackup.id}`, {
        method: "DELETE"
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Yedek dosyası başarıyla silindi.");
        
        // Yedekleri yeniden yükle
        await loadBackups();
      } else {
        throw new Error(data.error || "Silme işlemi başarısız oldu");
      }
    } catch (error: any) {
      console.error("Silme hatası:", error);
      toast.error(error.message || "Yedek silinirken bir hata oluştu.");
    } finally {
      setSelectedBackup(null);
    }
  };

  // Tablo seçimi değişikliği
  const handleTableSelectionChange = (tableName: string, isSelected: boolean) => {
    setTables(tables.map(table => 
      table.table_name === tableName 
        ? { ...table, isSelected } 
        : table
    ));

    if (isSelected) {
      setSelectedTables([...selectedTables, tableName]);
    } else {
      setSelectedTables(selectedTables.filter(name => name !== tableName));
    }
  };

  // Dosya boyutunu formatla
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return bytes + " B";
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + " KB";
    } else if (bytes < 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    } else {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    }
  };

  // Tarihi formatla
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return formatRelative(date, new Date(), { locale: tr });
    } catch (error) {
      return dateStr;
    }
  };

  // Yedek indirme için link oluştur
  const createDownloadLink = (backup: Backup) => {
    return `/api/database/backups/download-direct?id=${backup.id}`;
  };

  // Otomatik yedekleme ayarlarını kaydetme
  const saveAutoBackupSettings = async () => {
    try {
      const settingsData = {
        enabled: autoBackupEnabled,
        frequency: autoBackupFrequency,
        time: autoBackupTime,
        type: autoBackupType
      };
      
      // API'ye gönderme
      const response = await fetch('/api/database/autobackup/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settingsData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success("Otomatik yedekleme ayarları kaydedildi");
        setShowSettingsDialog(false);
      } else {
        throw new Error(data.error || 'Ayarlar kaydedilemedi');
      }
    } catch (error: any) {
      console.error("Ayarlar kaydedilirken hata:", error);
      toast.error(error.message || "Otomatik yedekleme ayarları kaydedilemedi");
    }
  };
  
  // Otomatik yedekleme ayarlarını yükleme
  const loadAutoBackupSettings = async () => {
    try {
      const response = await fetch('/api/database/autobackup/settings');
      const data = await response.json();
      
      if (data.success && data.settings) {
        const settings = data.settings;
        setAutoBackupEnabled(settings.enabled || false);
        setAutoBackupFrequency(settings.frequency || 'daily');
        setAutoBackupTime(settings.time || '03:00');
        setAutoBackupType(settings.type || 'prisma-json');
      }
    } catch (error) {
      console.error("Ayarlar yüklenirken hata:", error);
      toast.error("Otomatik yedekleme ayarları yüklenemedi");
    }
  };
  
  // Tarihe dönüş işlemi - belirli bir tarihdeki yedeği bulur ve geri yükler
  const findBackupByDate = (targetDate: Date) => {
    // Tarihi yıl-ay-gün olarak formatla
    const formattedTargetDate = targetDate.toISOString().split('T')[0];
    
    // Yedekleri tarihe göre filtrele ve en yakın tarihteki yedeği bul
    const filteredBackups = backups
      .filter(backup => {
        const backupDate = new Date(backup.createdAt).toISOString().split('T')[0];
        return backupDate === formattedTargetDate;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Eğer o tarihte yedek varsa, ilk yedeği al
    if (filteredBackups.length > 0) {
      setSelectedBackup(filteredBackups[0]);
      setShowRestoreDialog(true);
      return true;
    }
    
    toast.error(`${formattedTargetDate} tarihinde bir yedek bulunamadı`);
    return false;
  };

  // Component yüklendiğinde veri çekme
  useEffect(() => {
    loadTables();
    loadBackups();
    loadAutoBackupSettings();
  }, []);

  // Yedek tipi değiştiğinde seçili tabloları sıfırla
  useEffect(() => {
    setSelectedTables([]);
    setTables(tables.map(table => ({ ...table, isSelected: false })));
  }, [backupType]);

  // Dialog restore düğmesi
  const RestoreButton = () => {
    if (!selectedBackup) return null;
    
    return (
      <AlertDialogAction
        onClick={() => handleRestore(selectedBackup.id)}
        disabled={restoring}
        className="bg-red-500 hover:bg-red-600"
      >
        {restoring ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Geri Yükleniyor...
          </>
        ) : (
          "Geri Yükle"
        )}
      </AlertDialogAction>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Veritabanı Yönetimi</CardTitle>
        <CardDescription>
          Veritabanınızın yedeğini alın ve gerektiğinde geri yükleyin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="backup">
              <Database className="mr-2 h-4 w-4" />
              Yedekleme
            </TabsTrigger>
            <TabsTrigger value="restore">
              <RefreshCw className="mr-2 h-4 w-4" />
              Geri Yükleme
            </TabsTrigger>
            <TabsTrigger value="history">
              <Calendar className="mr-2 h-4 w-4" />
              Tarih
            </TabsTrigger>
          </TabsList>
          
          {/* Yedekleme Sekmesi */}
          <TabsContent value="backup" className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Yedek Oluştur</h3>
              <div className="flex gap-2">
                <YedeklemeYardim />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowSettingsDialog(true)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Otomatik Yedekleme
                </Button>
              </div>
            </div>
            
            <div className="space-y-6 p-4 border rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="backupType">Yedek Tipi</Label>
                  <div className="p-3 border rounded-md mt-1">
                    <span className="font-medium">JSON Yedek</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tüm verileri JSON olarak yedekler. PostgreSQL araçları gerektirmez.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
                <Input
                  id="description"
                  placeholder="Bu yedeğin amacı veya içeriği"
                  value={backupDescription}
                  onChange={(e) => setBackupDescription(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleBackup} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Spinner className="mr-2" size="sm" />
                    Yedekleniyor...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Yedek Al
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          {/* Geri Yükleme Sekmesi */}
          <TabsContent value="restore" className="py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Mevcut Yedekler</h3>
                <Button variant="outline" size="sm" onClick={loadBackups} disabled={loadingBackups}>
                  {loadingBackups ? <Spinner size="sm" /> : <RefreshCw className="h-4 w-4" />}
                </Button>
              </div>
              
              {backups.length === 0 && !loadingBackups ? (
                <div className="text-center py-8 text-muted-foreground">
                  Henüz alınmış bir yedek bulunmuyor.
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dosya Adı</TableHead>
                        <TableHead>Tip</TableHead>
                        <TableHead>Boyut</TableHead>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingBackups ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            <Spinner />
                          </TableCell>
                        </TableRow>
                      ) : (
                        backups.map((backup) => (
                          <TableRow key={backup.id}>
                            <TableCell className="font-medium">
                              {backup.fileName}
                              {backup.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {backup.description}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              {backup.type === "prisma-json" && "JSON Yedek"}
                              {backup.type === "full" && "Tam Yedek (eski)"}
                              {backup.type === "data-only" && "Sadece Veri (eski)"}
                              {backup.type === "schema-only" && "Sadece Şema (eski)"}
                              {backup.type === "selected" && "Seçili Tablolar (eski)"}
                              {backup.type === "pg-dump" && "Postgres Yedek (eski)"}
                              {backup.type === "node-pg-dump-nodejs" && "Node.js pg_dump (eski)"}
                            </TableCell>
                            <TableCell>{formatFileSize(backup.fileSize)}</TableCell>
                            <TableCell>{formatDate(backup.createdAt)}</TableCell>
                            <TableCell>
                              {backup.fileExists !== false ? (
                                <div className="flex items-center text-green-500">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Hazır
                                </div>
                              ) : (
                                <div className="flex items-center text-red-500">
                                  <AlertCircle className="h-4 w-4 mr-1" />
                                  Dosya Yok
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  disabled={backup.fileExists === false || restoring}
                                  onClick={() => {
                                    setSelectedBackup(backup);
                                    setShowRestoreDialog(true);
                                  }}
                                  title="Geri Yükle"
                                >
                                  <Upload className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedBackup(backup);
                                    setShowDeleteDialog(true);
                                  }}
                                  title="Sil"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Tarih Sekmesi */}
          <TabsContent value="history" className="py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Tarih Seçerek Geri Yükleme</h3>
              </div>
              
              <div className="p-4 border rounded-md">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="restoreDate">Geri Yüklenecek Tarih</Label>
                    <Input
                      id="restoreDate"
                      type="date"
                      className="mt-1"
                      onChange={(e) => {
                        if (e.target.value) {
                          findBackupByDate(new Date(e.target.value));
                        }
                      }}
                    />
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>Veritabanını belirli bir tarihteki durumuna geri döndürmek için yukarıdan bir tarih seçin.</p>
                    <p>Sistem seçilen tarihteki en son yedeği bulup geri yükleme işlemi için hazırlayacaktır.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-md font-medium mb-2">Yedekleme Zaman Çizelgesi</h4>
                <div className="border rounded-md p-4 max-h-80 overflow-y-auto">
                  <div className="space-y-4">
                    {backups.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        Yedek kaydı bulunamadı.
                      </div>
                    ) : (
                      backups
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((backup) => (
                          <div key={backup.id} className="flex items-start border-l-2 border-primary pl-4 relative">
                            <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-primary"></div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <p className="font-medium">{new Date(backup.createdAt).toLocaleDateString()}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(backup.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                              <p className="text-sm">{backup.fileName}</p>
                              <p className="text-xs text-muted-foreground">
                                {backup.type === "prisma-json" && "JSON Yedek"}
                                {backup.type === "full" && "Tam Yedek (eski)"}
                                {backup.type === "data-only" && "Sadece Veri (eski)"}
                                {backup.type === "schema-only" && "Sadece Şema (eski)"}
                                {backup.type === "selected" && "Seçili Tablolar (eski)"}
                                {backup.type === "pg-dump" && "Postgres Yedek (eski)"}
                                {backup.type === "node-pg-dump-nodejs" && "Node.js pg_dump (eski)"}
                              </p>
                              {backup.description && (
                                <p className="text-xs italic mt-1">{backup.description}</p>
                              )}
                              <div className="flex gap-2 mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={backup.fileExists === false || restoring}
                                  onClick={() => {
                                    setSelectedBackup(backup);
                                    setShowRestoreDialog(true);
                                  }}
                                >
                                  <Upload className="h-3 w-3 mr-1" />
                                  Geri Yükle
                                </Button>
                                <a 
                                  href={createDownloadLink(backup)}
                                  download={backup.fileName}
                                  className={`inline-flex items-center justify-center h-8 py-1 px-3 text-sm rounded-md border font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                                    backup.fileExists === false ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent hover:text-accent-foreground'
                                  }`}
                                  onClick={(e) => {
                                    if (backup.fileExists === false) {
                                      e.preventDefault();
                                    }
                                  }}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  İndir
                                </a>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Geri Yükleme Onay Dialogu */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Veritabanını Geri Yükle</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem mevcut veritabanınızın üzerine yazacaktır. Devam etmek istediğinize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox 
                id="createBackup" 
                checked={createBackupBeforeRestore}
                onCheckedChange={(checked) => setCreateBackupBeforeRestore(checked === true)} 
              />
              <label
                htmlFor="createBackup"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Geri yükleme öncesi mevcut durumun otomatik yedeğini al
              </label>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium">Geri Yüklenecek Yedek:</p>
              {selectedBackup && (
                <div className="text-sm">
                  <p>Dosya: <span className="font-semibold">{selectedBackup.fileName}</span></p>
                  <p>Tarih: <span className="font-semibold">{formatDate(selectedBackup.createdAt)}</span></p>
                  <p>Boyut: <span className="font-semibold">{formatFileSize(selectedBackup.fileSize)}</span></p>
                </div>
              )}
            </div>
            
            {/* Geri Yükleme Hatası Mesajı */}
            {restoreError && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-800">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{restoreError.message}</p>
                    <p className="text-sm mt-1">
                      Lütfen geçerli bir yedek seçtiğinizden emin olun ve tekrar deneyin.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <RestoreButton />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Silme Onay Dialogu */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yedeği Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedBackup?.fileName} dosyasını silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBackup} className="bg-destructive text-destructive-foreground">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Otomatik Yedekleme Ayarları Dialogu */}
      <AlertDialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Otomatik Yedekleme Ayarları</AlertDialogTitle>
            <AlertDialogDescription>
              Veritabanınızın otomatik olarak yedeklenmesi için ayarları yapılandırın.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoBackup">Otomatik Yedekleme</Label>
                <p className="text-sm text-muted-foreground">
                  Belirlenen zamanlarda otomatik yedek oluşturulacaktır
                </p>
              </div>
              <Switch
                id="autoBackup"
                checked={autoBackupEnabled}
                onCheckedChange={setAutoBackupEnabled}
              />
            </div>
            
            {autoBackupEnabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Sıklık</Label>
                  <Select 
                    value={autoBackupFrequency} 
                    onValueChange={(value) => setAutoBackupFrequency(value as AutoBackupFrequency)}
                  >
                    <SelectTrigger id="backupFrequency">
                      <SelectValue placeholder="Yedekleme sıklığını seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Günlük</SelectItem>
                      <SelectItem value="weekly">Haftalık</SelectItem>
                      <SelectItem value="monthly">Aylık</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="backupTime">Yedekleme Saati</Label>
                  <Input
                    id="backupTime"
                    type="time"
                    value={autoBackupTime}
                    onChange={(e) => setAutoBackupTime(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="autoBackupType">Yedek Tipi</Label>
                  <div className="p-3 border rounded-md mt-1">
                    <span className="font-medium">JSON Yedek</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tüm verileri JSON olarak yedekler. PostgreSQL araçları gerektirmez.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={saveAutoBackupSettings}>
              <Save className="mr-2 h-4 w-4" />
              Kaydet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
} 