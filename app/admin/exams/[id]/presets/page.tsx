"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Preset = { id: number; name: string; createdAt: string; hidden: boolean };
type Exam = { id: number; name: string };

export default function ExamPresetsPage() {
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const [examData, presetData] = await Promise.all([
      fetch(`/api/exams/${examId}`).then((r) => r.json()),
      fetch(`/api/exams/${examId}/presets?all=true`).then((r) => r.json()),
    ]);
    setExam(examData);
    setPresets(presetData);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [examId]);

  const handleDelete = async (presetId: number) => {
    if (!confirm("Delete this preset?")) return;
    await fetch(`/api/exams/${examId}/presets/${presetId}`, { method: "DELETE" });
    load();
  };

  const toggleHidden = async (preset: Preset) => {
    await fetch(`/api/exams/${examId}/presets/${preset.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hidden: !preset.hidden }),
    });
    setPresets((prev) =>
      prev.map((p) => (p.id === preset.id ? { ...p, hidden: !p.hidden } : p))
    );
  };

  const persistOrder = async (newList: Preset[]) => {
    await fetch(`/api/exams/${examId}/presets/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: newList.map((p) => p.id) }),
    });
  };

  const handleDrop = (targetId: number) => {
    if (dragId === null || dragId === targetId) return;
    const list = [...presets];
    const fromIndex = list.findIndex((p) => p.id === dragId);
    const toIndex = list.findIndex((p) => p.id === targetId);
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    setPresets(list);
    persistOrder(list);
    setDragId(null);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Presets for &quot;{exam?.name}&quot;</h1>
      <p className="text-gray-500 text-sm mb-6">
        Drag to reorder. Hidden presets won&apos;t show in the visitor dropdown, but their
        categories remain pickable under Custom.
      </p>

      <Link
        href={`/admin/exams/${examId}/presets/new`}
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-6"
      >
        + Add Preset
      </Link>

      {presets.length === 0 && (
        <p className="text-gray-500">No presets yet. Add one so visitors have a quick-start option.</p>
      )}

      <div className="space-y-3">
        {presets.map((preset) => (
          <div
            key={preset.id}
            draggable
            onDragStart={() => setDragId(preset.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(preset.id)}
            className={`border rounded-lg p-4 flex justify-between items-center cursor-move transition-opacity ${
              dragId === preset.id ? "opacity-40" : ""
            } ${preset.hidden ? "bg-gray-50" : ""}`}
          >
            <div>
              <p className={`font-medium ${preset.hidden ? "text-gray-400" : ""}`}>
                {preset.name} {preset.hidden && <span className="text-xs">(hidden)</span>}
              </p>
              <p className="text-xs text-gray-400">Created: {formatDate(preset.createdAt)}</p>
            </div>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => toggleHidden(preset)}
                className="text-xs px-2 py-1 rounded border text-gray-600 hover:bg-gray-100"
              >
                {preset.hidden ? "Show" : "Hide"}
              </button>
              <Link
                href={`/admin/exams/${examId}/presets/${preset.id}/edit`}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(preset.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Link href="/admin" className="block mt-8 text-sm text-gray-500 hover:underline">
        ← Back to dashboard
      </Link>
    </div>
  );
}