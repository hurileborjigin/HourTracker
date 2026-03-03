"use client";

interface StatsCardProps {
  icon: string;
  label: string;
  value: string;
  className?: string;
}

export default function StatsCard({ icon, label, value, className = "" }: StatsCardProps) {
  return (
    <div className={`glass rounded-2xl p-4 sm:p-6 text-center ${className}`}>
      <div className="text-xs sm:text-sm text-gray-400 mb-1">{icon} {label}</div>
      <div className="text-lg sm:text-xl font-bold text-brand-400 truncate">{value}</div>
    </div>
  );
}
