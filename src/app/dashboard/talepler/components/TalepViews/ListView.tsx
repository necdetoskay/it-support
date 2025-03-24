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

interface ListViewProps {
  talepler: Talep[];
  onRefresh: () => void;
}

export function ListView({ talepler, onRefresh }: ListViewProps) {
  return (
    <div className="space-y-4">
      {talepler.map((talep, index) => (
        <Card
          key={talep.id}
          className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  <span className="text-sm text-gray-500 block">{talep.kategori.ad}</span>
                  {talep.baslik}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium">Rapor Eden</div>
                    <div>
                      <span className="text-sm text-gray-500 block">{talep.departman.ad}</span>
                      {talep.raporEden.ad}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Atanan</div>
                    <div>{talep.atanan?.name || "-"}</div>
                  </div>
                  <div>
                    <div className="font-medium">Öncelik</div>
                    <div>
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
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Durum</div>
                    <div>
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
                  </div>
                  <div className="col-span-2">
                    <div className="font-medium">Son İşlem</div>
                    <div>
                      {talep.sonIslem ? (
                        <div className="text-sm">
                          <span className="text-gray-500">
                            {formatDate(talep.sonIslem.olusturulmaTarihi)}:
                          </span>{" "}
                          {talep.sonIslem.aciklama}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Henüz işlem yapılmadı</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <ActionButtons talepId={talep.id} onSuccess={onRefresh} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 