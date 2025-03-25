import { LayoutGrid, List, Table2 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type ViewMode = "table" | "list" | "card";

type ViewOptionsProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};

export function ViewOptions({ viewMode, onViewModeChange }: ViewOptionsProps) {
  return (
    <ToggleGroup
      type="single"
      value={viewMode}
      onValueChange={(value: string) => {
        if (value) onViewModeChange(value as ViewMode);
      }}
    >
      <ToggleGroupItem value="table" aria-label="Tablo görünümü">
        <Table2 className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="Liste görünümü">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="card" aria-label="Kart görünümü">
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
} 