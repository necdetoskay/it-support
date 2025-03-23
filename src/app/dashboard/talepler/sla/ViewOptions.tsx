"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, LayoutList, Table as TableIcon } from "lucide-react";

export type ViewMode = "table" | "list" | "card";

type ViewOptionsProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};

export function ViewOptions({ viewMode, onViewModeChange }: ViewOptionsProps) {
  return (
    <Tabs
      value={viewMode}
      onValueChange={(value) => onViewModeChange(value as ViewMode)}
      className="w-fit"
    >
      <TabsList className="grid w-fit grid-cols-3">
        <TabsTrigger value="table" className="px-3">
          <TableIcon className="h-4 w-4 mr-1" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Tablo</span>
        </TabsTrigger>
        <TabsTrigger value="list" className="px-3">
          <LayoutList className="h-4 w-4 mr-1" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Liste</span>
        </TabsTrigger>
        <TabsTrigger value="card" className="px-3">
          <LayoutGrid className="h-4 w-4 mr-1" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Kart</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
} 