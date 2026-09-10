"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type Category = { id: number; name: string };
type Year = { id: number; year: number };

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [yearId, setYearId] = useState("");
  const [text, setText] = useState("");
  const [choices, setChoices] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [catRes, yearRes, qRes] = await Promise.all([
        fetch("/api/categories").then((r) => r.json()),
        fetch("/api/years").then((r) => r.json()),
        fetch(`/api/questions/${id}`).then((r) => r.json()),
      ]);
      setCategories(catRes);
      setYears(yearRes);

      setText(qRes.text);
      setCategoryId(qRes.categoryId.toString());
      setYearId(qRes.yearId ? qRes.yearId.toString() : "");
      setChoices(
        qRes.choices.map((c: { text: string; isCorrect: boolean }) => ({
          text: c.text,
          isCorrect: c.isCorrect,
        }))
      );
      setLoading(false);
    };
    load();
  }, [id]);

  const updateChoiceText = (index: number, value: string) => {
    const updated = [...choices];
    updated[index].text = value;
    setChoices(updated);
  };

  const setCorrect = (index: number) => {
    const updated = choices.map((c, i) => ({ ...c, isCorrect: i === index }));
    setChoices(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!categoryId || !text.trim()) {
      setError("Please fill in category and question text.");
      return;
    }
    if (choices.some((c) => !c.text.trim())) {
      setError("All 4 choices must have text.");
      return;
    }
    if (!choices.some((c) => c.isCorrect)) {
      setError("Please select the correct answer.");
      return;
    }

    const res = await fetch(`/api/questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, categoryId, yearId, choices }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/admin/questions"), 1000);
  };

  if (loading) return <div className="p-8">Loading question...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Question</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">Question updated! Redirecting...</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={yearId}
            onChange={(e) => setYearId(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          >
            <option value="">Reviewer</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>{y.year}</option>
            ))}
          </select>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Question text"
          className="border rounded px-3 py-2 w-full h-40 text-base leading-relaxed"
        />

        <div className="space-y-2">
          {choices.map((choice, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct"
                checked={choice.isCorrect}
                onChange={() => setCorrect(i)}
              />
              <input
                type="text"
                value={choice.text}
                onChange={(e) => updateChoiceText(i, e.target.value)}
                placeholder={`Choice ${i + 1}`}
                className="border rounded px-3 py-2 flex-1"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/questions")}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}