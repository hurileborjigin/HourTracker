"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth, differenceInSeconds } from "date-fns";
import * as XLSX from "xlsx";
import Navbar from "../components/Navbar";

interface WorkSession {
  id: string;
  startedAt: string;
  endedAt: string | null;
  note: string | null;
}

export default function SummaryPage() {
  const { status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [hourlyRate, setHourlyRate] = useState(14);
  const [loading, setLoading] = useState(true);
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

  function formatHours(hours: number) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  }

  function exportToExcel() {
    const rows = completedSessions.map((s) => ({
      Date: format(new Date(s.startedAt), "yyyy-MM-dd"),
      Start: format(new Date(s.startedAt), "HH:mm"),
      End: s.endedAt ? format(new Date(s.endedAt), "HH:mm") : "",
      Hours: Math.round(getHours(s) * 100) / 100,
      Note: s.note || "",
    }));

    rows.push({
      Date: "",
      Start: "",
      End: "TOTAL",
      Hours: Math.round(totalHours * 100) / 100,
      Note: `$${totalSalary.toFixed(2)} (@ $${hourlyRate}/hr)`,
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Work Sessions");
    XLSX.writeFile(wb, `hours_${startDate}_to_${endDate}.xlsx`);
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Date Range */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-semibold text-lg mb-4">Date Range</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-sm text-gray-500 mb-1">Total Hours</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatHours(totalHours)}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-sm text-gray-500 mb-1">Total Salary</div>
            <div className="text-2xl font-bold text-green-600">
              ${totalSalary.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Export */}
        <button
          onClick={exportToExcel}
          disabled={completedSessions.length === 0}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          Export to Excel
        </button>

        {/* Sessions Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-lg">
              Sessions ({completedSessions.length})
            </h2>
          </div>
          {completedSessions.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400">
              No completed sessions in this range.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Start</th>
                    <th className="px-4 py-3 text-left">End</th>
                    <th className="px-4 py-3 text-right">Hours</th>
                    <th className="px-4 py-3 text-left">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {completedSessions.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {format(new Date(s.startedAt), "MMM d")}
                      </td>
                      <td className="px-4 py-3">
                        {format(new Date(s.startedAt), "h:mm a")}
                      </td>
                      <td className="px-4 py-3">
                        {s.endedAt && format(new Date(s.endedAt), "h:mm a")}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {getHours(s).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate">
                        {s.note || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold">
                  <tr>
                    <td className="px-4 py-3" colSpan={3}>
                      Total
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {totalHours.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-green-600">
                      ${totalSalary.toFixed(2)}
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
