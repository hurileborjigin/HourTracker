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
    <div className="glass rounded-2xl p-6 animate-slide-up">
      <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
        <span>📅</span> Date Range
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-300">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-brand-950/50 border border-brand-700/50 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-white text-sm transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-300">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-brand-950/50 border border-brand-700/50 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-white text-sm transition-all"
          />
        </div>
      </div>
    </div>
  );
}
