"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, ListTodo, Edit, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TalepDuzenleModal from "../[id]/TalepDuzenleModal";
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

interface ActionButtonsProps {
  talepId: string;
  onSuccess?: () => void;
}

export function ActionButtons({ talepId, onSuccess }: ActionButtonsProps) {
  const router = useRouter();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Silme işlemi
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/talepler/${talepId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Talep silinirken bir hata oluştu');
      }

      toast.success('Talep başarıyla silindi');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Talep silinirken hata:', error);
      toast.error('Talep silinirken bir hata oluştu');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/dashboard/talepler/${talepId}`)}
            className="h-8 w-8"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Detayları Görüntüle</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/dashboard/talepler/${talepId}/islemler`)}
            className="h-8 w-8"
          >
            <ListTodo className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>İşlemleri Görüntüle</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditModalOpen(true)}
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Düzenle</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteDialogOpen(true)}
            className="h-8 w-8 text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Sil</p>
        </TooltipContent>
      </Tooltip>

      <TalepDuzenleModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        talepId={talepId}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Talebi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu talebi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve talebe bağlı tüm işlemler ve dosyalar da silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 