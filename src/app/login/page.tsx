"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

// SearchParams'ı içeren bileşen
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Giriş yapılırken bir hata oluştu");
      }

      toast.success("Giriş başarılı");
      
      // Yönlendirme
      const from = searchParams.get("from") || "/dashboard";
      router.push(from);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Giriş yapılırken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Giriş Yap
        </h2>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm space-y-4">
          <div>
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="rememberMe" 
                checked={formData.rememberMe} 
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, rememberMe: checked as boolean })
                }
              />
              <label 
                htmlFor="rememberMe" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Beni Hatırla
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="text-blue-600 hover:text-blue-800">
                Şifremi Unuttum
              </a>
            </div>
          </div>
        </div>

        <div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Giriş Yap
          </Button>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Henüz hesabınız yok mu?{" "}
            <Link 
              href="/register" 
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
            >
              Hemen Kayıt Ol
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

// Yükleme durumu için fallback bileşeni
function LoginSkeleton() {
  return (
    <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
      <div className="h-8 bg-gray-200 rounded animate-pulse mb-6"></div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 bg-gray-300 rounded animate-pulse mt-6"></div>
      </div>
    </div>
  );
}

// Ana bileşen
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Suspense fallback={<LoginSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  );
} 