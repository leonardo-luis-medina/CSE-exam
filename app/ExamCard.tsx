"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Exam = {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
};

type Preset = { id: number; name: string };

type Props = {
  exam: Exam;
  isAdmin: boolean;
  onDelete?: (id: number) => void;
};

export default function ExamCard({ exam, isAdmin, onDelete }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [loadingPresets, setLoadingPresets] = useState(true);

  useEffect(() => {
    fetch(`/api/exams/${exam.id}/presets`)
      .then((r) => r.json())
      .then((data: Preset[]) => {
        setPresets(data);
        if (data.length > 0) setSelectedPresetId(data[0].id.toString());
        setLoadingPresets(false);
      });
  }, [exam.id]);

  const handleStart = () => {
    if (!selectedPresetId) return;
    router.push(`/exam/quiz?presetId=${selectedPresetId}`);
  };

  return (
    <div className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col">
      <div className="h-36 bg-gray-100 flex items-center justify-center shrink-0">
        {exam.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={exam.imageUrl} alt={exam.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-300 text-sm">No image</span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="font-semibold text-gray-900 mb-1">{exam.name}</p>
        <p
          className={`text-sm text-gray-500 whitespace-pre-wrap mb-1 ${
            expanded ? "" : "line-clamp-4"
          }`}
        >
          {exam.description}
        </p>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-blue-600 hover:underline mb-3 self-start"
        >
          {expanded ? "See less" : "See more..."}
        </button>

        <div className="mt-auto space-y-2">
          {!loadingPresets && presets.length > 0 && (
            <div className="flex gap-2">
              <select
                value={selectedPresetId}
                onChange={(e) => setSelectedPresetId(e.target.value)}
                className="flex-1 border rounded text-sm px-2 py-2"
              >
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleStart}
                className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
              >
                Start
              </button>
            </div>
          )}

          {!loadingPresets && presets.length === 0 && (
            <p className="text-xs text-gray-400">
              {isAdmin ? "No presets yet — add one in Edit." : "No presets available yet."}
            </p>
          )}

          <Link
            href={`/exam/setup?examId=${exam.id}`}
            className="block text-center bg-gray-100 text-gray-700 text-sm px-3 py-2 rounded hover:bg-gray-200"
          >
            Custom
          </Link>

          {isAdmin && (
            <div className="flex gap-2 pt-1">
              <Link
                href={`/admin/exams/${exam.id}/edit`}
                className="flex-1 text-center text-blue-600 text-xs px-3 py-2 rounded border border-blue-200 hover:bg-blue-50"
              >
                Edit
              </Link>
              <Link
                href={`/admin/exams/${exam.id}/presets`}
                className="flex-1 text-center text-purple-600 text-xs px-3 py-2 rounded border border-purple-200 hover:bg-purple-50"
              >
                Presets
              </Link>
              {onDelete && (
                <button
                  onClick={() => onDelete(exam.id)}
                  className="flex-1 text-center text-red-500 text-xs px-3 py-2 rounded border border-red-200 hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}