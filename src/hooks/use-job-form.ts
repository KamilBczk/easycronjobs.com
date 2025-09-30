"use client";

import { useState, useCallback, useEffect } from "react";
import { JobFormData, JobFormState } from "@/types/job-detail";
import { useSession } from "next-auth/react";

const defaultFormData: JobFormData = {
  name: "",
  status: "enabled",
  category: "", // Vide par défaut, mais obligatoire
  description: "",
  schedule: {
    mode: "preset",
    preset: "daily",
    cronExpression: "1 0 * * *",
    timezone: "Europe/Brussels",
    allowedDays: [true, true, true, true, true, true, true],
  },
  api: {
    method: "GET",
    url: "",
    auth: { type: "none" },
    queryParams: [],
    headers: [],
    body: "",
    bodyType: "json",
    timeout: 30000,
    followRedirects: true,
    successCodes: [200],
    failureCodes: [],
  },
  notifications: {
    trigger: "error",
    httpCodes: [],
    recipients: [],
    subject: "{{job.name}} - {{run.state}}",
    template: "Job {{job.name}} finished with status {{run.state}}",
    includeLogs: true,
    includeResponse: false,
    minInterval: 15,
    maxPerDay: 10,
    dailySummary: false,
  },
  concurrency: "skip",
  timeout: 300000,
  retries: 3,
  backoffType: "exponential",
  backoffDelay: 1000,
  jitter: true,
  runOnDeploy: false,
  failSafeThreshold: 5,
};

export function useJobForm(jobId?: string) {
  const { data: session } = useSession();
  const [formState, setFormState] = useState<JobFormState>({
    data: { ...defaultFormData },
    isDirty: false,
    isValid: false,
    errors: {},
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  // Validation
  const validateForm = useCallback((data: JobFormData) => {
    const errors: Record<string, string> = {};

    if (!data.name.trim()) {
      errors.name = "Le nom du job est requis";
    }

    if (!data.category || !data.category.trim()) {
      errors.category = "La catégorie est requise";
    }

    if (!data.api.url.trim()) {
      errors.url = "L'URL est requise";
    } else {
      try {
        new URL(data.api.url);
      } catch {
        errors.url = "URL invalide";
      }
    }

    if (data.schedule.mode === "cron" && data.schedule.cronExpression) {
      // Basic cron validation (5 parts)
      const cronParts = data.schedule.cronExpression.split(" ");
      if (cronParts.length !== 5) {
        errors.cron = "Expression cron invalide (5 parties requises)";
      }
    }

    if (data.api.bodyType === "json" && data.api.body) {
      try {
        JSON.parse(data.api.body);
      } catch {
        errors.body = "JSON invalide";
      }
    }

    return { errors, isValid: Object.keys(errors).length === 0 };
  }, []);

  const updateField = useCallback((path: string, value: any) => {
    setFormState((prev) => {
      const newData = { ...prev.data };
      const keys = path.split(".");
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current)) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;

      const { errors, isValid } = validateForm(newData);
      console.log("🔄 updateField:", path, "=", value, "→ isValid:", isValid, "errors:", errors);

      return {
        data: newData,
        isDirty: true,
        isValid,
        errors,
      };
    });
  }, [validateForm]);

  const resetForm = useCallback(() => {
    setFormState((prev) => ({
      data: prev.data.id ? prev.data : { ...defaultFormData },
      isDirty: false,
      isValid: false,
      errors: {},
    }));
  }, []);

  const saveForm = useCallback(async () => {
    console.log("💾 Tentative de sauvegarde - isValid:", formState.isValid, "catégorie:", formState.data.category);
    setIsSaving(true);
    try {
      const { data } = formState;
      let response;

      if (data.id) {
        // Mise à jour d'un job existant
        response = await fetch(`/api/jobs/${data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        // Création d'un nouveau job
        response = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la sauvegarde");
      }

      const result = await response.json();

      setFormState((prev) => ({
        ...prev,
        data: { ...prev.data, id: result.job.id },
        isDirty: false,
      }));

      return { success: true, job: result.job };
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur lors de la sauvegarde"
      };
    } finally {
      setIsSaving(false);
    }
  }, [formState]);

  // Generate next executions preview
  const getNextExecutions = useCallback(() => {
    const { schedule } = formState.data;
    const executions: Date[] = [];
    const now = new Date();

    // For second-based and minute-based schedules, start from current time
    if (schedule.preset === '30s') {
      const currentSeconds = now.getSeconds();
      const nextSecond = Math.ceil(currentSeconds / 30) * 30;

      for (let i = 0; i < 5; i++) {
        const nextExec = new Date(now);
        const targetSecond = nextSecond + i * 30;

        if (targetSecond >= 60) {
          nextExec.setMinutes(nextExec.getMinutes() + Math.floor(targetSecond / 60));
          nextExec.setSeconds(targetSecond % 60, 0);
        } else {
          nextExec.setSeconds(targetSecond, 0);
        }

        if (nextExec <= now) {
          nextExec.setSeconds(nextExec.getSeconds() + 30);
        }
        executions.push(nextExec);
      }
    } else if (schedule.preset === '1m') {
      for (let i = 1; i <= 5; i++) {
        const nextExec = new Date(now);
        nextExec.setMinutes(nextExec.getMinutes() + i, 0, 0);
        executions.push(nextExec);
      }
    } else if (schedule.preset === '5m') {
      const currentMinutes = now.getMinutes();
      const nextMinute = Math.ceil(currentMinutes / 5) * 5;

      for (let i = 0; i < 5; i++) {
        const nextExec = new Date(now);
        nextExec.setMinutes(nextMinute + i * 5, 0, 0);
        if (nextExec <= now) {
          nextExec.setHours(nextExec.getHours() + 1);
        }
        executions.push(nextExec);
      }
    } else if (schedule.preset === '15m') {
      const currentMinutes = now.getMinutes();
      const nextMinute = Math.ceil(currentMinutes / 15) * 15;

      for (let i = 0; i < 5; i++) {
        const nextExec = new Date(now);
        nextExec.setMinutes(nextMinute + i * 15, 0, 0);
        if (nextExec <= now) {
          nextExec.setHours(nextExec.getHours() + 1);
        }
        executions.push(nextExec);
      }
    } else if (schedule.preset === 'hourly') {
      for (let i = 1; i <= 5; i++) {
        const nextExec = new Date(now);
        nextExec.setHours(nextExec.getHours() + i, 0, 0, 0);
        executions.push(nextExec);
      }
    } else if (schedule.preset === 'daily') {
      for (let i = 1; i <= 5; i++) {
        const nextExec = new Date(now);
        nextExec.setDate(nextExec.getDate() + i);
        nextExec.setHours(0, 1, 0, 0);
        executions.push(nextExec);
      }
    } else if (schedule.preset === 'weekly') {
      // Next Mondays at 00:01
      for (let i = 0; i < 5; i++) {
        const nextExec = new Date(now);
        const daysUntilMonday = ((1 - nextExec.getDay() + 7) % 7) || 7;
        nextExec.setDate(nextExec.getDate() + daysUntilMonday + i * 7);
        nextExec.setHours(0, 1, 0, 0);
        executions.push(nextExec);
      }
    } else if (schedule.preset === 'monthly') {
      // 1st of next months at 00:01
      for (let i = 1; i <= 5; i++) {
        const nextExec = new Date(now);
        nextExec.setMonth(nextExec.getMonth() + i);
        nextExec.setDate(1);
        nextExec.setHours(0, 1, 0, 0);
        executions.push(nextExec);
      }
    } else if (schedule.mode === 'cron' && schedule.cronExpression) {
      // Basic cron parsing for common patterns
      const cronParts = schedule.cronExpression.split(' ');
      if (cronParts.length === 5) {
        const [minute, hour, day, month, weekday] = cronParts;

        for (let i = 1; i <= 5; i++) {
          const nextExec = new Date(now);

          // Simple parsing - handle basic cases
          if (minute !== '*') {
            nextExec.setMinutes(parseInt(minute) || 0);
          }
          if (hour !== '*') {
            nextExec.setHours(parseInt(hour) || 0);
          }

          // If it's today and time has passed, move to next occurrence
          if (nextExec <= now) {
            if (weekday !== '*') {
              // Weekly pattern
              nextExec.setDate(nextExec.getDate() + 7 * i);
            } else if (day !== '*') {
              // Monthly pattern
              nextExec.setMonth(nextExec.getMonth() + i);
            } else {
              // Daily pattern
              nextExec.setDate(nextExec.getDate() + i);
            }
          } else if (i > 1) {
            // Add interval for subsequent executions
            if (weekday !== '*') {
              nextExec.setDate(nextExec.getDate() + 7 * (i - 1));
            } else if (day !== '*') {
              nextExec.setMonth(nextExec.getMonth() + (i - 1));
            } else {
              nextExec.setDate(nextExec.getDate() + (i - 1));
            }
          }

          executions.push(nextExec);
        }
      }
    }

    // Fallback for any unhandled cases
    if (executions.length === 0) {
      for (let i = 1; i <= 5; i++) {
        const nextExec = new Date(now);
        nextExec.setDate(nextExec.getDate() + i);
        nextExec.setHours(0, 1, 0, 0);
        executions.push(nextExec);
      }
    }

    return executions;
  }, [formState.data.schedule]);

  // Fonction pour charger les catégories
  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des catégories");
      }
      const result = await response.json();
      setCategories(result.categories || []);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
      setCategories([]);
    }
  }, []);


  // Charger un job existant
  useEffect(() => {
    if (jobId) {
      setIsLoading(true);
      Promise.all([
        fetch(`/api/jobs/${jobId}`).then(r => r.json()),
        fetch("/api/categories").then(r => r.json())
      ])
        .then(([jobResult, categoriesResult]) => {
          setFormState({
            data: jobResult.job,
            isDirty: false,
            isValid: true,
            errors: {},
          });
          setCategories(categoriesResult.categories || []);
        })
        .catch((error) => {
          console.error("Erreur lors du chargement:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // Charger seulement les catégories pour un nouveau job
      loadCategories();
    }
  }, [jobId, loadCategories]);

  // Validation automatique quand les données changent (éviter la boucle)
  useEffect(() => {
    const { errors, isValid } = validateForm(formState.data);
    console.log("🔍 Validation - catégorie:", formState.data.category, "isValid:", isValid, "errors:", errors);
    setFormState((prev) => {
      // Ne mettre à jour que si les erreurs ou isValid ont changé
      if (prev.isValid !== isValid || JSON.stringify(prev.errors) !== JSON.stringify(errors)) {
        console.log("📝 Mise à jour validation - nouveau isValid:", isValid);
        return {
          ...prev,
          isValid,
          errors,
        };
      }
      return prev;
    });
  }, [formState.data.name, formState.data.category, formState.data.api.url, formState.data.schedule.cronExpression, formState.data.api.body, formState.data.api.bodyType, validateForm]);

  // Fonctions d'actions
  const runJobNow = useCallback(async () => {
    if (!formState.data.id) return { success: false, error: "Job non sauvegardé" };

    try {
      const response = await fetch(`/api/jobs/${formState.data.id}/run`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Erreur lors du lancement du job");
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "Erreur lors du lancement du job" };
    }
  }, [formState.data.id]);

  const toggleJobStatus = useCallback(async () => {
    const newStatus = formState.data.status === "enabled" ? "disabled" : "enabled";

    // Mettre à jour l'état local immédiatement pour le feedback UI
    setFormState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        status: newStatus,
      },
    }));

    // Sauvegarder automatiquement si le job existe
    if (formState.data.id) {
      try {
        const response = await fetch(`/api/jobs/${formState.data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formState.data,
            status: newStatus,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erreur lors de la sauvegarde");
        }

        const result = await response.json();
        return { success: true, job: result.job };
      } catch (error) {
        console.error("Erreur lors du toggle status:", error);
        // Rollback en cas d'erreur
        setFormState((prev) => ({
          ...prev,
          data: {
            ...prev.data,
            status: formState.data.status,
          },
        }));
        return {
          success: false,
          error: error instanceof Error ? error.message : "Erreur lors de la sauvegarde"
        };
      }
    }
    return { success: true };
  }, [formState.data]);

  const duplicateJob = useCallback(async () => {
    if (!formState.data.id) return { success: false, error: "Job non sauvegardé" };

    try {
      // Créer une copie sans l'ID
      const jobCopy = { ...formState.data };
      delete jobCopy.id;
      jobCopy.name = `${jobCopy.name} (copie)`;
      jobCopy.status = "disabled";

      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobCopy),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la duplication");
      }

      const result = await response.json();
      return { success: true, job: result.job };
    } catch (error) {
      return { success: false, error: "Erreur lors de la duplication" };
    }
  }, [formState.data]);

  const deleteJob = useCallback(async () => {
    if (!formState.data.id) return { success: false, error: "Job non sauvegardé" };

    try {
      const response = await fetch(`/api/jobs/${formState.data.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "Erreur lors de la suppression" };
    }
  }, [formState.data.id]);

  const addCategory = useCallback((newCategory: { id: string; name: string }) => {
    setCategories((prev) => [...prev, newCategory]);
    // Sélectionner automatiquement la nouvelle catégorie
    updateField("category", newCategory.name);
  }, [updateField]);

  return {
    formState,
    isLoading,
    isSaving,
    categories,
    updateField,
    resetForm,
    saveForm,
    runJobNow,
    toggleJobStatus,
    duplicateJob,
    deleteJob,
    getNextExecutions,
    addCategory,
  };
}
