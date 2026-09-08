"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Choice = { id: number; text: string; isCorrect: boolean };
type Question = {
  id: number;
  text: string;
  category: { name: string };
  year: { year: number } | null;
  choices: Choice[];
};

export default function QuestionListPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadQuestions = async () => {
    setLoading(true);
    const res = await fetch("/api/questions");
    setQuestions(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this question? This cannot be undone.")) return;
    await fetch(`/api/questions/${id}`, { method: "DELETE" });
    loadQuestions();
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Questions ({questions.length})</h1>
        <Link
          href="/admin/questions/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Question
        </Link>
      </div>

      {questions.length === 0 && (
        <p className="text-gray-500">No questions yet.</p>
      )}

      <div className="space-y-3">
        {questions.map((q) => (
          <div key={q.id} className="border rounded-lg overflow-hidden">
            <div
              onClick={() => toggleExpand(q.id)}
              className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-start"
            >
              <div>
                <p className="font-medium">{q.text}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {q.category.name} · {q.year ? q.year.year : "Reviewer"}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(q.id);
                }}
                className="text-red-500 hover:text-red-700 text-sm ml-4 shrink-0"
              >
                Delete
              </button>
            </div>

            {expandedId === q.id && (
              <div className="border-t bg-gray-50 p-4 space-y-2">
                {q.choices.map((c) => (
                  <div
                    key={c.id}
                    className={`px-3 py-2 rounded ${
                      c.isCorrect
                        ? "bg-green-100 border border-green-400 font-medium"
                        : "bg-white border"
                    }`}
                  >
                    {c.isCorrect && "✓ "}
                    {c.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}