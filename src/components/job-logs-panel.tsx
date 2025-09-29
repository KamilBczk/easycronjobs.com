"use client";

import { Terminal, ExternalLink, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function JobLogsPanel() {
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Mock log data
  const logs = [
    "[2024-12-27 10:30:15] Starting job execution...",
    "[2024-12-27 10:30:15] Sending GET request to https://api.example.com/data",
    "[2024-12-27 10:30:16] Response received: 200 OK",
    '[2024-12-27 10:30:16] Response body: {"status":"success","data":[...]}',
    "[2024-12-27 10:30:16] Job completed successfully in 1.25s",
    "[2024-12-27 10:30:16] Sending notification to 2 recipients",
    "[2024-12-27 10:30:17] Notification sent successfully",
    "[2024-12-27 10:30:17] Job execution finished",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Derniers logs
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label
                htmlFor="auto-refresh"
                className="text-xs text-muted-foreground"
              >
                Auto 30s
              </Label>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mini console */}
        <div className="bg-gray-950 text-green-400 p-3 rounded-md font-mono text-xs overflow-hidden">
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="whitespace-nowrap">
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <ExternalLink className="h-4 w-4 mr-2" />
            View full logs
          </Button>
          <Button variant="outline" size="sm">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Status */}
        <div className="text-xs text-muted-foreground">
          Dernière mise à jour : il y a 2 minutes
          {autoRefresh && " • Auto-refresh activé"}
        </div>
      </CardContent>
    </Card>
  );
}
