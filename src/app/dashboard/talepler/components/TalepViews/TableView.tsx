"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/utils";
import { ActionButtons } from "../ActionButtons";
import { Talep, durumRenkleri, oncelikRenkleri } from "../../types";

interface TableViewProps {
  talepler: Talep[];
  onRefresh: () => void;
}

export function TableView({ talepler, onRefresh }: TableViewProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-4 text-left">Başlık</th>
            <th className="p-4 text-left">Rapor Eden</th>
            <th className="p-4 text-left">Atanan</th>
            <th className="p-4 text-left">Son Yapılan İşlem</th>
            <th className="p-4 text-left">Öncelik</th>
            <th className="p-4 text-left">Durum</th>
            <th className="p-4 text-left">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {talepler.map((talep, index) => (
            <tr
              key={talep.id}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="p-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">{talep.kategori.ad}</span>
                      <span className="font-medium">{talep.baslik}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Kategori: {talep.kategori.ad}</p>
                    <p>Başlık: {talep.baslik}</p>
                  </TooltipContent>
                </Tooltip>
              </td>
              <td className="p-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">{talep.departman.ad}</span>
                      <span className="font-medium">{talep.raporEden.ad}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Departman: {talep.departman.ad}</p>
                    <p>Rapor Eden: {talep.raporEden.ad}</p>
                  </TooltipContent>
                </Tooltip>
              </td>
              <td className="p-4">{talep.atanan?.name || "-"}</td>
              <td className="p-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col">
                      {talep.sonIslem ? (
                        <>
                          <span className="text-xs text-gray-500">
                            {formatDate(talep.sonIslem.olusturulmaTarihi)}
                          </span>
                          <span className="text-sm line-clamp-1">
                            {talep.sonIslem.aciklama}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {talep.sonIslem ? (
                      <>
                        <p>Tarih: {formatDate(talep.sonIslem.olusturulmaTarihi)}</p>
                        <p>İşlem: {talep.sonIslem.aciklama}</p>
                        <p>Yapan: {talep.sonIslem.yapanKullanici.name}</p>
                      </>
                    ) : (
                      <p>Henüz işlem yapılmadı</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </td>
              <td className="p-4">
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
              </td>
              <td className="p-4">
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
              </td>
              <td className="p-4">
                <ActionButtons talepId={talep.id} onSuccess={onRefresh} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 