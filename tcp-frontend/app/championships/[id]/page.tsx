"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FaTrophy,
  FaUsers,
  FaClock,
  FaBolt,
  FaArrowLeft,
  FaLock,
  FaCheckCircle,
  FaFlagCheckered,
  FaArrowRight,
} from "react-icons/fa";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/api";

interface Player {
  _id: string;
  username: string;
}
interface Group {
  _id: string;
  name: string;
  scheduledAt: string;
  maxPlayers: number;
  players: Player[];
  status: string;
}
interface Championship {
  _id: string;
  name: string;
  description: string;
  status: string;
}

export default function ChampionshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [championship, setChampionship] = useState<Championship | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    if (!id || id === "undefined") return;
    fetchData();
  }, [id]);

  async function fetchData() {
    try {
      const [champRes, groupsRes] = await Promise.all([
        api.get(`/championships/${id}`),
        api.get(`/groups/championship/${id}`),
      ]);
      setChampionship(champRes.data);
      setGroups(groupsRes.data);
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(groupId: string) {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setJoiningId(groupId);
    try {
      await api.post(`/groups/${groupId}/join`);
      toast.success("Joined!");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to join");
    } finally {
      setJoiningId(null);
    }
  }

  async function handleLeave(groupId: string) {
    setJoiningId(groupId);
    try {
      await api.post(`/groups/${groupId}/leave`);
      toast.success("Left group");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to leave");
    } finally {
      setJoiningId(null);
    }
  }

  const isUserInGroup = (g: Group) =>
    user ? g.players.some((p) => p._id === user.id) : false;

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      time: d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }

  const myGroup = groups.find((g) => isUserInGroup(g));
  const totalPlayers = groups.reduce((s, g) => s + g.players.length, 0);
  const totalSlots = groups.reduce((s, g) => s + g.maxPlayers, 0);
  const liveGroups = groups.filter((g) => g.status === "in_progress");
  const waitingGroups = groups.filter((g) => g.status === "waiting");
  const finishedGroups = groups.filter((g) => g.status === "finished");

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <div className="w-7 h-7 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!championship) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <p className="text-gray-400">Not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="bg-white border-b border-gray-100 px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/championships"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm font-medium transition-colors mb-8"
          >
            <FaArrowLeft className="text-xs" /> All Championships
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center shrink-0">
                  <FaTrophy className="text-white" />
                </div>
                {championship.status === "active" ? (
                  <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Open for Registration
                  </span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full font-semibold">
                    Finished
                  </span>
                )}
              </div>

              <h1
                className="font-extrabold text-gray-900 mb-4"
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: "clamp(1.9rem, 4vw, 2.8rem)",
                  lineHeight: 1.1,
                }}
              >
                {championship.name}
              </h1>

              <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-lg">
                {championship.description ||
                  "Pick a race group that fits your schedule. When the admin starts the race, all players in your group compete live at the same time."}
              </p>

              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    label: "Groups",
                    value: groups.length,
                    icon: <FaUsers className="text-sky-500 text-sm" />,
                    bg: "bg-sky-50 border-sky-100",
                  },
                  {
                    label: "Players",
                    value: totalPlayers,
                    icon: <FaBolt className="text-emerald-500 text-sm" />,
                    bg: "bg-emerald-50 border-emerald-100",
                  },
                  {
                    label: "Spots Left",
                    value: Math.max(totalSlots - totalPlayers, 0),
                    icon: <FaClock className="text-violet-500 text-sm" />,
                    bg: "bg-violet-50 border-violet-100",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className={`${s.bg} border rounded-2xl p-4 text-center`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      {s.icon}
                    </div>
                    <p
                      className="font-extrabold text-2xl text-gray-900"
                      style={{ fontFamily: "Syne, sans-serif" }}
                    >
                      {s.value}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {myGroup ? (
                <div className="bg-sky-500 rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <FaCheckCircle className="text-white text-sm" />
                      <span className="text-white font-bold text-sm">
                        You're Registered
                      </span>
                    </div>
                    <h3
                      className="font-extrabold text-white text-2xl mb-1"
                      style={{ fontFamily: "Syne, sans-serif" }}
                    >
                      {myGroup.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sky-100 text-sm mb-5">
                      <FaClock className="text-sky-200 text-xs" />
                      <span>{formatDate(myGroup.scheduledAt).date}</span>
                      <span className="font-bold text-white">
                        {formatDate(myGroup.scheduledAt).time}
                      </span>
                    </div>
                    {myGroup.status !== "finished" && (
                      <button
                        onClick={() => router.push(`/race/${myGroup._id}`)}
                        className="w-full flex items-center justify-center gap-2 bg-white text-sky-600 hover:bg-sky-50 rounded-2xl py-3 font-bold text-sm transition-colors cursor-pointer border-none"
                      >
                        <FaBolt className="text-xs" />
                        {myGroup.status === "in_progress"
                          ? "Rejoin Live Race"
                          : "Enter Race Room"}
                      </button>
                    )}
                    <button
                      onClick={() => handleLeave(myGroup._id)}
                      className="w-full text-sky-200 hover:text-white text-xs font-medium mt-3 cursor-pointer bg-transparent border-none transition-colors"
                    >
                      Leave group
                    </button>
                  </div>
                </div>
              ) : !isAuthenticated ? (
                <div className="bg-white border border-gray-200 rounded-3xl p-6">
                  <div className="w-10 h-10 bg-sky-50 rounded-2xl flex items-center justify-center mb-4">
                    <FaTrophy className="text-sky-500" />
                  </div>
                  <h3
                    className="font-bold text-gray-900 text-lg mb-2"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    Want to compete?
                  </h3>
                  <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                    Create a free account and join any group below to race live.
                  </p>
                  <Link
                    href="/register"
                    className="block w-full text-center bg-sky-500 hover:bg-sky-600 text-white rounded-2xl py-3 font-bold text-sm transition-colors shadow-md shadow-sky-100 mb-2"
                  >
                    Register Free
                  </Link>
                  <Link
                    href="/login"
                    className="block w-full text-center bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-2xl py-3 font-bold text-sm transition-all"
                  >
                    Already have an account
                  </Link>
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-3xl p-6">
                  <div className="w-10 h-10 bg-sky-50 rounded-2xl flex items-center justify-center mb-4">
                    <FaUsers className="text-sky-500" />
                  </div>
                  <h3
                    className="font-bold text-gray-900 text-lg mb-2"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    Pick a Group
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Choose a race group below that fits your schedule and click
                    Join Group.
                  </p>
                  {waitingGroups.length > 0 && (
                    <div className="mt-4 flex items-center gap-2 text-sky-600 text-sm font-semibold">
                      <FaArrowRight className="text-xs" />
                      {waitingGroups.length} group
                      {waitingGroups.length !== 1 ? "s" : ""} available
                    </div>
                  )}
                </div>
              )}

              {liveGroups.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-3xl p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-600 font-bold text-sm">
                      Live Right Now
                    </span>
                  </div>
                  <p className="text-red-500 text-sm">
                    {liveGroups.map((g) => g.name).join(", ")}{" "}
                    {liveGroups.length === 1 ? "is" : "are"} racing
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {groups.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl py-20 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <FaUsers className="text-gray-300 text-2xl" />
            </div>
            <h3
              className="font-bold text-gray-700 text-xl mb-2"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              No groups yet
            </h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">
              The admin hasn't created race groups yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {liveGroups.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <h2
                    className="font-bold text-gray-900 text-base"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    Live Now
                  </h2>
                  <span className="text-gray-400 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    {liveGroups.length}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {liveGroups.map((group) => (
                    <GroupCard
                      key={group._id}
                      group={group}
                      user={user}
                      isUserInGroup={isUserInGroup(group)}
                      joiningId={joiningId}
                      onJoin={handleJoin}
                      onLeave={handleLeave}
                      onEnter={(gid) => router.push(`/race/${gid}`)}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}

            {waitingGroups.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <FaClock className="text-gray-400 text-sm" />
                  <h2
                    className="font-bold text-gray-900 text-base"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    Upcoming
                  </h2>
                  <span className="text-gray-400 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    {waitingGroups.length}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {waitingGroups.map((group) => (
                    <GroupCard
                      key={group._id}
                      group={group}
                      user={user}
                      isUserInGroup={isUserInGroup(group)}
                      joiningId={joiningId}
                      onJoin={handleJoin}
                      onLeave={handleLeave}
                      onEnter={(gid) => router.push(`/race/${gid}`)}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}

            {finishedGroups.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <FaFlagCheckered className="text-gray-400 text-sm" />
                  <h2
                    className="font-bold text-gray-500 text-base"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    Finished
                  </h2>
                  <span className="text-gray-400 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    {finishedGroups.length}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {finishedGroups.map((group) => (
                    <GroupCard
                      key={group._id}
                      group={group}
                      user={user}
                      isUserInGroup={isUserInGroup(group)}
                      joiningId={joiningId}
                      onJoin={handleJoin}
                      onLeave={handleLeave}
                      onEnter={(gid) => router.push(`/race/${gid}`)}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function GroupCard({
  group,
  user,
  isUserInGroup,
  joiningId,
  onJoin,
  onLeave,
  onEnter,
  formatDate,
}: {
  group: Group;
  user: any;
  isUserInGroup: boolean;
  joiningId: string | null;
  onJoin: (id: string) => void;
  onLeave: (id: string) => void;
  onEnter: (id: string) => void;
  formatDate: (d: string) => { date: string; time: string };
}) {
  const isFull = group.players.length >= group.maxPlayers;
  const isWaiting = group.status === "waiting";
  const isInProgress = group.status === "in_progress";
  const isFinished = group.status === "finished";
  const capacity = (group.players.length / group.maxPlayers) * 100;
  const { date, time } = formatDate(group.scheduledAt);

  return (
    <div
      className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${
        isInProgress
          ? "border-red-200"
          : isUserInGroup
            ? "border-sky-200"
            : isFinished
              ? "border-gray-100"
              : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
      }`}
    >
      <div
        className={`flex items-center justify-between px-5 py-2.5 border-b ${
          isInProgress
            ? "bg-red-50 border-red-100"
            : isUserInGroup
              ? "bg-sky-50 border-sky-100"
              : isFinished
                ? "bg-gray-50 border-gray-100"
                : "bg-gray-50 border-gray-100"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isInProgress
                ? "bg-red-500 animate-pulse"
                : isUserInGroup
                  ? "bg-sky-500"
                  : isFinished
                    ? "bg-gray-300"
                    : "bg-amber-400"
            }`}
          />
          <span
            className={`text-xs font-bold ${
              isInProgress
                ? "text-red-600"
                : isUserInGroup
                  ? "text-sky-600"
                  : isFinished
                    ? "text-gray-400"
                    : "text-amber-600"
            }`}
          >
            {isInProgress
              ? "Racing Now"
              : isUserInGroup
                ? "Your Group"
                : isFinished
                  ? "Finished"
                  : "Open"}
          </span>
        </div>
        <span className="text-gray-400 text-xs flex items-center gap-1.5">
          <FaClock style={{ fontSize: "10px" }} />
          {date} · {time}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <h3
              className="font-bold text-gray-900 text-xl"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              {group.name}
            </h3>
            {isUserInGroup && (
              <span className="inline-flex items-center gap-1 text-xs bg-sky-50 text-sky-600 font-bold px-2.5 py-1 rounded-full border border-sky-200">
                <FaCheckCircle className="text-xs" /> Joined
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center">
                <FaUsers className="text-gray-400 text-xs" />
              </div>
              <div>
                <p className="text-gray-900 text-xs font-semibold">
                  {group.players.length} / {group.maxPlayers}
                </p>
                <p
                  className={`text-xs ${isFull ? "text-red-400" : "text-gray-400"}`}
                >
                  {isFull
                    ? "Full"
                    : `${group.maxPlayers - group.players.length} open`}
                </p>
              </div>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400 text-xs">Capacity</span>
                <span className="text-gray-500 text-xs font-semibold">
                  {Math.round(capacity)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    capacity >= 90
                      ? "bg-red-400"
                      : capacity >= 60
                        ? "bg-amber-400"
                        : "bg-sky-400"
                  }`}
                  style={{ width: `${capacity}%` }}
                />
              </div>
            </div>
          </div>

          {group.players.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {group.players.slice(0, 6).map((p) => (
                <span
                  key={p._id}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    p._id === user?.id
                      ? "bg-sky-100 text-sky-700 border border-sky-200"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {p.username}
                </span>
              ))}
              {group.players.length > 6 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-400 font-medium">
                  +{group.players.length - 6} more
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-row sm:flex-col items-center gap-2 shrink-0">
          {isUserInGroup && !isFinished && (
            <button
              onClick={() => onEnter(group._id)}
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold transition-colors cursor-pointer border-none shadow-md shadow-sky-100 whitespace-nowrap"
            >
              <FaBolt className="text-xs" />
              {isInProgress ? "Rejoin" : "Enter"}
            </button>
          )}
          {!isUserInGroup && isWaiting && !isFull && (
            <button
              onClick={() => onJoin(group._id)}
              disabled={joiningId === group._id}
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white rounded-xl px-5 py-2.5 text-sm font-bold transition-colors cursor-pointer border-none disabled:opacity-50 whitespace-nowrap"
            >
              {joiningId === group._id ? "Joining..." : "Join Group"}
            </button>
          )}
          {!isUserInGroup && isFull && isWaiting && (
            <span className="inline-flex items-center gap-1.5 text-gray-400 text-sm font-medium px-3">
              <FaLock className="text-xs" /> Full
            </span>
          )}
          {!isUserInGroup && isInProgress && (
            <span className="text-red-400 text-sm font-medium px-3">
              Racing
            </span>
          )}
          {!isUserInGroup && isFinished && (
            <span className="text-gray-300 text-sm px-3">Ended</span>
          )}
          {isUserInGroup && isWaiting && (
            <button
              onClick={() => onLeave(group._id)}
              disabled={joiningId === group._id}
              className="text-xs text-gray-300 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none"
            >
              Leave
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
