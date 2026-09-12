"use client";

import { useEffect, useRef, useState } from "react";

type Category = { id: number; name: string };
type Exam = { id: number; name: string; config: string };

type Props = {
  value: string; // "" means Uncategorized
  onChange: (id: string) => void;
  placeholder?: string;
};

export default function CategorySelect({ value, onChange, placeholder }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<Record<string, Category[]>>({});
  const [examFilter, setExamFilter] = useState("All Exams");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/exams").then((r) => r.json()),
    ]).then(([cats, exams]: [Category[], Exam[]]) => {
      setCategories(cats);

      const map: Record<string, Category[]> = {};
      const seenPerCategory: Record<number, boolean> = {};

      exams.forEach((exam) => {
        try {
          const config = JSON.parse(exam.config);
          const ids: number[] = config.categories?.map((c: { id: number }) => c.id) || [];
          ids.forEach((id) => {
            const cat = cats.find((c) => c.id === id);
            if (!cat) return;
            if (!map[exam.name]) map[exam.name] = [];
            map[exam.name].push(cat);
            seenPerCategory[id] = true;
          });
        } catch {
          // ignore malformed config
        }
      });

      const ungrouped = cats.filter((c) => !seenPerCategory[c.id]);
      if (ungrouped.length > 0) map["Ungrouped"] = ungrouped;

      setGroups(map);
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCategory = categories.find((c) => c.id.toString() === value);
  const displayValue = value === "" ? "Uncategorized" : selectedCategory?.name || "";

  const filtered = query.trim()
    ? categories.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : null;

  const visibleGroups =
    examFilter === "All Exams"
      ? groups
      : groups[examFilter]
      ? { [examFilter]: groups[examFilter] }
      : {};

  const handleSelect = (id: string) => {
    onChange(id);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <input
        value={open ? query : displayValue}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        placeholder={placeholder || "Select or search category..."}
        className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
      />

      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-80 overflow-y-auto bg-white border border-gray-300 rounded shadow-lg">
          {!query.trim() && (
            <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
              <select
                value={examFilter}
                onChange={(e) => setExamFilter(e.target.value)}
                className="w-full border border-gray-200 rounded text-xs px-2 py-1 bg-gray-50 text-gray-700"
              >
                <option>All Exams</option>
                {Object.keys(groups).map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={() => handleSelect("")}
            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-500 italic border-b border-gray-100"
          >
            Uncategorized
          </button>

          {filtered ? (
            filtered.length === 0 ? (
              <p className="text-sm text-gray-400 px-3 py-2">No matches.</p>
            ) : (
              filtered.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelect(cat.id.toString())}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-blue-50 text-gray-900"
                >
                  {cat.name}
                </button>
              ))
            )
          ) : Object.keys(visibleGroups).length === 0 ? (
            <p className="text-sm text-gray-400 px-3 py-2">No categories found.</p>
          ) : (
            Object.entries(visibleGroups).map(([groupName, cats]) => (
              <div key={groupName}>
                <p className="text-xs font-semibold text-gray-400 uppercase px-3 pt-2 pb-1">
                  {groupName}
                </p>
                {cats.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelect(cat.id.toString())}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-blue-50 text-gray-900"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}