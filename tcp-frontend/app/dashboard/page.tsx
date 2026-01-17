"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FaBolt,
  FaTrophy,
  FaKeyboard,
  FaChartLine,
  FaArrowRight,
  FaFire,
  FaMedal,
} from "react-icons/fa";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/api";

interface Stats {
  totalRaces: number;
  bestWpm: number;
  averageWpm: number;
  averageAccuracy: number;
}
interface RecentRace {
  raceId: string;
  wpm: number;
  accuracy: number;
  rank: number;
  createdAt: string;
}
interface StatsData {
  user: { username: string; email: string; stats: Stats };
  recentRaces: RecentRace[];
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.role === "admin") {
      router.push("/admin/dashboard");
      return;
    }
    fetchStats();
  }, [isAuthenticated, user]);

  async function fetchStats() {
    try {
      const res = await api.get("/stats/me");
      setStatsData(res.data);
    } catch {
      toast.error("Failed to load stats");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const stats = statsData?.user?.stats;
  const races = statsData?.recentRaces || [];
  const bestRace = races.reduce(
    (best, r) => (r.wpm > (best?.wpm || 0) ? r : best),
    races[0],
  );
  const accuracyTrend =
    races.length >= 2
      ? races[0].accuracy - races[races.length - 1].accuracy
      : 0;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">
              Your Performance
            </p>
            <h1
              className="font-bold text-4xl text-gray-900"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              {user?.username}
            </h1>
          </div>
          <div className="flex gap-3">
            <Link
              href="/race/quick"
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl px-5 py-3 font-bold text-sm transition-colors shadow-md shadow-sky-200"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              <FaBolt /> Quick Race
            </Link>
            <Link
              href="/championships"
              className="inline-flex items-center gap-2 bg-white border-2 border-gray-100 hover:border-sky-200 text-gray-700 rounded-2xl px-5 py-3 font-bold text-sm transition-all"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              <FaTrophy className="text-sky-500" /> Championships
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-5 mb-5">
          <div className="col-span-12 md:col-span-5 bg-sky-500 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-sky-400/30 -translate-y-10 translate-x-10" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-sky-600/30 translate-y-8 -translate-x-6" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <FaBolt className="text-sky-200 text-sm" />
                <span className="text-sky-100 text-sm font-medium">
                  Personal Best
                </span>
              </div>
              <p
                className="font-bold text-white mb-1"
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: "5rem",
                  lineHeight: 1,
                }}
              >
                {stats?.bestWpm ?? 0}
              </p>
              <p className="text-sky-200 text-lg font-medium">
                words per minute
              </p>
              <div className="mt-8 pt-6 border-t border-sky-400/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sky-200 text-xs mb-1">Average WPM</p>
                    <p
                      className="text-white font-bold text-2xl"
                      style={{ fontFamily: "Syne, sans-serif" }}
                    >
                      {stats?.averageWpm ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sky-200 text-xs mb-1">Avg Accuracy</p>
                    <p
                      className="text-white font-bold text-2xl"
                      style={{ fontFamily: "Syne, sans-serif" }}
                    >
                      {stats?.averageAccuracy ?? 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sky-200 text-xs mb-1">Total Races</p>
                    <p
                      className="text-white font-bold text-2xl"
                      style={{ fontFamily: "Syne, sans-serif" }}
                    >
                      {stats?.totalRaces ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-7 grid grid-cols-2 gap-5">
            <div className="bg-white rounded-3xl p-6 border-2 border-gray-50 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm font-medium">
                  Accuracy Trend
                </span>
                <div
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${accuracyTrend >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}
                >
                  {accuracyTrend >= 0 ? "↑" : "↓"} {Math.abs(accuracyTrend)}%
                </div>
              </div>
              <div>
                <p
                  className="font-bold text-4xl text-gray-900 mb-1"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {stats?.averageAccuracy ?? 0}%
                </p>
                <p className="text-gray-400 text-xs">
                  last {races.length} races
                </p>
              </div>
              <div className="flex gap-1 mt-4">
                {races
                  .slice(0, 8)
                  .reverse()
                  .map((r, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-sky-500 rounded-sm"
                      style={{
                        height: `${(r.accuracy / 100) * 40}px`,
                        opacity: 0.3 + i / 10,
                      }}
                    />
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border-2 border-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <FaFire className="text-orange-400 text-sm" />
                <span className="text-gray-400 text-sm font-medium">
                  Best Race
                </span>
              </div>
              {bestRace ? (
                <>
                  <p
                    className="font-bold text-4xl text-gray-900 mb-1"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    {bestRace.wpm}{" "}
                    <span className="text-lg text-gray-400 font-normal">
                      wpm
                    </span>
                  </p>
                  <p className="text-gray-400 text-xs mb-4">
                    {bestRace.accuracy}% accuracy
                  </p>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-orange-400 h-1.5 rounded-full"
                      style={{
                        width: `${Math.min((bestRace.wpm / 200) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-gray-300 text-xs mt-2">
                    {new Date(bestRace.createdAt).toLocaleDateString()}
                  </p>
                </>
              ) : (
                <p className="text-gray-300 text-sm mt-4">No races yet</p>
              )}
            </div>

            <div className="col-span-2 bg-white rounded-3xl p-6 border-2 border-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <FaChartLine className="text-sky-500 text-sm" />
                <span className="text-gray-400 text-sm font-medium">
                  WPM History
                </span>
              </div>
              {races.length > 0 ? (
                <div className="flex items-end gap-2 h-12">
                  {races
                    .slice(0, 10)
                    .reverse()
                    .map((r, i) => {
                      const maxWpm = Math.max(...races.map((x) => x.wpm));
                      const height = maxWpm > 0 ? (r.wpm / maxWpm) * 100 : 10;
                      return (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center gap-1"
                        >
                          <div
                            className="w-full bg-sky-500 rounded-t-sm transition-all"
                            style={{
                              height: `${height}%`,
                              minHeight: "4px",
                              opacity: 0.4 + i / 12,
                            }}
                          />
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="h-12 flex items-center">
                  <p className="text-gray-300 text-sm">
                    Race to see your history
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 lg:col-span-7 bg-white rounded-3xl border-2 border-gray-50 overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between border-b-2 border-gray-50">
              <div className="flex items-center gap-2">
                <FaMedal className="text-sky-500 text-sm" />
                <h2
                  className="font-bold text-gray-900"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  Recent Races
                </h2>
              </div>
              <Link
                href="/stats"
                className="text-sky-500 text-xs font-semibold hover:text-sky-600 flex items-center gap-1"
              >
                Leaderboard <FaArrowRight className="text-xs" />
              </Link>
            </div>

            {races.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <FaKeyboard className="text-gray-200 text-5xl mb-4" />
                <p className="text-gray-400 font-medium mb-1">No races yet</p>
                <Link
                  href="/race/quick"
                  className="text-sky-500 text-sm font-semibold hover:text-sky-600 mt-2"
                >
                  Start your first race →
                </Link>
              </div>
            ) : (
              <div>
                {races.map((race, i) => {
                  const isTop = race.rank === 1;
                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0 ${isTop ? "bg-sky-50/50" : ""}`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold ${isTop ? "bg-sky-500 text-white" : "bg-gray-100 text-gray-400"}`}
                        >
                          {race.rank ? `#${race.rank}` : "-"}
                        </div>
                        <div>
                          <p className="text-gray-900 font-bold text-base">
                            {race.wpm}{" "}
                            <span className="text-gray-400 text-xs font-normal">
                              WPM
                            </span>
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="w-16 bg-gray-100 rounded-full h-1">
                              <div
                                className="bg-sky-400 h-1 rounded-full"
                                style={{ width: `${race.accuracy}%` }}
                              />
                            </div>
                            <span className="text-gray-400 text-xs">
                              {race.accuracy}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-gray-300 text-xs">
                        {new Date(race.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
            <div className="bg-white rounded-3xl border-2 border-gray-50 p-6">
              <h2
                className="font-bold text-gray-900 mb-5"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Quick Actions
              </h2>
              <div className="flex flex-col gap-3">
                <Link
                  href="/race/quick"
                  className="flex items-center justify-between p-4 bg-sky-50 hover:bg-sky-100 rounded-2xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
                      <FaBolt className="text-white text-sm" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold text-sm">
                        Quick Race
                      </p>
                      <p className="text-gray-400 text-xs">
                        Random words, instant start
                      </p>
                    </div>
                  </div>
                  <FaArrowRight className="text-sky-400 text-xs group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/championships"
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center">
                      <FaTrophy className="text-white text-sm" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold text-sm">
                        Championships
                      </p>
                      <p className="text-gray-400 text-xs">
                        Compete in organized races
                      </p>
                    </div>
                  </div>
                  <FaArrowRight className="text-gray-300 text-xs group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/stats"
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-400 rounded-xl flex items-center justify-center">
                      <FaChartLine className="text-white text-sm" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold text-sm">
                        Leaderboard
                      </p>
                      <p className="text-gray-400 text-xs">
                        See the global rankings
                      </p>
                    </div>
                  </div>
                  <FaArrowRight className="text-gray-300 text-xs group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-3xl border-2 border-gray-50 p-6">
              <h2
                className="font-bold text-gray-900 mb-5"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Progress Overview
              </h2>
              <div className="flex flex-col gap-4">
                {[
                  {
                    label: "Best WPM",
                    value: stats?.bestWpm ?? 0,
                    max: 200,
                    color: "bg-sky-500",
                  },
                  {
                    label: "Avg WPM",
                    value: stats?.averageWpm ?? 0,
                    max: 200,
                    color: "bg-blue-400",
                  },
                  {
                    label: "Avg Accuracy",
                    value: stats?.averageAccuracy ?? 0,
                    max: 100,
                    color: "bg-green-400",
                    suffix: "%",
                  },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-500 text-sm">
                        {item.label}
                      </span>
                      <span className="text-gray-900 font-bold text-sm">
                        {item.value}
                        {item.suffix || ""}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all`}
                        style={{
                          width: `${Math.min((item.value / item.max) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
