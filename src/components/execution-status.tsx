"use client";

import { ExecutionStatus, EXECUTION_STATUS_CONFIG } from "@/types/schedule";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { History } from "lucide-react";

interface ExecutionStatusIndicatorProps {
  status: ExecutionStatus;
  completedAt: Date;
  duration: number;
  exitCode?: number;
  className?: string;
}

export function ExecutionStatusIndicator({
  status,
  completedAt,
  className,
}: ExecutionStatusIndicatorProps) {
  const config = EXECUTION_STATUS_CONFIG[status];
  const timeAgo = formatDistanceToNow(completedAt, {
    locale: fr,
    addSuffix: true,
  });

  return (
    <span className={cn("text-sm text-muted-foreground", className)}>
      {timeAgo}
    </span>
  );
}
