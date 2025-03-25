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
import { KullaniciModal } from "./KullaniciModal";
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
  ChevronDown,
  Mail,
  Shield
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
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  createdAt: string;
  talepSayisi: number;
}

type SelectedUser = Omit<User, 'createdAt' | 'talepSayisi'>;

interface Pagination {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

type ViewType = "table" | "list" | "grid";

export default function KullanicilarSayfasi() {
  // State tanımlamaları
  const [viewType, setViewType] = useState<ViewType>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('userViewType') as ViewType) || 'table';
    }
    return 'table';
  });
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize, setPageSize] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return Number(localStorage.getItem('userPageSize')) || 10;
    }
    return 10;
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const router = useRouter();

  // Tercihleri kaydetme efekti
  useEffect(() => {
    localStorage.setItem('userViewType', viewType);
  }, [viewType]);

  useEffect(() => {
    localStorage.setItem('userPageSize', pageSize.toString());
  }, [pageSize]);

  // Kullanıcıları yükleme fonksiyonu
  const loadUsers = async () => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedRole !== "all" && { role: selectedRole }),
        ...(selectedStatus !== "all" && { status: selectedStatus })
      });

      const response = await fetch(`/api/kullanicilar?${searchParams}`);
      if (!response.ok) {
        throw new Error("Kullanıcılar alınırken bir hata oluştu");
      }

      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.pagination.pages);
      setTotalRecords(data.pagination.total);
    } catch (error) {
      console.error("Kullanıcılar yüklenirken hata:", error);
      toast.error("Kullanıcılar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // İlk yükleme ve filtreleme değişikliklerinde kullanıcıları yükle
  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, selectedRole, selectedStatus, pageSize]);

  // Event handler'lar
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (value: string) => {
    setSelectedRole(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleEdit = (user: User) => {
    const { createdAt, talepSayisi, ...selectedUserData } = user;
    setSelectedUser(selectedUserData);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setUserToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`/api/kullanicilar/${userToDelete}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast.success("Kullanıcı başarıyla silindi");
      loadUsers();
    } catch (error) {
      console.error("Kullanıcı silinirken hata:", error);
      toast.error(error instanceof Error ? error.message : "Kullanıcı silinirken bir hata oluştu");
    } finally {
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleModalClose = (refresh?: boolean) => {
    setModalOpen(false);
    setSelectedUser(null);
    if (refresh) {
      loadUsers();
    }
  };

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

  // Render fonksiyonları
  const renderTableView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ad</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead>Talep Sayısı</TableHead>
          <TableHead className="w-[100px]">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id} className="group">
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                {user.role}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={user.isApproved ? "success" : "destructive"}>
                {user.isApproved ? "Onaylı" : "Onay Bekliyor"}
              </Badge>
            </TableCell>
            <TableCell>{user.talepSayisi || 0}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(user)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4 text-blue-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(user.id)}
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
      {users.map((user) => (
        <Card key={user.id} className="bg-background group relative">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">{user.name}</CardTitle>
                <CardDescription className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(user)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4 text-blue-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(user.id)}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                  {user.role}
                </Badge>
              </div>
              <Badge variant={user.isApproved ? "success" : "destructive"}>
                {user.isApproved ? "Onaylı" : "Onay Bekliyor"}
              </Badge>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Talep Sayısı: {user.talepSayisi || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map((user) => (
        <Card key={user.id} className="bg-white group relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold">{user.name}</CardTitle>
            <CardDescription className="text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {user.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                  {user.role}
                </Badge>
              </div>
              <Badge variant={user.isApproved ? "success" : "destructive"}>
                {user.isApproved ? "Onaylı" : "Onay Bekliyor"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>Talep Sayısı: {user.talepSayisi || 0}</span>
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(user)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4 text-blue-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(user.id)}
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

  return (
    <div className="container mx-auto py-6 space-y-4">
      {/* Başlık ve Kontroller */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Kullanıcılar</h1>
        <div className="flex items-center gap-2">
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
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kullanıcı ara..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 max-w-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedRole} onValueChange={handleRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Rol seçiniz" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem 
                  value="all" 
                  className="hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                >
                  Tüm Roller
                </SelectItem>
                <SelectItem 
                  value="ADMIN" 
                  className="hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                >
                  Admin
                </SelectItem>
                <SelectItem 
                  value="USER" 
                  className="hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                >
                  Kullanıcı
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Durum seçiniz" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem 
                  value="all" 
                  className="hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                >
                  Tüm Durumlar
                </SelectItem>
                <SelectItem 
                  value="true" 
                  className="hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                >
                  Onaylı
                </SelectItem>
                <SelectItem 
                  value="false" 
                  className="hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                >
                  Onay Bekliyor
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Sayfa boyutu" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem 
                  value="5" 
                  className="hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                >
                  5 Kayıt
                </SelectItem>
                <SelectItem 
                  value="10" 
                  className="hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                >
                  10 Kayıt
                </SelectItem>
                <SelectItem 
                  value="25" 
                  className="hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                >
                  25 Kayıt
                </SelectItem>
                <SelectItem 
                  value="50" 
                  className="hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                >
                  50 Kayıt
                </SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Kullanıcı
            </Button>
          </div>
        </div>
      </div>

      {/* Kullanıcı Listesi */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      ) : viewType === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <Card key={user.id} className="bg-white group relative">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">{user.name}</CardTitle>
                <CardDescription className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </div>
                  <Badge variant={user.isApproved ? "success" : "destructive"}>
                    {user.isApproved ? "Onaylı" : "Onay Bekliyor"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Talep Sayısı: {user.talepSayisi || 0}</span>
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(user)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(user.id)}
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
          {users.map((user) => (
            <Card key={user.id} className="bg-white group relative">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">{user.name}</CardTitle>
                    <CardDescription className="text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(user)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(user.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </div>
                  <Badge variant={user.isApproved ? "success" : "destructive"}>
                    {user.isApproved ? "Onaylı" : "Onay Bekliyor"}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Talep Sayısı: {user.talepSayisi || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden">
          {renderTableView()}
        </div>
      )}

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg p-4 shadow-sm border mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Toplam {totalRecords} kayıt
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Önceki
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8"
                  >
                    {page}
                  </Button>
                ))}
              </div>
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
        </div>
      )}

      {/* Modaller */}
      <KullaniciModal
        open={modalOpen}
        onClose={handleModalClose}
        user={selectedUser}
      />

      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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