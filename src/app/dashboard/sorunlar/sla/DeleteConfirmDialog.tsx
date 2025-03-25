"use client";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SLAKurali } from "./SLAModal";

type DeleteConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seciliSLA: SLAKurali | null;
  yenile: () => void;
  oncelikFormati: (oncelik: string) => React.ReactNode;
};

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  seciliSLA,
  yenile,
  oncelikFormati
}: DeleteConfirmDialogProps) {
  const [siliniyor, setSiliniyor] = useState(false);
  
  const slaKuraliSil = async () => {
    if (!seciliSLA) return;
    
    try {
      setSiliniyor(true);
      
      const response = await fetch(`/api/sla/${seciliSLA.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "SLA kuralı silinirken bir hata oluştu");
      }
      
      toast.success("SLA kuralı başarıyla silindi");
      onOpenChange(false);
      yenile();
    } catch (error: any) {
      console.error("SLA kuralı silinemedi:", error);
      toast.error(error.message || "SLA kuralı silinirken bir hata oluştu");
    } finally {
      setSiliniyor(false);
    }
  };
  
  if (!seciliSLA) {
    return null;
  }
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>SLA Kuralını Sil</AlertDialogTitle>
          <AlertDialogDescription>
            Bu SLA kuralını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-2 border rounded-md p-3 bg-gray-50 my-3">
          <p className="text-sm">
            <strong>Kategori:</strong> {seciliSLA.kategori?.ad}
          </p>
          <p className="text-sm">
            <strong>Öncelik:</strong> {oncelikFormati(seciliSLA.oncelik)}
          </p>
          <p className="text-sm">
            <strong>Yanıtlama Süresi:</strong> {seciliSLA.yanitlamaSuresi} saat
          </p>
          <p className="text-sm">
            <strong>Çözüm Süresi:</strong> {seciliSLA.cozumSuresi} saat
          </p>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={siliniyor}>
            İptal
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={slaKuraliSil}
            disabled={siliniyor}
          >
            {siliniyor ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Siliniyor...
              </>
            ) : (
              "Evet, Sil"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 