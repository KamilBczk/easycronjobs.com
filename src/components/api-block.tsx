"use client";

import { Globe, Plus, X, Eye, EyeOff, Play } from "lucide-react";
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
import {
  JobFormData,
  KeyValuePair,
  HttpMethod,
  AuthType,
} from "@/types/job-detail";
import { useState } from "react";

interface ApiBlockProps {
  data: JobFormData;
  onUpdate: (path: string, value: any) => void;
  errors: Record<string, string>;
}

const httpMethods: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const authTypes: { value: AuthType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "bearer", label: "Bearer Token" },
  { value: "basic", label: "Basic Auth" },
  { value: "apikey", label: "API Key" },
];

export function ApiBlock({ data, onUpdate, errors }: ApiBlockProps) {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const addKeyValuePair = (type: "queryParams" | "headers") => {
    const current = data.api[type];
    const updated = [...current, { key: "", value: "", enabled: true }];
    onUpdate(`api.${type}`, updated);
  };

  const updateKeyValuePair = (
    type: "queryParams" | "headers",
    index: number,
    field: keyof KeyValuePair,
    value: any
  ) => {
    const current = data.api[type];
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate(`api.${type}`, updated);
  };

  const removeKeyValuePair = (
    type: "queryParams" | "headers",
    index: number
  ) => {
    const current = data.api[type];
    const updated = current.filter((_, i) => i !== index);
    onUpdate(`api.${type}`, updated);
  };

  const toggleSecret = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const testApiCall = () => {
    // Mock test call
    alert("Test call executed (mock)");
  };

  const renderKeyValueList = (
    type: "queryParams" | "headers",
    title: string
  ) => {
    const items = data.api[type];

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{title}</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addKeyValuePair(type)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        </div>

        {items.length > 0 && (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Clé"
                  value={item.key}
                  onChange={(e) =>
                    updateKeyValuePair(type, index, "key", e.target.value)
                  }
                  className="flex-1"
                />
                <Input
                  placeholder="Valeur"
                  value={item.value}
                  onChange={(e) =>
                    updateKeyValuePair(type, index, "value", e.target.value)
                  }
                  className="flex-1"
                />
                <Switch
                  checked={item.enabled}
                  onCheckedChange={(checked) =>
                    updateKeyValuePair(type, index, "enabled", checked)
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeKeyValuePair(type, index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Requête sortante
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Method and URL */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Méthode</Label>
            <Select
              value={data.api.method}
              onValueChange={(value) => onUpdate("api.method", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {httpMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    <Badge variant="outline" className="text-xs">
                      {method}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-3 space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={data.api.url}
              onChange={(e) => onUpdate("api.url", e.target.value)}
              placeholder="https://api.example.com/webhook"
              className={errors.url ? "border-red-500" : ""}
            />
            {errors.url && <p className="text-sm text-red-600">{errors.url}</p>}
          </div>
        </div>

        {/* Authentication */}
        <div className="space-y-4">
          <Label>Authentification</Label>
          <Select
            value={data.api.auth.type}
            onValueChange={(value) => onUpdate("api.auth.type", value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {authTypes.map((auth) => (
                <SelectItem key={auth.value} value={auth.value}>
                  {auth.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {data.api.auth.type === "bearer" && (
            <div className="space-y-2">
              <Label>Token</Label>
              <div className="flex items-center gap-2">
                <Input
                  type={showSecrets.token ? "text" : "password"}
                  value={data.api.auth.token || ""}
                  onChange={(e) => onUpdate("api.auth.token", e.target.value)}
                  placeholder="Bearer token"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSecret("token")}
                >
                  {showSecrets.token ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {data.api.auth.type === "basic" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={data.api.auth.username || ""}
                  onChange={(e) =>
                    onUpdate("api.auth.username", e.target.value)
                  }
                  placeholder="Username"
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type={showSecrets.password ? "text" : "password"}
                    value={data.api.auth.password || ""}
                    onChange={(e) =>
                      onUpdate("api.auth.password", e.target.value)
                    }
                    placeholder="Password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSecret("password")}
                  >
                    {showSecrets.password ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {data.api.auth.type === "apikey" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Header Name</Label>
                <Input
                  value={data.api.auth.headerName || ""}
                  onChange={(e) =>
                    onUpdate("api.auth.headerName", e.target.value)
                  }
                  placeholder="X-API-Key"
                />
              </div>
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type={showSecrets.apiKey ? "text" : "password"}
                    value={data.api.auth.apiKey || ""}
                    onChange={(e) =>
                      onUpdate("api.auth.apiKey", e.target.value)
                    }
                    placeholder="API Key"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSecret("apiKey")}
                  >
                    {showSecrets.apiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Query Parameters */}
        {renderKeyValueList("queryParams", "Paramètres de requête")}

        {/* Headers */}
        {renderKeyValueList("headers", "En-têtes")}

        {/* Body */}
        {(data.api.method === "POST" ||
          data.api.method === "PUT" ||
          data.api.method === "PATCH") && (
          <div className="space-y-4">
            <Label>Corps de requête</Label>
            <Select
              value={data.api.bodyType}
              onValueChange={(value) => onUpdate("api.bodyType", value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="form">Form-encoded</SelectItem>
                <SelectItem value="raw">Raw</SelectItem>
              </SelectContent>
            </Select>

            <Textarea
              value={data.api.body}
              onChange={(e) => onUpdate("api.body", e.target.value)}
              placeholder={
                data.api.bodyType === "json" ? '{"key": "value"}' : "key=value"
              }
              rows={6}
              className={errors.body ? "border-red-500" : ""}
            />
            {errors.body && (
              <p className="text-sm text-red-600">{errors.body}</p>
            )}
          </div>
        )}

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Timeout (ms)</Label>
            <Input
              type="number"
              value={data.api.timeout}
              onChange={(e) =>
                onUpdate("api.timeout", parseInt(e.target.value) || 30000)
              }
              min="1000"
              step="1000"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Follow redirects</Label>
              <p className="text-sm text-muted-foreground">
                Suivre les redirections HTTP
              </p>
            </div>
            <Switch
              checked={data.api.followRedirects}
              onCheckedChange={(checked) =>
                onUpdate("api.followRedirects", checked)
              }
            />
          </div>
        </div>

        {/* Test call */}
        <div className="pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={testApiCall}
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            Tester l'appel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
