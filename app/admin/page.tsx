"use client";

import { signOut } from "next-auth/react";

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Log Out
        </button>
      </div>
      <p className="text-gray-600 mt-2">You're logged in.</p>
    </div>
  );
}