"use client";

import { FileText, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function JobAuditPanel() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Mock audit data
  const auditData = {
    id: "job-123456",
    createdBy: "John Doe",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    lastModifiedBy: "Jane Smith",
    lastModifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    team: "Development Team",
    category: "API",
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy HH:mm", { locale: fr });
  };

  const auditItems = [
    {
      label: "ID du job",
      value: auditData.id,
      copyable: true,
    },
    {
      label: "Créé par",
      value: auditData.createdBy,
      copyable: false,
    },
    {
      label: "Créé le",
      value: formatDate(auditData.createdAt),
      copyable: false,
    },
    {
      label: "Modifié par",
      value: auditData.lastModifiedBy,
      copyable: false,
    },
    {
      label: "Modifié le",
      value: formatDate(auditData.lastModifiedAt),
      copyable: false,
    },
    {
      label: "Équipe",
      value: auditData.team,
      copyable: false,
    },
    {
      label: "Catégorie",
      value: auditData.category,
      copyable: false,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Audit & méta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {auditItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {item.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-right max-w-32 truncate">
                  {item.value}
                </span>
                {item.copyable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(item.value, item.label)}
                  >
                    {copiedField === item.label ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {copiedField && (
          <div className="text-xs text-green-600 mt-2 text-center">
            {copiedField} copié !
          </div>
        )}
      </CardContent>
    </Card>
  );
}
