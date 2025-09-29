"use client";

import Link from "next/link";
import { Calendar, Clock, History } from "lucide-react";
import { Job } from "@/types/schedule";
import { JobStatusBadge } from "@/components/job-status-badge";
import { ExecutionStatusIndicator } from "@/components/execution-status";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface JobCardProps {
  job: Job;
  className?: string;
}

export function JobCard({ job, className }: JobCardProps) {
  const formatNextExecution = (date: Date | null) => {
    if (!date) return "—";
    return format(date, "dd/MM/yyyy HH:mm", { locale: fr });
  };

  return (
    <Link href={`/app/schedule/${job.id}`}>
      <Card
        className={cn(
          "group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-amber-200",
          job.status === "disabled" && "opacity-75",
          className
        )}
      >
        <CardContent className="p-4">
          {/* First line: Job name + Status badge */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-semibold text-foreground truncate flex-1 group-hover:text-amber-600 transition-colors">
              {job.name}
            </h3>
            <JobStatusBadge status={job.status} />
          </div>

          {/* Second line: Meta information */}
          <div className="space-y-2">
            {/* Next execution */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Prochaine : {formatNextExecution(job.nextExecution)}</span>
            </div>

            {/* Last execution status */}
            {job.lastExecution && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <History className="h-3 w-3" />
                <span>Dernière exécution :</span>
                <ExecutionStatusIndicator
                  status={job.lastExecution.status}
                  completedAt={job.lastExecution.completedAt}
                  duration={job.lastExecution.duration}
                  exitCode={job.lastExecution.exitCode}
                />
              </div>
            )}

            {/* Category and frequency */}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {job.category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {job.frequencyHuman}
              </span>
            </div>

            {/* Failures indicator - commented for now */}
            {/* {job.failures24h > 0 && (
            <div className="text-xs text-red-600 font-medium">
              {job.failures24h} échec{job.failures24h > 1 ? "s" : ""} (24h)
            </div>
          )} */}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
