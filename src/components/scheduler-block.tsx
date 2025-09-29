"use client";

import { useState } from "react";
import { Clock, Info, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { JobFormData } from "@/types/job-detail";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AddCategoryDialog } from "@/components/add-category-dialog";

interface SchedulerBlockProps {
  data: JobFormData;
  onUpdate: (path: string, value: any) => void;
  nextExecutions: Date[];
  errors: Record<string, string>;
  categories: Array<{ id: string; name: string }>;
  onAddCategory: (category: { id: string; name: string }) => void;
}

const presetOptions = [
  { value: "30s", label: "Every 30s", cron: "*/30 * * * * *", pro: true },
  { value: "1m", label: "Every minute", cron: "* * * * *", pro: true },
  { value: "5m", label: "Every 5 minutes", cron: "*/5 * * * *" },
  { value: "15m", label: "Every 15 minutes", cron: "*/15 * * * *" },
  { value: "hourly", label: "Hourly", cron: "0 * * * *" },
  { value: "daily", label: "Daily", cron: "1 0 * * *" },
  { value: "weekly", label: "Weekly", cron: "1 0 * * 1" },
  { value: "monthly", label: "Monthly", cron: "1 0 1 * *" },
];

const timezones = [
  "Europe/Brussels",
  "Europe/Paris",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "UTC",
];

export function SchedulerBlock({
  data,
  onUpdate,
  nextExecutions,
  errors,
  categories,
  onAddCategory,
}: SchedulerBlockProps) {
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);

  const selectedPreset = presetOptions.find(
    (p) => p.value === data.schedule.preset
  );
  const isProRequired = selectedPreset?.pro && true; // Assume non-pro for demo

  const handleCategoryChange = (value: string) => {
    if (value === "__add_new__") {
      setShowAddCategoryDialog(true);
    } else {
      onUpdate("category", value);
    }
  };

  const handleCategoryAdded = (newCategory: { id: string; name: string }) => {
    onAddCategory(newCategory);
    setShowAddCategoryDialog(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Planification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du job</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => onUpdate("name", e.target.value)}
              placeholder="Mon job de synchronisation"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select value={data.category} onValueChange={handleCategoryChange}>
              <SelectTrigger
                className={errors.category ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
                {categories.length > 0 && (
                  <div className="border-t border-border mt-1 pt-1">
                    <SelectItem
                      key="__add_new__"
                      value="__add_new__"
                      className="font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Ajouter une catégorie
                      </div>
                    </SelectItem>
                  </div>
                )}
                {categories.length === 0 && (
                  <SelectItem
                    key="__add_new__"
                    value="__add_new__"
                    className="text-amber-600 font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Créer votre première catégorie
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optionnel)</Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => onUpdate("description", e.target.value)}
            placeholder="Description courte de ce job..."
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Fuseau horaire</Label>
          <Select
            value={data.schedule.timezone}
            onValueChange={(value) => onUpdate("schedule.timezone", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Schedule mode */}
        <div className="space-y-4">
          <Label>Mode de planification</Label>
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {presetOptions.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    onUpdate("schedule.preset", preset.value);
                    onUpdate("schedule.cronExpression", preset.cron);
                  }}
                  disabled={preset.pro && isProRequired}
                  className={`p-3 text-sm border rounded-lg transition-colors ${
                    data.schedule.preset === preset.value
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-border hover:border-amber-200"
                  } ${preset.pro && isProRequired ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{preset.label}</div>
                    {preset.pro && (
                      <Badge variant="secondary" className="text-xs ml-1">
                        Pro
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {isProRequired && selectedPreset?.pro && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">
                  Cadence &lt; 5 min requiert un plan Pro
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Next executions preview */}
        <div className="space-y-3">
          <Label>Prochaines 5 exécutions</Label>
          <div className="space-y-1">
            {nextExecutions.map((date, index) => (
              <div key={index} className="text-sm text-muted-foreground">
                {format(date, "dd/MM/yyyy HH:mm", { locale: fr })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Add Category Dialog */}
      {showAddCategoryDialog && (
        <AddCategoryDialog
          onCategoryAdded={handleCategoryAdded}
          onCancel={() => setShowAddCategoryDialog(false)}
        />
      )}
    </Card>
  );
}
