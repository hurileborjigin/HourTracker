"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function SettingsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [hourlyRate, setHourlyRate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/settings")
        .then((res) => res.json())
        .then((data) => {
          setHourlyRate(data.hourlyRate.toString());
          setLoading(false);
        });
    }
  }, [status, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate < 0) {
      setMessage("Please enter a valid hourly rate");
      setSaving(false);
      return;
    }

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hourlyRate: rate }),
    });

    setSaving(false);

    if (res.ok) {
      setMessage("Settings saved!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Failed to save settings");
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse-slow">
            <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/30">
              H
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="animate-fade-in mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>⚙️</span> Settings
          </h1>
          <p className="text-gray-400 text-sm mt-1">Configure your hourly rate</p>
        </div>

        <div className="glass rounded-2xl p-6 animate-slide-up">
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-300">
                Hourly Rate (€)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">€</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-brand-950/50 border border-brand-700/50 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-white text-lg font-mono transition-all"
                />
              </div>
            </div>

            {message && (
              <div
                className={`text-sm p-3 rounded-xl transition-all ${
                  message.includes("saved")
                    ? "bg-brand-500/10 border border-brand-500/30 text-brand-400"
                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                }`}
              >
                {message.includes("saved") ? "✅ " : "❌ "}{message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-brand-600 to-brand-500 text-white py-3 rounded-xl font-semibold hover:from-brand-500 hover:to-brand-400 disabled:opacity-50 transition-all duration-300 shadow-lg shadow-brand-600/25 hover:shadow-brand-500/40 hover:scale-[1.01] active:scale-[0.99]"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Saving...
                </span>
              ) : "💾 Save Settings"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
