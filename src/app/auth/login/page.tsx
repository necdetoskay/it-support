"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Next-Auth signIn kullanarak giriş yapma
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard"
      });

      // Sonuç kontrolü
      if (result?.error) {
        toast.error(result.error || "Giriş başarısız. Bilgilerinizi kontrol edin.");
        console.error("Giriş hatası:", result.error);
        setLoading(false);
        return;
      }
      
      if (result?.ok) {
        toast.success("Giriş başarılı!");
        router.push(result.url || "/dashboard");
      } else {
        toast.error("Giriş işleminde beklenmeyen bir hata oluştu.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Giriş hatası:", error);
      toast.error("Giriş sırasında bir hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Giriş Yap</CardTitle>
          <CardDescription>
            IT Destek Sistemine giriş yapmak için bilgilerinizi giriniz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta Adresi</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@sirket.com"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Şifre</Label>
                <Link
                  href="/auth/sifre-sifirlama"
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  Şifremi Unuttum
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => 
                    setRememberMe(checked === true || checked === "indeterminate")
                  }
                  disabled={loading}
                />
                <Label 
                  htmlFor="remember" 
                  className="text-sm cursor-pointer"
                >
                  Beni hatırla
                </Label>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Hesabınız yok mu? </span>
              <Link href="/auth/register" className="text-primary hover:underline">
                Kayıt Ol
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 