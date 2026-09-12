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

  const PresetControls = () => (
    <>
      {!loadingPresets && presets.length > 0 && (
        <div className="flex gap-2">
          <select
            value={selectedPresetId}
            onChange={(e) => setSelectedPresetId(e.target.value)}
            className="flex-1 border border-blue-200 rounded-lg text-sm px-2 py-2 bg-white"
          >
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button onClick={handleStart} className="btn-primary text-sm px-4 py-2 rounded-lg font-medium">
            Start
          </button>
        </div>
      )}

      {!loadingPresets && presets.length === 0 && (
        <p className="text-xs text-gray-500">
          {isAdmin ? "No presets yet — add one below." : "No presets available yet."}
        </p>
      )}
    </>
  );

  return (
    <>
      <div className="thumb-card rounded-xl overflow-hidden flex flex-col h-full">
        <div
          onClick={() => setModalOpen(true)}
          className="cursor-pointer flex-1"
        >
          <div className="h-36 bg-blue-100 flex items-center justify-center">
            {exam.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={exam.imageUrl} alt={exam.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-blue-300 text-sm">No image</span>
            )}
          </div>
          <div className="px-4 pt-4">
            <p className="font-semibold text-gray-900 mb-1">{exam.name}</p>
            <p className="text-sm text-gray-600 line-clamp-[8] whitespace-pre-wrap">
              {exam.description}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(true);
              }}
              className="text-xs text-blue-700 hover:underline mt-1 mb-2"
            >
              See more...
            </button>
          </div>
        </div>

        <div className="p-4 pt-1 space-y-2">
          <PresetControls />

          <Link
            href={`/exam/setup?examId=${exam.id}`}
            className="block text-center bg-white text-gray-700 text-sm px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors font-medium"
          >
            Custom
          </Link>

          {isAdmin && (
            <div className="flex gap-2 pt-1">
              <Link
                href={`/admin/exams/${exam.id}/edit`}
                className="flex-1 text-center bg-white text-indigo-700 text-xs px-3 py-2 rounded-lg border border-indigo-200 hover:bg-indigo-50 font-medium"
              >
                Edit
              </Link>
              <Link
                href={`/admin/exams/${exam.id}/presets`}
                className="flex-1 text-center bg-white text-purple-700 text-xs px-3 py-2 rounded-lg border border-purple-200 hover:bg-purple-50 font-medium"
              >
                Presets
              </Link>
              {onDelete && (
                <button
                  onClick={() => onDelete(exam.id)}
                  className="flex-1 text-center bg-white text-red-600 text-xs px-3 py-2 rounded-lg border border-red-200 hover:bg-red-50 font-medium"
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="thumb-card rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto relative"
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 shadow z-10"
            >
              ✕
            </button>

            {exam.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={exam.imageUrl} alt={exam.name} className="w-full h-56 object-cover" />
            )}

            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{exam.name}</h2>
              <p className="text-gray-700 whitespace-pre-wrap mb-6">{exam.description}</p>

              <div className="space-y-2">
                <PresetControls />

                <Link
                  href={`/exam/setup?examId=${exam.id}`}
                  className="block text-center bg-white text-gray-700 text-sm px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 font-medium"
                >
                  Custom
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}