"use client";

import { useEffect, useState } from "react";

type Category = { id: number; name: string };
type Year = { id: number; year: number };

export default function SetupPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [newCategory, setNewCategory] = useState("");
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
      body: JSON.stringify({ name: newCategory }),
    });
    setNewCategory("");
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

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Categories & Years</h1>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Categories</h2>
        <div className="flex gap-2 mb-3">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="e.g. Verbal Reasoning"
            className="border rounded px-3 py-2 flex-1"
          />
          <button
            onClick={addCategory}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <ul className="space-y-1">
          {categories.map((c) => (
            <li key={c.id} className="border rounded px-3 py-2 bg-gray-50">
              {c.name}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Years</h2>
        <div className="flex gap-2 mb-3">
          <input
            value={newYear}
            onChange={(e) => setNewYear(e.target.value)}
            placeholder="e.g. 2024"
            className="border rounded px-3 py-2 flex-1"
          />
          <button
            onClick={addYear}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <ul className="space-y-1">
          {years.map((y) => (
            <li key={y.id} className="border rounded px-3 py-2 bg-gray-50">
              {y.year}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}