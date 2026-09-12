"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import Link from "next/link";

type Row = Record<string, string>;
type Category = { id: number; name: string };
type Year = { id: number; year: number };

const COLUMNS = [
  "year",
  "category",
  "question",
  "choice1",
  "choice2",
  "choice3",
  "choice4",
  "correctChoice",
  "imageUrl",
];

const EMPTY_ROW: Row = {
  year: "",
  category: "",
  question: "",
  choice1: "",
  choice2: "",
  choice3: "",
  choice4: "",
  correctChoice: "",
  imageUrl: "",
};

async function uploadToCloudinary(file: File): Promise<string | null> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) return null;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) return null;
  return data.secure_url;
}

export default function BulkUploadPage() {
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<Row[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<{ imported: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingRowIndex, setUploadingRowIndex] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [years, setYears] = useState<Year[]>([]);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
    fetch("/api/years").then((r) => r.json()).then(setYears);
  }, []);

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
        setPreview((prev) => [...prev, ...(results.data as Row[])]);
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

  const handleImageFile = async (rowIndex: number, file: File) => {
    setUploadingRowIndex(rowIndex);
    const url = await uploadToCloudinary(file);
    if (url) updateCell(rowIndex, "imageUrl", url);
    setUploadingRowIndex(null);
  };

  const removeRow = (rowIndex: number) => {
    setPreview((prev) => prev.filter((_, i) => i !== rowIndex));
  };

  const addBlankRow = () => {
    setPreview((prev) => [...prev, { ...EMPTY_ROW }]);
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
      <div className="glass-card rounded-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Bulk Upload Questions</h1>
          <Link href="/admin/questions" className="text-blue-700 hover:underline">
            Back to Questions
          </Link>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-sm">
          <p className="font-medium mb-2 text-gray-800">CSV format (for file upload):</p>
          <code className="block bg-white p-2 rounded border border-gray-200 text-xs overflow-x-auto text-gray-700">
            year,category,question,choice1,choice2,choice3,choice4,correctChoice,imageUrl
          </code>
          <ul className="list-disc list-inside mt-2 text-gray-600">
            <li>Leave <code>year</code> blank for &quot;Reviewer&quot; (no specific year)</li>
            <li><code>correctChoice</code> is a number: 1, 2, 3, or 4</li>
            <li><code>imageUrl</code> is optional — leave blank, paste a link, or use the Upload button below per row</li>
            <li>You can edit any cell below directly, or click &quot;Add Row&quot; to type a question manually</li>
          </ul>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <label className="upload-button">
            Choose CSV
            <input type="file" accept=".csv" onChange={handleFile} className="hidden" />
          </label>
          <button
            onClick={addBlankRow}
            type="button"
            className="btn-secondary px-4 py-2 rounded font-medium text-sm whitespace-nowrap"
          >
            + Add Row
          </button>
        </div>

        {fileName && (
          <p className="text-sm text-gray-500 mb-2">Last file loaded: {fileName}</p>
        )}

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
              Preview & Edit: {preview.length} row(s)
            </p>
            <div className="overflow-x-auto border border-gray-200 rounded mb-4 max-h-[32rem] overflow-y-auto bg-white">
              <table className="w-full text-sm border-collapse table-fixed">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="text-left p-2 border-b border-gray-200 w-10 text-gray-700">#</th>
                    {COLUMNS.map((col) => (
                      <th
                        key={col}
                        className={`text-left p-2 border-b border-gray-200 whitespace-nowrap text-gray-700 ${
                          col === "question" ? "w-[300px]" : col === "imageUrl" ? "w-[160px]" : "w-[130px]"
                        }`}
                      >
                        {col}
                      </th>
                    ))}
                    <th className="text-left p-2 border-b border-gray-200 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-2 text-gray-400 align-top">{i + 1}</td>
                      {COLUMNS.map((col) => (
                        <td
                          key={col}
                          className={`p-1 align-top ${
                            col === "question" ? "w-[300px]" : col === "imageUrl" ? "w-[160px]" : "w-[130px]"
                          }`}
                        >
                          {col === "question" ? (
                            <textarea
                              value={row[col] ?? ""}
                              onChange={(e) => updateCell(i, col, e.target.value)}
                              className="w-full border border-gray-300 rounded text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-y bg-white text-gray-900"
                              rows={3}
                            />
                          ) : col === "category" ? (
                            <select
                              value={row[col] ?? ""}
                              onChange={(e) => updateCell(i, col, e.target.value)}
                              className="w-full border border-gray-300 rounded text-sm px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white text-gray-900"
                            >
                              <option value="">Select</option>
                              {categories.map((c) => (
                                <option key={c.id} value={c.name}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          ) : col === "year" ? (
                            <select
                              value={row[col] ?? ""}
                              onChange={(e) => updateCell(i, col, e.target.value)}
                              className="w-full border border-gray-300 rounded text-sm px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white text-gray-900"
                            >
                              <option value="">Reviewer</option>
                              {years.map((y) => (
                                <option key={y.id} value={y.year}>
                                  {y.year}
                                </option>
                              ))}
                            </select>
                          ) : col === "correctChoice" ? (
                            <select
                              value={row[col] ?? ""}
                              onChange={(e) => updateCell(i, col, e.target.value)}
                              className="w-full border border-gray-300 rounded text-sm px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white text-gray-900"
                            >
                              <option value="">-</option>
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="3">3</option>
                              <option value="4">4</option>
                            </select>
                          ) : col === "imageUrl" ? (
                            <div className="space-y-1">
                              {row.imageUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={row.imageUrl}
                                  alt="preview"
                                  className="w-12 h-12 object-cover rounded border border-gray-200"
                                />
                              )}
                              <label className="upload-button-compact block text-center">
                                {uploadingRowIndex === i ? "Uploading..." : "Upload"}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageFile(i, file);
                                  }}
                                  disabled={uploadingRowIndex === i}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          ) : (
                            <input
                              value={row[col] ?? ""}
                              onChange={(e) => updateCell(i, col, e.target.value)}
                              className="w-full border border-gray-300 rounded text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white text-gray-900"
                            />
                          )}
                        </td>
                      ))}
                      <td className="p-2 align-top">
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

            <div className="flex items-center gap-3">
              <button
                onClick={handleUpload}
                disabled={uploading}
                type="button"
                className="btn-primary px-6 py-2 rounded font-medium disabled:opacity-50"
              >
                {uploading ? "Uploading..." : `Import ${preview.length} Question(s)`}
              </button>
              <button
                onClick={addBlankRow}
                type="button"
                className="text-blue-700 hover:underline text-sm"
              >
                + Add another row
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}