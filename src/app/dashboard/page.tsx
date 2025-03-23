"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  TicketIcon, CheckCircle2, Clock, XCircle, 
  AlertTriangle, BarChart3, PieChart, LineChart, 
  Users, Building2, Layout, MessageSquare
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardMetricCard from "@/components/DashboardMetricCard";
import DashboardChart from "@/components/DashboardChart";
import ActivityFeed from "@/components/ActivityFeed";
import RecentTickets from "@/components/RecentTickets";
import StatProgressBar from "@/components/StatProgressBar";
import { getLocalStorageItem } from "@/lib/utils";
import { TalepDurum, Oncelik } from '@prisma/client';

// Dashboard ana veri arayüzü
interface DashboardData {
  statusCounts: {
    DEVAM_EDIYOR: number;
    TAMAMLANDI: number;
    BEKLEMEDE: number;
    IPTAL: number;
    TOPLAM: number;
  };
  priorityCounts: {
    DUSUK: number;
    ORTA: number;
    YUKSEK: number;
    ACIL: number;
  };
  departmentStats: Array<{
    id: string;
    ad: string;
    _count: {
      talepler: number;
    }
  }>;
  categoryStats: Array<{
    id: string;
    ad: string;
    _count: {
      talepler: number;
    }
  }>;
  recentTickets: Array<any>;
  recentActivities: Array<any>;
  timeSeriesData: Array<{
    date: string;
    created: number;
    completed: number;
  }>;
}

interface Kullanici {
  name: string;
  email: string;
}

export default function KontrolPaneliSayfasi() {
  const [kullanici, setKullanici] = useState<Kullanici | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const yetkiKontrol = () => {
      const token = getLocalStorageItem("token", null) || sessionStorage.getItem("token");
      const kullaniciVerisi = getLocalStorageItem("user", null) || sessionStorage.getItem("user");

      if (!token || !kullaniciVerisi) {
        console.log("Token veya kullanıcı verisi bulunamadı");
        router.replace("/auth/login");
        return;
      }

      try {
        const ayrıstirilmisKullanici = typeof kullaniciVerisi === 'string' 
          ? JSON.parse(kullaniciVerisi) 
          : kullaniciVerisi;
        setKullanici(ayrıstirilmisKullanici);
      } catch (hata) {
        console.error("Kullanıcı verisi ayrıştırma hatası:", hata);
        router.replace("/auth/login");
      }
    };

    yetkiKontrol();
  }, [router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store'
          },
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error('Dashboard verileri getirilemedi');
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Dashboard veri hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    if (kullanici) {
      fetchDashboardData();
    }
  }, [kullanici]);

  // Yükleniyor durumu
  if (loading || !kullanici) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Grafik verileri için dönüşümler
  const durumChartData = dashboardData ? [
    { name: 'Devam Ediyor', value: dashboardData.statusCounts.DEVAM_EDIYOR },
    { name: 'Tamamlandı', value: dashboardData.statusCounts.TAMAMLANDI },
    { name: 'Beklemede', value: dashboardData.statusCounts.BEKLEMEDE },
    { name: 'İptal', value: dashboardData.statusCounts.IPTAL }
  ] : [];

  const departmanChartData = dashboardData?.departmentStats.map(dept => ({
    name: dept.ad,
    value: dept._count.talepler
  })) || [];

  const kategoriChartData = dashboardData?.categoryStats.map(cat => ({
    name: cat.ad,
    value: cat._count.talepler
  })) || [];
  
  // Her öncelik seviyesinin toplam taleplere oranını hesapla
  const oncelikToplam = dashboardData 
    ? Object.values(dashboardData.priorityCounts).reduce((acc, curr) => acc + curr, 0)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          IT Destek Portalı
        </h1>
        <p className="text-gray-600">
          Hoş geldin, <span className="font-medium">{kullanici.name}</span>. İşte destek sisteminin güncel durumu.
        </p>
      </header>

      {/* Üst Sıra - Özet Metrikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardMetricCard
          title="Toplam Talepler"
          value={dashboardData?.statusCounts.TOPLAM || 0}
          icon={<TicketIcon className="h-6 w-6" />}
          loading={loading}
        />
        
        <DashboardMetricCard
          title="Devam Eden"
          value={dashboardData?.statusCounts.DEVAM_EDIYOR || 0}
          icon={<Clock className="h-6 w-6" />}
          loading={loading}
          className="border-l-4 border-blue-500"
        />
        
        <DashboardMetricCard
          title="Tamamlanan"
          value={dashboardData?.statusCounts.TAMAMLANDI || 0}
          icon={<CheckCircle2 className="h-6 w-6" />}
          loading={loading}
          className="border-l-4 border-green-500"
        />
        
        <DashboardMetricCard
          title="Bekleyen"
          value={dashboardData?.statusCounts.BEKLEMEDE || 0}
          icon={<AlertTriangle className="h-6 w-6" />}
          loading={loading}
          className="border-l-4 border-yellow-500"
        />
      </div>

      {/* Ana İçerik Bölümü - 3 Sütun */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-8">
        {/* Sol Taraf - İstatistikler */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                Öncelik Dağılımı
              </CardTitle>
              <CardDescription>
                Taleplerin öncelik dağılımı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <StatProgressBar 
                  label="Acil" 
                  value={dashboardData?.priorityCounts.ACIL || 0} 
                  max={oncelikToplam || 1}
                  color="red"
                  loading={loading}
                />
                <StatProgressBar 
                  label="Yüksek" 
                  value={dashboardData?.priorityCounts.YUKSEK || 0} 
                  max={oncelikToplam || 1}
                  color="yellow"
                  loading={loading}
                />
                <StatProgressBar 
                  label="Orta" 
                  value={dashboardData?.priorityCounts.ORTA || 0} 
                  max={oncelikToplam || 1}
                  color="blue"
                  loading={loading}
                />
                <StatProgressBar 
                  label="Düşük" 
                  value={dashboardData?.priorityCounts.DUSUK || 0} 
                  max={oncelikToplam || 1}
                  color="green"
                  loading={loading}
                />
              </div>
            </CardContent>
          </Card>

          <DashboardChart
            title="Durum Dağılımı"
            description="Taleplerin durum dağılımı"
            data={durumChartData}
            type="pie"
            loading={loading}
            colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
          />

          <ActivityFeed 
            activities={dashboardData?.recentActivities || []}
            loading={loading}
            limit={5}
          />
        </div>

        {/* Orta - Grafikler */}
        <div className="lg:col-span-4 space-y-6">
          <DashboardChart
            title="Talep Trendi"
            description="Son 7 gündeki talep oluşturma ve tamamlama trendi"
            data={dashboardData?.timeSeriesData || []}
            type="line"
            xKey="date"
            yKeys={['created', 'completed']}
            loading={loading}
            height={300}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardChart
              title="Departman Dağılımı"
              description="Departmanlara göre talep sayıları"
              data={departmanChartData}
              type="bar"
              xKey="name"
              yKeys={['value']}
              loading={loading}
              height={260}
            />

            <DashboardChart
              title="Kategori Dağılımı"
              description="Kategorilere göre talep sayıları"
              data={kategoriChartData}
              type="bar"
              xKey="name"
              yKeys={['value']}
              loading={loading}
              height={260}
            />
          </div>

          <RecentTickets 
            tickets={dashboardData?.recentTickets || []}
            loading={loading}
          />
        </div>
      </div>

      {/* Alt Bölüm - Hızlı Erişim Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <TicketIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                {dashboardData?.statusCounts.TOPLAM || 0} Toplam
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">Talep Yönetimi</h3>
            <p className="text-gray-600 text-sm mb-4">
              Tüm destek taleplerini görüntüleyin ve yönetin
            </p>
            <Button 
              variant="outline" 
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => router.push('/dashboard/talepler')}
            >
              Tüm Talepler
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
                Kullanıcılar
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">Kullanıcı Yönetimi</h3>
            <p className="text-gray-600 text-sm mb-4">
              Kullanıcıları ve rolleri yönetin
            </p>
            <Button 
              variant="outline" 
              className="w-full border-green-200 text-green-700 hover:bg-green-50"
              onClick={() => router.push('/dashboard/kullanicilar')}
            >
              Kullanıcılar
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                Organizasyon
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">Departmanlar</h3>
            <p className="text-gray-600 text-sm mb-4">
              Departman ve personel yönetimi
            </p>
            <Button 
              variant="outline" 
              className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
              onClick={() => router.push('/dashboard/departmanlar')}
            >
              Departmanlar
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <MessageSquare className="h-6 w-6 text-orange-600" />
              </div>
              <div className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs font-medium">
                İletişim
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">Mesajlar</h3>
            <p className="text-gray-600 text-sm mb-4">
              Sistem mesajlarını görüntüleyin
            </p>
            <Button 
              variant="outline" 
              className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
              onClick={() => router.push('/dashboard/mesajlar')}
            >
              Mesajlar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 