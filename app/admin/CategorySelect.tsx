"use client";

import { useEffect, useState } from "react";

type Category = { id: number; name: string; group: string | null };

type Props = {
  value: string; // "" means no category selected
  onChange: (id: string) => void;
};

const NO_CATEGORY = "__none__";

export default function CategorySelect({ value, onChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: Category[]) => {
        setCategories(data);
        // if editing an existing question, pre-select the correct group based on current value
        if (value) {
          const current = data.find((c) => c.id.toString() === value);
          if (current) setSelectedGroup(current.group || "Uncategorized");
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groups = Array.from(
    new Set(categories.map((c) => c.group || "Uncategorized"))
  ).sort();

  const categoriesInGroup = categories.filter(
    (c) => (c.group || "Uncategorized") === selectedGroup
  );

  const handleGroupChange = (group: string) => {
    setSelectedGroup(group);
    onChange(""); // reset category choice when group changes
  };

  return (
    <div className="flex gap-2 flex-1">
      <select
        value={selectedGroup}
        onChange={(e) => handleGroupChange(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 flex-1 bg-white text-gray-900"
      >
        <option value="">Select Group</option>
        {groups.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>

      <select
        value={value || NO_CATEGORY}
        onChange={(e) => onChange(e.target.value === NO_CATEGORY ? "" : e.target.value)}
        disabled={!selectedGroup}
        className="border border-gray-300 rounded px-3 py-2 flex-1 bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
      >
        <option value={NO_CATEGORY}>No Category</option>
        {categoriesInGroup.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>
  );
}