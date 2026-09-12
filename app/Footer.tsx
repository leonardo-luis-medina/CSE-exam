export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center">
              LM
            </span>
            <div>
              <p className="text-white font-medium">Leonardo Luis C. Medina</p>
              <p className="text-blue-200/60 text-sm">Muntinlupa City, Philippines</p>
            </div>
          </div>

          <div className="flex gap-5 text-sm">
            <a
              href="https://github.com/leonardo-luis-medina"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-200 hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/leonardo-luis-c-medina-9475192ab/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-200 hover:text-white transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="mailto:leonardo.luis.medina99@gmail.com"
              className="text-blue-200 hover:text-white transition-colors"
            >
              Email
            </a>
          </div>
        </div>

        <div className="text-center mt-8 pt-6 border-t border-white/10">
          <p className="text-blue-200/50 text-xs mb-2">
            © 2026 Leonardo Luis C. Medina
          </p>
          <a
            href="https://leo-fullstack-portfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-400 hover:text-orange-300 text-xs font-medium hover:underline"
          >
            View My Portfolio →
          </a>
        </div>
      </div>
    </footer>
  );
}