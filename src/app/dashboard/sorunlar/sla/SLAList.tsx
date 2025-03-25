"use client";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { SLAKurali } from "./SLAModal";

type SLAListProps = {
  slaKurallari: SLAKurali[];
  oncelikFormati: (oncelik: string) => React.ReactNode;
  onEdit: (sla: SLAKurali) => void;
  onDelete: (sla: SLAKurali) => void;
};

export function SLAList({ slaKurallari, oncelikFormati, onEdit, onDelete }: SLAListProps) {
  return (
    <div className="space-y-3">
      {slaKurallari.map((sla) => (
        <div 
          key={sla.id}
          className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 p-4 border rounded-md hover:bg-gray-50 transition-colors"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 w-full">
            <div>
              <p className="text-xs text-gray-500 mb-1">Kategori</p>
              <p className="font-medium">{sla.kategori?.ad}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Öncelik</p>
              <div>{oncelikFormati(sla.oncelik)}</div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Yanıtlama Süresi</p>
              <p className="font-medium">{sla.yanitlamaSuresi} saat</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Çözüm Süresi</p>
              <p className="font-medium">{sla.cozumSuresi} saat</p>
            </div>
          </div>
          
          <div className="flex space-x-2 ml-auto mt-2 md:mt-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(sla)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(sla)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Sil
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
} 