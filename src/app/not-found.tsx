"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [homeLink, setHomeLink] = useState("/");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setHomeLink("/dashboard");
    } else {
      setHomeLink("/");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-4">
          <h1 className="text-9xl font-bold text-primary">404</h1>
          <h2 className="text-4xl font-semibold text-foreground">Sayfa Bulunamadı</h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
          </p>
        </div>
        
        <div className="flex justify-center gap-4">
          <Link href={homeLink}>
            <Button className="gap-2">
              <Home size={20} />
              {homeLink === "/dashboard" ? "Dashboard'a Dön" : "Ana Sayfaya Dön"}
            </Button>
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="relative mt-16">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-8 left-1/2 -translate-x-1/2 rotate-45 w-32 h-32 bg-primary/10 rounded-lg blur-2xl" />
        </div>
      </div>
    </div>
  );
} 