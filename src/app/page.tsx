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
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  function sessionDuration(s: WorkSession) {
    if (!s.endedAt) return "In progress";
    const secs = differenceInSeconds(new Date(s.endedAt), new Date(s.startedAt));
    return formatDuration(secs);
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Check-in / Check-out */}
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          {openSession ? (
            <>
              <div className="text-sm text-gray-500 mb-1">Checked in since {format(new Date(openSession.startedAt), "h:mm a")}</div>
              <div className="text-4xl font-mono font-bold text-blue-600 mb-4">
                {formatDuration(elapsed)}
              </div>
              <button
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="w-full max-w-xs bg-red-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? "..." : "Check Out"}
              </button>
            </>
          ) : (
            <button
              onClick={handleCheckIn}
              disabled={actionLoading}
              className="w-full max-w-xs bg-green-500 text-white py-6 rounded-xl text-xl font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              {actionLoading ? "..." : "Check In"}
            </button>
          )}
        </div>

        {/* Add Session */}
        <div>
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full bg-white border-2 border-dashed border-gray-300 text-gray-500 py-3 rounded-xl hover:border-blue-400 hover:text-blue-500 transition-colors"
            >
              + Add Session Manually
            </button>
          ) : (
            <form
              onSubmit={handleAddSession}
              className="bg-white rounded-xl shadow-md p-6 space-y-4"
            >
              <h3 className="font-semibold text-lg">Add Past Session</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start</label>
                  <input
                    type="datetime-local"
                    value={addStart}
                    onChange={(e) => setAddStart(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End</label>
                  <input
                    type="datetime-local"
                    value={addEnd}
                    onChange={(e) => setAddEnd(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Note (optional)</label>
                <input
                  type="text"
                  value={addNote}
                  onChange={(e) => setAddNote(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="What were you working on?"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2.5 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-lg">Recent Sessions</h2>
          </div>
          {sessions.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400">
              No sessions yet. Check in to start tracking!
            </div>
          ) : (
            <ul className="divide-y">
              {sessions.map((s) => (
                <li key={s.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">
                      {format(new Date(s.startedAt), "MMM d, yyyy")}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(s.startedAt), "h:mm a")}
                      {s.endedAt && ` – ${format(new Date(s.endedAt), "h:mm a")}`}
                      <span className="ml-2 font-mono text-xs">
                        ({sessionDuration(s)})
                      </span>
                    </div>
                    {s.note && (
                      <div className="text-xs text-gray-400 mt-0.5 truncate">
                        {s.note}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-red-400 hover:text-red-600 text-sm shrink-0 transition-colors"
                  >
                    Delete
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
