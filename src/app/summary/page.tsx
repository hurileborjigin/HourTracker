"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth, differenceInSeconds } from "date-fns";
import * as XLSX from "xlsx";
import Navbar from "../components/Navbar";
import DateRangeFilter from "../components/DateRangeFilter";
import StatsCard from "../components/StatsCard";

interface WorkSession {
  id: string;
  startedAt: string;
  endedAt: string | null;
  note: string | null;
  tipAmount: number | null;
}

export default function SummaryPage() {
  const { data: sessionData, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [hourlyRate, setHourlyRate] = useState(14);
  const [loading, setLoading] = useState(true);
  const [includeSalary, setIncludeSalary] = useState(false);
  const [startDate, setStartDate] = useState(() =>
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(() =>
    format(endOfMonth(new Date()), "yyyy-MM-dd")
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchData() {
      setLoading(true);
      const endOfDay = `${endDate}T23:59:59.999Z`;
      const startOfDay = `${startDate}T00:00:00.000Z`;

      const [sessionsRes, settingsRes] = await Promise.all([
        fetch(`/api/sessions?start=${startOfDay}&end=${endOfDay}`),
        fetch("/api/settings"),
      ]);

      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        setSessions(data);
      }
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setHourlyRate(data.hourlyRate);
      }
      setLoading(false);
    }

    fetchData();
  }, [status, startDate, endDate]);

  function getHours(s: WorkSession) {
    if (!s.endedAt) return 0;
    return differenceInSeconds(new Date(s.endedAt), new Date(s.startedAt)) / 3600;
  }

  const completedSessions = sessions.filter((s) => s.endedAt);
  const totalHours = completedSessions.reduce((acc, s) => acc + getHours(s), 0);
  const totalSalary = totalHours * hourlyRate;
  const totalTips = completedSessions.reduce((acc, s) => acc + (s.tipAmount ?? 0), 0);

  function formatHours(hours: number) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  }

  function exportToExcel() {
    const userName = sessionData?.user?.name || sessionData?.user?.email || "Employee";
    const formattedStart = format(new Date(startDate), "dd.MM.yyyy");
    const formattedEnd = format(new Date(endDate), "dd.MM.yyyy");

    const titleRow = [`TIME SHEET - ${userName}`];
    const periodRow = [`${formattedStart} - ${formattedEnd}`];
    const blankRow: string[] = [];
    const headerRow = ["Date", "In", "Out", "Hours", "Tip"];

    const dataRows = completedSessions.map((s) => [
      format(new Date(s.startedAt), "dd/MM/yy"),
      format(new Date(s.startedAt), "h:mm a"),
      s.endedAt ? format(new Date(s.endedAt), "h:mm a") : "",
      (Math.round(getHours(s) * 100) / 100).toString(),
      (s.tipAmount ?? 0) > 0 ? `€${(s.tipAmount ?? 0).toFixed(2)}` : "",
    ]);

    const totalRow = ["", "", "Total Hours", formatHours(totalHours), ""];
    const tipsRow = ["", "", "Total Tips", "", `€${totalTips.toFixed(2)}`];
    const allRows = [titleRow, periodRow, blankRow, headerRow, ...dataRows, blankRow, totalRow, tipsRow];

    if (includeSalary) {
      allRows.push(
        ["", "", "Hourly Rate", `€${hourlyRate.toFixed(2)}`, ""],
        ["", "", "Total Salary", `€${totalSalary.toFixed(2)}`, ""],
      );
    }

    const ws = XLSX.utils.aoa_to_sheet(allRows);
    ws["!cols"] = [{ wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 12 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Time Sheet");
    XLSX.writeFile(wb, `timesheet_${startDate}_to_${endDate}.xlsx`);
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse-slow">
            <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/30">
              H
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Page Title */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>📊</span> Summary
          </h1>
          <p className="text-gray-400 text-sm mt-1">View your hours and export timesheets</p>
        </div>

        {/* Date Range */}
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
        />

        {/* Totals */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <StatsCard icon="⏱" label="Hours" value={formatHours(totalHours)} />
          <StatsCard icon="💶" label="Salary" value={`€${totalSalary.toFixed(2)}`} />
          <StatsCard icon="💰" label="Tips" value={`€${totalTips.toFixed(2)}`} />
        </div>

        {/* Export Options */}
        <div className="glass rounded-2xl p-6 space-y-4 animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="includeSalary"
              checked={includeSalary}
              onChange={(e) => setIncludeSalary(e.target.checked)}
              className="w-4 h-4 rounded bg-brand-950 border-brand-700 text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
            />
            <label htmlFor="includeSalary" className="text-sm font-medium text-gray-300">
              Include salary in export
            </label>
          </div>
          <button
            onClick={exportToExcel}
            disabled={completedSessions.length === 0}
            className="w-full bg-gradient-to-r from-brand-600 to-brand-500 text-white py-3.5 rounded-xl font-semibold hover:from-brand-500 hover:to-brand-400 disabled:opacity-50 transition-all duration-300 shadow-lg shadow-brand-600/25 hover:shadow-brand-500/40 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span>📥</span> Export to Excel
          </button>
        </div>

        {/* Sessions Table */}
        <div className="glass rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="px-6 py-4 border-b border-brand-800/50">
            <h2 className="font-semibold text-white">
              Sessions ({completedSessions.length})
            </h2>
          </div>
          {completedSessions.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <div className="text-4xl mb-3">📭</div>
              <div>No completed sessions in this range.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-brand-900/50 text-gray-400">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Start</th>
                    <th className="px-4 py-3 text-left font-medium">End</th>
                    <th className="px-4 py-3 text-right font-medium">Hours</th>
                    <th className="px-4 py-3 text-right font-medium">Tip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-800/30">
                  {completedSessions.map((s, i) => (
                    <tr key={s.id} className="hover:bg-brand-800/20 transition-colors animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                      <td className="px-4 py-3 text-gray-200 font-medium">
                        {format(new Date(s.startedAt), "MMM d")}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {format(new Date(s.startedAt), "h:mm a")}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {s.endedAt && format(new Date(s.endedAt), "h:mm a")}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-brand-400">
                        {getHours(s).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-yellow-400">
                        {(s.tipAmount ?? 0) > 0 ? `€${(s.tipAmount ?? 0).toFixed(2)}` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-brand-900/50 font-semibold">
                  <tr>
                    <td className="px-4 py-3 text-white" colSpan={3}>
                      Total
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-brand-300">
                      {totalHours.toFixed(2)}h
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-yellow-400">
                      €{totalTips.toFixed(2)}
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
