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

  function formatHours(hours: number) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  }

  function exportToExcel() {
    const userName = sessionData?.user?.name || sessionData?.user?.email || "Employee";
    const formattedStart = format(new Date(startDate), "dd.MM.yyyy");
    const formattedEnd = format(new Date(endDate), "dd.MM.yyyy");

    // Build rows: title header first, then blank row, then data
    const titleRow = [`TIME SHEET - ${userName}`];
    const periodRow = [`${formattedStart} - ${formattedEnd}`];
    const blankRow: string[] = [];
    const headerRow = ["Date", "In", "Out", "Hours"];

    const dataRows = completedSessions.map((s) => [
      format(new Date(s.startedAt), "dd/MM/yy"),
      format(new Date(s.startedAt), "h:mm a"),
      s.endedAt ? format(new Date(s.endedAt), "h:mm a") : "",
      (Math.round(getHours(s) * 100) / 100).toString(),
    ]);

    // Total hours row
    const totalRow = ["", "", "Total Hours", formatHours(totalHours)];

    // Assemble all rows
    const allRows = [titleRow, periodRow, blankRow, headerRow, ...dataRows, blankRow, totalRow];

    // Optionally add salary section
    if (includeSalary) {
      allRows.push(
        ["", "", "Hourly Rate", `€${hourlyRate.toFixed(2)}`],
        ["", "", "Total Salary", `€${totalSalary.toFixed(2)}`],
      );
    }

    const ws = XLSX.utils.aoa_to_sheet(allRows);

    // Set column widths
    ws["!cols"] = [{ wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 12 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Time Sheet");
    XLSX.writeFile(wb, `timesheet_${startDate}_to_${endDate}.xlsx`);
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
              €{totalSalary.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="includeSalary"
              checked={includeSalary}
              onChange={(e) => setIncludeSalary(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="includeSalary" className="text-sm font-medium text-gray-700">
              Include salary in export
            </label>
          </div>
          <button
            onClick={exportToExcel}
            disabled={completedSessions.length === 0}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            Export to Excel
          </button>
        </div>

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
                      €{totalSalary.toFixed(2)}
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
