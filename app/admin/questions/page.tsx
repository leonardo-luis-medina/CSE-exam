"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Choice = { id: number; text: string; isCorrect: boolean };
type Question = {
  id: number;
  text: string;
  category: { name: string };
  year: { year: number } | null;
  choices: Choice[];
};

type SortMode = "default" | "year" | "category";

export default function QuestionListPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>("default");

  const [activeYearTags, setActiveYearTags] = useState<string[]>([]); // "Reviewer" or year as string
  const [activeCategoryTags, setActiveCategoryTags] = useState<string[]>([]);

  const loadQuestions = async () => {
    setLoading(true);
    const res = await fetch("/api/questions");
    setQuestions(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this question? This cannot be undone.")) return;
    await fetch(`/api/questions/${id}`, { method: "DELETE" });
    loadQuestions();
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Build the list of available year/category options from the actual questions loaded
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => set.add(q.year ? q.year.year.toString() : "Reviewer"));
    return Array.from(set).sort((a, b) => {
      if (a === "Reviewer") return 1;
      if (b === "Reviewer") return -1;
      return Number(b) - Number(a);
    });
  }, [questions]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => set.add(q.category.name));
    return Array.from(set).sort();
  }, [questions]);

  const toggleYearTag = (year: string) => {
    setActiveYearTags((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const toggleCategoryTag = (cat: string) => {
    setActiveCategoryTags((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const clearAllTags = () => {
    setActiveYearTags([]);
    setActiveCategoryTags([]);
  };

  const filteredQuestions = questions.filter((q) => {
    const yearLabel = q.year ? q.year.year.toString() : "Reviewer";
    const yearMatch =
      activeYearTags.length === 0 || activeYearTags.includes(yearLabel);
    const categoryMatch =
      activeCategoryTags.length === 0 || activeCategoryTags.includes(q.category.name);
    return yearMatch && categoryMatch;
  });

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    if (sortMode === "year") {
      const yearA = a.year?.year ?? -1;
      const yearB = b.year?.year ?? -1;
      return yearB - yearA;
    }
    if (sortMode === "category") {
      return a.category.name.localeCompare(b.category.name);
    }
    return 0;
  });

  const hasActiveTags = activeYearTags.length > 0 || activeCategoryTags.length > 0;

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Questions ({questions.length})</h1>
        <Link
          href="/admin/questions/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Question
        </Link>
      </div>

      {/* Filter section */}
      <div className="mb-4 space-y-3">
        <div>
          <p className="text-sm text-gray-600 mb-1">Filter by Year:</p>
          <div className="flex flex-wrap gap-2">
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => toggleYearTag(year)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  activeYearTags.includes(year)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-1">Filter by Category:</p>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategoryTag(cat)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  activeCategoryTags.includes(cat)
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Active tag chips with individual X removal */}
        {hasActiveTags && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-sm text-gray-500">Active filters:</span>
            {activeYearTags.map((year) => (
              <span
                key={`yeartag-${year}`}
                className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
              >
                {year}
                <button onClick={() => toggleYearTag(year)} className="font-bold hover:text-blue-900">
                  ×
                </button>
              </span>
            ))}
            {activeCategoryTags.map((cat) => (
              <span
                key={`cattag-${cat}`}
                className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
              >
                {cat}
                <button onClick={() => toggleCategoryTag(cat)} className="font-bold hover:text-green-900">
                  ×
                </button>
              </span>
            ))}
            <button
              onClick={clearAllTags}
              className="text-xs text-red-500 hover:underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Sort dropdown */}
      <div className="flex items-center gap-2 mb-6">
        <label htmlFor="sort" className="text-sm text-gray-600">
          Sort by:
        </label>
        <select
          id="sort"
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          className="border rounded px-3 py-1.5 text-sm"
        >
          <option value="default">Default (Newest Added)</option>
          <option value="year">Year</option>
          <option value="category">Category</option>
        </select>
      </div>

      <p className="text-sm text-gray-500 mb-3">
        Showing {sortedQuestions.length} of {questions.length} question(s)
      </p>

      {sortedQuestions.length === 0 && (
        <p className="text-gray-500">No questions match the current filters.</p>
      )}

      <div className="space-y-3">
        {sortedQuestions.map((q) => (
          <div key={q.id} className="border rounded-lg overflow-hidden">
            <div
              onClick={() => toggleExpand(q.id)}
              className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-start"
            >
              <div>
                <p className="font-medium">{q.text}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {q.category.name} · {q.year ? q.year.year : "Reviewer"}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(q.id);
                }}
                className="text-red-500 hover:text-red-700 text-sm ml-4 shrink-0"
              >
                Delete
              </button>
            </div>

            {expandedId === q.id && (
              <div className="border-t bg-gray-50 p-4 space-y-2">
                {q.choices.map((c) => (
                  <div
                    key={c.id}
                    className={`px-3 py-2 rounded ${
                      c.isCorrect
                        ? "bg-green-100 border border-green-400 font-medium"
                        : "bg-white border"
                    }`}
                  >
                    {c.isCorrect && "✓ "}
                    {c.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}