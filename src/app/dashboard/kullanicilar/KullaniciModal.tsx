"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isApproved: boolean;
  } | null;
}

export function KullaniciModal({ open, onClose, user }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPassword("");
      setRole(user.role);
      setIsApproved(user.isApproved);
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setRole("USER");
      setIsApproved(false);
    }
  }, [user]);

  const validateForm = () => {
    // HTML5 form validasyonu
    const form = document.querySelector('form');
    if (form && !form.checkValidity()) {
      form.reportValidity();
      return false;
    }

    // Özel validasyonlar
    if (!name.trim()) {
      toast.error("Ad boş olamaz");
      return false;
    }
    
    if (name.trim().length < 3) {
      toast.error("Ad en az 3 karakter olmalıdır");
      return false;
    }
    
    if (name.trim().length > 50) {
      toast.error("Ad en fazla 50 karakter olabilir");
      return false;
    }
    
    if (!/^[a-zA-ZğĞüÜşŞıİöÖçÇ\s]+$/.test(name.trim())) {
      toast.error("Ad sadece harflerden oluşmalıdır");
      return false;
    }

    if (!email.trim()) {
      toast.error("Email boş olamaz");
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Geçerli bir email adresi giriniz");
      return false;
    }

    if (!user && !password.trim()) {
      toast.error("Şifre boş olamaz");
      return false;
    }
    
    if (password.trim() && password.trim().length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır");
      return false;
    }

    if (!role) {
      toast.error("Rol seçiniz");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const url = user
        ? `/api/kullanicilar/${user.id}`
        : "/api/kullanicilar";
      const method = user ? "PUT" : "POST";

      const data: any = {
        name: name.trim(),
        email: email.trim(),
        role,
        isApproved
      };

      if (!user || (user && password.trim())) {
        data.password = password.trim();
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast.success(
        user
          ? "Kullanıcı başarıyla güncellendi"
          : "Kullanıcı başarıyla oluşturuldu"
      );
      onClose(true);
    } catch (error) {
      console.error("Form gönderilirken hata:", error);
      toast.error(
        error instanceof Error ? error.message : "Bir hata oluştu"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {user ? "Kullanıcı Düzenle" : "Yeni Kullanıcı"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ad Soyad</Label>
            <Input
              id="name"
              placeholder="Ad soyad giriniz"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={3}
              maxLength={50}
              pattern="^[a-zA-ZğĞüÜşŞıİöÖçÇ\s]+$"
              title="Ad sadece harflerden oluşmalıdır"
              className="border-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email giriniz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
              title="Geçerli bir email adresi giriniz"
              className="border-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              {user ? "Şifre (Boş bırakılırsa değişmez)" : "Şifre"}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Şifre giriniz"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required={!user}
              title="Şifre en az 6 karakter olmalıdır"
              className="border-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select
              value={role}
              onValueChange={setRole}
              required
            >
              <SelectTrigger id="role" className="border-input">
                <SelectValue placeholder="Rol seçiniz" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem 
                  value="USER"
                  className="hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                >
                  Kullanıcı
                </SelectItem>
                <SelectItem 
                  value="ADMIN"
                  className="hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                >
                  Admin
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isApproved"
              checked={isApproved}
              onCheckedChange={setIsApproved}
            />
            <Label htmlFor="isApproved">Onaylı</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose()}
              disabled={loading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : (user ? "Güncelle" : "Oluştur")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 