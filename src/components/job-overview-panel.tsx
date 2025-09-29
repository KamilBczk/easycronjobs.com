"use client";

import { Clock, History, User, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { JobFormData } from "@/types/job-detail";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface JobOverviewPanelProps {
  data: JobFormData;
  nextExecutions: Date[];
}

export function JobOverviewPanel({
  data,
  nextExecutions,
}: JobOverviewPanelProps) {
  const nextExecution = nextExecutions[0];

  // Mock last execution data
  const lastExecution = {
    status: "ok" as const,
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
    duration: 1250, // 1.25s
  };

  const consecutiveFails = 0; // Mock data
  const owner = "John Doe"; // Mock data

  const formatDuration = (ms: number) => {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  const formatNextExecution = (date: Date | null) => {
    if (!date) return "—";
    return format(date, "dd/MM/yyyy HH:mm", { locale: fr });
  };

  const formatLastExecution = (date: Date) => {
    return format(date, "dd/MM/yyyy HH:mm", { locale: fr });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Statut courant</span>
          <Badge
            variant="outline"
            className={
              data.status === "enabled"
                ? "border-green-200 text-green-700 bg-green-50"
                : "border-gray-200 text-gray-600 bg-gray-50"
            }
          >
            {data.status === "enabled" ? "Enabled" : "Disabled"}
          </Badge>
        </div>

        {/* Next execution */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Prochaine exécution
            </span>
          </div>
          <span className="text-sm font-medium">
            {data.status === "enabled"
              ? formatNextExecution(nextExecution)
              : "—"}
          </span>
        </div>

        {/* Last execution */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Dernière exécution
              </span>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-700">
                  Success
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatLastExecution(lastExecution.completedAt)}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground text-right">
            Durée : {formatDuration(lastExecution.duration)}
          </div>
        </div>

        {/* Frequency */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Fréquence</span>
          <div className="text-right">
            <div className="text-sm font-medium">
              {data.schedule.mode === "preset"
                ? data.schedule.preset
                : "Cron personnalisé"}
            </div>
            {data.schedule.cronExpression && (
              <div className="text-xs text-muted-foreground font-mono">
                {data.schedule.cronExpression}
              </div>
            )}
          </div>
        </div>

        {/* Consecutive fails */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Échecs consécutifs
            </span>
          </div>
          <span
            className={`text-sm font-medium ${
              consecutiveFails > 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {consecutiveFails}
          </span>
        </div>

        {/* Owner */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Owner</span>
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-amber-100 text-amber-700">
                {owner
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{owner}</span>
          </div>
        </div>

        {/* Timezone */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Fuseau horaire</span>
          <span className="text-sm font-medium">{data.schedule.timezone}</span>
        </div>
      </CardContent>
    </Card>
  );
}
