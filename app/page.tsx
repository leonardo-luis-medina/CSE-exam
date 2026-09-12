"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import ExamSection from "./ExamSection";
import Footer from "./Footer";

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
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/exams")
      .then((r) => r.json())
      .then((data) => {
        setExams(data);
        setLoading(false);
      });
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setLogoUrl(data.logoUrl || null));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this exam card? This won't delete the underlying questions.")) return;
    await fetch(`/api/exams/${id}`, { method: "DELETE" });
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar - fixed row */}
      <div className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="flex items-center gap-2 font-semibold text-white">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" className="w-7 h-7 rounded-md object-cover" />
            ) : (
              <span className="w-7 h-7 rounded-md bg-orange-500 text-white text-xs flex items-center justify-center font-bold">
                R
              </span>
            )}
            ReviewerHub
          </span>

          <div className="flex items-center gap-5 text-sm">
            <a href="#about" className="text-blue-200 hover:text-white transition-colors">
              About
            </a>
            <button
              disabled
              title="Coming soon"
              className="text-gray-500 cursor-not-allowed border border-white/10 rounded-full px-3 py-1 text-xs"
            >
              Download App
            </button>

            {isAdmin ? (
              <div className="flex items-center gap-4">
                <Link href="/admin" className="text-blue-300 hover:text-white">
                  Admin Panel
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-orange-400 hover:text-orange-300"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <Link href="/admin/login" className="text-blue-300 hover:text-white">
                Admin Log In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Hero - its own styled section */}
      <header className="relative text-center pt-16 pb-14 px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(249,115,22,0.15), transparent 60%)",
          }}
        />
        <div className="relative">
          <p className="text-sm font-medium text-orange-400 mb-2 tracking-wide uppercase">
            Free Practice Reviewers
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">ReviewerHub</h1>
          <p className="text-blue-100/80 max-w-lg mx-auto">
            Pick a reviewer below to start practicing with randomized questions and
            instant feedback.
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 pb-16">
        {loading ? (
          <p className="text-center text-blue-100/70">Loading reviewers...</p>
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

        <section id="about" className="mt-8 glass-card rounded-2xl p-8 scroll-mt-20">
          <h2 className="text-xl font-bold text-gray-900 mb-3">About ReviewerHub</h2>
          <p className="text-gray-600">
            ReviewerHub is a free practice platform built to help Filipinos prepare for
            the Civil Service Exam and other professional exams. Questions are randomized
            on every attempt, with instant feedback so you can learn as you go. More exam
            types and features are on the way.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}