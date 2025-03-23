'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hata oluştuğunda Analytics servisine bildirim gönder (isteğe bağlı)
    // Production ortamında console.error kayıtlarını kaldır
    if (process.env.NODE_ENV !== 'production') {
      console.error('Hata oluştu:', error);
    }
  }, [error]);

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[70vh] px-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="space-y-1 flex flex-col items-center text-center pb-2">
          <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Bir şeyler yanlış gitti</CardTitle>
          <CardDescription>
            Beklenmedik bir hata oluştu. Bu sorun geçici olabilir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground text-sm">
            <p>Lütfen aşağıdaki çözümleri deneyin:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-left mx-auto max-w-xs">
              <li>Sayfayı yenilemeyi deneyin</li>
              <li>İnternet bağlantınızı kontrol edin</li>
              <li>Tarayıcı önbelleğini temizleyin</li>
              <li>Daha sonra tekrar deneyin</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={reset} className="w-full">
            Tekrar Dene
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'} className="w-full">
            Ana Sayfaya Dön
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 