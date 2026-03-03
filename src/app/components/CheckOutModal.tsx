"use client";

import { useState } from "react";

interface CheckOutModalProps {
  onConfirm: (tipAmount: number) => void;
  onCancel: () => void;
  loading: boolean;
}

export default function CheckOutModal({ onConfirm, onCancel, loading }: CheckOutModalProps) {
  const [tip, setTip] = useState("");

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative glass rounded-2xl p-6 max-w-sm w-full animate-slide-up shadow-2xl border border-brand-500/20">
        <h3 className="text-lg font-bold text-white mb-1">Ready to check out?</h3>
        <p className="text-gray-400 text-sm mb-4">Did you get any tips today?</p>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1.5 text-gray-300">
            Tip amount (optional)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-3 py-2.5 bg-brand-950/50 border border-brand-700/50 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-white transition-all"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onConfirm(tip ? parseFloat(tip) : 0)}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white py-3 rounded-xl font-semibold hover:from-red-500 hover:to-red-400 disabled:opacity-50 transition-all duration-300 shadow-lg shadow-red-600/20"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Checking out...
              </span>
            ) : "Check Out"}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-3 rounded-xl border border-brand-700/50 text-gray-400 hover:bg-brand-800/40 hover:text-gray-200 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
