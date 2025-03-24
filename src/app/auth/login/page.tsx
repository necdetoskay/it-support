"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { clearAuthData } from "@/lib/utils";

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
    clearAuthData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Loglama ekleyelim
      console.log("Login attempt with:", { email, rememberMe });
      
      // API URL'yi doğrudan oluşturuyoruz
      const apiUrl = "/api/auth/login";
      console.log("API URL:", apiUrl);
      
      const requestBody = JSON.stringify({ 
        email, 
        password, 
        rememberMe 
      });
      
      console.log("Request body:", requestBody);
      
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
        credentials: "include",
      });

      // Yanıt durumunu konsola yazdıralım
      console.log("Response status:", res.status);
      
      if (!res.ok) {
        // res.text() ile ham yanıtı kontrol edelim
        const errorText = await res.text();
        console.error("Raw error response:", errorText);
        
        // Eğer JSON olarak ayrıştırılabilirse
        let errorData;
        try {
          errorData = JSON.parse(errorText);
          toast.error(errorData.error || "Giriş başarısız!");
        } catch {
          toast.error("Sunucu yanıtında hata oluştu");
        }
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      console.log("Response data:", data);

      // Token ve kullanıcı bilgilerini rememberMe durumuna göre sakla
      const storage = rememberMe ? localStorage : sessionStorage;
      
      // Token string olarak direkt sakla, JSON olmadığı için parse/stringify yapmadan
      storage.setItem("token", data.token);
      
      // Kullanıcı bilgilerini JSON olarak sakla
      storage.setItem("user", JSON.stringify(data.user));

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
            <Button className="w-full" type="submit" disabled={loading}>
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