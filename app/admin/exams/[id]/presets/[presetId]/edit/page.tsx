"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type Category = { id: number; name: string };
type Year = { id: number; year: number };
type ExamConfig = { categories: { id: number; count: number }[]; years: string[] };

const DEFAULT_COUNT = "25";

export default function EditPresetPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;
  const presetId = params.presetId as string;

  const [presetName, setPresetName] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [counts, setCounts] = useState<Record<number, string>>({});
  const [selectedYearTags, setSelectedYearTags] = useState<string[]>([]);

  const [allowedCategoryIds, setAllowedCategoryIds] = useState<number[]>([]);
  const [allowedYears, setAllowedYears] = useState<string[] | null>(null);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [cats, yrs, exam, preset] = await Promise.all([
        fetch("/api/categories").then((r) => r.json()),
        fetch("/api/years").then((r) => r.json()),
        fetch(`/api/exams/${examId}`).then((r) => r.json()),
        fetch(`/api/exams/${examId}/presets/${presetId}`).then((r) => r.json()),
      ]);
      setCategories(cats);
      setYears(yrs);

      const examConfig: ExamConfig = JSON.parse(exam.config);
      setAllowedCategoryIds(examConfig.categories.map((c) => c.id));
      setAllowedYears(examConfig.years && examConfig.years.length > 0 ? examConfig.years : null);

      setPresetName(preset.name);
      const presetConfig: ExamConfig = JSON.parse(preset.config);
      const sel: Record<number, boolean> = {};
      const cnt: Record<number, string> = {};
      presetConfig.categories.forEach((c) => {
        sel[c.id] = true;
        cnt[c.id] = c.count.toString();
      });
      setSelected(sel);
      setCounts(cnt);
      setSelectedYearTags(presetConfig.years || []);

      setLoading(false);
    };
    load();
  }, [examId, presetId]);

  const visibleCategories = categories.filter((c) => allowedCategoryIds.includes(c.id));
  const visibleYears = allowedYears ? years.filter((y) => allowedYears.includes(y.year.toString())) : years;
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

  const toggleYearTag = (tag: string) => {
    setSelectedYearTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    setError("");

    if (!presetName.trim()) {
      setError("Please name this preset.");
      return;
    }

    const chosenIds = Object.keys(selected).filter((id) => selected[Number(id)]);
    if (chosenIds.length === 0) {
      setError("Please select at least one category.");
      return;
    }

    const config = {
      categories: chosenIds.map((id) => ({
        id: Number(id),
        count: parseInt(counts[Number(id)] || DEFAULT_COUNT) || 0,
      })),
      years: selectedYearTags,
    };

    setSaving(true);
    const res = await fetch(`/api/exams/${examId}/presets/${presetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: presetName, config }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      return;
    }

    router.push(`/admin/exams/${examId}/presets`);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Edit Preset</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 block mb-1">Preset Name</label>
        <input
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">Years</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedYearTags([])}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              selectedYearTags.length === 0
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300"
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
                  : "bg-white text-gray-700 border-gray-300"
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
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              Reviewer Only
            </button>
          )}
        </div>
      </div>

      <p className="text-sm font-medium text-gray-700 mb-2">Categories</p>
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

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium flex-1 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={() => router.push(`/admin/exams/${examId}/presets`)}
          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}