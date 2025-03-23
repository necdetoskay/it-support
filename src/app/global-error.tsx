'use client';

import { Inter } from 'next/font/google';
import { Button } from '@/components/ui/button';

const inter = Inter({ subsets: ['latin'] });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
          <div className="max-w-md w-full mx-auto text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter">Oops! Bir hata oluştu</h1>
              <p className="text-muted-foreground">
                Sistemde beklenmeyen bir hata oluştu. Teknik ekibimiz bilgilendirildi.
              </p>
            </div>
            <div className="p-6 bg-card border rounded-lg shadow-sm">
              <div className="text-4xl font-bold mb-4">500</div>
              <p className="text-muted-foreground mb-4">
                Lütfen daha sonra tekrar deneyin veya sorununuz devam ederse bizimle iletişime geçin.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button 
                  onClick={() => reset()} 
                  variant="default"
                  className="w-full sm:w-auto"
                >
                  Tekrar Dene
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'} 
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Ana Sayfaya Dön
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {process.env.NODE_ENV !== 'production' && (
                <details className="mt-4 text-left border rounded-md p-2">
                  <summary className="cursor-pointer font-medium">Geliştirici Detayları</summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                    {error.message}
                    {'\n'}
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 