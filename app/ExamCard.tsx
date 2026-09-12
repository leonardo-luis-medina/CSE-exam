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
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [loadingPresets, setLoadingPresets] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

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
    <>
      <div className="glass-card rounded-xl overflow-hidden flex flex-col">
        <div
          onClick={() => setModalOpen(true)}
          className="cursor-pointer"
        >
          <div className="h-36 bg-indigo-50 flex items-center justify-center">
            {exam.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={exam.imageUrl} alt={exam.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-indigo-200 text-sm">No image</span>
            )}
          </div>
          <div className="px-4 pt-4">
            <p className="font-semibold text-gray-900 mb-1">{exam.name}</p>
            <p className="text-sm text-gray-500 line-clamp-3 whitespace-pre-wrap">
              {exam.description}
            </p>
          </div>
        </div>

        <div className="p-4 pt-3 mt-auto space-y-2">
          {!loadingPresets && presets.length > 0 && (
            <div className="flex gap-2">
              <select
                value={selectedPresetId}
                onChange={(e) => setSelectedPresetId(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg text-sm px-2 py-2 bg-white/80"
              >
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button onClick={handleStart} className="btn-primary text-sm px-4 py-2 rounded-lg">
                Start
              </button>
            </div>
          )}

          {!loadingPresets && presets.length === 0 && (
            <p className="text-xs text-gray-400">
              {isAdmin ? "No presets yet — add one below." : "No presets available yet."}
            </p>
          )}

          <Link
            href={`/exam/setup?examId=${exam.id}`}
            className="block text-center bg-white/70 text-gray-700 text-sm px-3 py-2 rounded-lg hover:bg-white transition-colors"
          >
            Custom
          </Link>

          {isAdmin && (
            <div className="flex gap-2 pt-1">
              <Link
                href={`/admin/exams/${exam.id}/edit`}
                className="flex-1 text-center text-indigo-600 text-xs px-3 py-2 rounded-lg border border-indigo-200 hover:bg-indigo-50"
              >
                Edit
              </Link>
              <Link
                href={`/admin/exams/${exam.id}/presets`}
                className="flex-1 text-center text-purple-600 text-xs px-3 py-2 rounded-lg border border-purple-200 hover:bg-purple-50"
              >
                Presets
              </Link>
              {onDelete && (
                <button
                  onClick={() => onDelete(exam.id)}
                  className="flex-1 text-center text-red-500 text-xs px-3 py-2 rounded-lg border border-red-200 hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-card rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto relative bg-white/95"
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-500 hover:text-gray-800 shadow"
            >
              ✕
            </button>

            {exam.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={exam.imageUrl} alt={exam.name} className="w-full h-56 object-cover" />
            )}

            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{exam.name}</h2>
              <p className="text-gray-600 whitespace-pre-wrap mb-6">{exam.description}</p>

              {!loadingPresets && presets.length > 0 && (
                <div className="flex gap-2 mb-3">
                  <select
                    value={selectedPresetId}
                    onChange={(e) => setSelectedPresetId(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg text-sm px-2 py-2"
                  >
                    {presets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <button onClick={handleStart} className="btn-primary text-sm px-4 py-2 rounded-lg">
                    Start
                  </button>
                </div>
              )}

              <Link
                href={`/exam/setup?examId=${exam.id}`}
                className="block text-center bg-gray-100 text-gray-700 text-sm px-3 py-2 rounded-lg hover:bg-gray-200"
              >
                Custom
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}