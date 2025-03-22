"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Edit, Trash2, Shield, Users } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  checked: boolean;
}

// Tüm olası izinler
const availablePermissions: Omit<Permission, "checked">[] = [
  {
    id: "talep_olusturma",
    name: "Talep Oluşturma",
    description: "Yeni talep oluşturabilir"
  },
  {
    id: "talep_guncelleme",
    name: "Talep Güncelleme",
    description: "Mevcut talepleri güncelleyebilir"
  },
  {
    id: "talep_silme",
    name: "Talep Silme",
    description: "Talepleri silebilir"
  },
  {
    id: "talep_atama",
    name: "Talep Atama",
    description: "Talepleri kullanıcılara atayabilir"
  },
  {
    id: "rapor_goruntuleme",
    name: "Rapor Görüntüleme",
    description: "Raporları görüntüleyebilir"
  },
  {
    id: "ayarlar_yonetimi",
    name: "Ayarlar Yönetimi",
    description: "Sistem ayarlarını değiştirebilir"
  },
  {
    id: "kullanici_yonetimi",
    name: "Kullanıcı Yönetimi",
    description: "Kullanıcıları yönetebilir"
  },
];

export function KullaniciRolleri() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [newRole, setNewRole] = useState<{
    name: string;
    permissions: Permission[];
  }>({
    name: "",
    permissions: availablePermissions.map(p => ({ ...p, checked: false })),
  });
  const [activeTab, setActiveTab] = useState("users");

  // Kullanıcıları getir
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/kullanicilar");
      
      if (!response.ok) {
        throw new Error("Kullanıcılar getirilirken bir hata oluştu");
      }
      
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Kullanıcılar getirilirken hata:", error);
      toast.error("Kullanıcılar getirilirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Rolleri getir
  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/roller");
      
      if (!response.ok) {
        throw new Error("Roller getirilirken bir hata oluştu");
      }
      
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error("Roller getirilirken hata:", error);
      toast.error("Roller getirilirken bir hata oluştu");
    }
  };

  // Sayfa yüklendiğinde verileri getir
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // Kullanıcı ekle
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
      toast.error("Tüm alanları doldurun");
      return;
    }

    try {
      const response = await fetch("/api/kullanicilar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error("Kullanıcı eklenirken bir hata oluştu");
      }

      toast.success("Kullanıcı başarıyla eklendi");
      setNewUser({ name: "", email: "", password: "", role: "" });
      setUserDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Kullanıcı eklenirken hata:", error);
      toast.error("Kullanıcı eklenirken bir hata oluştu");
    }
  };

  // Kullanıcı güncelle
  const handleUpdateUser = async () => {
    if (!selectedUser || !selectedUser.name || !selectedUser.email || !selectedUser.role) {
      toast.error("Tüm alanları doldurun");
      return;
    }

    try {
      const response = await fetch(`/api/kullanicilar/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.role,
        }),
      });

      if (!response.ok) {
        throw new Error("Kullanıcı güncellenirken bir hata oluştu");
      }

      toast.success("Kullanıcı başarıyla güncellendi");
      setSelectedUser(null);
      setUserDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Kullanıcı güncellenirken hata:", error);
      toast.error("Kullanıcı güncellenirken bir hata oluştu");
    }
  };

  // Kullanıcı sil
  const handleDeleteUser = async (id: string) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/kullanicilar/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Kullanıcı silinirken bir hata oluştu");
      }

      toast.success("Kullanıcı başarıyla silindi");
      fetchUsers();
    } catch (error) {
      console.error("Kullanıcı silinirken hata:", error);
      toast.error("Kullanıcı silinirken bir hata oluştu");
    }
  };

  // Rol ekle
  const handleAddRole = async () => {
    if (!newRole.name) {
      toast.error("Rol adı gereklidir");
      return;
    }

    try {
      const response = await fetch("/api/roller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRole.name,
          // Sadece seçili izinleri gönder
          permissions: newRole.permissions
            .filter(p => p.checked)
            .map(p => p.id),
        }),
      });

      if (!response.ok) {
        throw new Error("Rol eklenirken bir hata oluştu");
      }

      toast.success("Rol başarıyla eklendi");
      setNewRole({
        name: "",
        permissions: availablePermissions.map(p => ({ ...p, checked: false })),
      });
      setRoleDialogOpen(false);
      fetchRoles();
    } catch (error) {
      console.error("Rol eklenirken hata:", error);
      toast.error("Rol eklenirken bir hata oluştu");
    }
  };

  // Rol güncelle
  const handleUpdateRole = async () => {
    if (!selectedRole || !selectedRole.name) {
      toast.error("Rol adı gereklidir");
      return;
    }

    try {
      const response = await fetch(`/api/roller/${selectedRole.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedRole.name,
          // Sadece seçili izinleri gönder
          permissions: selectedRole.permissions
            .filter(p => p.checked)
            .map(p => p.id),
        }),
      });

      if (!response.ok) {
        throw new Error("Rol güncellenirken bir hata oluştu");
      }

      toast.success("Rol başarıyla güncellendi");
      setSelectedRole(null);
      setRoleDialogOpen(false);
      fetchRoles();
    } catch (error) {
      console.error("Rol güncellenirken hata:", error);
      toast.error("Rol güncellenirken bir hata oluştu");
    }
  };

  // Rol sil
  const handleDeleteRole = async (id: string) => {
    if (!confirm("Bu rolü silmek istediğinize emin misiniz? Bu role sahip kullanıcılar etkilenecektir.")) {
      return;
    }

    try {
      const response = await fetch(`/api/roller/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Rol silinirken bir hata oluştu");
      }

      toast.success("Rol başarıyla silindi");
      fetchRoles();
    } catch (error) {
      console.error("Rol silinirken hata:", error);
      toast.error("Rol silinirken bir hata oluştu");
    }
  };

  // İzin değiştirme (checkbox toggle)
  const handlePermissionChange = (permissionId: string, isChecked: boolean, isForSelectedRole: boolean) => {
    if (isForSelectedRole && selectedRole) {
      // Seçili rol için izinleri güncelle
      setSelectedRole({
        ...selectedRole,
        permissions: selectedRole.permissions.map(p =>
          p.id === permissionId ? { ...p, checked: isChecked } : p
        ),
      });
    } else {
      // Yeni rol için izinleri güncelle
      setNewRole({
        ...newRole,
        permissions: newRole.permissions.map(p =>
          p.id === permissionId ? { ...p, checked: isChecked } : p
        ),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-3 font-medium text-sm flex items-center ${
                activeTab === "users"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="h-4 w-4 mr-2" />
              Kullanıcılar
            </button>
            <button
              onClick={() => setActiveTab("roles")}
              className={`px-6 py-3 font-medium text-sm flex items-center ${
                activeTab === "roles"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Shield className="h-4 w-4 mr-2" />
              Roller
            </button>
          </div>
        </div>
        
        {activeTab === "users" && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Kullanıcılar</h2>
              <Button onClick={() => {
                setSelectedUser(null);
                setNewUser({ name: "", email: "", password: "", role: "" });
                setUserDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Kullanıcı
              </Button>
            </div>
            
            {loading ? (
              <div className="text-center py-4">Yükleniyor...</div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead className="w-[100px] text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          Henüz kullanıcı bulunmuyor
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {roles.find(r => r.id === user.role)?.name || user.role}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setUserDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
        
        {activeTab === "roles" && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Roller</h2>
              <Button onClick={() => {
                setSelectedRole(null);
                setNewRole({ 
                  name: "", 
                  permissions: availablePermissions.map(p => ({ ...p, checked: false })) 
                });
                setRoleDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Rol
              </Button>
            </div>
            
            {loading ? (
              <div className="text-center py-4">Yükleniyor...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.length === 0 ? (
                  <div className="col-span-full text-center py-8 bg-gray-50 rounded-md">
                    Henüz rol bulunmuyor
                  </div>
                ) : (
                  roles.map((role) => (
                    <div key={role.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="border-b bg-gray-50 px-4 py-3 flex items-center justify-between">
                        <h3 className="font-medium text-gray-800">{role.name}</h3>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Seçili rol için mevcut izinleri checked olarak işaretle
                              const permissions = availablePermissions.map(ap => {
                                const foundPerm = role.permissions.find(
                                  rp => rp.id === ap.id
                                );
                                return {
                                  ...ap,
                                  checked: !!foundPerm,
                                };
                              });
                              
                              setSelectedRole({
                                ...role,
                                permissions
                              });
                              setRoleDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRole(role.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-gray-500 mb-2">İzinler</p>
                        <div className="flex flex-wrap gap-1.5">
                          {role.permissions.map((perm) => (
                            <div key={perm.id} className="bg-gray-100 text-xs px-2 py-1 rounded-md">
                              {perm.name}
                            </div>
                          ))}
                          {role.permissions.length === 0 && (
                            <div className="text-xs text-gray-400">İzin bulunmuyor</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Kullanıcı Ekle/Düzenle Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Kullanıcı Düzenle" : "Yeni Kullanıcı Ekle"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="userName" className="text-sm font-medium">
                Ad Soyad
              </label>
              <Input
                id="userName"
                value={selectedUser ? selectedUser.name : newUser.name}
                onChange={(e) => {
                  if (selectedUser) {
                    setSelectedUser({ ...selectedUser, name: e.target.value });
                  } else {
                    setNewUser({ ...newUser, name: e.target.value });
                  }
                }}
                placeholder="Kullanıcı adını girin"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="userEmail" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="userEmail"
                type="email"
                value={selectedUser ? selectedUser.email : newUser.email}
                onChange={(e) => {
                  if (selectedUser) {
                    setSelectedUser({ ...selectedUser, email: e.target.value });
                  } else {
                    setNewUser({ ...newUser, email: e.target.value });
                  }
                }}
                placeholder="Email adresini girin"
              />
            </div>
            {!selectedUser && (
              <div className="space-y-2">
                <label htmlFor="userPassword" className="text-sm font-medium">
                  Şifre
                </label>
                <Input
                  id="userPassword"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Şifre girin"
                />
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="userRole" className="text-sm font-medium">
                Rol
              </label>
              <Select
                value={selectedUser ? selectedUser.role : newUser.role}
                onValueChange={(value) => {
                  if (selectedUser) {
                    setSelectedUser({ ...selectedUser, role: value });
                  } else {
                    setNewUser({ ...newUser, role: value });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rol seçin" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUserDialogOpen(false)}
            >
              İptal
            </Button>
            <Button
              onClick={selectedUser ? handleUpdateUser : handleAddUser}
            >
              {selectedUser ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rol Ekle/Düzenle Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedRole ? "Rol Düzenle" : "Yeni Rol Ekle"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="roleName" className="text-sm font-medium">
                Rol Adı
              </label>
              <Input
                id="roleName"
                value={selectedRole ? selectedRole.name : newRole.name}
                onChange={(e) => {
                  if (selectedRole) {
                    setSelectedRole({ ...selectedRole, name: e.target.value });
                  } else {
                    setNewRole({ ...newRole, name: e.target.value });
                  }
                }}
                placeholder="Rol adını girin"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">İzinler</label>
              <ScrollArea className="h-72 border rounded-md p-4">
                <div className="space-y-4">
                  {(selectedRole ? selectedRole.permissions : newRole.permissions).map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-2">
                      <Checkbox 
                        id={permission.id} 
                        checked={permission.checked}
                        onCheckedChange={(checked) => {
                          handlePermissionChange(
                            permission.id, 
                            checked === true, 
                            !!selectedRole
                          );
                        }}
                      />
                      <div className="grid gap-1">
                        <label
                          htmlFor={permission.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {permission.name}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoleDialogOpen(false)}
            >
              İptal
            </Button>
            <Button
              onClick={selectedRole ? handleUpdateRole : handleAddRole}
            >
              {selectedRole ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 