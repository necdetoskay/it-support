"use client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { SLAKurali } from "./SLAModal";

type SLATableProps = {
  slaKurallari: SLAKurali[];
  oncelikFormati: (oncelik: string) => React.ReactNode;
  onEdit: (sla: SLAKurali) => void;
  onDelete: (sla: SLAKurali) => void;
};

export function SLATable({
  slaKurallari,
  oncelikFormati,
  onEdit,
  onDelete
}: SLATableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kategori</TableHead>
            <TableHead>Öncelik</TableHead>
            <TableHead>Yanıtlama Süresi (saat)</TableHead>
            <TableHead>Çözüm Süresi (saat)</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {slaKurallari.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                Henüz SLA kuralı bulunmamaktadır.
              </TableCell>
            </TableRow>
          ) : (
            slaKurallari.map((sla) => (
              <TableRow key={sla.id} className="group">
                <TableCell>{sla.kategori?.ad}</TableCell>
                <TableCell>{oncelikFormati(sla.oncelik)}</TableCell>
                <TableCell>{sla.yanitlamaSuresi}</TableCell>
                <TableCell>{sla.cozumSuresi}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 