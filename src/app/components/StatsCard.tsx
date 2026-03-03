"use client";

interface StatsCardProps {
  icon: string;
  label: string;
  value: string;
  className?: string;
}

export default function StatsCard({ icon, label, value, className = "" }: StatsCardProps) {
  return (
    <div className={`glass rounded-xl p-2.5 sm:p-4 text-center ${className}`}>
      <div className="text-[10px] sm:text-xs text-gray-400 mb-0.5">{icon} {label}</div>
      <div className="text-sm sm:text-lg font-bold text-brand-400 truncate">{value}</div>
    </div>
  );
}
