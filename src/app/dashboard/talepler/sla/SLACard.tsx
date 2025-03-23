"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Clock, Timer } from "lucide-react";
import { SLAKurali } from "./SLAModal";

type SLACardProps = {
  slaKurallari: SLAKurali[];
  oncelikFormati: (oncelik: string) => React.ReactNode;
  onEdit: (sla: SLAKurali) => void;
  onDelete: (sla: SLAKurali) => void;
};

export function SLACard({
  slaKurallari,
  oncelikFormati,
  onEdit,
  onDelete
}: SLACardProps) {
  if (slaKurallari.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Henüz SLA kuralı bulunmamaktadır.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {slaKurallari.map((sla) => (
        <Card key={sla.id} className="group hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{sla.kategori?.ad}</CardTitle>
              {oncelikFormati(sla.oncelik)}
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col items-center justify-center p-2 bg-muted rounded-md">
                <Clock className="h-5 w-5 mb-1 text-muted-foreground" />
                <div className="text-sm font-medium">Yanıtlama</div>
                <div className="text-xl font-bold">{sla.yanitlamaSuresi} saat</div>
              </div>
              <div className="flex flex-col items-center justify-center p-2 bg-muted rounded-md">
                <Timer className="h-5 w-5 mb-1 text-muted-foreground" />
                <div className="text-sm font-medium">Çözüm</div>
                <div className="text-xl font-bold">{sla.cozumSuresi} saat</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end pt-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-1">
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
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 