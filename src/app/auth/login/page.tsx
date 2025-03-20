"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "react-hot-toast";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mevcut yetkilendirme verilerini temizle
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("kullanici");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("kullanici");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Giriş denemesi yapılıyor...");
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "same-origin",
      });

      const data = await res.json();
      console.log("API yanıtı:", data);

      if (!res.ok) {
        toast.error(data.error || "Giriş başarısız!");
        setLoading(false);
        return;
      }

      // Kullanıcı verisini yeni formata dönüştür
      const kullaniciVerisi = {
        id: data.user.id,
        isim: data.user.name,
        eposta: data.user.email,
        rol: data.user.role
      };

      // Token ve kullanıcı bilgilerini rememberMe durumuna göre sakla
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", data.token);
      storage.setItem("kullanici", JSON.stringify(kullaniciVerisi));

      toast.success("Giriş başarılı!");
      
      // Yönlendirmeden önce kısa bir bekleme
      setTimeout(() => {
        router.replace("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Giriş hatası:", error);
      toast.error("Giriş sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Giriş Yap</CardTitle>
          <CardDescription>IT Destek Portalına hoş geldiniz</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@sirket.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked: CheckboxPrimitive.CheckedState) => 
                  setRememberMe(checked === true)}
              />
              <Label 
                htmlFor="rememberMe" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Beni Hatırla
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>
          <p className="text-center mt-4 text-sm">
            Hesabınız yok mu?{" "}
            <Link href="/auth/register" className="text-primary hover:underline">
              Kayıt Ol
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 