"use client";

import { Badge } from "@/components/ui/badge";
import { JobStatus } from "@/types/schedule";
import { cn } from "@/lib/utils";

interface JobStatusBadgeProps {
  status: JobStatus;
  className?: string;
}

export function JobStatusBadge({ status, className }: JobStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium",
        status === "enabled"
          ? "border-green-200 text-green-700 bg-green-50"
          : "border-gray-200 text-gray-600 bg-gray-50",
        className
      )}
    >
      {status === "enabled" ? "Enabled" : "Disabled"}
    </Badge>
  );
}
