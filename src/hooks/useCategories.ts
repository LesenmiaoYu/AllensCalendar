"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { Category } from "@/types";

interface CreateCategoryData {
  name: string;
  slug: string;
  color: string;
  sortOrder: number;
}

interface UpdateCategoryData {
  name?: string;
  slug?: string;
  color?: string;
  sortOrder?: number;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async (): Promise<Category[]> => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");

      const data = await res.json();
      setCategories(data.categories);
      return data.categories;
    } catch (err) {
      toast.error("Failed to load categories");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(
    async (formData: CreateCategoryData): Promise<Category> => {
      try {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to create category");
        }

        const data = await res.json();
        setCategories((prev) =>
          [...prev, data.category].sort((a, b) => a.sortOrder - b.sortOrder)
        );
        toast.success("Category created");
        return data.category;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to create category"
        );
        throw err;
      }
    },
    []
  );

  const updateCategory = useCallback(
    async (id: string, formData: UpdateCategoryData): Promise<Category> => {
      try {
        const res = await fetch(`/api/categories/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to update category");
        }

        const data = await res.json();
        setCategories((prev) =>
          prev
            .map((c) => (c.id === id ? data.category : c))
            .sort((a, b) => a.sortOrder - b.sortOrder)
        );
        toast.success("Category updated");
        return data.category;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to update category"
        );
        throw err;
      }
    },
    []
  );

  const deleteCategory = useCallback(async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete category");
      }

      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category deleted");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete category"
      );
      throw err;
    }
  }, []);

  return {
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
