"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Props = {
  backHref?: string;
  backLabel?: string;
};

export default function PublicHeader({ backHref, backLabel }: Props) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setLogoUrl(data.logoUrl || null));
  }, []);

  return (
    <div className="navbar-glass rounded-2xl max-w-5xl mx-auto mt-4 mb-6 px-4 h-14 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Logo" className="w-7 h-7 rounded-md object-cover" />
        ) : (
          <span className="w-7 h-7 rounded-md bg-orange-500 text-white text-xs flex items-center justify-center font-bold">
            R
          </span>
        )}
        <span className="text-sm font-medium text-white hidden sm:inline">ReviewerHub</span>
      </Link>

      {backHref && (
        <Link
          href={backHref}
          className="text-sm text-gray-200 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          ← {backLabel || "Back"}
        </Link>
      )}
    </div>
  );
}