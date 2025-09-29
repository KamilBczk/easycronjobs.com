"use client";

import {
  Mail,
  Plus,
  X,
  AlertTriangle,
  Info,
  Bell,
  Users,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { JobFormData, NotificationTrigger } from "@/types/job-detail";
import { useState } from "react";

interface NotificationsBlockProps {
  data: JobFormData;
  onUpdate: (path: string, value: any) => void;
  errors: Record<string, string>;
}

const triggerOptions: {
  value: NotificationTrigger;
  label: string;
  description: string;
}[] = [
  { value: "error", label: "En cas d'erreur", description: "Recommandé" },
  { value: "always", label: "Toujours", description: "À chaque exécution" },
  {
    value: "success",
    label: "En cas de succès",
    description: "Seulement si OK",
  },
];

const commonHttpCodes = [400, 401, 403, 404, 429, 500, 502, 503, 504];

const teamMembers = [
  { email: "john@example.com", name: "John Doe" },
  { email: "jane@example.com", name: "Jane Smith" },
  { email: "mike@example.com", name: "Mike Johnson" },
];

export function NotificationsBlock({
  data,
  onUpdate,
  errors,
}: NotificationsBlockProps) {
  const [newRecipient, setNewRecipient] = useState("");

  const addRecipient = () => {
    if (newRecipient && !data.notifications.recipients.includes(newRecipient)) {
      const updated = [...data.notifications.recipients, newRecipient];
      onUpdate("notifications.recipients", updated);
      setNewRecipient("");
    }
  };

  const removeRecipient = (email: string) => {
    const updated = data.notifications.recipients.filter((r) => r !== email);
    onUpdate("notifications.recipients", updated);
  };

  const addTeamMember = (email: string) => {
    if (!data.notifications.recipients.includes(email)) {
      const updated = [...data.notifications.recipients, email];
      onUpdate("notifications.recipients", updated);
    }
  };

  const toggleHttpCode = (code: number) => {
    const current = data.notifications.httpCodes;
    const updated = current.includes(code)
      ? current.filter((c) => c !== code)
      : [...current, code];
    onUpdate("notifications.httpCodes", updated);
  };

  const isNoisyConfig = () => {
    return (
      data.notifications.trigger === "always" ||
      (data.notifications.trigger === "success" &&
        data.notifications.maxPerDay > 50) ||
      data.notifications.minInterval < 5
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Notifications email
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <Tabs defaultValue="triggers" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="triggers" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Déclencheurs
              </TabsTrigger>
              <TabsTrigger
                value="recipients"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Destinataires
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Contenu
              </TabsTrigger>
            </TabsList>

            <TabsContent value="triggers" className="space-y-4">
              <div className="flex items-center gap-2">
                <Label>Quand envoyer ?</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Définit dans quelles conditions les notifications seront
                      envoyées
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <ToggleGroup
                type="single"
                value={data.notifications.trigger}
                onValueChange={(value) =>
                  value && onUpdate("notifications.trigger", value)
                }
                className="grid grid-cols-3 gap-2"
              >
                {triggerOptions.map((option) => (
                  <Tooltip key={option.value}>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem
                        value={option.value}
                        className={`flex items-center justify-center p-2 h-10 text-sm border-2 transition-all ${
                          data.notifications.trigger === option.value
                            ? "border-amber-500 bg-amber-50 text-amber-700 font-medium"
                            : "border-transparent hover:border-amber-200"
                        }`}
                      >
                        {option.label}
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{option.description}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </ToggleGroup>

              {/* HTTP codes selection */}
              {data.notifications.trigger === "http_codes" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label>Codes HTTP à surveiller</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Notifications envoyées uniquement pour ces codes de
                          réponse HTTP
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {commonHttpCodes.map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => toggleHttpCode(code)}
                        className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                          data.notifications.httpCodes.includes(code)
                            ? "border-amber-500 bg-amber-50 text-amber-700"
                            : "border-border hover:border-amber-200"
                        }`}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Noisy config warning */}
              {isNoisyConfig() && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-700">
                    <div className="font-medium">
                      Configuration potentiellement bruyante
                    </div>
                    <div className="text-xs mt-1">
                      Cette configuration pourrait générer beaucoup d'emails
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="recipients" className="space-y-4">
              <div className="flex items-center gap-2">
                <Label>Destinataires</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Adresses email qui recevront les notifications</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Add recipient */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="email@example.com"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addRecipient()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addRecipient}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Selected recipients */}
              {data.notifications.recipients.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    Destinataires sélectionnés (
                    {data.notifications.recipients.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.notifications.recipients.map((email) => (
                      <Badge
                        key={email}
                        variant="secondary"
                        className="text-xs px-2 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        onClick={() => removeRecipient(email)}
                      >
                        {email}
                        <X className="ml-1 h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {data.notifications.recipients.length === 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    ⚠️ Aucun destinataire sélectionné
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div className="flex items-center gap-2">
                <Label>Modèle d'email</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Personnalisez le contenu des emails de notification</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="subject">Objet</Label>
                  <Input
                    id="subject"
                    value={data.notifications.subject}
                    onChange={(e) =>
                      onUpdate("notifications.subject", e.target.value)
                    }
                    placeholder="{{job.name}} - {{run.state}}"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Corps du message</Label>
                  <Textarea
                    id="template"
                    value={data.notifications.template}
                    onChange={(e) =>
                      onUpdate("notifications.template", e.target.value)
                    }
                    placeholder="Job {{job.name}} finished with status {{run.state}}"
                    rows={3}
                  />
                  <div className="text-xs text-muted-foreground">
                    Variables: {"{job.name}"}, {"{run.state}"},{" "}
                    {"{run.duration}"}, {"{now}"}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <Label>Options de contenu</Label>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label>Inclure les logs</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ajoute les logs d'exécution dans l'email</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Switch
                    checked={data.notifications.includeLogs}
                    onCheckedChange={(checked) =>
                      onUpdate("notifications.includeLogs", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label>Inclure la réponse HTTP</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Inclut un extrait de la réponse HTTP dans l'email</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Switch
                    checked={data.notifications.includeResponse}
                    onCheckedChange={(checked) =>
                      onUpdate("notifications.includeResponse", checked)
                    }
                  />
                </div>
              </div>

              {/* Preview button */}
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    alert("Aperçu de l'email - Fonctionnalité à venir")
                  }
                  className="w-full"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Aperçu de l'email
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
