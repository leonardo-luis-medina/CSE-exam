"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: number; name: string; _count?: { questions: number } };

export default function ExamSetupPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [counts, setCounts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: Category[]) => {
        setCategories(data);
        setLoading(false);
      });
  }, []);

  const toggleCategory = (id: number) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateCount = (id: number, value: string) => {
    setCounts((prev) => ({ ...prev, [id]: value }));
  };

  const selectAll = () => {
    const all: Record<number, boolean> = {};
    categories.forEach((c) => (all[c.id] = true));
    setSelected(all);
  };

  const clearAll = () => {
    setSelected({});
  };

  const handleStart = () => {
    const chosenIds = Object.keys(selected).filter((id) => selected[Number(id)]);

    if (chosenIds.length === 0) {
      alert("Please select at least one category.");
      return;
    }

    // Build param like: categories=1:10,2:0,3:25  (0 or blank = all available)
    const param = chosenIds
      .map((id) => `${id}:${counts[Number(id)]?.trim() || "0"}`)
      .join(",");

    router.push(`/exam/quiz?categories=${encodeURIComponent(param)}`);
  };

  if (loading) return <div className="p-8 text-center">Loading categories...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">Set Up Your Exam</h1>
      <p className="text-gray-500 mb-6">
        Choose which categories to include and how many questions per category. Leave the
        count blank (or 0) to include all available questions from that category.
      </p>

      <div className="flex gap-3 mb-4 text-sm">
        <button onClick={selectAll} className="text-blue-600 hover:underline">
          Select All
        </button>
        <button onClick={clearAll} className="text-red-500 hover:underline">
          Clear All
        </button>
      </div>

      <div className="space-y-3 mb-8">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`flex items-center gap-3 border rounded-lg px-4 py-3 ${
              selected[cat.id] ? "border-blue-400 bg-blue-50" : "border-gray-200"
            }`}
          >
            <input
              type="checkbox"
              checked={!!selected[cat.id]}
              onChange={() => toggleCategory(cat.id)}
              className="w-4 h-4"
            />
            <span className="flex-1 font-medium">{cat.name}</span>
            {selected[cat.id] && (
              <input
                type="number"
                min={0}
                placeholder="All"
                value={counts[cat.id] ?? ""}
                onChange={(e) => updateCount(cat.id, e.target.value)}
                className="w-20 border rounded px-2 py-1 text-sm"
              />
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="text-gray-500">No categories found. Add some in the admin panel first.</p>
      )}

      <button
        onClick={handleStart}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium w-full"
      >
        Start Exam
      </button>
    </div>
  );
}