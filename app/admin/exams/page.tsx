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

export default function ExamListPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

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
    loadExams();
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Exams ({exams.length})</h1>
        <Link
          href="/admin/exams/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Create Exam
        </Link>
      </div>

      {exams.length === 0 && (
        <p className="text-gray-500">No exams created yet.</p>
      )}

      <div className="space-y-3">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="border rounded-lg p-4 flex items-center gap-4"
          >
            {exam.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={exam.imageUrl}
                alt={exam.name}
                className="w-16 h-16 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                No image
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium">{exam.name}</p>
              <p className="text-sm text-gray-500 line-clamp-1">{exam.description}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href={`/admin/exams/${exam.id}/edit`}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(exam.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}