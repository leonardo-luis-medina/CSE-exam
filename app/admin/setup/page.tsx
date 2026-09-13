"use client";

import { useEffect, useState } from "react";

type Category = { id: number; name: string; group: string | null };
type Year = { id: number; year: number };

export default function SetupPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newYear, setNewYear] = useState("");

  const loadData = async () => {
    const catRes = await fetch("/api/categories");
    setCategories(await catRes.json());
    const yearRes = await fetch("/api/years");
    setYears(await yearRes.json());
  };

  useEffect(() => {
    loadData();
  }, []);

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategory, group: newGroup }),
    });
    setNewCategory("");
    setNewGroup("");
    loadData();
  };

  const addYear = async () => {
    if (!newYear.trim()) return;
    await fetch("/api/years", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: newYear }),
    });
    setNewYear("");
    loadData();
  };

  const deleteCategory = async (id: number) => {
    if (
      !confirm(
        "Delete this category? Questions using it will remain, but become Uncategorized."
      )
    )
      return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    loadData();
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="glass-card rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Manage Categories & Years</h1>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Categories</h2>

          <div className="space-y-2 mb-3">
            <input
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              placeholder="Category Group (optional) — e.g. CSE, LTO, NAT"
              className="border border-gray-300 rounded px-3 py-2 w-full bg-white text-gray-900 text-sm"
            />
            <div className="flex gap-2">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Category name — e.g. Verbal Reasoning"
                className="border border-gray-300 rounded px-3 py-2 flex-1 bg-white text-gray-900"
              />
              <button
                onClick={addCategory}
                className="btn-primary px-4 py-2 rounded font-medium"
              >
                Add
              </button>
            </div>
          </div>

          <ul className="space-y-1">
            {categories.map((c) => (
              <li
                key={c.id}
                className="border border-gray-200 rounded px-3 py-2 bg-white text-gray-800 flex items-center justify-between"
              >
                <span>{c.name}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      c.group
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {c.group || "Uncategorized"}
                  </span>
                  <button
                    onClick={() => deleteCategory(c.id)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Years</h2>
          <div className="flex gap-2 mb-3">
            <input
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              placeholder="e.g. 2024"
              className="border border-gray-300 rounded px-3 py-2 flex-1 bg-white text-gray-900"
            />
            <button
              onClick={addYear}
              className="btn-primary px-4 py-2 rounded font-medium"
            >
              Add
            </button>
          </div>
          <ul className="space-y-1">
            {years.map((y) => (
              <li key={y.id} className="border border-gray-200 rounded px-3 py-2 bg-white text-gray-800">
                {y.year}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}