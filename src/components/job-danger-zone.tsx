"use client";

import { AlertTriangle, Power, Copy, Trash2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface JobDangerZoneProps {
  isEnabled: boolean;
  onToggleStatus: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function JobDangerZone({
  isEnabled,
  onToggleStatus,
  onDuplicate,
  onDelete,
}: JobDangerZoneProps) {
  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Delete */}
        <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
          <div>
            <div className="font-medium text-sm text-red-600">
              Supprimer ce job
            </div>
            <div className="text-xs text-red-500">
              ⚠️ Cette action est irréversible. Toutes les données seront
              perdues.
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>

        {/* Warning */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Les actions de cette zone peuvent avoir des conséquences importantes.
          Assurez-vous de comprendre les implications avant de continuer.
        </div>
      </CardContent>
    </Card>
  );
}
