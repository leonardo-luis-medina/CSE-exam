"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ImageUpload from "../../ImageUpload";

type Category = { id: number; name: string };
type Year = { id: number; year: number };
type ExamConfig = { categories: { id: number; count: number }[]; years: string[] };

const DEFAULT_COUNT = "25";

export default function EditExamPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [counts, setCounts] = useState<Record<number, string>>({});
  const [selectedYearTags, setSelectedYearTags] = useState<string[]>([]);
  const [yearExpanded, setYearExpanded] = useState(false);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [cats, yrs, exam] = await Promise.all([
        fetch("/api/categories").then((r) => r.json()),
        fetch("/api/years").then((r) => r.json()),
        fetch(`/api/exams/${id}`).then((r) => r.json()),
      ]);
      setCategories(cats);
      setYears(yrs);

      setName(exam.name);
      setDescription(exam.description);
      setImageUrl(exam.imageUrl || "");

      const config: ExamConfig = JSON.parse(exam.config);
      const sel: Record<number, boolean> = {};
      const cnt: Record<number, string> = {};
      config.categories.forEach((c) => {
        sel[c.id] = true;
        cnt[c.id] = c.count.toString();
      });
      setSelected(sel);
      setCounts(cnt);
      setSelectedYearTags(config.years || []);

      setLoading(false);
    };
    load();
  }, [id]);

  const toggleCategory = (catId: number) => {
    setSelected((prev) => {
      const next = { ...prev, [catId]: !prev[catId] };
      if (next[catId] && counts[catId] === undefined) {
        setCounts((c) => ({ ...c, [catId]: DEFAULT_COUNT }));
      }
      return next;
    });
  };

  const updateCount = (catId: number, value: string) => {
    setCounts((prev) => ({ ...prev, [catId]: value }));
  };

  const toggleYearTag = (tag: string) => {
    setSelectedYearTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    setError("");

    if (!name.trim() || !description.trim()) {
      setError("Please provide a name and description.");
      return;
    }

    const chosenIds = Object.keys(selected).filter((cid) => selected[Number(cid)]);
    if (chosenIds.length === 0) {
      setError("Please select at least one category.");
      return;
    }

    const config = {
      categories: chosenIds.map((cid) => ({
        id: Number(cid),
        count: parseInt(counts[Number(cid)] || DEFAULT_COUNT) || 0,
      })),
      years: selectedYearTags,
    };

    setSaving(true);
    const res = await fetch(`/api/exams/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, imageUrl, config }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      return;
    }

    router.push("/admin/exams");
  };

  if (loading) return <div className="p-8 text-center">Loading exam...</div>;

  const yearSummary =
    selectedYearTags.length === 0
      ? "All Years"
      : selectedYearTags.map((t) => (t === "reviewer" ? "Reviewer" : t)).join(", ");

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Edit Exam</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="space-y-4 mb-8">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Exam Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2 h-24"
          />
        </div>

          

        <ImageUpload value={imageUrl} onChange={setImageUrl} />



      </div>

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
            {years.map((y) => (
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
          </div>
        )}
      </div>

      <p className="text-sm font-medium text-gray-700 mb-2">Select Categories</p>
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
          onClick={() => router.push("/admin/exams")}
          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}