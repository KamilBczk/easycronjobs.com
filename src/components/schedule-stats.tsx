"use client";

import { Job } from "@/types/schedule";
import { Card, CardContent } from "@/components/ui/card";

interface ScheduleStatsProps {
  jobs: Job[];
  className?: string;
}

export function ScheduleStats({ jobs, className }: ScheduleStatsProps) {
  const stats = {
    total: jobs.length,
    enabled: jobs.filter((job) => job.status === "enabled").length,
    failed24h: jobs.reduce((sum, job) => sum + job.failures24h, 0),
  };

  const statsItems = [
    {
      label: "Total",
      value: stats.total,
      color: "text-foreground",
    },
    {
      label: "Activés",
      value: stats.enabled,
      color: "text-green-600",
    },
    {
      label: "Échecs 24h",
      value: stats.failed24h,
      color: stats.failed24h > 0 ? "text-red-600" : "text-muted-foreground",
    },
  ];

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statsItems.map((item) => (
            <div key={item.label} className="text-center">
              <div className={`text-2xl font-bold ${item.color}`}>
                {item.value}
              </div>
              <div className="text-sm text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
