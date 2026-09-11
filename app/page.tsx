"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import ExamSection from "./ExamSection";

type Exam = {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
};

export default function HomePage() {
  const { status } = useSession();
  const isAdmin = status === "authenticated";

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/exams")
      .then((r) => r.json())
      .then((data) => {
        setExams(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this exam card? This won't delete the underlying questions.")) return;
    await fetch(`/api/exams/${id}`, { method: "DELETE" });
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="border-b">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-semibold text-gray-900">ReviewerHub</span>
          {isAdmin ? (
            <div className="flex items-center gap-4 text-sm">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                Admin Panel
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-red-500 hover:text-red-700"
              >
                Log Out
              </button>
            </div>
          ) : (
            <Link
              href="/admin/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Admin Log In
            </Link>
          )}
        </div>
      </div>

      <header className="text-center pt-14 pb-10 px-6">
        <p className="text-sm font-medium text-blue-600 mb-2 tracking-wide uppercase">
          Free Practice Reviewers
        </p>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">ReviewerHub</h1>
        <p className="text-gray-600 max-w-lg mx-auto">
          Pick a reviewer below to start practicing with randomized questions and
          instant feedback.
        </p>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 pb-16">
        {loading ? (
          <p className="text-center text-gray-500">Loading reviewers...</p>
        ) : (
          <>
            <ExamSection
              title="Main Exams"
              exams={exams}
              isAdmin={isAdmin}
              showAddCard={true}
              onDelete={handleDelete}
              emptyMessage="No reviewers have been created yet."
            />

            <ExamSection
              title="Custom Exams"
              exams={[]}
              isAdmin={isAdmin}
              showAddCard={false}
              emptyMessage="Community-created custom exams are coming soon!"
            />
          </>
        )}
      </main>

      <footer className="text-center text-xs text-gray-400 py-6">
        CSE Exam Reviewer · Built for Civil Service Exam practice
      </footer>
    </div>
  );
}