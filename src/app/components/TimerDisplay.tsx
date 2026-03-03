"use client";

import { format } from "date-fns";

interface TimerDisplayProps {
  h: number;
  m: number;
  s: number;
  startedAt: string;
}

export default function TimerDisplay({ h, m, s, startedAt }: TimerDisplayProps) {
  return (
    <>
      {/* Live pulsing indicator */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
        </span>
        <span className="text-sm text-brand-300 font-medium">
          Clocked in since {format(new Date(startedAt), "h:mm a")}
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
    </>
  );
}
