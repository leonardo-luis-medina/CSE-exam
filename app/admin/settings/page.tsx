"use client";

import { useEffect, useState } from "react";
import ImageUpload from "../exams/ImageUpload";

export default function SettingsPage() {
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setLogoUrl(data.logoUrl || "");
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoUrl }),
    });
    setSaving(false);
    setSuccess(true);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Site Settings</h1>

      <div className="glass-card rounded-xl p-6">
        <ImageUpload value={logoUrl} onChange={setLogoUrl} />

        {success && <p className="text-green-600 text-sm mt-3">Logo updated!</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-6 py-2 rounded-lg font-medium mt-4 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Logo"}
        </button>
      </div>
    </div>
  );
}