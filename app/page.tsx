import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-xl text-center">
          <p className="text-sm font-medium text-blue-600 mb-3 tracking-wide uppercase">
            Free Practice Reviewer
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            CSE Exam Reviewer
          </h1>
          <p className="text-lg text-gray-600 mb-10">
            Practice for the Philippine Civil Service Exam with randomized questions
            across Verbal, Numerical, Analytical, and General Information categories.
            Track your score as you go.
          </p>

          <Link
            href="/exam/setup"
            className="inline-block bg-blue-600 text-white text-lg font-medium px-10 py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            Start Reviewer
          </Link>

          <div className="grid grid-cols-3 gap-4 mt-16 text-sm text-gray-500">
            <div>
              <p className="text-2xl font-bold text-gray-900">Free</p>
              <p>Always</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">Random</p>
              <p>Every attempt</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">Instant</p>
              <p>Feedback</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-gray-400 py-6">
        CSE Exam Reviewer · Built for Civil Service Exam practice
      </footer>
    </div>
  );
}