"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Registration failed");
      return;
    }

    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 btn-themed rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-themed">
            H
          </div>
          <span className="text-3xl font-bold text-white">
            Hour<span className="text-themed">Tracker</span>
          </span>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5">
          <h2 className="text-xl font-bold text-white text-center">Create your account</h2>
          <p className="text-gray-400 text-sm text-center -mt-3">Start tracking your hours</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-300">Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-black/20 border border-themed/30 rounded-xl focus:ring-2 focus:ring-current focus:border-current outline-none text-white placeholder-gray-600 transition-all"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-black/20 border border-themed/30 rounded-xl focus:ring-2 focus:ring-current focus:border-current outline-none text-white placeholder-gray-600 transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-black/20 border border-themed/30 rounded-xl focus:ring-2 focus:ring-current focus:border-current outline-none text-white placeholder-gray-600 transition-all"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-300">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-black/20 border border-themed/30 rounded-xl focus:ring-2 focus:ring-current focus:border-current outline-none text-white placeholder-gray-600 transition-all"
              placeholder="Repeat your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-themed text-white py-3 rounded-xl font-semibold  disabled:opacity-50 transition-all duration-300 shadow-lg shadow-themed hover:shadow-themed hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Creating account...
              </span>
            ) : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-themed hover:text-themed-light font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
