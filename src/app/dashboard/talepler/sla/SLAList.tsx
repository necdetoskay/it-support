"use client";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Clock, Timer } from "lucide-react";
import { SLAKurali } from "./SLAModal";

type SLAListProps = {
  slaKurallari: SLAKurali[];
  oncelikFormati: (oncelik: string) => React.ReactNode;
  onEdit: (sla: SLAKurali) => void;
  onDelete: (sla: SLAKurali) => void;
};

export function SLAList({
  slaKurallari,
  oncelikFormati,
  onEdit,
  onDelete
}: SLAListProps) {
  if (slaKurallari.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Henüz SLA kuralı bulunmamaktadır.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {slaKurallari.map((sla) => (
        <div 
          key={sla.id} 
          className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/10 transition-colors"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex-1 min-w-[160px] font-medium">
              {sla.kategori?.ad}
            </div>
            <div>
              {oncelikFormati(sla.oncelik)}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Yanıtlama: {sla.yanitlamaSuresi} saat</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span>Çözüm: {sla.cozumSuresi} saat</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(sla)}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Düzenle</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(sla)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Sil</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
} 