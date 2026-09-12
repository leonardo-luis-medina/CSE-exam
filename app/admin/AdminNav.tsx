"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/setup", label: "Categories & Years" },
  { href: "/admin/questions", label: "All Questions" },
  { href: "/admin/questions/new", label: "Add Question" },
  { href: "/admin/questions/bulk", label: "Bulk Upload" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setLogoUrl(data.logoUrl || null));
  }, []);

  if (pathname === "/admin/login") return null;

  return (
    <div className="sticky top-0 z-20 px-4 pt-4 pb-2">
      <nav className="navbar-glass max-w-6xl mx-auto rounded-2xl px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-1 overflow-x-auto">
          <Link
            href="/"
            className="flex items-center gap-2 pr-3 mr-2 border-r border-gray-200 shrink-0"
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" className="w-7 h-7 rounded-md object-cover" />
            ) : (
              <span className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xs flex items-center justify-center font-bold">
                R
              </span>
            )}
            <span className="text-sm font-medium hidden sm:inline text-white">Home</span>
          </Link>

          {LINKS.map((link) => {
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-gray-200 hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/settings"
            title="Settings"
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            ⚙️
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="text-sm text-orange-300 hover:text-orange-200 whitespace-nowrap"
          >
            Log Out
          </button>
        </div>
      </nav>
    </div>
  );
}