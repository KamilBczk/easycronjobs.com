"use client";

import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MultiSelect } from "@/components/ui/multi-select";
import { StatusFilter } from "@/components/status-filter";
import { JobStatus } from "@/types/schedule";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ScheduleHeaderProps {
  view: "cards" | "table";
  onViewChange: (view: "cards" | "table") => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  selectedStatuses: JobStatus[];
  onStatusesChange: (statuses: string[]) => void;
  onClearAllFilters: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  totalJobs: number;
  categories: Array<{ id: string; name: string }>;
}

export function ScheduleHeader({
  view,
  onViewChange,
  selectedCategories,
  onCategoriesChange,
  selectedStatuses,
  onStatusesChange,
  onClearAllFilters,
  onRefresh,
  isLoading,
  totalJobs,
  categories,
}: ScheduleHeaderProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const categoryOptions = categories.map((category) => ({
    label: category.name,
    value: category.name,
  }));

  const handleCreateSchedule = async () => {
    try {
      setIsCreating(true);

      // Appeler l'API pour créer un nouveau job
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du job");
      }

      const { job } = await response.json();

      // Rediriger vers la page d'édition du nouveau job
      router.push(`/app/schedule/${job.id}`);
    } catch (error) {
      console.error("Erreur lors de la création du job:", error);
      alert("Erreur lors de la création du job. Veuillez réessayer.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col gap-4 p-6">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-semibold text-foreground">Schedule</h1>
            <div className="text-sm text-muted-foreground">
              {totalJobs} job{totalJobs !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Times in Europe/Brussels
          </div>
        </div>

        {/* Controls row */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {/* View toggle */}
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(value) =>
                value && onViewChange(value as "cards" | "table")
              }
              className="border rounded-lg p-1"
            >
              <ToggleGroupItem
                value="cards"
                aria-label="Vue en cartes"
                className="text-sm"
              >
                Cards
              </ToggleGroupItem>
              <ToggleGroupItem
                value="table"
                aria-label="Vue en tableau"
                className="text-sm"
              >
                Table
              </ToggleGroupItem>
            </ToggleGroup>

            {/* Category filter */}
            <div className="w-full sm:w-64">
              <MultiSelect
                options={categoryOptions}
                value={selectedCategories}
                onValueChange={onCategoriesChange}
                placeholder="Filtrer par catégorie..."
                searchPlaceholder="Rechercher une catégorie..."
                emptyText="Aucune catégorie trouvée."
              />
            </div>

            {/* Status filter */}
            <div className="w-full sm:w-48">
              <StatusFilter
                selectedStatuses={selectedStatuses}
                onStatusesChange={onStatusesChange}
              />
            </div>

            {/* Refresh button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="shrink-0"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          {/* Create button */}
          <Button
            onClick={handleCreateSchedule}
            disabled={isCreating}
            className="bg-amber-500 hover:bg-amber-600 text-white shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isCreating ? "Création..." : "Create schedule"}
          </Button>
        </div>

        {/* Active filters summary */}
        {(selectedCategories.length > 0 || selectedStatuses.length > 0) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Filtré par :</span>
            {selectedCategories.length > 0 && (
              <span className="font-medium">
                {selectedCategories.length} catégorie
                {selectedCategories.length > 1 ? "s" : ""}
              </span>
            )}
            {selectedStatuses.length > 0 && (
              <span className="font-medium">
                {selectedStatuses.length} statut
                {selectedStatuses.length > 1 ? "s" : ""}
              </span>
            )}
            <Button
              variant="link"
              size="sm"
              onClick={onClearAllFilters}
              className="h-auto p-0 text-xs text-amber-600 hover:text-amber-700"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
