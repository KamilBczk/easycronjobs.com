"use client";

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Job, ScheduleState } from "@/types/schedule";
import { JobStatusBadge } from "@/components/job-status-badge";
import { ExecutionStatusIndicator } from "@/components/execution-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface JobsTableProps {
  jobs: Job[];
  sortKey: ScheduleState["sortKey"];
  sortOrder: ScheduleState["sortOrder"];
  onSort: (key: ScheduleState["sortKey"]) => void;
  isLoading?: boolean;
}

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
          <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </TableCell>
      <TableCell>
        <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
      </TableCell>
      <TableCell>
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
      </TableCell>
      <TableCell>
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
      </TableCell>
      <TableCell>
        <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
      </TableCell>
    </TableRow>
  );
}

export function JobsTable({
  jobs,
  sortKey,
  sortOrder,
  onSort,
  isLoading = false,
}: JobsTableProps) {
  const formatNextExecution = (date: Date | null) => {
    if (!date) return "—";
    return format(date, "dd/MM/yyyy HH:mm", { locale: fr });
  };

  const getSortIcon = (key: ScheduleState["sortKey"]) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">
              <Button
                variant="ghost"
                onClick={() => onSort("name")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Job
                {getSortIcon("name")}
              </Button>
            </TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => onSort("nextExecution")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Prochaine exécution
                {getSortIcon("nextExecution")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => onSort("lastExecution")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Dernière exécution
                {getSortIcon("lastExecution")}
              </Button>
            </TableHead>
            <TableHead>Fréquence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <TableRowSkeleton key={i} />
            ))
          ) : jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12">
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Aucun job trouvé
                  </h3>
                  <p className="text-muted-foreground">
                    Aucun job ne correspond à vos filtres actuels.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => (
              <TableRow
                key={job.id}
                className={cn(
                  "cursor-pointer hover:bg-muted/50 transition-colors",
                  job.status === "disabled" && "opacity-75"
                )}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate hover:text-amber-600 transition-colors">
                        {job.name}
                      </div>
                      {/* Failures indicator - commented for now */}
                      {/* {job.failures24h > 0 && (
                        <div className="text-xs text-red-600 font-medium mt-1">
                          {job.failures24h} échec
                          {job.failures24h > 1 ? "s" : ""} (24h)
                        </div>
                      )} */}
                    </div>
                    <JobStatusBadge status={job.status} />
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {job.category}
                  </Badge>
                </TableCell>

                <TableCell>
                  <span className="text-sm">
                    {formatNextExecution(job.nextExecution)}
                  </span>
                </TableCell>

                <TableCell>
                  {job.lastExecution ? (
                    <ExecutionStatusIndicator
                      status={job.lastExecution.status}
                      completedAt={job.lastExecution.completedAt}
                      duration={job.lastExecution.duration}
                      exitCode={job.lastExecution.exitCode}
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>

                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {job.frequencyHuman}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
