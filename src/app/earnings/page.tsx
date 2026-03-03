"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth, differenceInSeconds } from "date-fns";
import Navbar from "../components/Navbar";
import DateRangeFilter from "../components/DateRangeFilter";
import StatsCard from "../components/StatsCard";

interface WorkSession {
  id: string;
  startedAt: string;
  endedAt: string | null;
  tipAmount: number | null;
}

export default function EarningsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [allSessions, setAllSessions] = useState<WorkSession[]>([]);
  const [periodSessions, setPeriodSessions] = useState<WorkSession[]>([]);
  const [hourlyRate, setHourlyRate] = useState(14);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() =>
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(() =>
    format(endOfMonth(new Date()), "yyyy-MM-dd")
  );

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Fetch all sessions (for all-time totals) + settings
  useEffect(() => {
    if (status !== "authenticated") return;
    async function fetchAll() {
      const [sessionsRes, settingsRes] = await Promise.all([
        fetch("/api/sessions"),
        fetch("/api/settings"),
      ]);
      if (sessionsRes.ok) setAllSessions(await sessionsRes.json());
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setHourlyRate(data.hourlyRate);
      }
    }
    fetchAll();
  }, [status]);

  // Fetch period sessions
  useEffect(() => {
    if (status !== "authenticated") return;
    async function fetchPeriod() {
      setLoading(true);
      const res = await fetch(
        `/api/sessions?start=${startDate}T00:00:00.000Z&end=${endDate}T23:59:59.999Z`
      );
      if (res.ok) setPeriodSessions(await res.json());
      setLoading(false);
    }
    fetchPeriod();
  }, [status, startDate, endDate]);

  function getHours(s: WorkSession) {
    if (!s.endedAt) return 0;
    return differenceInSeconds(new Date(s.endedAt), new Date(s.startedAt)) / 3600;
  }

  function formatHours(hours: number) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  }

  const allCompleted = allSessions.filter((s) => s.endedAt);
  const allTotalHours = allCompleted.reduce((a, s) => a + getHours(s), 0);
  const allTotalSalary = allTotalHours * hourlyRate;
  const allTotalTips = allCompleted.reduce((a, s) => a + (s.tipAmount ?? 0), 0);

  const periodCompleted = periodSessions.filter((s) => s.endedAt);
  const periodTotalHours = periodCompleted.reduce((a, s) => a + getHours(s), 0);
  const periodTotalSalary = periodTotalHours * hourlyRate;
  const periodTotalTips = periodCompleted.reduce((a, s) => a + (s.tipAmount ?? 0), 0);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse-slow">
            <div className="w-12 h-12 bg-themed rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-themed">
              H
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>💰</span> Earnings
          </h1>
          <p className="text-gray-400 text-sm mt-1">Your complete earnings breakdown</p>
        </div>

        {/* All-Time Summary */}
        <div className="animate-slide-up">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">All Time</h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <StatsCard icon="💶" label="Salary" value={`€${allTotalSalary.toFixed(2)}`} />
            <StatsCard icon="💰" label="Tips" value={`€${allTotalTips.toFixed(2)}`} />
            <div className="glass rounded-xl p-2.5 sm:p-4 text-center">
              <div className="text-[10px] sm:text-xs text-gray-400 mb-0.5">🏦 Total</div>
              <div className="text-sm sm:text-lg font-bold text-themed-light">
                €{(allTotalSalary + allTotalTips).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
        />

        {/* Period Summary */}
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Selected Period</h2>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            <StatsCard icon="⏱" label="Hours" value={formatHours(periodTotalHours)} />
            <StatsCard icon="💶" label="Salary" value={`€${periodTotalSalary.toFixed(2)}`} />
            <StatsCard icon="💰" label="Tips" value={`€${periodTotalTips.toFixed(2)}`} />
            <div className="glass rounded-xl p-2.5 sm:p-4 text-center">
              <div className="text-[10px] sm:text-xs text-gray-400 mb-0.5">🏦 Total</div>
              <div className="text-sm sm:text-lg font-bold text-themed-light">
                €{(periodTotalSalary + periodTotalTips).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Per-session breakdown table */}
        <div className="glass rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <div className="px-6 py-4 border-b border-themed/20">
            <h2 className="font-semibold text-white">
              Session Breakdown ({periodCompleted.length})
            </h2>
          </div>
          {periodCompleted.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <div className="text-4xl mb-3">📭</div>
              <div>No completed sessions in this period.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-black/20 text-gray-400">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-right font-medium">Hours</th>
                    <th className="px-4 py-3 text-right font-medium">Salary</th>
                    <th className="px-4 py-3 text-right font-medium">Tip</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-800/30">
                  {periodCompleted.map((s, i) => {
                    const hours = getHours(s);
                    const salary = hours * hourlyRate;
                    const tip = s.tipAmount ?? 0;
                    return (
                      <tr
                        key={s.id}
                        className="hover:bg-themed-muted/20 transition-colors animate-fade-in"
                        style={{ animationDelay: `${i * 0.03}s` }}
                      >
                        <td className="px-4 py-3 text-gray-200 font-medium">
                          {format(new Date(s.startedAt), "MMM d")}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-themed">
                          {hours.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-themed-light">
                          €{salary.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-yellow-400">
                          {tip > 0 ? `€${tip.toFixed(2)}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-white font-semibold">
                          €{(salary + tip).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-black/20 font-semibold">
                  <tr>
                    <td className="px-4 py-3 text-white">Total</td>
                    <td className="px-4 py-3 text-right font-mono text-themed">
                      {periodTotalHours.toFixed(2)}h
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-themed-light">
                      €{periodTotalSalary.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-yellow-400">
                      €{periodTotalTips.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-white">
                      €{(periodTotalSalary + periodTotalTips).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
