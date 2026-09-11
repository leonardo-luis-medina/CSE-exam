"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type ChoiceItem = { id: number; text: string; isCorrect: boolean };
type QuestionItem = { id: number; text: string; imageUrl?: string | null; choices: ChoiceItem[] };
type CategoryBlock = { id: number; name: string; questions: QuestionItem[] };

type AnswerRecord = { selectedChoiceId: number; correct: boolean };

function QuizContent() {
  const searchParams = useSearchParams();
  const presetId = searchParams.get("presetId") ?? "";
  const examId = searchParams.get("examId") ?? "";
  const categoriesParam = searchParams.get("categories") ?? "";
  const yearsParam = searchParams.get("years") ?? "";

  const [categories, setCategories] = useState<CategoryBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  const [pointer, setPointer] = useState<Record<number, number>>({});
  const [answers, setAnswers] = useState<Record<number, AnswerRecord>>({});
  const [selectedChoiceId, setSelectedChoiceId] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const loadExam = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (presetId) {
      params.set("presetId", presetId);
    } else if (examId) {
      params.set("examId", examId);
    } else {
      if (categoriesParam) params.set("categories", categoriesParam);
      if (yearsParam) params.set("years", yearsParam);
    }

    const res = await fetch(`/api/exam/questions?${params.toString()}`);
    const data: CategoryBlock[] = await res.json();
    setCategories(data);

    const initialPointer: Record<number, number> = {};
    data.forEach((cat) => (initialPointer[cat.id] = 0));
    setPointer(initialPointer);
    setAnswers({});
    setSelectedChoiceId(null);
    setShowFeedback(false);
    setActiveCategoryId(data.length > 0 ? data[0].id : null);
    setLoading(false);
  };

  useEffect(() => {
    loadExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetId, examId, categoriesParam, yearsParam]);

  if (loading) {
    return <div className="p-8 text-center">Loading exam...</div>;
  }

  if (categories.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No questions available yet. Please check back later.</p>
      </div>
    );
  }

  const totalQuestions = categories.reduce((sum, c) => sum + c.questions.length, 0);
  const totalAnswered = Object.keys(answers).length;
  const examComplete = totalAnswered === totalQuestions;

  // ---------- RESULTS SCREEN ----------
  if (examComplete) {
    const totalCorrect = Object.values(answers).filter((a) => a.correct).length;
    const percentage = Math.round((totalCorrect / totalQuestions) * 100);

    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Exam Complete!</h1>
        <p className="text-6xl font-bold text-blue-600 my-6">
          {totalCorrect} / {totalQuestions}
        </p>
        <p className="text-xl text-gray-600 mb-8">{percentage}% Score</p>

        <div className="space-y-2 mb-8 text-left">
          {categories.map((cat) => {
            const catCorrect = cat.questions.filter(
              (q) => answers[q.id]?.correct
            ).length;
            return (
              <div
                key={cat.id}
                className="flex justify-between border rounded px-4 py-2 bg-gray-50"
              >
                <span>{cat.name}</span>
                <span className="font-medium">
                  {catCorrect} / {cat.questions.length}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
          >
            Back to Main Hub
          </Link>
          <button
            onClick={loadExam}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ---------- ACTIVE QUIZ SCREEN ----------
  const activeCategory = categories.find((c) => c.id === activeCategoryId)!;
  const activeIndex = pointer[activeCategory.id];
  const activeQuestion = activeCategory.questions[activeIndex];

  const handleSelectChoice = (choice: ChoiceItem) => {
    if (showFeedback) return; // already answered this question, ignore further clicks
    setSelectedChoiceId(choice.id);
    setShowFeedback(true);
    setAnswers((prev) => ({
      ...prev,
      [activeQuestion.id]: { selectedChoiceId: choice.id, correct: choice.isCorrect },
    }));
  };

  const findNextCategoryWithUnanswered = (excludeId: number): number | null => {
    for (const cat of categories) {
      if (cat.id === excludeId) continue;
      if (pointer[cat.id] < cat.questions.length) return cat.id;
    }
    // check the excluded one last, in case it still has more (shouldn't happen here but safe)
    const excluded = categories.find((c) => c.id === excludeId);
    if (excluded && pointer[excludeId] < excluded.questions.length) return excludeId;
    return null;
  };

  const handleNext = () => {
    const nextIndex = activeIndex + 1;
    const updatedPointer = { ...pointer, [activeCategory.id]: nextIndex };
    setPointer(updatedPointer);
    setSelectedChoiceId(null);
    setShowFeedback(false);

    if (nextIndex >= activeCategory.questions.length) {
      // this category is done, jump to next category with unanswered questions
      const nextCatId = categories
        .filter((c) => c.id !== activeCategory.id)
        .find((c) => updatedPointer[c.id] < c.questions.length)?.id;
      if (nextCatId) {
        setActiveCategoryId(nextCatId);
      }
      // if nextCatId is undefined, examComplete will become true on next render
    }
  };

  const handleTabClick = (catId: number) => {
    setActiveCategoryId(catId);
    setSelectedChoiceId(null);
    setShowFeedback(false);
  };

  const correctChoice = activeQuestion.choices.find((c) => c.isCorrect);

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => {
          const answeredCount = Math.min(pointer[cat.id], cat.questions.length);
          const isActive = cat.id === activeCategoryId;
          const isDone = answeredCount >= cat.questions.length;
          return (
            <button
              key={cat.id}
              onClick={() => handleTabClick(cat.id)}
              className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                isActive
                  ? "bg-blue-600 text-white border-blue-600"
                  : isDone
                  ? "bg-green-50 text-green-700 border-green-300"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {cat.name} {answeredCount}/{cat.questions.length}
            </button>
          );
        })}
      </div>

      {/* Question card */}
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <p className="text-xs text-gray-400 mb-2">
          {activeCategory.name} — Question {activeIndex + 1} of {activeCategory.questions.length}
        </p>
        {activeQuestion.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeQuestion.imageUrl}
            alt="Question"
            className="w-full max-h-64 object-contain rounded mb-4 border"
          />
        )}
        <p className="text-lg font-medium mb-6">{activeQuestion.text}</p>

        <div className="space-y-3">
          {activeQuestion.choices.map((choice) => {
            const isSelected = selectedChoiceId === choice.id;
            let styles = "border-gray-300 hover:bg-gray-50";

            if (showFeedback) {
              if (choice.isCorrect) {
                styles = "border-green-500 bg-green-50 text-green-800";
              } else if (isSelected && !choice.isCorrect) {
                styles = "border-red-500 bg-red-50 text-red-800";
              } else {
                styles = "border-gray-200 text-gray-400";
              }
            }

            return (
              <button
                key={choice.id}
                onClick={() => handleSelectChoice(choice)}
                disabled={showFeedback}
                className={`w-full text-left px-4 py-3 border rounded-lg transition-colors ${styles}`}
              >
                {choice.text}
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className="mt-5">
            {answers[activeQuestion.id]?.correct ? (
              <p className="text-green-600 font-semibold">✓ Correct!</p>
            ) : (
              <p className="text-red-600 font-semibold">
                ✗ Wrong! Correct answer: {correctChoice?.text}
              </p>
            )}
            <button
              onClick={handleNext}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading exam...</div>}>
      <QuizContent />
    </Suspense>
  );
}