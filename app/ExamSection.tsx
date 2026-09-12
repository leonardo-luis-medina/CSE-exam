"use client";

import { useState } from "react";
import Link from "next/link";

type Exam = {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
};

const PAGE_SIZE = 6;

type Props = {
  title: string;
  exams: Exam[];
  isAdmin: boolean;
  showAddCard?: boolean;
  onDelete?: (id: number) => void;
  emptyMessage: string;
};

export default function ExamSection({
  title,
  exams,
  isAdmin,
  showAddCard = false,
  onDelete,
  emptyMessage,
}: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = exams.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
  };

  return (
    <section className="mb-14">
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>

      <input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        placeholder={`Search ${title.toLowerCase()}...`}
        className="w-full max-w-md border border-white/20 bg-white/10 text-white placeholder-blue-200/60 rounded-lg px-4 py-2 text-sm mb-5 focus:outline-none focus:border-orange-400 focus:bg-white/15"
      />

      {exams.length === 0 && !showAddCard && (
        <p className="text-blue-100/70 text-sm">{emptyMessage}</p>
      )}

      {exams.length > 0 && filtered.length === 0 && (
        <p className="text-blue-100/70 text-sm">No exams match your search.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {pageItems.map((exam) => (
          <div
            key={exam.id}
            className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white"
          >
            <div className="h-36 bg-gray-100 flex items-center justify-center">
              {exam.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={exam.imageUrl}
                  alt={exam.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-300 text-sm">No image</span>
              )}
            </div>
            <div className="p-4">
              <p className="font-semibold text-gray-900 mb-1">{exam.name}</p>
              <p className="text-sm text-gray-500 mb-3 whitespace-pre-wrap">{exam.description}</p>

              <div className="flex gap-2 mb-2">
                <Link
                  href={`/exam/quiz?examId=${exam.id}`}
                  className="flex-1 text-center bg-blue-600 text-white text-sm px-3 py-2 rounded hover:bg-blue-700"
                >
                  Default
                </Link>
                <Link
                  href={`/exam/setup?examId=${exam.id}`}
                  className="flex-1 text-center bg-gray-100 text-gray-700 text-sm px-3 py-2 rounded hover:bg-gray-200"
                >
                  Custom
                </Link>
              </div>

              {isAdmin && (
                <div className="flex gap-2">
                  <Link
                    href={`/admin/exams/${exam.id}/edit`}
                    className="flex-1 text-center text-blue-600 text-xs px-3 py-1.5 rounded border border-blue-200 hover:bg-blue-50"
                  >
                    Edit
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(exam.id)}
                      className="flex-1 text-center text-red-500 text-xs px-3 py-1.5 rounded border border-red-200 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {showAddCard && isAdmin && (
          <Link
            href="/admin/exams/new"
            className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-400 transition-colors min-h-[220px]"
          >
            <span className="text-4xl mb-2">+</span>
            <span className="text-sm font-medium">Create Exam</span>
          </Link>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-white/20 text-blue-100 rounded hover:bg-white/10 disabled:opacity-30"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`px-3 py-1.5 text-sm border rounded ${
                p === page
                  ? "bg-orange-500 text-white border-orange-500"
                  : "border-white/20 text-blue-100 hover:bg-white/10"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border border-white/20 text-blue-100 rounded hover:bg-white/10 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}