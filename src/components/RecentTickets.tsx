import { FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, formatDate } from '@/lib/utils';
import { TalepDurum, Oncelik } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ExternalLink } from 'lucide-react';

interface Talep {
  id: string;
  baslik: string;
  durum: TalepDurum;
  oncelik: Oncelik;
  olusturulmaTarihi: Date;
  departman: {
    ad: string;
  };
  kategori: {
    ad: string;
  };
  raporEden: {
    ad: string;
    soyad: string;
  };
  atanan?: {
    name: string;
  } | null;
}

interface RecentTicketsProps {
  tickets: Talep[];
  className?: string;
  loading?: boolean;
}

// Durum renk sınıfları
const getDurumClass = (durum: TalepDurum) => {
  switch (durum) {
    case 'TAMAMLANDI':
      return 'bg-green-100 hover:bg-green-200 text-green-800';
    case 'DEVAM_EDIYOR':
      return 'bg-blue-100 hover:bg-blue-200 text-blue-800';
    case 'BEKLEMEDE':
      return 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800';
    case 'IPTAL':
      return 'bg-red-100 hover:bg-red-200 text-red-800';
    default:
      return 'bg-gray-100 hover:bg-gray-200 text-gray-800';
  }
};

// Öncelik renk sınıfları
const getOncelikClass = (oncelik: Oncelik) => {
  switch (oncelik) {
    case 'ACIL':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'YUKSEK':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'ORTA':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'DUSUK':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const RecentTickets: FC<RecentTicketsProps> = ({
  tickets,
  className,
  loading = false
}) => {
  const router = useRouter();
  
  const goToTicket = (id: string) => {
    router.push(`/dashboard/talepler/${id}`);
  };
  
  if (loading) {
    return (
      <Card className={cn("bg-white border border-gray-100 shadow-sm", className)}>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Son Talepler</CardTitle>
          <CardDescription>En son oluşturulan destek talepleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-full h-12 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <Card className={cn("bg-white border border-gray-100 shadow-sm", className)}>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Son Talepler</CardTitle>
          <CardDescription>En son oluşturulan destek talepleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>Henüz talep bulunmuyor</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-white border border-gray-100 shadow-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Son Talepler</CardTitle>
        <CardDescription>En son oluşturulan destek talepleri</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-1">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Talep
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departman
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Atanan
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Öncelik
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => goToTicket(ticket.id)}
                >
                  <td className="px-4 py-3">
                    <div className="max-w-[180px]">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {ticket.baslik}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {ticket.kategori.ad}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {ticket.departman.ad}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {ticket.atanan?.name || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn("font-normal", getOncelikClass(ticket.oncelik))}>
                      {ticket.oncelik}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={getDurumClass(ticket.durum)}>
                      {ticket.durum.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-right whitespace-nowrap">
                    {formatDate(ticket.olusturulmaTarihi)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4 px-4">
          <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => router.push('/dashboard/talepler')}>
            <span>Tümünü Gör</span>
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTickets; 