"use client";

import { format, differenceInSeconds } from "date-fns";

interface WorkSession {
  id: string;
  startedAt: string;
  endedAt: string | null;
  note: string | null;
  tipAmount: number | null;
}

interface SessionListProps {
  sessions: WorkSession[];
  onDelete: (id: string) => void;
}

function sessionDuration(s: WorkSession) {
  if (!s.endedAt) return "In progress";
  const secs = differenceInSeconds(new Date(s.endedAt), new Date(s.startedAt));
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const sec = secs % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export default function SessionList({ sessions, onDelete }: SessionListProps) {
  return (
    <div className="glass rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <div className="px-6 py-4 border-b border-themed/20">
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
              className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-themed-muted/20 transition-colors animate-fade-in"
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
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs font-mono text-themed bg-themed-muted/40 px-2 py-0.5 rounded-md">
                    {sessionDuration(s)}
                  </span>
                  {(s.tipAmount ?? 0) > 0 && (
                    <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-md font-medium">
                      💰 €{(s.tipAmount ?? 0).toFixed(2)}
                    </span>
                  )}
                  {s.note && (
                    <span className="text-xs text-gray-500 truncate">
                      {s.note}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onDelete(s.id)}
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
  );
}
