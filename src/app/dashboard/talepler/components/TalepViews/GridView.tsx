"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/utils";
import { ActionButtons } from "../ActionButtons";
import { Talep, durumRenkleri, oncelikRenkleri } from "../../types";

interface GridViewProps {
  talepler: Talep[];
  onRefresh: () => void;
}

export function GridView({ talepler, onRefresh }: GridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {talepler.map((talep, index) => (
        <Card
          key={talep.id}
          className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
        >
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">
              <span className="text-xs text-gray-500 block">{talep.kategori.ad}</span>
              {talep.baslik}
            </h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{talep.sorunDetay}</p>
            <div className="space-y-3 mb-4">
              <div>
                <div className="font-medium">Rapor Eden</div>
                <div>
                  <span className="text-xs text-gray-500 block">{talep.departman.ad}</span>
                  {talep.raporEden.ad}
                </div>
              </div>
              <div>
                <div className="font-medium">Atanan</div>
                <div>{talep.atanan?.name || "-"}</div>
              </div>
              <div>
                <div className="font-medium">Son İşlem</div>
                <div>
                  {talep.sonIslem ? (
                    <div className="text-sm">
                      <span className="text-gray-500">
                        {formatDate(talep.sonIslem.olusturulmaTarihi)}:
                      </span>{" "}
                      <span className="line-clamp-1">{talep.sonIslem.aciklama}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Henüz işlem yapılmadı</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className={oncelikRenkleri[talep.oncelik]}>
                      {talep.oncelik}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Öncelik: {talep.oncelik}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className={durumRenkleri[talep.durum]}>
                      {talep.durum}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Durum: {talep.durum}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <ActionButtons talepId={talep.id} onSuccess={onRefresh} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 