"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { format, differenceInSeconds } from "date-fns";
import Navbar from "./components/Navbar";

interface WorkSession {
  id: string;
  startedAt: string;
  endedAt: string | null;
  note: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [openSession, setOpenSession] = useState<WorkSession | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addStart, setAddStart] = useState("");
  const [addEnd, setAddEnd] = useState("");
  const [addNote, setAddNote] = useState("");

  const fetchSessions = useCallback(async () => {
    const res = await fetch("/api/sessions?limit=10");
    if (res.ok) {
      const data: WorkSession[] = await res.json();
      setSessions(data);
      const open = data.find((s) => !s.endedAt);
      setOpenSession(open || null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchSessions();
    }
  }, [status, router, fetchSessions]);

  useEffect(() => {
    if (!openSession) {
      setElapsed(0);
      return;
    }
    const start = new Date(openSession.startedAt).getTime();
    const update = () => setElapsed(differenceInSeconds(new Date(), start));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [openSession]);

  async function handleCheckIn() {
    setActionLoading(true);
    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startedAt: new Date().toISOString() }),
    });
    await fetchSessions();
    setActionLoading(false);
  }

  async function handleCheckOut() {
    if (!openSession) return;
    setActionLoading(true);
    await fetch("/api/sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: openSession.id,
        endedAt: new Date().toISOString(),
      }),
    });
    await fetchSessions();
    setActionLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this session?")) return;
    await fetch(`/api/sessions?id=${id}`, { method: "DELETE" });
    await fetchSessions();
  }

  async function handleAddSession(e: React.FormEvent) {
    e.preventDefault();
    if (!addStart || !addEnd) return;
    setActionLoading(true);
    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startedAt: new Date(addStart).toISOString(),
        endedAt: new Date(addEnd).toISOString(),
        note: addNote || null,
      }),
    });
    setAddStart("");
    setAddEnd("");
    setAddNote("");
    setShowAddForm(false);
    await fetchSessions();
    setActionLoading(false);
  }

  function formatDuration(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return { h, m, s };
  }

  function formatDurationStr(seconds: number) {
    const { h, m, s } = formatDuration(seconds);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  function sessionDuration(s: WorkSession) {
    if (!s.endedAt) return "In progress";
    const secs = differenceInSeconds(new Date(s.endedAt), new Date(s.startedAt));
    return formatDurationStr(secs);
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-slow">
          <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/30">
            H
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const { h, m, s } = formatDuration(elapsed);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="text-brand-400">{session.user?.name || "there"}</span> 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>

        {/* Check-in / Check-out */}
        <div className="glass rounded-2xl p-8 text-center animate-slide-up">
          {openSession ? (
            <>
              {/* Live pulsing indicator */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
                </span>
                <span className="text-sm text-brand-300 font-medium">
                  Clocked in since {format(new Date(openSession.startedAt), "h:mm a")}
                </span>
              </div>

              {/* Big animated timer */}
              <div className="flex items-center justify-center gap-2 my-6">
                <div className="glass-light rounded-xl px-4 py-3 min-w-[72px]">
                  <div className="text-4xl font-mono font-bold text-brand-300 timer-digit">
                    {h.toString().padStart(2, "0")}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Hours</div>
                </div>
                <div className="text-3xl font-bold text-brand-600 animate-pulse">:</div>
                <div className="glass-light rounded-xl px-4 py-3 min-w-[72px]">
                  <div className="text-4xl font-mono font-bold text-brand-300 timer-digit">
                    {m.toString().padStart(2, "0")}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Min</div>
                </div>
                <div className="text-3xl font-bold text-brand-600 animate-pulse">:</div>
                <div className="glass-light rounded-xl px-4 py-3 min-w-[72px]">
                  <div className="text-4xl font-mono font-bold text-brand-300 timer-digit">
                    {s.toString().padStart(2, "0")}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Sec</div>
                </div>
              </div>

              <button
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="w-full max-w-xs mx-auto block bg-gradient-to-r from-red-600 to-red-500 text-white py-4 rounded-2xl text-lg font-bold hover:from-red-500 hover:to-red-400 disabled:opacity-50 transition-all duration-300 shadow-lg shadow-red-600/25 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                {actionLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Checking out...
                  </span>
                ) : "🛑  Check Out"}
              </button>
            </>
          ) : (
            <>
              <div className="text-gray-400 mb-4 text-sm">Ready to start your shift?</div>
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="w-full max-w-xs mx-auto block bg-gradient-to-r from-brand-600 to-brand-500 text-white py-6 rounded-2xl text-xl font-bold hover:from-brand-500 hover:to-brand-400 disabled:opacity-50 transition-all duration-300 shadow-lg shadow-brand-600/30 hover:shadow-brand-500/50 hover:scale-[1.02] active:scale-[0.98] animate-glow"
              >
                {actionLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Starting...
                  </span>
                ) : "⏱  Check In"}
              </button>
            </>
          )}
        </div>

        {/* Add Session */}
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full glass-light border border-dashed border-brand-700/50 text-gray-400 py-4 rounded-2xl hover:border-brand-500 hover:text-brand-400 transition-all duration-300 hover:shadow-lg hover:shadow-brand-600/10 group"
            >
              <span className="group-hover:scale-110 inline-block transition-transform">✨</span>
              <span className="ml-2">Add Session Manually</span>
            </button>
          ) : (
            <form
              onSubmit={handleAddSession}
              className="glass rounded-2xl p-6 space-y-4 animate-slide-up"
            >
              <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                <span>📝</span> Add Past Session
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Start</label>
                  <input
                    type="datetime-local"
                    value={addStart}
                    onChange={(e) => setAddStart(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-brand-950/50 border border-brand-700/50 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">End</label>
                  <input
                    type="datetime-local"
                    value={addEnd}
                    onChange={(e) => setAddEnd(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-brand-950/50 border border-brand-700/50 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-white transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Note (optional)</label>
                <input
                  type="text"
                  value={addNote}
                  onChange={(e) => setAddNote(e.target.value)}
                  className="w-full px-3 py-2.5 bg-brand-950/50 border border-brand-700/50 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-white transition-all"
                  placeholder="What were you working on?"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-gradient-to-r from-brand-600 to-brand-500 text-white py-3 rounded-xl font-semibold hover:from-brand-500 hover:to-brand-400 disabled:opacity-50 transition-all duration-300 shadow-lg shadow-brand-600/20"
                >
                  💾 Save Session
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-5 py-3 rounded-xl border border-brand-700/50 text-gray-400 hover:bg-brand-800/40 hover:text-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Recent Sessions */}
        <div className="glass rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="px-6 py-4 border-b border-brand-800/50">
            <h2 className="font-semibold text-lg text-white flex items-center gap-2">
              <span>📋</span> Recent Sessions
            </h2>
          </div>
          {sessions.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <div className="text-4xl mb-3">🕐</div>
              <div>No sessions yet. Check in to start tracking!</div>
            </div>
          ) : (
            <ul className="divide-y divide-brand-800/30">
              {sessions.map((s, i) => (
                <li
                  key={s.id}
                  className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-brand-800/20 transition-colors animate-fade-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white">
                      {format(new Date(s.startedAt), "MMM d, yyyy")}
                    </div>
                    <div className="text-sm text-gray-400">
                      {format(new Date(s.startedAt), "h:mm a")}
                      {s.endedAt && ` → ${format(new Date(s.endedAt), "h:mm a")}`}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-brand-400 bg-brand-800/40 px-2 py-0.5 rounded-md">
                        {sessionDuration(s)}
                      </span>
                      {s.note && (
                        <span className="text-xs text-gray-500 truncate">
                          {s.note}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-gray-600 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all duration-200 shrink-0"
                    title="Delete session"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
