"use client";

import {
  Save,
  RotateCcw,
  Play,
  Power,
  MoreHorizontal,
  Copy,
  Download,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface JobDetailHeaderProps {
  jobName: string;
  isDirty: boolean;
  isValid: boolean;
  isSaving: boolean;
  isEnabled: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onRunNow: () => void;
  onToggleStatus: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onDelete: () => void;
}

export function JobDetailHeader({
  jobName,
  isDirty,
  isValid,
  isSaving,
  isEnabled,
  onSave,
  onDiscard,
  onRunNow,
  onToggleStatus,
  onDuplicate,
  onExport,
  onDelete,
}: JobDetailHeaderProps) {
  console.log("🔘 JobDetailHeader - isDirty:", isDirty, "isValid:", isValid, "isSaving:", isSaving);
  return (
    <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col gap-4 p-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/app/schedule">Schedule</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{jobName || "Nouveau job"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header with actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-semibold text-foreground">
              {jobName || "Nouveau job"}
            </h1>
            <div className="text-xs text-muted-foreground">
              Times in Europe/Brussels
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <div className="flex items-center gap-2">
              {isDirty ? (
                <Badge
                  variant="outline"
                  className="text-amber-600 border-amber-200"
                >
                  Unsaved changes
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-200"
                >
                  All changes saved
                </Badge>
              )}
            </div>

            {/* Action buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={onDiscard}
              disabled={!isDirty || isSaving}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Discard
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onRunNow}
              disabled={!isValid}
            >
              <Play className="h-4 w-4 mr-2" />
              Run now
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onToggleStatus}
              className={
                isEnabled
                  ? "text-red-600 hover:text-red-700"
                  : "text-green-600 hover:text-green-700"
              }
            >
              <Power className="h-4 w-4 mr-2" />
              {isEnabled ? "Disable" : "Enable"}
            </Button>

            <Button
              onClick={onSave}
              disabled={!isDirty || !isValid || isSaving}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
