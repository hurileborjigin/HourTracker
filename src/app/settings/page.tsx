"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useTheme, themes } from "../components/ThemeProvider";

export default function SettingsPage() {
  const { status } = useSession();
  const router = useRouter();
  const { theme, setThemeById } = useTheme();
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
      <div className="min-h-screen w-full overflow-x-hidden">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse-slow">
            <div className="w-12 h-12 bg-themed rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-themed">
              H
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Page Title */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>⚙️</span> Settings
          </h1>
          <p className="text-gray-400 text-sm mt-1">Configure your preferences</p>
        </div>

        {/* Hourly Rate */}
        <div className="glass rounded-2xl p-6 animate-slide-up">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span>💶</span> Hourly Rate
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">€</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-themed/30 rounded-xl focus:ring-2 focus:ring-current outline-none text-white text-lg font-mono transition-all"
              />
            </div>

            {message && (
              <div
                className={`text-sm p-3 rounded-xl transition-all ${
                  message.includes("saved")
                    ? "bg-green-500/10 border border-green-500/30 text-green-400"
                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                }`}
              >
                {message.includes("saved") ? "✅ " : "❌ "}{message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full btn-themed text-white py-3 rounded-xl font-semibold disabled:opacity-50 shadow-lg shadow-themed"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Saving...
                </span>
              ) : "💾 Save"}
            </button>
          </form>
        </div>

        {/* Theme Picker */}
        <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span>🎨</span> Theme
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setThemeById(t.id)}
                className={`relative p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                  theme.id === t.id
                    ? "border-white/60 shadow-lg scale-[1.02]"
                    : "border-transparent hover:border-white/20 hover:scale-[1.01]"
                }`}
                style={{
                  background: `linear-gradient(135deg, ${t.colors.bg1}, ${t.colors.bg2})`,
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{t.emoji}</span>
                  <span className="text-xs font-semibold text-white/90">{t.name}</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.colors.accent }} />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.colors.accentLight }} />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.colors.accentMuted }} />
                </div>
                {theme.id === t.id && (
                  <div className="absolute top-2 right-2 text-xs">✓</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
