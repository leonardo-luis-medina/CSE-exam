"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Exam = {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  createdAt: string;
};

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState<number | null>(null);

  const loadExams = async () => {
    setLoading(true);
    const res = await fetch("/api/exams");
    setExams(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this exam card? This won't delete the underlying questions.")) return;
    await fetch(`/api/exams/${id}`, { method: "DELETE" });
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  const persistOrder = async (newList: Exam[]) => {
    await fetch("/api/exams/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: newList.map((e) => e.id) }),
    });
  };

  const handleDrop = (targetId: number) => {
    if (dragId === null || dragId === targetId) return;
    const list = [...exams];
    const fromIndex = list.findIndex((e) => e.id === dragId);
    const toIndex = list.findIndex((e) => e.id === targetId);
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    setExams(list);
    persistOrder(list);
    setDragId(null);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Manage Exams</h1>
      <p className="text-gray-500 text-sm mb-6">Drag cards to reorder how they appear on the homepage.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {exams.map((exam) => (
          <div
            key={exam.id}
            draggable
            onDragStart={() => setDragId(exam.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(exam.id)}
            className={`border rounded-xl overflow-hidden bg-white cursor-move transition-opacity ${
              dragId === exam.id ? "opacity-40" : ""
            }`}
          >
            <div className="h-32 bg-gray-100 flex items-center justify-center">
              {exam.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={exam.imageUrl} alt={exam.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-300 text-sm">No image</span>
              )}
            </div>
            <div className="p-4">
              <p className="font-semibold text-gray-900 mb-1">{exam.name}</p>
              <p className="text-sm text-gray-500 line-clamp-2 mb-2">{exam.description}</p>
              <p className="text-xs text-gray-400 mb-3">Created: {formatDate(exam.createdAt)}</p>

              <div className="flex gap-2">
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
                <button
                  onClick={() => handleDelete(exam.id)}
                  className="flex-1 text-center text-red-500 text-xs px-3 py-2 rounded border border-red-200 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        <Link
          href="/admin/exams/new"
          className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-400 transition-colors min-h-[220px]"
        >
          <span className="text-4xl mb-2">+</span>
          <span className="text-sm font-medium">Create Exam</span>
        </Link>
      </div>
    </div>
  );
}