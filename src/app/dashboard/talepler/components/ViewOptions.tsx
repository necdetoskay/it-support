"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TableIcon, ListIcon, LayoutGridIcon } from "lucide-react";
import { ViewType } from "../types";

interface ViewOptionsProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  viewType: ViewType;
  onViewTypeChange: (type: ViewType) => void;
}

export function ViewOptions({
  pageSize,
  onPageSizeChange,
  viewType,
  onViewTypeChange
}: ViewOptionsProps) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="h-9 w-[120px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
        aria-label="Sayfa başına kayıt sayısı"
      >
        <option value={5}>5 Kayıt</option>
        <option value={10}>10 Kayıt</option>
        <option value={20}>20 Kayıt</option>
        <option value={50}>50 Kayıt</option>
        <option value={100}>100 Kayıt</option>
      </select>
      <div className="flex gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewType === "table" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewTypeChange("table")}
              className="h-8 w-8"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tablo Görünümü</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewType === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewTypeChange("list")}
              className="h-8 w-8"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Liste Görünümü</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewType === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewTypeChange("grid")}
              className="h-8 w-8"
            >
              <LayoutGridIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Grid Görünümü</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
} 