"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  TicketIcon,
  Users,
  UserCog,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  MessageSquare,
  PieChart,
  Building2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";

interface MenuLinki {
  href: string;
  etiket: string;
  ikon: React.ReactNode;
  altMenuler?: {
    href: string;
    etiket: string;
  }[];
}

const menuLinkleri: MenuLinki[] = [
  { href: "/dashboard", etiket: "Ana Sayfa", ikon: <Home className="w-5 h-5" /> },
  { 
    href: "/dashboard/talepler", 
    etiket: "Talepler", 
    ikon: <TicketIcon className="w-5 h-5" />,
    altMenuler: [
      { href: "/dashboard/talepler", etiket: "Talep Listesi" },
      { href: "/dashboard/talepler/kategoriler", etiket: "Kategoriler" },
      { href: "/dashboard/talepler/etiketler", etiket: "Etiketler" },
      { href: "/dashboard/talepler/sla", etiket: "SLA Kuralları" },
    ]
  },
  { href: "/dashboard/mesajlar", etiket: "Mesajlar", ikon: <MessageSquare className="w-5 h-5" /> },
  { href: "/dashboard/departmanlar", etiket: "Departmanlar", ikon: <Building2 className="w-5 h-5" /> },
  { href: "/dashboard/personeller", etiket: "Personeller", ikon: <Users className="w-5 h-5" /> },
  { href: "/dashboard/kullanicilar", etiket: "Kullanıcılar", ikon: <UserCog className="w-5 h-5" /> },
  { href: "/dashboard/raporlar", etiket: "Raporlar", ikon: <PieChart className="w-5 h-5" /> },
  { href: "/dashboard/ayarlar", etiket: "Ayarlar", ikon: <Settings className="w-5 h-5" /> },
];

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuAcik, setMenuAcik] = useState(true);
  const [kullanici, setKullanici] = useState<{ name: string; email: string } | null>(null);
  const [acikAltMenuler, setAcikAltMenuler] = useState<{ [key: string]: boolean }>({});
  const yonlendirici = useRouter();
  const mevcutYol = usePathname();

  // Sayfa yüklendiğinde ilgili alt menüyü otomatik aç
  useEffect(() => {
    menuLinkleri.forEach((link) => {
      if (link.altMenuler && (mevcutYol === link.href || link.altMenuler.some(alt => mevcutYol.includes(alt.href)))) {
        setAcikAltMenuler(prev => ({ ...prev, [link.href]: true }));
      }
    });
  }, [mevcutYol]);

  useEffect(() => {
    const kullaniciVerisi = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (kullaniciVerisi) {
      try {
        setKullanici(JSON.parse(kullaniciVerisi));
      } catch (hata) {
        console.error("Kullanıcı verisi ayrıştırma hatası:", hata);
      }
    }
  }, []);

  const cikisYap = () => {
    // Token ve kullanıcı verilerini temizle
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    
    // Cookie'yi temizle
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
    
    // Doğrudan login sayfasına yönlendir
    document.location.href = "/auth/login";
  };

  const altMenuTikla = (href: string) => {
    setAcikAltMenuler(prev => ({ ...prev, [href]: !prev[href] }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Yan Menü */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out",
          !menuAcik && "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Menü Başlığı */}
          <div className="flex items-center justify-between px-4 py-6">
            <h1 className="text-xl font-bold text-gray-800">IT Destek</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuAcik(false)}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Menü Linkleri */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {menuLinkleri.map((link) => (
              <div key={link.href}>
                {link.altMenuler ? (
                  // Alt menüsü olan öğe
                  <div>
                    <button
                      onClick={() => altMenuTikla(link.href)}
                      className={cn(
                        "flex w-full items-center justify-between space-x-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100",
                        (mevcutYol === link.href || link.altMenuler.some(alt => mevcutYol.includes(alt.href))) && 
                        "bg-gray-100 text-blue-600"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        {link.ikon}
                        <span>{link.etiket}</span>
                      </div>
                      {acikAltMenuler[link.href] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    
                    {/* Alt Menüler */}
                    {acikAltMenuler[link.href] && (
                      <div className="ml-6 mt-1 space-y-1">
                        {link.altMenuler.map((altMenu) => (
                          <Link
                            key={altMenu.href}
                            href={altMenu.href}
                            className={cn(
                              "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100",
                              mevcutYol === altMenu.href && "bg-gray-100 text-blue-600"
                            )}
                          >
                            <span>{altMenu.etiket}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Normal link
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100",
                      mevcutYol === link.href && "bg-gray-100 text-blue-600"
                    )}
                  >
                    {link.ikon}
                    <span>{link.etiket}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Kullanıcı Bilgisi */}
          <div className="border-t p-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-gray-200" />
              <div>
                <p className="text-sm font-medium text-gray-800">{kullanici?.name}</p>
                <p className="text-xs text-gray-500">{kullanici?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Ana İçerik */}
      <div
        className={cn(
          "min-h-screen transition-all duration-200 ease-in-out",
          menuAcik ? "lg:ml-64" : ""
        )}
      >
        {/* Üst Bar */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMenuAcik(!menuAcik)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold text-gray-800">Kontrol Paneli</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <a 
                href="/api/auth/logout"
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg border border-red-200 hover:border-red-600 transition-all duration-200"
                title="Oturumu Kapat"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Çıkış Yap</span>
              </a>
            </div>
          </div>
        </header>

        {/* Sayfa İçeriği */}
        <main className="p-6">
          <div className="flex-1 overflow-y-auto">
            {children}
            <Toaster />
          </div>
        </main>
      </div>
    </div>
  );
} 