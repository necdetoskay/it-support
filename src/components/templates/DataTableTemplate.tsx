"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit, Trash2, LayoutGrid, LayoutList, Table2 } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DataTableTemplateProps<T> {
  title: string;
  columns: {
    header: string;
    accessor: keyof T;
    className?: string;
  }[];
  data: T[];
  loading: boolean;
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  searchPlaceholder?: string;
  onSearch: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  canDelete?: (item: T) => boolean;
  deleteModalTitle?: string;
  deleteModalDescription?: string;
  storageKeyPrefix: string;
  viewMode?: "card" | "list" | "table";
  onViewModeChange?: (mode: "card" | "list" | "table") => void;
}

type ViewMode = "card" | "list" | "table";

export default function DataTableTemplate<T extends { id: string }>({
  title,
  columns,
  data,
  loading,
  pagination,
  searchPlaceholder = "Ara...",
  onSearch,
  onPageChange,
  onPageSizeChange,
  onAdd,
  onEdit,
  onDelete,
  canDelete,
  deleteModalTitle = "Sil",
  deleteModalDescription = "Bu kaydı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
  storageKeyPrefix,
  viewMode = "table",
  onViewModeChange,
}: DataTableTemplateProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [viewModeState, setViewModeState] = useState<ViewMode>(viewMode);

  useEffect(() => {
    setViewModeState(viewMode);
  }, [viewMode]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    onSearch(value);
  }, [onSearch]);

  const handleDelete = useCallback(() => {
    if (itemToDelete && onDelete) {
      onDelete(itemToDelete);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  }, [itemToDelete, onDelete]);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  }, [onViewModeChange, setViewModeState]);

  const prepareItemDelete = useCallback((item: T) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  }, [setItemToDelete, setDeleteDialogOpen]);

  return (
    <TooltipProvider>
      <div className="container mx-auto py-6 space-y-6">
        {/* Filtreler */}
        <Card className="p-4 bg-white">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2 border rounded-md">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewModeState === "card" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => handleViewModeChange("card")}
                    className="rounded-none rounded-l-md h-9 w-9"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Kart Görünümü</TooltipContent>
              </Tooltip>
              <div className="w-px h-4 bg-border" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewModeState === "list" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => handleViewModeChange("list")}
                    className="rounded-none h-9 w-9"
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Liste Görünümü</TooltipContent>
              </Tooltip>
              <div className="w-px h-4 bg-border" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewModeState === "table" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => handleViewModeChange("table")}
                    className="rounded-none rounded-r-md h-9 w-9"
                  >
                    <Table2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Tablo Görünümü</TooltipContent>
              </Tooltip>
            </div>
            <select
              value={pagination.pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-9 w-[120px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
            >
              <option value={5}>5 Kayıt</option>
              <option value={10}>10 Kayıt</option>
              <option value={20}>20 Kayıt</option>
              <option value={50}>50 Kayıt</option>
              <option value={100}>100 Kayıt</option>
            </select>
            {onAdd && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={onAdd}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Yeni Ekle</TooltipContent>
              </Tooltip>
            )}
          </div>
        </Card>

        {/* Veri Listesi */}
        {loading ? (
          <div className="text-center">Yükleniyor...</div>
        ) : data.length === 0 ? (
          <div className="text-center">Kayıt bulunamadı</div>
        ) : viewModeState === "card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((item) => (
              <Card key={item.id} className="bg-white">
                <div className="p-6">
                  {columns.map((column) => (
                    <div key={String(column.accessor)} className="mb-2">
                      <div className="font-medium">{column.header}</div>
                      <div className="text-sm text-muted-foreground">
                        {String(item[column.accessor] || "-")}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end gap-2 mt-4">
                    {onEdit && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Düzenle</TooltipContent>
                      </Tooltip>
                    )}
                    {onDelete && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              prepareItemDelete(item);
                            }}
                            disabled={canDelete ? !canDelete(item) : false}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {canDelete && !canDelete(item)
                            ? "Bu kayıt silinemez"
                            : "Sil"}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : viewModeState === "list" ? (
          <Card className="divide-y bg-white">
            {data.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    {columns.map((column) => (
                      <div key={String(column.accessor)} className="mb-2">
                        <div className="font-medium">{column.header}</div>
                        <div className="text-sm text-muted-foreground">
                          {String(item[column.accessor] || "-")}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {onEdit && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Düzenle</TooltipContent>
                      </Tooltip>
                    )}
                    {onDelete && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              prepareItemDelete(item);
                            }}
                            disabled={canDelete ? !canDelete(item) : false}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {canDelete && !canDelete(item)
                            ? "Bu kayıt silinemez"
                            : "Sil"}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Card>
        ) : (
          <Card className="bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={String(column.accessor)} className={column.className}>
                      {column.header}
                    </TableHead>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableHead className="text-right">İşlemler</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    {columns.map((column) => (
                      <TableCell key={String(column.accessor)} className={column.className}>
                        {String(item[column.accessor] || "-")}
                      </TableCell>
                    ))}
                    {(onEdit || onDelete) && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {onEdit && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onEdit(item)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Düzenle</TooltipContent>
                            </Tooltip>
                          )}
                          {onDelete && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    prepareItemDelete(item);
                                  }}
                                  disabled={canDelete ? !canDelete(item) : false}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {canDelete && !canDelete(item)
                                  ? "Bu kayıt silinemez"
                                  : "Sil"}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Sayfalama */}
        {!loading && data.length > 0 && (
          <Card className="p-4 bg-white flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Toplam {pagination.totalItems} kayıt
            </div>
            <div className="flex items-center">
              <div className="flex items-center rounded-md border">
                <Button
                  variant="ghost"
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="h-8 px-3 text-sm hover:bg-transparent hover:text-black disabled:opacity-50 rounded-none rounded-l-md"
                >
                  Önceki
                </Button>
                <div className="px-3 py-1 bg-black text-white min-w-[32px] text-center">
                  <span className="text-sm">{pagination.currentPage}</span>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="h-8 px-3 text-sm hover:bg-transparent hover:text-black disabled:opacity-50 rounded-none rounded-r-md"
                >
                  Sonraki
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Silme Dialog */}
        {onDelete && (
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{deleteModalTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                  {deleteModalDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </TooltipProvider>
  );
} 