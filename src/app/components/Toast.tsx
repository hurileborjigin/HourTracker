"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({ message, onDismiss, duration = 5000 }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 pointer-events-none">
      <div
        className={`pointer-events-auto glass rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl shadow-brand-900/50 border border-brand-500/30 transition-all duration-300 ${
          visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        <div className="text-5xl mb-3 animate-bounce-gentle">😄</div>
        <p className="text-white font-semibold text-lg mb-1">Nice try!</p>
        <p className="text-gray-300 text-sm mb-4">{message}</p>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onDismiss, 300);
          }}
          className="px-6 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-500 transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
