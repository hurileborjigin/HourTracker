"use client";

import { useState } from "react";

interface AddSessionFormProps {
  onSubmit: (data: { startedAt: string; endedAt: string; note: string; tipAmount: string }) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export default function AddSessionForm({ onSubmit, onCancel, loading }: AddSessionFormProps) {
  const [addStart, setAddStart] = useState("");
  const [addEnd, setAddEnd] = useState("");
  const [addNote, setAddNote] = useState("");
  const [addTip, setAddTip] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!addStart || !addEnd) return;
    await onSubmit({
      startedAt: addStart,
      endedAt: addEnd,
      note: addNote,
      tipAmount: addTip,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Tip amount (€)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={addTip}
              onChange={(e) => setAddTip(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 bg-brand-950/50 border border-brand-700/50 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-white transition-all"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-brand-600 to-brand-500 text-white py-3 rounded-xl font-semibold hover:from-brand-500 hover:to-brand-400 disabled:opacity-50 transition-all duration-300 shadow-lg shadow-brand-600/20"
        >
          Save Session
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 rounded-xl border border-brand-700/50 text-gray-400 hover:bg-brand-800/40 hover:text-gray-200 transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
