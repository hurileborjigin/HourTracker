"use client";

import { useState } from "react";

interface StatsCardProps {
  icon: string;
  label: string;
  value: string;
  className?: string;
  hideable?: boolean;
}

export default function StatsCard({ icon, label, value, className = "", hideable = false }: StatsCardProps) {
  const [hidden, setHidden] = useState(false);

  return (
    <div
      className={`glass rounded-xl p-2.5 sm:p-4 text-center ${hideable ? "cursor-pointer select-none active:scale-[0.97]" : ""} transition-transform ${className}`}
      onClick={hideable ? () => setHidden(!hidden) : undefined}
    >
      <div className="text-[10px] sm:text-xs text-gray-400 mb-0.5">{icon} {label}</div>
      <div className="text-sm sm:text-lg font-bold text-themed truncate transition-all duration-200">
        {hidden ? "••••" : value}
      </div>
    </div>
  );
}
