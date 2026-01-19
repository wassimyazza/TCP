"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FaTrophy,
  FaUsers,
  FaPlay,
  FaPlus,
  FaChartBar,
  FaClock,
  FaArrowRight,
  FaBolt,
  FaCheckCircle,
} from "react-icons/fa";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/api";

interface Championship {
  _id: string;
  name: string;
  status: string;
}
interface Group {
  _id: string;
  name: string;
  championship: any;
  scheduledAt: string;
  maxPlayers: number;
  players: any[];
  status: string;
}
interface GlobalStats {
  totalUsers: number;
  totalRaces: number;
  topUser: any;
}

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [championships, setChampionships] = useState<Championship[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }, [isAuthenticated, user]);

  async function fetchData() {
    try {
      const [champsRes, groupsRes, statsRes] = await Promise.all([
        api.get("/championships"),
        api.get("/groups"),
        api.get("/stats/global"),
      ]);
      setChampionships(champsRes.data);
      setGroups(groupsRes.data);
      setGlobalStats(statsRes.data);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const activeChampionships = championships.filter(
    (c) => c.status === "active",
  );
  const waitingGroups = groups.filter((g) => g.status === "waiting");
  const inProgressGroups = groups.filter((g) => g.status === "in_progress");
  const finishedGroups = groups.filter((g) => g.status === "finished");

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 rounded-full px-3 py-1 text-xs font-semibold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              Administrator
            </div>
            <h1
              className="font-bold text-4xl text-gray-900"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Control Center
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage competitions and monitor live races
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/groups"
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl px-5 py-3 font-bold text-sm transition-colors shadow-md shadow-sky-200"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              <FaPlus className="text-xs" /> New Group
            </Link>
            <Link
              href="/admin/championships"
              className="inline-flex items-center gap-2 bg-white border-2 border-gray-100 hover:border-sky-200 text-gray-700 rounded-2xl px-5 py-3 font-bold text-sm transition-all"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              <FaTrophy className="text-sky-500 text-xs" /> Championships
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Players",
              value: globalStats?.totalUsers ?? 0,
              icon: <FaUsers className="text-white text-sm" />,
              bg: "bg-sky-500",
              desc: "registered accounts",
            },
            {
              label: "Races Completed",
              value: globalStats?.totalRaces ?? 0,
              icon: <FaCheckCircle className="text-white text-sm" />,
              bg: "bg-green-500",
              desc: "all time",
            },
            {
              label: "Active Championships",
              value: activeChampionships.length,
              icon: <FaTrophy className="text-white text-sm" />,
              bg: "bg-amber-400",
              desc: "currently open",
            },
            {
              label: "Groups Waiting",
              value: waitingGroups.length,
              icon: <FaClock className="text-white text-sm" />,
              bg: "bg-blue-500",
              desc: "ready to race",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border-2 border-gray-50 p-5 flex items-start gap-4"
            >
              <div
                className={`w-10 h-10 ${card.bg} rounded-2xl flex items-center justify-center shrink-0`}
              >
                {card.icon}
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">{card.label}</p>
                <p
                  className="font-bold text-2xl text-gray-900"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {card.value}
                </p>
                <p className="text-gray-300 text-xs mt-0.5">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {inProgressGroups.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h2
                  className="font-bold text-gray-900"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  Live Now
                </h2>
              </div>
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {inProgressGroups.length} racing
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {inProgressGroups.map((group) => (
                <div
                  key={group._id}
                  className="bg-white rounded-3xl border-2 border-red-100 p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                      <FaBolt className="text-red-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-gray-900 font-bold">{group.name}</p>
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold animate-pulse">
                          LIVE
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs">
                        {group.championship?.name} · {group.players.length}{" "}
                        players racing
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/race/${group._id}`)}
                    className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold transition-colors cursor-pointer border-none"
                  >
                    <FaChartBar className="text-xs" /> Monitor
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 lg:col-span-7 bg-white rounded-3xl border-2 border-gray-50 overflow-hidden">
            <div className="px-6 py-5 border-b-2 border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaClock className="text-sky-500 text-sm" />
                <h2
                  className="font-bold text-gray-900"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  Upcoming Races
                  <span className="ml-2 text-gray-300 font-normal text-base">
                    ({waitingGroups.length})
                  </span>
                </h2>
              </div>
              <Link
                href="/admin/groups"
                className="text-sky-500 text-xs font-semibold hover:text-sky-600 flex items-center gap-1"
              >
                All groups <FaArrowRight className="text-xs" />
              </Link>
            </div>

            {waitingGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <FaClock className="text-gray-200 text-5xl mb-4" />
                <p className="text-gray-400 font-medium mb-1">
                  No groups waiting
                </p>
                <Link
                  href="/admin/groups"
                  className="text-sky-500 text-sm font-semibold hover:text-sky-600 mt-1"
                >
                  Create a group →
                </Link>
              </div>
            ) : (
              <div>
                {waitingGroups.map((group, i) => (
                  <div
                    key={group._id}
                    className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-sky-50 rounded-2xl flex items-center justify-center shrink-0">
                        <span className="text-sky-500 text-xs font-bold">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-900 font-semibold text-sm">
                          {group.name}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-gray-400 text-xs">
                            {group.championship?.name}
                          </span>
                          <span className="text-gray-300 text-xs">·</span>
                          <span className="text-gray-400 text-xs">
                            {formatDate(group.scheduledAt)}
                          </span>
                          <span className="text-gray-300 text-xs">·</span>
                          <span className="text-gray-400 text-xs">
                            {group.players.length}/{group.maxPlayers}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/race/${group._id}`)}
                      className="inline-flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-3 py-2 text-xs font-bold transition-colors cursor-pointer border-none"
                    >
                      <FaPlay className="text-xs" /> Start
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
            <div className="bg-white rounded-3xl border-2 border-gray-50 p-6">
              <h2
                className="font-bold text-gray-900 mb-5"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Platform Stats
              </h2>
              <div className="flex flex-col gap-4">
                {[
                  {
                    label: "Active Championships",
                    value: activeChampionships.length,
                    total: championships.length,
                    color: "bg-sky-500",
                  },
                  {
                    label: "Completed Races",
                    value: finishedGroups.length,
                    total: groups.length,
                    color: "bg-green-400",
                  },
                  {
                    label: "In Progress",
                    value: inProgressGroups.length,
                    total: groups.length,
                    color: "bg-red-400",
                  },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-500 text-sm">
                        {item.label}
                      </span>
                      <span className="text-gray-900 font-bold text-sm">
                        {item.value}{" "}
                        <span className="text-gray-300 font-normal">
                          / {item.total}
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full`}
                        style={{
                          width:
                            item.total > 0
                              ? `${(item.value / item.total) * 100}%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border-2 border-gray-50 p-6">
              <h2
                className="font-bold text-gray-900 mb-5"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Quick Actions
              </h2>
              <div className="flex flex-col gap-3">
                {[
                  {
                    href: "/admin/championships",
                    icon: <FaTrophy className="text-amber-400 text-sm" />,
                    label: "Manage Championships",
                    desc: "Create or edit championships",
                    bg: "bg-amber-50 hover:bg-amber-100",
                  },
                  {
                    href: "/admin/groups",
                    icon: <FaUsers className="text-sky-500 text-sm" />,
                    label: "Manage Groups",
                    desc: "Create race groups",
                    bg: "bg-sky-50 hover:bg-sky-100",
                  },
                  {
                    href: "/stats",
                    icon: <FaChartBar className="text-green-500 text-sm" />,
                    label: "View Leaderboard",
                    desc: "Global player rankings",
                    bg: "bg-green-50 hover:bg-green-100",
                  },
                ].map((action, i) => (
                  <Link
                    key={i}
                    href={action.href}
                    className={`flex items-center justify-between p-3.5 ${action.bg} rounded-2xl transition-colors group`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        {action.icon}
                      </div>
                      <div>
                        <p className="text-gray-900 font-semibold text-sm">
                          {action.label}
                        </p>
                        <p className="text-gray-400 text-xs">{action.desc}</p>
                      </div>
                    </div>
                    <FaArrowRight className="text-gray-300 text-xs group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>

            {globalStats?.topUser && (
              <div className="bg-sky-500 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-sky-400/30 -translate-y-6 translate-x-6" />
                <div className="relative z-10">
                  <p className="text-sky-100 text-xs font-semibold mb-3 uppercase tracking-wide">
                    🏆 Top Player
                  </p>
                  <p
                    className="text-white font-bold text-2xl mb-1"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    {globalStats.topUser.username}
                  </p>
                  <p className="text-sky-200 text-sm">
                    {globalStats.topUser.stats?.bestWpm} WPM best ·{" "}
                    {globalStats.topUser.stats?.totalRaces} races
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
