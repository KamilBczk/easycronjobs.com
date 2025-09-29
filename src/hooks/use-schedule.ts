"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Job, ScheduleState } from "@/types/schedule";
import { jobToFormData } from "@/lib/job-utils";

const initialState: ScheduleState = {
  view: "cards",
  selectedCategories: [],
  selectedStatuses: [],
  sortKey: "nextExecution",
  sortOrder: "asc",
  page: 1,
  pageSize: 24,
  searchTerm: "",
};

export function useSchedule() {
  const [state, setState] = useState<ScheduleState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [realJobs, setRealJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let filtered = realJobs;

    // Filter by categories
    if (state.selectedCategories.length > 0) {
      filtered = filtered.filter((job) =>
        state.selectedCategories.includes(job.category)
      );
    }

    // Filter by statuses
    if (state.selectedStatuses.length > 0) {
      filtered = filtered.filter((job) =>
        state.selectedStatuses.includes(job.status)
      );
    }

    // Filter by search term
    if (state.searchTerm) {
      const searchLower = state.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.name.toLowerCase().includes(searchLower) ||
          job.category.toLowerCase().includes(searchLower) ||
          job.owner.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (state.sortKey) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "nextExecution":
          aValue = a.nextExecution?.getTime() || 0;
          bValue = b.nextExecution?.getTime() || 0;
          break;
        case "lastExecution":
          aValue = a.lastExecution?.completedAt.getTime() || 0;
          bValue = b.lastExecution?.completedAt.getTime() || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return state.sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return state.sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [realJobs, state.selectedCategories, state.selectedStatuses, state.searchTerm, state.sortKey, state.sortOrder]);

  // Paginate jobs
  const paginatedJobs = useMemo(() => {
    const startIndex = (state.page - 1) * state.pageSize;
    const endIndex = startIndex + state.pageSize;
    return filteredJobs.slice(startIndex, endIndex);
  }, [filteredJobs, state.page, state.pageSize]);

  // Total pages
  const totalPages = Math.ceil(filteredJobs.length / state.pageSize);

  // Actions
  const setView = useCallback((view: "cards" | "table") => {
    setState((prev) => ({ ...prev, view }));
  }, []);

  const setSelectedCategories = useCallback((categories: string[]) => {
    setState((prev) => ({ ...prev, selectedCategories: categories, page: 1 }));
  }, []);

  const clearCategories = useCallback(() => {
    setState((prev) => ({ ...prev, selectedCategories: [], page: 1 }));
  }, []);

  const setSelectedStatuses = useCallback((statuses: string[]) => {
    setState((prev) => ({ ...prev, selectedStatuses: statuses as any, page: 1 }));
  }, []);

  const clearStatuses = useCallback(() => {
    setState((prev) => ({ ...prev, selectedStatuses: [], page: 1 }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setState((prev) => ({ ...prev, selectedCategories: [], selectedStatuses: [], page: 1 }));
  }, []);

  const setSort = useCallback(
    (sortKey: ScheduleState["sortKey"]) => {
      setState((prev) => ({
        ...prev,
        sortKey,
        sortOrder:
          prev.sortKey === sortKey && prev.sortOrder === "asc" ? "desc" : "asc",
        page: 1,
      }));
    },
    []
  );

  const setPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, page }));
  }, []);

  const setSearchTerm = useCallback((searchTerm: string) => {
    setState((prev) => ({ ...prev, searchTerm, page: 1 }));
  }, []);

  // Fonction pour charger les catégories depuis l'API
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

  // Fonction pour charger les jobs depuis l'API
  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/jobs");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des jobs");
      }
      const result = await response.json();

      // Convertir les jobs Prisma en format pour l'interface
      const convertedJobs: Job[] = result.jobs.map((job: any) => {
        // Calculer les échecs des dernières 24h depuis les runs
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const failures24h = job.runs?.filter((run: any) => {
          const runDate = new Date(run.startedAt);
          return runDate > yesterday && (run.state === "FAIL" || run.state === "TIMEOUT");
        }).length || 0;

        return {
          id: job.id,
          name: job.name,
          status: job.status.toLowerCase() as "enabled" | "disabled",
          category: job.category?.name || "Sans catégorie",
          nextExecution: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000), // Mock next execution
          lastExecution: job.runs && job.runs.length > 0 ? {
            status: job.runs[0].state === "OK" ? "ok" :
                   job.runs[0].state === "FAIL" ? "fail" :
                   job.runs[0].state === "TIMEOUT" ? "timeout" :
                   job.runs[0].state === "RUNNING" ? "running" : "fail",
            completedAt: new Date(job.runs[0].finishedAt || job.runs[0].startedAt),
            duration: job.runs[0].finishedAt ?
              new Date(job.runs[0].finishedAt).getTime() - new Date(job.runs[0].startedAt).getTime() :
              Math.floor(Math.random() * 5000) + 100,
          } : null,
          frequency: job.cronExpression || "0 0 * * *",
          frequencyHuman: job.schedulePreset || "Tous les jours",
          owner: "Utilisateur",
          failures24h: Number.isFinite(failures24h) ? failures24h : 0,
        };
      });

      setRealJobs(convertedJobs);
    } catch (error) {
      console.error("Erreur lors du chargement des jobs:", error);
      setRealJobs([]); // En cas d'erreur, afficher une liste vide
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([loadJobs(), loadCategories()]);
  }, [loadJobs, loadCategories]);

  // Charger les jobs et catégories au montage du composant
  useEffect(() => {
    Promise.all([loadJobs(), loadCategories()]);
  }, [loadJobs, loadCategories]);

  return {
    // State
    state,
    jobs: paginatedJobs,
    allJobs: realJobs, // Tous les jobs pour les stats
    filteredJobsCount: filteredJobs.length,
    totalPages,
    isLoading,
    categories, // Catégories réelles de l'utilisateur

    // Actions
    setView,
    setSelectedCategories,
    clearCategories,
    setSelectedStatuses,
    clearStatuses,
    clearAllFilters,
    setSort,
    setPage,
    setSearchTerm,
    refresh,
  };
}
