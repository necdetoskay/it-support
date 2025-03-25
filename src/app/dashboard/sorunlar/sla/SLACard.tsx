"use client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { SLAKurali } from "./SLAModal";

type SLACardProps = {
  slaKurallari: SLAKurali[];
  oncelikFormati: (oncelik: string) => React.ReactNode;
  onEdit: (sla: SLAKurali) => void;
  onDelete: (sla: SLAKurali) => void;
};

export function SLACard({ slaKurallari, oncelikFormati, onEdit, onDelete }: SLACardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {slaKurallari.map((sla) => (
        <Card key={sla.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{sla.kategori?.ad}</CardTitle>
            <div className="mt-1">{oncelikFormati(sla.oncelik)}</div>
          </CardHeader>
          <CardContent className="pb-2 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Yanıtlama Süresi:</span>
              <span className="font-medium">{sla.yanitlamaSuresi} saat</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Çözüm Süresi:</span>
              <span className="font-medium">{sla.cozumSuresi} saat</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(sla)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Düzenle
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(sla)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Sil
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 