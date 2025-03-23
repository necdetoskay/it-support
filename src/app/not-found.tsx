"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSearch } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-[70vh] px-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="space-y-1 flex flex-col items-center text-center pb-2">
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FileSearch className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Sayfa Bulunamadı</CardTitle>
          <CardDescription>
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground text-sm">
            <p>Aşağıdaki nedenleri kontrol edebilirsiniz:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-left mx-auto max-w-xs">
              <li>URL'nin doğru yazıldığından emin olun</li>
              <li>Eğer bir bağlantı üzerinden geldiyseniz, bağlantı güncel olmayabilir</li>
              <li>Aradığınız içerik kaldırılmış olabilir</li>
              <li>Sayfa izinleriniz olmayabilir</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/">Ana Sayfaya Dön</Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()} className="w-full">
            Önceki Sayfaya Dön
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 