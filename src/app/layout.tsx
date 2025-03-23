import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { setupLogger } from "@/lib/logger";
import { NextAuthProvider } from "@/providers/NextAuthProvider";

// Production ortamında konsol çıktılarını engelle
if (typeof window !== 'undefined') {
  setupLogger();
}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IT Support Portal",
  description: "Modern IT support ticket management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className={`${inter.className} theme-transition bg-background text-foreground`}>
        <ThemeProvider>
          <NextAuthProvider>
            <main className="min-h-screen bg-background">
              {children}
            </main>
            <Toaster position="top-right" />
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
