"use client";

import { History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface RunHistoryItem {
  id: string;
  startedAt: Date;
  status: "ok" | "fail" | "timeout" | "running";
  duration: number;
  httpCode?: number;
}

export function JobHistoryPanel() {
  // Mock history data
  const runs: RunHistoryItem[] = [
    {
      id: "run-1",
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
      status: "ok",
      duration: 1250,
      httpCode: 200,
    },
    {
      id: "run-2",
      startedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8h ago
      status: "ok",
      duration: 980,
      httpCode: 200,
    },
    {
      id: "run-3",
      startedAt: new Date(Date.now() - 14 * 60 * 60 * 1000), // 14h ago
      status: "fail",
      duration: 5000,
      httpCode: 500,
    },
    {
      id: "run-4",
      startedAt: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20h ago
      status: "ok",
      duration: 1100,
      httpCode: 201,
    },
    {
      id: "run-5",
      startedAt: new Date(Date.now() - 26 * 60 * 60 * 1000), // 26h ago
      status: "timeout",
      duration: 30000,
    },
  ];

  const getStatusColor = (status: RunHistoryItem["status"]) => {
    switch (status) {
      case "ok":
        return "bg-green-500";
      case "fail":
        return "bg-red-500";
      case "timeout":
        return "bg-amber-500";
      case "running":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: RunHistoryItem["status"]) => {
    switch (status) {
      case "ok":
        return "Success";
      case "fail":
        return "Failed";
      case "timeout":
        return "Timeout";
      case "running":
        return "Running";
      default:
        return "Unknown";
    }
  };

  const formatDuration = (ms: number) => {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTime = (date: Date) => {
    return format(date, "dd/MM HH:mm", { locale: fr });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-4 w-4" />
          Historique des runs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {runs.map((run) => (
            <div
              key={run.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${getStatusColor(run.status)}`}
                />
                <div>
                  <div className="text-sm font-medium">
                    {formatTime(run.startedAt)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDuration(run.duration)}
                    {run.httpCode && ` • ${run.httpCode}`}
                  </div>
                </div>
              </div>

              <Badge
                variant="outline"
                className={`text-xs ${
                  run.status === "ok"
                    ? "border-green-200 text-green-700"
                    : run.status === "fail"
                      ? "border-red-200 text-red-700"
                      : run.status === "timeout"
                        ? "border-amber-200 text-amber-700"
                        : "border-blue-200 text-blue-700"
                }`}
              >
                {getStatusLabel(run.status)}
              </Badge>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground mt-4 text-center">
          Affichage des 5 dernières exécutions
        </div>
      </CardContent>
    </Card>
  );
}
