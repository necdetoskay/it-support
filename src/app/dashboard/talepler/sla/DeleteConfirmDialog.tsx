"use client";
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
  const [islemYapiliyor, setIslemYapiliyor] = useState(false);

  // SLA kuralı sil
  const slaKuraliSil = async () => {
    if (!seciliSLA) return;
    
    try {
      setIslemYapiliyor(true);
      const response = await fetch(`/api/sla/${seciliSLA.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Silme işlemi başarısız oldu");
      }
      
      toast.success("SLA kuralı başarıyla silindi");
      onOpenChange(false);
      yenile();
    } catch (error: any) {
      console.error("SLA silme başarısız:", error);
      toast.error(error.message || "SLA kuralı silinirken bir hata oluştu");
    } finally {
      setIslemYapiliyor(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>SLA Kuralını Sil</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {seciliSLA && seciliSLA.kategori && (
            <p>
              <strong>{seciliSLA.kategori.ad}</strong> kategorisi için{" "}
              <strong>{oncelikFormati(seciliSLA.oncelik)}</strong> önceliğine sahip SLA kuralını 
              silmek istediğinize emin misiniz?
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={islemYapiliyor}
          >
            İptal
          </Button>
          <Button 
            variant="destructive" 
            onClick={slaKuraliSil}
            disabled={islemYapiliyor}
          >
            {islemYapiliyor ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Siliniyor...
              </>
            ) : (
              "Sil"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 