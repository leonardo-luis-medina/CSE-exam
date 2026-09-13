"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Choice = { id: number; text: string; isCorrect: boolean };
type Question = {
  id: number;
  text: string;
  category: { name: string; group: string | null } | null;
  year: { year: number } | null;
  choices: Choice[];
  createdAt: string;
};

type SortMode = "default" | "year" | "category" | "group";

export default function QuestionListPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [search, setSearch] = useState("");

  const [activeYearTags, setActiveYearTags] = useState<string[]>([]);
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
    questions.forEach((q) => set.add(q.category ? q.category.name : "Uncategorized"));
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
    const categoryLabel = q.category ? q.category.name : "Uncategorized";
    const yearMatch =
      activeYearTags.length === 0 || activeYearTags.includes(yearLabel);
    const categoryMatch =
      activeCategoryTags.length === 0 || activeCategoryTags.includes(categoryLabel);
    const searchMatch =
      search.trim() === "" || q.text.toLowerCase().includes(search.toLowerCase());
    return yearMatch && categoryMatch && searchMatch;
  });

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    if (sortMode === "year") {
      const yearA = a.year?.year ?? -1;
      const yearB = b.year?.year ?? -1;
      return yearB - yearA;
    }
    if (sortMode === "category") {
      const catA = a.category?.name || "Uncategorized";
      const catB = b.category?.name || "Uncategorized";
      return catA.localeCompare(catB);
    }
    if (sortMode === "group") {
      const groupA = a.category?.group || "Uncategorized";
      const groupB = b.category?.group || "Uncategorized";
      return groupA.localeCompare(groupB);
    }
    return 0;
  });

  const hasActiveTags = activeYearTags.length > 0 || activeCategoryTags.length > 0;

  if (loading) return <div className="p-8 text-white text-center">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="glass-card rounded-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">All Questions ({questions.length})</h1>
          <Link
            href="/admin/questions/new"
            className="btn-primary px-4 py-2 rounded font-medium"
          >
            + Add Question
          </Link>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search question text..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm mb-5 bg-white text-gray-900"
        />

        <div className="mb-4 space-y-3">
          <div>
            <p className="text-sm text-gray-600 mb-1">Filter by Year:</p>
            <div className="flex flex-wrap gap-2">
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => toggleYearTag(year)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    activeYearTags.includes(year) ? "pill-select-active" : "pill-select"
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
                  className={`px-3 py-1 rounded-full text-sm ${
                    activeCategoryTags.includes(cat) ? "pill-select-active" : "pill-select"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

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

        <div className="flex items-center gap-2 mb-6">
          <label htmlFor="sort" className="text-sm text-gray-600">
            Sort by:
          </label>
          <select
            id="sort"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white text-gray-900"
          >
            <option value="default">Default (Newest Added)</option>
            <option value="year">Year</option>
            <option value="category">Category</option>
            <option value="group">Category Group</option>
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
            <div key={q.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div
                onClick={() => toggleExpand(q.id)}
                className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-start"
              >
                <div>
                  <p className="font-medium text-gray-900">{q.text}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {q.category ? q.category.name : "Uncategorized"}
                    {q.category?.group && ` (${q.category.group})`}
                    {" · "}
                    {q.year ? q.year.year : "Reviewer"}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <Link
                    href={`/admin/questions/${q.id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(q.id);
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {expandedId === q.id && (
                <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-2">
                  {q.choices.map((c) => (
                    <div
                      key={c.id}
                      className={`px-3 py-2 rounded ${
                        c.isCorrect
                          ? "bg-green-100 border border-green-400 font-medium text-gray-900"
                          : "bg-white border border-gray-200 text-gray-800"
                      }`}
                    >
                      {c.isCorrect && "✓ "}
                      {c.text}
                    </div>
                  ))}
                  <p className="text-xs text-gray-400 pt-2">
                    Created {new Date(q.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}