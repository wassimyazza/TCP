import {
  FaTrophy,
  FaKeyboard,
  FaBullseye,
  FaUsers,
  FaMedal,
} from "react-icons/fa";
import { API_BASE_URL } from "@/lib/api";

async function getLeaderboard() {
  try {
    const res = await fetch(`${API_BASE_URL}/stats/leaderboard`, {
      cache: "no-store",
    });
    return res.json();
  } catch {
    return [];
  }
}

async function getGlobalStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/stats/global`, {
      cache: "no-store",
    });
    return res.json();
  } catch {
    return null;
  }
}

const medals = ["🥇", "🥈", "🥉"];

export default async function StatsPage() {
  const [leaderboard, globalStats] = await Promise.all([
    getLeaderboard(),
    getGlobalStats(),
  ]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="bg-white border-b border-gray-100 px-6 py-14">
        <div className="max-w-5xl mx-auto">
          <p className="text-sky-500 text-xs font-bold uppercase tracking-widest mb-3">
            Rankings
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <h1
              className="font-bold text-gray-900"
              style={{
                fontFamily: "Syne, sans-serif",
                fontSize: "2.8rem",
                lineHeight: 1.05,
              }}
            >
              Leaderboard
            </h1>
            <p className="text-gray-400 text-base max-w-sm leading-relaxed pb-1">
              The fastest typists on the platform. Race more to improve your
              rank.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            {
              icon: <FaUsers className="text-sky-500" />,
              label: "Total Players",
              value: globalStats?.totalUsers ?? 0,
              bg: "bg-sky-50",
              border: "border-sky-100",
            },
            {
              icon: <FaKeyboard className="text-violet-500" />,
              label: "Races Completed",
              value: globalStats?.totalRaces ?? 0,
              bg: "bg-violet-50",
              border: "border-violet-100",
            },
            {
              icon: <FaTrophy className="text-amber-500" />,
              label: "Top WPM",
              value: globalStats?.topUser?.stats?.bestWpm ?? 0,
              bg: "bg-amber-50",
              border: "border-amber-100",
            },
            {
              icon: <FaBullseye className="text-emerald-500" />,
              label: "Top Player",
              value: globalStats?.topUser?.username ?? "—",
              bg: "bg-emerald-50",
              border: "border-emerald-100",
            },
          ].map((card, i) => (
            <div
              key={i}
              className={`${card.bg} border ${card.border} rounded-2xl p-5`}
            >
              <div className="w-9 h-9 bg-white rounded-xl border border-white shadow-sm flex items-center justify-center mb-4">
                {card.icon}
              </div>
              <p className="text-gray-400 text-xs mb-1">{card.label}</p>
              <p
                className="text-gray-900 font-bold text-2xl truncate"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-center">
                <FaMedal className="text-sky-500 text-sm" />
              </div>
              <div>
                <h2
                  className="font-bold text-gray-900"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  Top 20 Players
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  Ranked by best WPM
                </p>
              </div>
            </div>
            <span className="text-gray-400 text-sm font-medium">
              {leaderboard.length} ranked
            </span>
          </div>

          {leaderboard.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-6">
              <div className="w-14 h-14 bg-slate-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center mb-5">
                <FaTrophy className="text-gray-300 text-xl" />
              </div>
              <p
                className="text-gray-700 font-bold text-lg mb-1"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                No players ranked yet
              </p>
              <p className="text-gray-400 text-sm">
                Complete races to appear on the leaderboard.
              </p>
            </div>
          ) : (
            <div>
              {leaderboard.slice(0, 3).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5 bg-slate-50 border-b border-gray-100">
                  {[1, 0, 2].map((pos) => {
                    const player = leaderboard[pos];
                    if (!player) return null;
                    const isFirst = pos === 0;
                    return (
                      <div
                        key={player._id}
                        className={`rounded-2xl p-5 text-center border transition-all ${
                          isFirst
                            ? "bg-amber-50 border-amber-200 shadow-md shadow-amber-100"
                            : "bg-white border-gray-100"
                        }`}
                      >
                        <p className="text-3xl mb-2">{medals[pos]}</p>
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg ${
                            isFirst
                              ? "bg-amber-400 text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                          style={{ fontFamily: "Syne, sans-serif" }}
                        >
                          {player.username.charAt(0).toUpperCase()}
                        </div>
                        <p
                          className="text-gray-900 font-bold text-sm mb-0.5"
                          style={{ fontFamily: "Syne, sans-serif" }}
                        >
                          {player.username}
                        </p>
                        <p className="text-gray-400 text-xs mb-3">
                          {player.stats.totalRaces} races
                        </p>
                        <div
                          className={`rounded-xl px-3 py-2 ${isFirst ? "bg-amber-100" : "bg-slate-50"}`}
                        >
                          <p className="text-gray-400 text-xs">Best WPM</p>
                          <p
                            className={`font-bold text-2xl ${isFirst ? "text-amber-600" : "text-gray-800"}`}
                            style={{ fontFamily: "Syne, sans-serif" }}
                          >
                            {player.stats.bestWpm}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100 bg-slate-50">
                <div className="col-span-1" />
                <div className="col-span-5">
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
                    Player
                  </p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
                    Avg WPM
                  </p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
                    Accuracy
                  </p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
                    Best WPM
                  </p>
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {leaderboard.slice(3).map((player: any, i: number) => {
                  const rank = i + 4;
                  return (
                    <div
                      key={player._id}
                      className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="col-span-1">
                        <span className="text-gray-300 text-sm font-bold">
                          #{rank}
                        </span>
                      </div>

                      <div className="col-span-7 sm:col-span-5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          <span className="text-gray-600 text-sm font-bold">
                            {player.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-gray-900 font-semibold text-sm">
                            {player.username}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {player.stats.totalRaces} races
                          </p>
                        </div>
                      </div>

                      <div className="hidden sm:block col-span-2 text-right">
                        <p className="text-gray-700 text-sm font-semibold">
                          {player.stats.averageWpm}
                        </p>
                      </div>

                      <div className="hidden sm:block col-span-2 text-right">
                        <p className="text-gray-700 text-sm font-semibold">
                          {player.stats.averageAccuracy}%
                        </p>
                      </div>

                      <div className="col-span-4 sm:col-span-2 text-right">
                        <p
                          className="text-sky-600 font-bold text-xl"
                          style={{ fontFamily: "Syne, sans-serif" }}
                        >
                          {player.stats.bestWpm}
                        </p>
                        <p className="text-gray-300 text-xs">WPM</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
