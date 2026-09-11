"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Preset = { id: number; name: string; createdAt: string };
type Exam = { id: number; name: string };

export default function ExamPresetsPage() {
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [examData, presetData] = await Promise.all([
      fetch(`/api/exams/${examId}`).then((r) => r.json()),
      fetch(`/api/exams/${examId}/presets`).then((r) => r.json()),
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

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold">Presets for &quot;{exam?.name}&quot;</h1>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        Presets are the named quick-start options visitors see in the dropdown on this
        exam&apos;s card.
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
          <div key={preset.id} className="border rounded-lg p-4 flex justify-between items-center">
            <span className="font-medium">{preset.name}</span>
            <div className="flex gap-3">
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

      <Link href="/admin/exams" className="block mt-8 text-sm text-gray-500 hover:underline">
        ← Back to all exams
      </Link>
    </div>
  );
}