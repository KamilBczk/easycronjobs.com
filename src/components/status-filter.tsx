"use client";

import { JobStatus } from "@/types/schedule";
import { MultiSelect } from "@/components/ui/multi-select";

interface StatusFilterProps {
  selectedStatuses: JobStatus[];
  onStatusesChange: (statuses: string[]) => void;
  className?: string;
}

const statusOptions = [
  { label: "Enabled", value: "enabled" },
  { label: "Disabled", value: "disabled" },
];

export function StatusFilter({
  selectedStatuses,
  onStatusesChange,
  className,
}: StatusFilterProps) {
  return (
    <div className={className}>
      <MultiSelect
        options={statusOptions}
        value={selectedStatuses}
        onValueChange={onStatusesChange}
        placeholder="Filtrer par statut..."
        searchPlaceholder="Rechercher un statut..."
        emptyText="Aucun statut trouvé."
      />
    </div>
  );
}
