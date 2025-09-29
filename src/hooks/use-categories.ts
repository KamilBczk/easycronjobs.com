"use client";

import { useState, useEffect, useCallback } from "react";

export interface Category {
  id: string;
  name: string;
  teamId: string;
  createdAt: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les catégories
  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des catégories");
      }
      const result = await response.json();
      setCategories(result.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Créer une nouvelle catégorie
  const createCategory = useCallback(async (name: string) => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la création");
      }

      const result = await response.json();
      setCategories(prev => [...prev, result.category]);
      return { success: true, category: result.category };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  // Supprimer une catégorie
  const deleteCategory = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la suppression");
      }

      setCategories(prev => prev.filter(cat => cat.id !== id));
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  // Charger les catégories au montage
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    isLoading,
    error,
    loadCategories,
    createCategory,
    deleteCategory,
  };
}