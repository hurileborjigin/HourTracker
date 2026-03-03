"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { format, differenceInSeconds } from "date-fns";
import Navbar from "./components/Navbar";
import TimerDisplay from "./components/TimerDisplay";
import SessionList from "./components/SessionList";
import AddSessionForm from "./components/AddSessionForm";
import CheckOutModal from "./components/CheckOutModal";
import Toast from "./components/Toast";

interface WorkSession {
  id: string;
  startedAt: string;
  endedAt: string | null;
  note: string | null;
  tipAmount: number | null;
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
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  async function handleCheckOut(tipAmount: number) {
    if (!openSession) return;
    setActionLoading(true);
    const res = await fetch("/api/sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: openSession.id,
        endedAt: new Date().toISOString(),
        tipAmount,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      if (data.error === "too_short") {
        setShowCheckOutModal(false);
        setToastMessage("You gotta work at least 20 minutes to get paid!");
        setActionLoading(false);
        return;
      }
    }

    setShowCheckOutModal(false);
    await fetchSessions();
    setActionLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this session?")) return;
    await fetch(`/api/sessions?id=${id}`, { method: "DELETE" });
    await fetchSessions();
  }

  async function handleAddSession(data: {
    startedAt: string;
    endedAt: string;
    note: string;
    tipAmount: string;
  }) {
    setActionLoading(true);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startedAt: new Date(data.startedAt).toISOString(),
        endedAt: new Date(data.endedAt).toISOString(),
        note: data.note || null,
        tipAmount: data.tipAmount ? parseFloat(data.tipAmount) : 0,
      }),
    });

    if (!res.ok) {
      const result = await res.json();
      if (result.error === "too_short") {
        setToastMessage("You gotta work at least 20 minutes to get paid!");
        setActionLoading(false);
        return;
      }
    }

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

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-slow">
          <div className="w-12 h-12 bg-themed rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-themed">
            H
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const { h, m, s } = formatDuration(elapsed);

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Toast for too-short sessions */}
        {toastMessage && (
          <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
        )}

        {/* CheckOut Modal */}
        {showCheckOutModal && (
          <CheckOutModal
            onConfirm={handleCheckOut}
            onCancel={() => setShowCheckOutModal(false)}
            loading={actionLoading}
          />
        )}

        {/* Welcome */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="text-themed">{session.user?.name || "there"}</span> 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>

        {/* Check-in / Check-out */}
        <div className="glass rounded-2xl p-8 text-center animate-slide-up">
          {openSession ? (
            <>
              <TimerDisplay h={h} m={m} s={s} startedAt={openSession.startedAt} />
              <button
                onClick={() => setShowCheckOutModal(true)}
                disabled={actionLoading}
                className="w-full max-w-xs mx-auto block bg-gradient-to-r from-red-600 to-red-500 text-white py-4 rounded-2xl text-lg font-bold hover:from-red-500 hover:to-red-400 disabled:opacity-50 transition-all duration-300 shadow-lg shadow-red-600/25 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                🛑  Check Out
              </button>
            </>
          ) : (
            <>
              <div className="text-gray-400 mb-4 text-sm">Ready to start your shift?</div>
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="w-full max-w-xs mx-auto block btn-themed text-white py-6 rounded-2xl text-xl font-bold  disabled:opacity-50 transition-all duration-300 shadow-lg shadow-themed hover:shadow-brand-500/50 hover:scale-[1.02] active:scale-[0.98] animate-glow-themed"
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
              className="w-full glass-light border border-dashed border-themed/30 text-gray-400 py-4 rounded-2xl hover:border-brand-500 hover:text-themed transition-all duration-300 hover:shadow-lg hover:shadow-brand-600/10 group"
            >
              <span className="group-hover:scale-110 inline-block transition-transform">✨</span>
              <span className="ml-2">Add Session Manually</span>
            </button>
          ) : (
            <AddSessionForm
              onSubmit={handleAddSession}
              onCancel={() => setShowAddForm(false)}
              loading={actionLoading}
            />
          )}
        </div>

        {/* Recent Sessions */}
        <SessionList sessions={sessions} onDelete={handleDelete} />
      </main>
    </div>
  );
}
