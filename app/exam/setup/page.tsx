"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PublicHeader from "../../PublicHeader";

type Category = { id: number; name: string };
type Year = { id: number; year: number };
type ExamConfig = { categories: { id: number; count: number }[]; years: string[] };

const DEFAULT_COUNT = "25";

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId");

  const [categories, setCategories] = useState<Category[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [counts, setCounts] = useState<Record<number, string>>({});
  const [selectedYearTags, setSelectedYearTags] = useState<string[]>([]);
  const [yearExpanded, setYearExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  // If arriving from a specific exam's "Custom" button, only these are selectable
  const [allowedCategoryIds, setAllowedCategoryIds] = useState<number[] | null>(null);
  const [allowedYears, setAllowedYears] = useState<string[] | null>(null); // null = no restriction (All Years)

  useEffect(() => {
    const load = async () => {
      const [cats, yrs] = await Promise.all([
        fetch("/api/categories").then((r) => r.json()),
        fetch("/api/years").then((r) => r.json()),
      ]);
      setCategories(cats);
      setYears(yrs);

      if (examId) {
        const exam = await fetch(`/api/exams/${examId}`).then((r) => r.json());
        const config: ExamConfig = JSON.parse(exam.config);
        const catIds = config.categories.map((c) => c.id);
        setAllowedCategoryIds(catIds);
        setAllowedYears(config.years && config.years.length > 0 ? config.years : null);
      }

      setLoading(false);
    };
    load();
  }, [examId]);

  const visibleCategories = allowedCategoryIds
    ? categories.filter((c) => allowedCategoryIds.includes(c.id))
    : categories;

  const visibleYears = allowedYears
    ? years.filter((y) => allowedYears.includes(y.year.toString()))
    : years;

  const reviewerAllowed = allowedYears ? allowedYears.includes("reviewer") : true;

  const toggleCategory = (id: number) => {
    setSelected((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id] && counts[id] === undefined) {
        setCounts((c) => ({ ...c, [id]: DEFAULT_COUNT }));
      }
      return next;
    });
  };

  const updateCount = (id: number, value: string) => {
    setCounts((prev) => ({ ...prev, [id]: value }));
  };

  const selectAll = () => {
    const all: Record<number, boolean> = {};
    const newCounts: Record<number, string> = { ...counts };
    visibleCategories.forEach((c) => {
      all[c.id] = true;
      if (newCounts[c.id] === undefined) newCounts[c.id] = DEFAULT_COUNT;
    });
    setSelected(all);
    setCounts(newCounts);
  };

  const clearAll = () => {
    setSelected({});
  };

  const toggleYearTag = (tag: string) => {
    setSelectedYearTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleStart = () => {
    const chosenIds = Object.keys(selected).filter((id) => selected[Number(id)]);

    if (chosenIds.length === 0) {
      alert("Please select at least one category.");
      return;
    }

    const categoriesParam = chosenIds
      .map((id) => `${id}:${counts[Number(id)]?.trim() || "0"}`)
      .join(",");

    const params = new URLSearchParams();
    params.set("categories", categoriesParam);

    if (selectedYearTags.length > 0) {
      params.set("years", selectedYearTags.join(","));
    }

    router.push(`/exam/quiz?${params.toString()}`);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  const yearSummary =
    selectedYearTags.length === 0
      ? "All Years"
      : selectedYearTags.map((t) => (t === "reviewer" ? "Reviewer" : t)).join(", ");

  return (
    <div>
      <PublicHeader backHref="/" backLabel="Back to Exam Selection" />
      <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">Set Up Your Exam</h1>
      <p className="text-gray-500 mb-6">
        {examId
          ? "Choose from this reviewer's available categories. Each includes 25 questions by default — edit the number if you want more or fewer."
          : "Choose your categories below. Each includes 25 questions by default — edit the number if you want more or fewer."}
      </p>

      <div className="mb-6 border rounded-lg">
        <button
          onClick={() => setYearExpanded((v) => !v)}
          className="w-full flex justify-between items-center px-4 py-3 text-sm"
        >
          <span>
            <span className="font-medium text-gray-700">Year: </span>
            <span className="text-gray-500">{yearSummary}</span>
          </span>
          <span className="text-blue-600">{yearExpanded ? "Hide options ▲" : "Change ▼"}</span>
        </button>

        {yearExpanded && (
          <div className="px-4 pb-4 flex flex-wrap gap-2 border-t pt-3">
            <button
              onClick={() => setSelectedYearTags([])}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                selectedYearTags.length === 0
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              All Years
            </button>
            {visibleYears.map((y) => (
              <button
                key={y.id}
                onClick={() => toggleYearTag(y.year.toString())}
                className={`px-3 py-1.5 rounded-full text-sm border ${
                  selectedYearTags.includes(y.year.toString())
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {y.year}
              </button>
            ))}
            {reviewerAllowed && (
              <button
                onClick={() => toggleYearTag("reviewer")}
                className={`px-3 py-1.5 rounded-full text-sm border ${
                  selectedYearTags.includes("reviewer")
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Reviewer Only
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-medium text-gray-700">Select Categories</p>
        <div className="flex gap-3 text-sm">
          <button onClick={selectAll} className="text-blue-600 hover:underline">
            Select All
          </button>
          <button onClick={clearAll} className="text-red-500 hover:underline">
            Clear All
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        {visibleCategories.map((cat) => (
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
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  value={counts[cat.id] ?? DEFAULT_COUNT}
                  onChange={(e) => updateCount(cat.id, e.target.value)}
                  className="w-20 border rounded px-2 py-1 text-sm"
                />
                <span className="text-xs text-gray-400">questions</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {visibleCategories.length === 0 && (
        <p className="text-gray-500">No categories available.</p>
      )}

      <button
        onClick={handleStart}
        className="btn-primary px-6 py-3 rounded-lg font-medium w-full"
      >
        Start Exam
      </button>
      </div>
    </div>
  );
}

export default function ExamSetupPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <SetupContent />
    </Suspense>
  );
}