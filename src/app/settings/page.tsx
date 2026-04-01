"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCategories } from "@/hooks/useCategories";
import type { Category } from "@/types";

interface CategoryForm {
  name: string;
  slug: string;
  color: string;
  sortOrder: number;
}

const EMPTY_FORM: CategoryForm = {
  name: "",
  slug: "",
  color: "#4B7EB9",
  sortOrder: 0,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function SettingsPage() {
  const router = useRouter();
  const {
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: editingId ? prev.slug : slugify(name),
    }));
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      color: cat.color,
      sortOrder: cat.sortOrder,
    });
    setShowForm(true);
    setConfirmDeleteId(null);
  }

  function startCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setConfirmDeleteId(null);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCategory(editingId, form);
      } else {
        await createCategory(form);
      }
      cancelForm();
    } catch {
      // Error toast handled in hook
    }
  }

  async function handleDelete(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    try {
      await deleteCategory(id);
      setConfirmDeleteId(null);
    } catch {
      // Error toast handled in hook
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[#E5E5E5] px-4 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")}
          aria-label="Back"
        >
          <ArrowLeft className="size-4 text-[#222222]" />
        </Button>
        <h1
          className="text-lg font-semibold text-[#222222]"
          style={{ letterSpacing: "-0.02em" }}
        >
          Settings
        </h1>
      </header>

      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
        {/* Categories section */}
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-base font-semibold text-[#222222]"
            style={{ letterSpacing: "-0.02em" }}
          >
            Categories
          </h2>
          <Button
            size="sm"
            onClick={startCreate}
            className="bg-[#FEF991] text-[#222222] hover:bg-[#fef460] border-[#FEF991]"
          >
            <Plus className="size-3.5" />
            Add Category
          </Button>
        </div>

        {/* Category list */}
        {loading && categories.length === 0 ? (
          <p className="text-sm text-[#888888]">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-[#888888]">
            No categories yet. Create one to get started.
          </p>
        ) : (
          <div className="rounded-lg border border-[#E5E5E5] divide-y divide-[#E5E5E5]">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                {/* Color swatch */}
                <div
                  className="size-5 shrink-0 rounded-full border border-[#E5E5E5]"
                  style={{ backgroundColor: cat.color }}
                />
                {/* Name + slug */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#222222] truncate">
                    {cat.name}
                  </p>
                  <p className="text-xs text-[#888888]">{cat.slug}</p>
                </div>
                {/* Sort order */}
                <span className="text-xs text-[#AAAAAA] tabular-nums">
                  #{cat.sortOrder}
                </span>
                {/* Actions */}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => startEdit(cat)}
                  aria-label={`Edit ${cat.name}`}
                >
                  <Pencil className="size-3" />
                </Button>
                <Button
                  variant={confirmDeleteId === cat.id ? "destructive" : "ghost"}
                  size="icon-xs"
                  onClick={() => handleDelete(cat.id)}
                  aria-label={`Delete ${cat.name}`}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Inline form */}
        {showForm && (
          <>
            <Separator className="my-6" />
            <h3
              className="mb-3 text-sm font-semibold text-[#222222]"
              style={{ letterSpacing: "-0.02em" }}
            >
              {editingId ? "Edit Category" : "New Category"}
            </h3>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 rounded-lg border border-[#E5E5E5] p-4"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="catName">Name</Label>
                <Input
                  id="catName"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Category name"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="catSlug">Slug</Label>
                <Input
                  id="catSlug"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="category-slug"
                  required
                />
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="catColor">Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="catColor"
                      type="color"
                      value={form.color}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          color: e.target.value,
                        }))
                      }
                      className="h-8 w-10 cursor-pointer rounded border border-input"
                    />
                    <span className="text-xs text-[#888888] font-mono">
                      {form.color}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="catSort">Sort order</Label>
                  <Input
                    id="catSort"
                    type="number"
                    min={0}
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        sortOrder: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-20"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#FEF991] text-[#222222] hover:bg-[#fef460] border-[#FEF991]"
                >
                  {editingId ? "Save" : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={cancelForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
