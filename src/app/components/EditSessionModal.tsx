import { WorkSession } from "@/lib/types";
"use client";

import { useState } from "react";
import { format } from "date-fns";


interface EditSessionModalProps {
  session: WorkSession;
  onClose: () => void;
  onSave: (id: string, data: { startedAt: string; endedAt: string | null; note: string; tipAmount: number }) => Promise<boolean>;
}

export default function EditSessionModal({ session, onClose, onSave }: EditSessionModalProps) {
  const [startedAt, setStartedAt] = useState(
    format(new Date(session.startedAt), "yyyy-MM-dd'T'HH:mm")
  );
  const [endedAt, setEndedAt] = useState(
    session.endedAt ? format(new Date(session.endedAt), "yyyy-MM-dd'T'HH:mm") : ""
  );
  const [note, setNote] = useState(session.note || "");
  const [tipAmount, setTipAmount] = useState(
    (session.tipAmount ?? 0) > 0 ? (session.tipAmount ?? 0).toString() : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const success = await onSave(session.id, {
      startedAt: new Date(startedAt).toISOString(),
      endedAt: endedAt ? new Date(endedAt).toISOString() : null,
      note,
      tipAmount: tipAmount ? parseFloat(tipAmount) : 0,
    });

    setSaving(false);
    if (success) {
      onClose();
    } else {
      setError("Session must be at least 20 minutes");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative glass rounded-2xl p-6 w-full max-w-sm animate-slide-up">
        <h3 className="font-semibold text-lg text-white mb-4 flex items-center gap-2">
          <span>✏️</span> Edit Session
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-300">Start</label>
            <input
              type="datetime-local"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              required
              className="w-full px-3 py-2 bg-black/20 border border-themed/30 rounded-xl focus:ring-2 focus:ring-current outline-none text-white text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-gray-300">End</label>
            <input
              type="datetime-local"
              value={endedAt}
              onChange={(e) => setEndedAt(e.target.value)}
              className="w-full px-3 py-2 bg-black/20 border border-themed/30 rounded-xl focus:ring-2 focus:ring-current outline-none text-white text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-gray-300">Tip (€)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-black/20 border border-themed/30 rounded-xl focus:ring-2 focus:ring-current outline-none text-white text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-gray-300">Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note"
              className="w-full px-3 py-2 bg-black/20 border border-themed/30 rounded-xl focus:ring-2 focus:ring-current outline-none text-white text-sm transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-2.5 rounded-xl">
              😄 {error}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-themed text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 shadow-lg shadow-themed text-sm"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Saving...
                </span>
              ) : "💾 Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-themed/30 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
