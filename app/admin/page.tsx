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

type Stats = { questions: number; categories: number; exams: number };

export default function AdminDashboard() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [stats, setStats] = useState<Stats>({ questions: 0, categories: 0, exams: 0 });
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [examsData, questionsData, categoriesData] = await Promise.all([
      fetch("/api/exams").then((r) => r.json()),
      fetch("/api/questions").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]);
    setExams(examsData);
    setStats({
      questions: Array.isArray(questionsData) ? questionsData.length : 0,
      categories: Array.isArray(categoriesData) ? categoriesData.length : 0,
      exams: Array.isArray(examsData) ? examsData.length : 0,
    });
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this exam card? This won't delete the underlying questions.")) return;
    await fetch(`/api/exams/${id}`, { method: "DELETE" });
    setExams((prev) => prev.filter((e) => e.id !== id));
    setStats((s) => ({ ...s, exams: s.exams - 1 }));
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

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.exams}</p>
          <p className="text-sm text-gray-500">Exams</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.questions}</p>
          <p className="text-sm text-gray-500">Questions</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.categories}</p>
          <p className="text-sm text-gray-500">Categories</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Your Exams</h2>
      </div>
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