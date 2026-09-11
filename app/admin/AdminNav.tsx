"use client";

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

  if (pathname === "/admin/login") return null;

  return (
    <nav className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-1 overflow-x-auto">
          <Link
            href="/"
            className="flex items-center gap-2 pr-3 mr-2 border-r border-gray-700 shrink-0"
          >
            <span className="w-7 h-7 rounded-md bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
              R
            </span>
            <span className="text-sm font-medium hidden sm:inline">Home</span>
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
                className={`px-3 py-2 rounded text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="text-sm text-red-300 hover:text-red-200 whitespace-nowrap ml-3"
        >
          Log Out
        </button>
      </div>
    </nav>
  );
}