"use client";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartChange: (val: string) => void;
  onEndChange: (val: string) => void;
}

export default function DateRangeFilter({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}: DateRangeFilterProps) {
  return (
    <div className="glass rounded-2xl p-4 sm:p-6 animate-slide-up">
      <h2 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm sm:text-base">
        <span>📅</span> Date Range
      </h2>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 shrink-0 w-10">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartChange(e.target.value)}
            className="px-2.5 py-2 bg-brand-950/50 border border-brand-700/50 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-white text-xs transition-all"
          />
        </div>
        <span className="text-gray-600 hidden sm:block">→</span>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 shrink-0 w-10">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndChange(e.target.value)}
            className="px-2.5 py-2 bg-brand-950/50 border border-brand-700/50 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-white text-xs transition-all"
          />
        </div>
      </div>
    </div>
  );
}
