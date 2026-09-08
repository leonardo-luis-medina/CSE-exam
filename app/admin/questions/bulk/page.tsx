"use client";

import { useState } from "react";
import Papa from "papaparse";
import Link from "next/link";

type Row = Record<string, string>;

const COLUMNS = [
  "year",
  "category",
  "question",
  "choice1",
  "choice2",
  "choice3",
  "choice4",
  "correctChoice",
];

export default function BulkUploadPage() {
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<Row[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<{ imported: number } | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    setErrors([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPreview(results.data as Row[]);
      },
    });
  };

  const updateCell = (rowIndex: number, column: string, value: string) => {
    setPreview((prev) => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], [column]: value };
      return updated;
    });
  };

  const removeRow = (rowIndex: number) => {
    setPreview((prev) => prev.filter((_, i) => i !== rowIndex));
  };

  const handleUpload = async () => {
    setUploading(true);
    setErrors([]);
    setResult(null);

    const res = await fetch("/api/questions/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: preview }),
    });

    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setErrors(data.errors || ["Something went wrong."]);
      return;
    }

    setResult(data);
    setPreview([]);
    setFileName("");
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bulk Upload Questions</h1>
        <Link href="/admin/questions" className="text-blue-600 hover:underline">
          Back to Questions
        </Link>
      </div>

      <div className="bg-gray-50 border rounded-lg p-4 mb-6 text-sm">
        <p className="font-medium mb-2">CSV format required:</p>
        <code className="block bg-white p-2 rounded border text-xs overflow-x-auto">
          year,category,question,choice1,choice2,choice3,choice4,correctChoice
        </code>
        <ul className="list-disc list-inside mt-2 text-gray-600">
          <li>Leave <code>year</code> blank for &quot;Reviewer&quot; (no specific year)</li>
          <li><code>category</code> must match an existing category name exactly</li>
          <li><code>correctChoice</code> is a number: 1, 2, 3, or 4</li>
          <li>If a question or choice contains a comma, wrap that field in double quotes in your CSV</li>
          <li>You can edit any cell below directly before importing — no need to re-upload a fixed file</li>
        </ul>
      </div>

      <input type="file" accept=".csv" onChange={handleFile} className="mb-4 block" />

      {result && (
        <p className="text-green-600 font-medium mb-4">
          Successfully imported {result.imported} question(s)!
        </p>
      )}

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded p-4 mb-4">
          <p className="font-medium text-red-700 mb-2">
            {errors.length} error(s) found — nothing was imported. Fix the highlighted cells below and try again:
          </p>
          <ul className="list-disc list-inside text-red-600 text-sm space-y-1">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {preview.length > 0 && (
        <>
          <p className="mb-2 text-gray-600">
            Preview & Edit: {preview.length} row(s) from <strong>{fileName}</strong>
          </p>
          <div className="overflow-x-auto border rounded mb-4 max-h-[32rem] overflow-y-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="text-left p-2 border-b w-10">#</th>
                  {COLUMNS.map((col) => (
                    <th key={col} className="text-left p-2 border-b whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                  <th className="text-left p-2 border-b w-16"></th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-2 text-gray-400">{i + 2}</td>
                    {COLUMNS.map((col) => (
                      <td key={col} className="p-1">
                        {col === "question" ? (
                          <textarea
                            value={row[col] ?? ""}
                            onChange={(e) => updateCell(i, col, e.target.value)}
                            className="w-full min-w-[250px] px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 resize-y"
                            rows={3}
                          />
                        ) : (
                          <input
                            value={row[col] ?? ""}
                            onChange={(e) => updateCell(i, col, e.target.value)}
                            className="w-full min-w-[100px] px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                        )}
                      </td>
                    ))}
                    <td className="p-2">
                      <button
                        onClick={() => removeRow(i)}
                        className="text-red-500 hover:text-red-700 text-xs"
                        type="button"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : `Import ${preview.length} Question(s)`}
          </button>
        </>
      )}
    </div>
  );
}