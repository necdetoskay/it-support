"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Kullanıcıyı yeni login sayfasına yönlendir
    console.log("Eski login sayfasından yeni login sayfasına yönlendiriliyor");
    router.replace("/auth/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Yönlendiriliyor...</h2>
        <p className="text-gray-500">Giriş sayfasına yönlendiriliyorsunuz.</p>
      </div>
    </div>
  );
} 