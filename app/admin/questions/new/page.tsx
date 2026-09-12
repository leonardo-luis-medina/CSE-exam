"use client";

import { useEffect, useRef, useState } from "react";
import ImageUpload from "../ImageUpload";
import CategorySelect from "../../CategorySelect";

type Year = { id: number; year: number };

export default function NewQuestionPage() {
  const [years, setYears] = useState<Year[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [yearId, setYearId] = useState("");
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [choices, setChoices] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/years").then((r) => r.json()).then(setYears);
  }, []);

  const updateChoiceText = (index: number, value: string) => {
    const updated = [...choices];
    updated[index].text = value;
    setChoices(updated);
  };

  const setCorrect = (index: number) => {
    const updated = choices.map((c, i) => ({ ...c, isCorrect: i === index }));
    setChoices(updated);
  };

  const resetForm = () => {
    setText("");
    setImageUrl("");
    setChoices([
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ]);
  };

  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      const el = textareaRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const before = text.slice(0, start);
      const selected = text.slice(start, end);
      const after = text.slice(end);
      const newText = `${before}**${selected || "bold text"}**${after}`;
      setText(newText);
      setTimeout(() => {
        el.focus();
        el.selectionStart = start + 2;
        el.selectionEnd = start + 2 + (selected || "bold text").length;
      }, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!text.trim()) {
      setError("Please enter question text.");
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

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, categoryId, yearId, choices, imageUrl }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      return;
    }

    setSuccess(true);
    resetForm();
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="glass-card rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Add Question</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">Question saved!</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <CategorySelect value={categoryId} onChange={setCategoryId} />

            <select
              value={yearId}
              onChange={(e) => setYearId(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 flex-1 bg-white text-gray-900"
            >
              <option value="">Reviewer</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>{y.year}</option>
              ))}
            </select>
          </div>

          <ImageUpload value={imageUrl} onChange={setImageUrl} />

          <div>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleTextKeyDown}
              placeholder="Question text"
              className="border border-gray-300 rounded px-3 py-2 w-full h-40 text-base leading-relaxed bg-white text-gray-900"
            />
            <p className="text-xs text-gray-400 mt-1">
              Tip: select text and press Ctrl+B (Cmd+B on Mac) to make it bold.
            </p>
          </div>

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
                  className="border border-gray-300 rounded px-3 py-2 flex-1 bg-white text-gray-900"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="btn-primary px-6 py-2 rounded font-medium"
          >
            Save Question
          </button>
        </form>
      </div>
    </div>
  );
}