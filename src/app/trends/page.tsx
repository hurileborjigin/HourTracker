"use client";

import { useSession } from "next-auth/react";
import { WorkSession } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
  format,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfWeek,
  endOfMonth,
  endOfYear,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
  differenceInSeconds,
  subMonths,
  subYears,
  isWithinInterval,
} from "date-fns";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Navbar from "../components/Navbar";


type Period = "weekly" | "monthly" | "yearly";

export default function TrendsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [hourlyRate, setHourlyRate] = useState(14);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("weekly");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    async function fetchData() {
      setLoading(true);
      const [sessionsRes, settingsRes] = await Promise.all([
        fetch("/api/sessions"),
        fetch("/api/settings"),
      ]);
      if (sessionsRes.ok) setSessions(await sessionsRes.json());
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setHourlyRate(data.hourlyRate);
      }
      setLoading(false);
    }
    fetchData();
  }, [status]);

  const completedSessions = useMemo(
    () => sessions.filter((s) => s.endedAt),
    [sessions]
  );

  const chartData = useMemo(() => {
    if (completedSessions.length === 0) return [];

    const dates = completedSessions.map((s) => new Date(s.startedAt));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    let intervals: { start: Date; end: Date; label: string }[] = [];

    if (period === "weekly") {
      const rangeStart = subMonths(maxDate, 3) > minDate ? subMonths(maxDate, 3) : minDate;
      const weeks = eachWeekOfInterval({ start: rangeStart, end: maxDate }, { weekStartsOn: 1 });
      intervals = weeks.map((w) => ({
        start: startOfWeek(w, { weekStartsOn: 1 }),
        end: endOfWeek(w, { weekStartsOn: 1 }),
        label: format(w, "MMM d"),
      }));
    } else if (period === "monthly") {
      const rangeStart = subYears(maxDate, 1) > minDate ? subYears(maxDate, 1) : minDate;
      const months = eachMonthOfInterval({ start: rangeStart, end: maxDate });
      intervals = months.map((m) => ({
        start: startOfMonth(m),
        end: endOfMonth(m),
        label: format(m, "MMM yyyy"),
      }));
    } else {
      const years = eachYearOfInterval({ start: minDate, end: maxDate });
      intervals = years.map((y) => ({
        start: startOfYear(y),
        end: endOfYear(y),
        label: format(y, "yyyy"),
      }));
    }

    return intervals.map(({ start, end, label }) => {
      const periodSessions = completedSessions.filter((s) =>
        isWithinInterval(new Date(s.startedAt), { start, end })
      );

      const hours = periodSessions.reduce((acc, s) => {
        return acc + differenceInSeconds(new Date(s.endedAt!), new Date(s.startedAt)) / 3600;
      }, 0);

      const tips = periodSessions.reduce((acc, s) => acc + (s.tipAmount ?? 0), 0);

      return {
        label,
        hours: Math.round(hours * 100) / 100,
        salary: Math.round(hours * hourlyRate * 100) / 100,
        tips: Math.round(tips * 100) / 100,
      };
    });
  }, [completedSessions, period, hourlyRate]);

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

  const periodBtnClass = (p: Period) =>
    `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      period === p
        ? "bg-themed-muted text-white shadow-lg shadow-themed"
        : "text-gray-400 hover:bg-themed-muted/40 hover:text-white"
    }`;

  const tooltipStyle = {
    contentStyle: {
      background: "rgba(20, 83, 45, 0.9)",
      border: "1px solid rgba(34, 197, 94, 0.3)",
      borderRadius: "12px",
      color: "#fff",
      fontSize: "13px",
    },
    itemStyle: { color: "#86efac" },
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>📈</span> Trends
          </h1>
          <p className="text-gray-400 text-sm mt-1">Visualize your work patterns over time</p>
        </div>

        {/* Period Toggle */}
        <div className="glass rounded-2xl p-4 flex gap-2 animate-slide-up">
          <button onClick={() => setPeriod("weekly")} className={periodBtnClass("weekly")}>
            Weekly
          </button>
          <button onClick={() => setPeriod("monthly")} className={periodBtnClass("monthly")}>
            Monthly
          </button>
          <button onClick={() => setPeriod("yearly")} className={periodBtnClass("yearly")}>
            Yearly
          </button>
        </div>

        {chartData.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-gray-500 animate-slide-up">
            <div className="text-4xl mb-3">📊</div>
            <div>No completed sessions yet. Start tracking to see trends!</div>
          </div>
        ) : (
          <>
            {/* Hours Chart */}
            <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span>⏱</span> Working Hours
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 197, 94, 0.1)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(34, 197, 94, 0.2)" }}
                    />
                    <YAxis
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(34, 197, 94, 0.2)" }}
                    />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="hours" fill="#4ade80" radius={[6, 6, 0, 0]} name="Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Salary Chart */}
            <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "0.15s" }}>
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span>💶</span> Salary Earned
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 197, 94, 0.1)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(34, 197, 94, 0.2)" }}
                    />
                    <YAxis
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(34, 197, 94, 0.2)" }}
                    />
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(value) => [`€${Number(value).toFixed(2)}`, "Salary"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="salary"
                      stroke="#86efac"
                      strokeWidth={2}
                      dot={{ fill: "#86efac", r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Salary"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tips Chart */}
            <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span>💰</span> Tips Earned
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 197, 94, 0.1)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(34, 197, 94, 0.2)" }}
                    />
                    <YAxis
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(34, 197, 94, 0.2)" }}
                    />
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(value) => [`€${Number(value).toFixed(2)}`, "Tips"]}
                    />
                    <Bar dataKey="tips" fill="#facc15" radius={[6, 6, 0, 0]} name="Tips" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
