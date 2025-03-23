import { FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from '@/lib/utils';
import { 
  CheckCircle2, Clock, AlertTriangle, XCircle, 
  MessageSquare, AlertCircle, ArrowRightCircle, RotateCw
} from 'lucide-react';
import { TalepIslemTipi, TalepDurum } from '@prisma/client';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  tip: TalepIslemTipi;
  aciklama: string;
  durum?: TalepDurum | null;
  olusturulmaTarihi: Date;
  talep: {
    id: string;
    baslik: string;
  };
  yapanKullanici: {
    name: string;
  };
}

interface ActivityFeedProps {
  activities: Activity[];
  className?: string;
  loading?: boolean;
  limit?: number;
  showUser?: boolean;
}

// İşlem tiplerine göre ikon ve renk ataması
const getTipIcon = (tip: TalepIslemTipi, durum?: TalepDurum | null) => {
  switch (tip) {
    case 'COZUM':
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case 'GUNCELLEME':
      return <RotateCw className="w-5 h-5 text-blue-500" />;
    case 'INCELEME':
      return <AlertCircle className="w-5 h-5 text-purple-500" />;
    case 'RED':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'BEKLEMEDE':
      return <Clock className="w-5 h-5 text-yellow-500" />;
    case 'TAMAMLANDI':
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    default:
      return <MessageSquare className="w-5 h-5 text-gray-500" />;
  }
};

// Durum ayıklama
const getDurumIcon = (durum?: TalepDurum | null) => {
  if (!durum) return null;
  
  switch (durum) {
    case 'TAMAMLANDI':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'DEVAM_EDIYOR':
      return <ArrowRightCircle className="w-4 h-4 text-blue-500" />;
    case 'BEKLEMEDE':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'IPTAL':
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return null;
  }
};

// Durum sınıfı
const getDurumClass = (durum?: TalepDurum | null) => {
  if (!durum) return '';
  
  switch (durum) {
    case 'TAMAMLANDI':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'DEVAM_EDIYOR':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'BEKLEMEDE':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'IPTAL':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const ActivityFeed: FC<ActivityFeedProps> = ({
  activities,
  className,
  loading = false,
  limit = 5,
  showUser = true
}) => {
  // Aktivite sayısını sınırla
  const limitedActivities = activities?.slice(0, limit) || [];
  
  if (loading) {
    return (
      <Card className={cn("bg-white border border-gray-100 shadow-sm", className)}>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Son Aktiviteler</CardTitle>
          <CardDescription>En son gerçekleşen destek işlemleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className={cn("bg-white border border-gray-100 shadow-sm", className)}>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Son Aktiviteler</CardTitle>
          <CardDescription>En son gerçekleşen destek işlemleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>Henüz aktivite bulunmuyor</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-white border border-gray-100 shadow-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Son Aktiviteler</CardTitle>
        <CardDescription>En son gerçekleşen destek işlemleri</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {limitedActivities.map((activity, index) => (
            <div key={activity.id} className="flex items-start gap-4 py-4 relative">
              {/* Sol taraf - Zaman çizgisi */}
              <div className="relative flex flex-col items-center">
                <div className="z-10 p-1.5 rounded-full bg-white border-2 border-gray-200">
                  {getTipIcon(activity.tip, activity.durum)}
                </div>
                {index < limitedActivities.length - 1 && (
                  <div className="absolute top-10 h-full w-0.5 bg-gray-200 left-1/2 transform -translate-x-1/2"></div>
                )}
              </div>
              
              {/* Sağ taraf - İçerik */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">
                        <span>#{activity.talep.id.slice(-4)} - </span>
                        <span className="line-clamp-1">{activity.talep.baslik}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{activity.aciklama}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDistanceToNow(new Date(activity.olusturulmaTarihi))}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    {/* Kullanıcı */}
                    {showUser && (
                      <span className="text-xs text-gray-500">
                        {activity.yapanKullanici.name}
                      </span>
                    )}
                    
                    {/* Durum */}
                    {activity.durum && (
                      <div className={cn(
                        "flex items-center gap-1 text-xs py-1 px-2 rounded-full border",
                        getDurumClass(activity.durum)
                      )}>
                        {getDurumIcon(activity.durum)}
                        <span>{activity.durum.replace('_', ' ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed; 