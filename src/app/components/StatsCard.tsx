"use client";

import { useState } from "react";

interface StatsCardProps {
  icon: string;
  label: string;
  value: string;
  className?: string;
  hideable?: boolean;
  externalHidden?: boolean;
}

export default function StatsCard({ icon, label, value, className = "", hideable = false, externalHidden }: StatsCardProps) {
  const [internalHidden, setInternalHidden] = useState(hideable);
  const hidden = externalHidden !== undefined ? externalHidden : internalHidden;

  return (
    <div
      className={`glass rounded-xl p-2.5 sm:p-4 text-center ${hideable && externalHidden === undefined ? "cursor-pointer select-none active:scale-[0.97]" : ""} transition-transform ${className}`}
      onClick={hideable && externalHidden === undefined ? () => setInternalHidden(!internalHidden) : undefined}
    >
      <div className="text-[10px] sm:text-xs text-gray-400 mb-0.5">{icon} {label}</div>
      <div className="text-sm sm:text-lg font-bold text-themed truncate transition-all duration-200">
        {hidden ? "👾" : value}
      </div>
    </div>
  );
}
