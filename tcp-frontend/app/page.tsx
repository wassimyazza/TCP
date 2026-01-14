"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  FaArrowRight,
  FaKeyboard,
  FaTrophy,
  FaBolt,
  FaUsers,
} from "react-icons/fa";

const DEMO_TEXT = "The quick brown fox jumps over the lazy dog";

const stats = [
  { number: "50K+", label: "Active Typists" },
  { number: "2M+", label: "Races Completed" },
  { number: "180", label: "WPM Record" },
  { number: "99%", label: "Uptime" },
];

export default function HomePage() {
  const [typed, setTyped] = useState("");
  const [demoRunning, setDemoRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    const timeout = setTimeout(() => runDemo(), 1200);
    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function runDemo() {
    setDemoRunning(true);
    indexRef.current = 0;
    setTyped("");
    intervalRef.current = setInterval(() => {
      indexRef.current += 1;
      setTyped(DEMO_TEXT.slice(0, indexRef.current));
      if (indexRef.current >= DEMO_TEXT.length) {
        clearInterval(intervalRef.current!);
        setTimeout(() => {
          setTyped("");
          indexRef.current = 0;
          runDemo();
        }, 2000);
      }
    }, 60);
  }

  function renderDemo() {
    return DEMO_TEXT.split("").map((char, i) => {
      if (i < typed.length) {
        return (
          <span key={i} className="text-sky-600 font-medium">
            {char}
          </span>
        );
      }
      if (i === typed.length) {
        return (
          <span key={i} className="border-b-2 border-sky-500 text-gray-400">
            {char}
          </span>
        );
      }
      return (
        <span key={i} className="text-gray-300">
          {char}
        </span>
      );
    });
  }

  return (
    <div className="bg-white">
      <section className="relative min-h-[calc(100vh-64px)] flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-sky-50" />
          <div className="absolute top-16 right-16 w-80 h-80 rounded-full bg-sky-100 opacity-60" />
          <div className="absolute bottom-24 right-48 w-48 h-48 rounded-full bg-blue-100 opacity-40" />
          <div className="absolute top-32 right-32 w-24 h-24 rounded-full bg-sky-200 opacity-50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                Live multiplayer races happening now
              </div>

              <h1
                className="font-bold text-gray-900 mb-6"
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: "clamp(2.6rem, 5vw, 4rem)",
                  lineHeight: 1.1,
                }}
              >
                How fast can
                <br />
                <span className="text-sky-500">you type?</span>
                <br />
                Find out now.
              </h1>

              <p
                className="text-gray-500 text-lg mb-10 max-w-md"
                style={{ lineHeight: 1.7 }}
              >
                Race against real players in real time. Join championships,
                track your speed, and climb the leaderboard. No fluff — just
                pure typing competition.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/race/quick"
                  className="inline-flex items-center gap-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl px-8 py-4 font-bold text-base transition-colors shadow-lg shadow-sky-200"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  Start Typing Free
                  <FaArrowRight className="text-sm" />
                </Link>
                <Link
                  href="/championships"
                  className="inline-flex items-center gap-3 bg-white border-2 border-gray-200 hover:border-sky-300 text-gray-700 rounded-2xl px-8 py-4 font-bold text-base transition-colors"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  <FaTrophy className="text-sky-500 text-sm" />
                  Championships
                </Link>
              </div>
            </div>

            <div className="hidden lg:flex flex-col gap-4">
              <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl shadow-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex items-center gap-2 bg-sky-50 rounded-full px-3 py-1">
                    <FaBolt className="text-sky-500 text-xs" />
                    <span className="text-sky-600 text-xs font-semibold">
                      Live Race
                    </span>
                  </div>
                </div>

                <div className="font-mono text-lg text-gray-800 mb-6 leading-relaxed tracking-wide">
                  {renderDemo()}
                </div>

                <div className="h-1.5 bg-gray-100 rounded-full mb-6">
                  <div
                    className="h-1.5 bg-sky-500 rounded-full transition-all duration-100"
                    style={{
                      width: `${(typed.length / DEMO_TEXT.length) * 100}%`,
                    }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    {
                      label: "WPM",
                      value:
                        typed.length > 5
                          ? Math.round(
                              (typed.trim().split(" ").length /
                                (typed.length / 250)) *
                                10,
                            )
                          : 0,
                    },
                    { label: "Accuracy", value: "100%" },
                    {
                      label: "Progress",
                      value: `${Math.round((typed.length / DEMO_TEXT.length) * 100)}%`,
                    },
                  ].map((s, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-400 text-xs mb-1">{s.label}</p>
                      <p
                        className="text-gray-900 font-bold text-lg"
                        style={{ fontFamily: "Syne, sans-serif" }}
                      >
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: "Ahmed K.", wpm: 142, color: "bg-sky-500" },
                  { name: "Sara M.", wpm: 118, color: "bg-blue-500" },
                  { name: "You", wpm: 94, color: "bg-green-500" },
                ].map((player, i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm"
                  >
                    <div
                      className={`w-8 h-8 ${player.color} rounded-full mx-auto mb-2 flex items-center justify-center`}
                    >
                      <span className="text-white text-xs font-bold">
                        {player.name.charAt(0)}
                      </span>
                    </div>
                    <p className="text-gray-700 text-xs font-medium">
                      {player.name}
                    </p>
                    <p
                      className="text-gray-900 font-bold text-base"
                      style={{ fontFamily: "Syne, sans-serif" }}
                    >
                      {player.wpm}{" "}
                      <span className="text-gray-400 text-xs font-normal">
                        wpm
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-gray-50 py-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p
                  className="font-bold text-3xl text-gray-900 mb-1"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {stat.number}
                </p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sky-500 font-semibold text-sm uppercase tracking-widest mb-3">
              How it works
            </p>
            <h2
              className="font-bold text-4xl text-gray-900"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Built for real competition
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: <FaKeyboard className="text-sky-500 text-2xl" />,
                title: "Quick Race",
                desc: "Jump in instantly. No waiting, no setup. Just you against the clock and a fresh set of words every round.",
                color: "bg-sky-50 border-sky-100",
              },
              {
                step: "02",
                icon: <FaUsers className="text-blue-500 text-2xl" />,
                title: "Multiplayer Groups",
                desc: "Join a championship group, wait for other players to connect, and race simultaneously when the admin starts the timer.",
                color: "bg-blue-50 border-blue-100",
              },
              {
                step: "03",
                icon: <FaTrophy className="text-amber-500 text-2xl" />,
                title: "Championships",
                desc: "Compete in organized tournaments. Groups race at scheduled times and results go straight to the leaderboard.",
                color: "bg-amber-50 border-amber-100",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`rounded-3xl border p-8 ${item.color} relative overflow-hidden`}
              >
                <span
                  className="absolute top-6 right-6 text-5xl font-bold text-black/5"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {item.step}
                </span>
                <div className="mb-5">{item.icon}</div>
                <h3
                  className="font-bold text-xl text-gray-900 mb-3"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                quote:
                  "Finally a typing platform that feels fast. No ads, no noise — just racing.",
                name: "Karim B.",
                wpm: "134 WPM",
              },
              {
                quote:
                  "I went from 60 WPM to 110 in two months just by doing daily quick races.",
                name: "Nour A.",
                wpm: "112 WPM",
              },
              {
                quote:
                  "The championship format is addictive. Waiting for the countdown with 8 other players is intense.",
                name: "Youssef R.",
                wpm: "98 WPM",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
              >
                <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                  "{t.quote}"
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-gray-900 font-semibold text-sm">
                    {t.name}
                  </p>
                  <span className="bg-sky-100 text-sky-700 text-xs font-bold px-2 py-1 rounded-full">
                    {t.wpm}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-sky-500">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="font-bold text-4xl md:text-5xl text-white mb-5"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Your fingers are faster than you think.
          </h2>
          <p className="text-sky-100 text-lg mb-10">
            Create a free account in 30 seconds and start your first race today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-3 bg-white text-sky-600 hover:bg-sky-50 rounded-2xl px-8 py-4 font-bold text-base transition-colors shadow-lg"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Create Free Account
              <FaArrowRight className="text-sm" />
            </Link>
            <Link
              href="/race/quick"
              className="inline-flex items-center gap-3 bg-sky-600 hover:bg-sky-700 border border-sky-400 text-white rounded-2xl px-8 py-4 font-bold text-base transition-colors"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              <FaBolt className="text-sm" />
              Try Without Account
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-10 px-6 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center">
              <FaKeyboard className="text-white text-xs" />
            </div>
            <span
              className="font-bold text-gray-900"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Key<span className="text-sky-500">Race</span>
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            Type faster. Race harder. Win bigger.
          </p>
          <div className="flex gap-6">
            <Link
              href="/championships"
              className="text-gray-400 hover:text-gray-700 text-sm transition-colors"
            >
              Championships
            </Link>
            <Link
              href="/stats"
              className="text-gray-400 hover:text-gray-700 text-sm transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              href="/register"
              className="text-gray-400 hover:text-gray-700 text-sm transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}