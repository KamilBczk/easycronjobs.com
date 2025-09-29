"use client";

import { Mail, AlertCircle, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function JobQuotasPanel() {
  // Mock data
  const emailsSent = 45;
  const emailsQuota = 100;
  const blockedNotifications = 3;
  let plan: "Starter" | "Pro" = "Starter";
  // @ts-ignore - This is mock data for demonstration
  const minInterval = plan === "Pro" ? 30 : 300; // seconds

  const emailsPercentage = (emailsSent / emailsQuota) * 100;

  const planCapabilities = {
    Starter: [
      "Intervalle min : 5 minutes",
      "100 emails/mois",
      "Support communautaire",
    ],
    Pro: [
      "Intervalle min : 30 secondes",
      "1000 emails/mois",
      "Support prioritaire",
      "Webhooks avancés",
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Quotas & notifications
          {/* @ts-ignore - This is mock data for demonstration */}
          {plan === "Pro" && <Crown className="h-4 w-4 text-amber-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email quota */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Emails ce mois
              </span>
            </div>
            <span className="text-sm font-medium">
              {emailsSent} / {emailsQuota}
            </span>
          </div>
          <Progress value={emailsPercentage} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {emailsQuota - emailsSent} emails restants
          </div>
        </div>

        {/* Blocked notifications */}
        {blockedNotifications > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-muted-foreground">
                Notifications bloquées
              </span>
            </div>
            <Badge
              variant="outline"
              className="text-amber-600 border-amber-200"
            >
              {blockedNotifications}
            </Badge>
          </div>
        )}

        {/* Plan info */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Plan actuel</span>
            <Badge
              // @ts-ignore - This is mock data for demonstration
              variant={plan === "Pro" ? "default" : "secondary"}
              className={
                // @ts-ignore - This is mock data for demonstration
                plan === "Pro" ? "bg-amber-500 hover:bg-amber-600" : ""
              }
            >
              {plan}
            </Badge>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-xs text-muted-foreground cursor-help">
                  Capacités du plan {plan} ↗
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <div className="space-y-1">
                  {planCapabilities[plan as keyof typeof planCapabilities]?.map(
                    (capability, index) => (
                      <div key={index} className="text-xs">
                        • {capability}
                      </div>
                    )
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Rate limiting info */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Intervalle min
            </span>
            <span className="text-sm font-medium">
              {minInterval < 60
                ? `${minInterval}s`
                : `${Math.floor(minInterval / 60)}min`}
            </span>
          </div>

          {plan === "Starter" && (
            <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
              💡 Upgrade vers Pro pour des intervalles plus courts
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
