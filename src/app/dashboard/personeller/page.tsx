"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PersonelModal } from "./PersonelModal";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  List,
  LayoutGrid,
  Table as TableIcon,
  Search,
  Plus,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

// Arayüz tanımlamaları
interface Personel {
  id: string;
  ad: string;
  telefon: string;
  aktif: boolean;
  departman: {
    id: string;
    ad: string;
  };
  talepSayisi: number;
}

interface Departman {
  id: string;
  ad: string;
}

// Görünüm tipleri
type ViewType = "table" | "list" | "grid";

export default function PersonellerSayfasi() {
  // State tanımlamaları
  const [viewType, setViewType] = useState<ViewType>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('personelViewType') as ViewType) || 'table';
    }
    return 'table';
  });
  const [loading, setLoading] = useState(true);
  const [personeller, setPersoneller] = useState<Personel[]>([]);
  const [departmanlar, setDepartmanlar] = useState<Departman[]>([]);
  const [departmanlarLoading, setDepartmanlarLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartman, setSelectedDepartman] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPersonel, setSelectedPersonel] = useState<Personel | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize, setPageSize] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return Number(localStorage.getItem('personelPageSize')) || 10;
    }
    return 10;
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [personelToDelete, setPersonelToDelete] = useState<string | null>(null);

  const router = useRouter();

  // Tercihleri kaydetme efekti
  useEffect(() => {
    localStorage.setItem('personelViewType', viewType);
  }, [viewType]);

  useEffect(() => {
    localStorage.setItem('personelPageSize', pageSize.toString());
  }, [pageSize]);

  // Görünüm tipi değiştirme fonksiyonu
  const handleViewTypeChange = (type: ViewType) => {
    setViewType(type);
  };

  // Sayfa boyutu değiştirme fonksiyonu
  const handlePageSizeChange = (value: string) => {
    const newSize = Number(value);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Veri yükleme fonksiyonları
  const loadDepartmanlar = async () => {
    try {
      setDepartmanlarLoading(true);
      const response = await fetch("/api/departments");
      if (!response.ok) {
        throw new Error("Departmanlar yüklenemedi");
      }
      const data = await response.json();
      if (data.departments && Array.isArray(data.departments)) {
        setDepartmanlar(data.departments);
      } else {
        setDepartmanlar([]);
      }
    } catch (error) {
      console.error("Departmanlar yüklenirken hata:", error);
      toast.error("Departmanlar yüklenirken bir hata oluştu");
      setDepartmanlar([]);
    } finally {
      setDepartmanlarLoading(false);
    }
  };

  const loadPersoneller = async () => {
    try {
      setLoading(true);
      const departmanFilter = selectedDepartman === "all" ? "" : selectedDepartman;
      const statusFilter = selectedStatus === "all" ? "" : selectedStatus;
      
      const url = `/api/personeller?page=${currentPage}&limit=${pageSize}&search=${searchTerm}&departman=${departmanFilter}&status=${statusFilter}`;
      console.log("API çağrısı yapılıyor:", url);
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Personeller yüklenemedi");
      }

      const data = await response.json();
      console.log("API yanıtı:", data);
      
      if (Array.isArray(data)) {
        // Eski format - düz dizi
        setPersoneller(data);
        setTotalPages(1);
        setTotalRecords(data.length);
      } else {
        // Yeni format - sayfalama objesi
        setPersoneller(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalRecords(data.totalRecords || 0);
      }
    } catch (error) {
      console.error("Personeller yüklenirken hata:", error);
      toast.error("Personeller yüklenirken bir hata oluştu");
      setPersoneller([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  // Efektler
  useEffect(() => {
    loadDepartmanlar();
  }, []);

  useEffect(() => {
    loadPersoneller();
  }, [currentPage, searchTerm, selectedDepartman, selectedStatus, pageSize]);

  // Event handler'lar
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleDepartmanFilter = (value: string) => {
    setSelectedDepartman(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleEdit = (personel: Personel) => {
    console.log("Düzenlenecek personel:", personel); // Debug için
    setSelectedPersonel({ ...personel }); // Personel verisinin kopyasını oluştur
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setPersonelToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!personelToDelete) return;

    try {
      const response = await fetch(`/api/personeller/${personelToDelete}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast.success("Personel başarıyla silindi");
      loadPersoneller();
    } catch (error) {
      console.error("Personel silinirken hata:", error);
      toast.error(error instanceof Error ? error.message : "Personel silinirken bir hata oluştu");
    } finally {
      setDeleteModalOpen(false);
      setPersonelToDelete(null);
    }
  };

  const handleModalClose = (refresh?: boolean) => {
    setModalOpen(false);
    setSelectedPersonel(null);
    if (refresh) {
      loadPersoneller();
    }
  };

  // Render fonksiyonları
  const renderTableView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ad</TableHead>
          <TableHead>Departman</TableHead>
          <TableHead>Telefon</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead>Talep Sayısı</TableHead>
          <TableHead className="w-[100px]">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {personeller.map((personel) => (
          <TableRow key={personel.id} className="group">
            <TableCell>{personel.ad}</TableCell>
            <TableCell>{personel.departman.ad}</TableCell>
            <TableCell>{personel.telefon}</TableCell>
            <TableCell>
              <Badge variant={personel.aktif ? "success" : "destructive"}>
                {personel.aktif ? "Aktif" : "Pasif"}
              </Badge>
            </TableCell>
            <TableCell>{personel.talepSayisi}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(personel)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4 text-blue-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(personel.id)}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {personeller.map((personel) => (
        <Card key={personel.id} className="bg-background group relative">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">{personel.ad}</CardTitle>
                <CardDescription className="text-muted-foreground">{personel.departman.ad}</CardDescription>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(personel)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4 text-blue-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(personel.id)}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Talep Sayısı: {personel.talepSayisi}</span>
              </div>
              <Badge variant={personel.aktif ? "success" : "destructive"}>
                {personel.aktif ? "Aktif" : "Pasif"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {personeller.map((personel) => (
        <Card key={personel.id} className="bg-background group relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold">{personel.ad}</CardTitle>
            <CardDescription className="text-muted-foreground">{personel.departman.ad}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Talep Sayısı: {personel.talepSayisi}</span>
              </div>
              <Badge variant={personel.aktif ? "success" : "destructive"}>
                {personel.aktif ? "Aktif" : "Pasif"}
              </Badge>
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(personel)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4 text-blue-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(personel.id)}
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>;
    }

    switch (viewType) {
      case "table":
        return renderTableView();
      case "list":
        return renderListView();
      case "grid":
        return renderGridView();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 bg-muted/50 p-6">
      <div className="flex items-center gap-4 bg-background p-4 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Personel ara..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={selectedDepartman} onValueChange={handleDepartmanFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Departman seçin" />
          </SelectTrigger>
          <SelectContent className="bg-background border">
            <SelectItem value="all">Tüm Departmanlar</SelectItem>
            {departmanlar.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.ad}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Durum seçin" />
          </SelectTrigger>
          <SelectContent className="bg-background border">
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="true">Aktif</SelectItem>
            <SelectItem value="false">Pasif</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={pageSize.toString()}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="Kayıt sayısı" />
          </SelectTrigger>
          <SelectContent className="bg-background border">
            <SelectItem value="5">5 Kayıt</SelectItem>
            <SelectItem value="10">10 Kayıt</SelectItem>
            <SelectItem value="25">25 Kayıt</SelectItem>
            <SelectItem value="50">50 Kayıt</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant={viewType === "table" ? "default" : "outline"}
            size="icon"
            onClick={() => handleViewTypeChange("table")}
          >
            <TableIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={viewType === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => handleViewTypeChange("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewType === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => handleViewTypeChange("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Personel
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      ) : viewType === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personeller.map((personel) => (
            <Card key={personel.id} className="bg-background group relative">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">{personel.ad}</CardTitle>
                <CardDescription className="text-muted-foreground">{personel.departman.ad}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Talep Sayısı: {personel.talepSayisi}</span>
                  </div>
                  <Badge variant={personel.aktif ? "success" : "destructive"}>
                    {personel.aktif ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(personel)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(personel.id)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : viewType === "list" ? (
        <div className="space-y-4">
          {personeller.map((personel) => (
            <Card key={personel.id} className="bg-background group relative">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">{personel.ad}</CardTitle>
                    <CardDescription className="text-muted-foreground">{personel.departman.ad}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(personel)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(personel.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Talep Sayısı: {personel.talepSayisi}</span>
                  </div>
                  <Badge variant={personel.aktif ? "success" : "destructive"}>
                    {personel.aktif ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-background rounded-lg border">
          {renderContent()}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center bg-background p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">
            Toplam {totalRecords} kayıt
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Önceki
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="min-w-[32px]"
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Sonraki
            </Button>
          </div>
        </div>
      )}

      <PersonelModal
        open={modalOpen}
        onClose={handleModalClose}
        personel={selectedPersonel}
        departmanlar={departmanlar}
      />

      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Personeli Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu personeli silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 