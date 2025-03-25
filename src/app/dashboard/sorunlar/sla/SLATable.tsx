"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { SLAKurali } from "./SLAModal";

type SLATableProps = {
  slaKurallari: SLAKurali[];
  oncelikFormati: (oncelik: string) => React.ReactNode;
  onEdit: (sla: SLAKurali) => void;
  onDelete: (sla: SLAKurali) => void;
};

export function SLATable({ slaKurallari, oncelikFormati, onEdit, onDelete }: SLATableProps) {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kategori</TableHead>
            <TableHead>Öncelik</TableHead>
            <TableHead className="text-center">Yanıtlama Süresi (saat)</TableHead>
            <TableHead className="text-center">Çözüm Süresi (saat)</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {slaKurallari.map((sla) => (
            <TableRow key={sla.id}>
              <TableCell>
                {sla.kategori?.ad}
              </TableCell>
              <TableCell>
                {oncelikFormati(sla.oncelik)}
              </TableCell>
              <TableCell className="text-center">
                {sla.yanitlamaSuresi}
              </TableCell>
              <TableCell className="text-center">
                {sla.cozumSuresi}
              </TableCell>
              <TableCell className="flex justify-end space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(sla)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(sla)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 