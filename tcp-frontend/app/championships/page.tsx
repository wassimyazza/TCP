"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FaTrophy,
  FaArrowRight,
  FaUsers,
  FaBolt,
  FaClock,
} from "react-icons/fa";
import api from "@/lib/api";

interface Championship {
  _id: string;
  name: string;
  description: string;
  status: string;
}

export default function ChampionshipsPage() {
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChampionships();
  }, []);

  async function fetchChampionships() {
    try {
      const res = await api.get("/championships");
      setChampionships(res.data);
    } catch {
      toast.error("Failed to load championships");
    } finally {
      setLoading(false);
    }
  }

  const active = championships.filter((c) => c.status === "active");
  const finished = championships.filter((c) => c.status === "finished");

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <div className="w-7 h-7 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="bg-white border-b border-gray-100 px-6 py-14">
        <div className="max-w-5xl mx-auto">
          <p className="text-sky-500 text-xs font-bold uppercase tracking-widest mb-3">
            Competitions
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
              Championships
            </h1>
            <div className="flex items-center gap-6 pb-1">
              <div>
                <p
                  className="font-bold text-3xl text-gray-900"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {active.length}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">Open now</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div>
                <p
                  className="font-bold text-3xl text-gray-900"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {championships.length}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">Total</p>
              </div>
            </div>
          </div>
          <p className="text-gray-400 text-base mt-4 max-w-lg leading-relaxed">
            Organized typing tournaments with scheduled race groups. Join a
            group, race live against others, and climb the rankings.
          </p>
        </div>
      </div>

      <div className="bg-white border-b border-gray-100 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <FaTrophy className="text-sky-500" />,
                title: "Join a Championship",
                desc: "Browse open championships and pick one to enter.",
              },
              {
                icon: <FaUsers className="text-sky-500" />,
                title: "Choose a Group",
                desc: "Pick a race group with a time that fits your schedule.",
              },
              {
                icon: <FaBolt className="text-sky-500" />,
                title: "Race Live",
                desc: "When the admin starts, compete in real time against everyone in your group.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-slate-50 rounded-2xl px-5 py-4"
              >
                <div className="w-9 h-9 bg-white rounded-xl border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                  {step.icon}
                </div>
                <div>
                  <p className="text-gray-800 font-semibold text-sm mb-1">
                    {step.title}
                  </p>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {championships.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-3xl py-24 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center mb-5">
              <FaTrophy className="text-gray-300 text-xl" />
            </div>
            <p
              className="text-gray-700 font-bold text-lg mb-1"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              No championships yet
            </p>
            <p className="text-gray-400 text-sm">
              Check back soon — competitions will appear here once created.
            </p>
          </div>
        )}

        {active.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h2
                className="text-gray-900 font-bold text-sm uppercase tracking-wide"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Open Now
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {active.map((champ, i) => (
                <Link
                  key={champ._id}
                  href={`/championships/${champ._id}`}
                  className="group flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-6 py-5 hover:border-sky-200 hover:shadow-md hover:shadow-sky-50 transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-11 h-11 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-center shrink-0">
                      <FaTrophy className="text-sky-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3
                          className="text-gray-900 font-bold text-lg group-hover:text-sky-700 transition-colors"
                          style={{ fontFamily: "Syne, sans-serif" }}
                        >
                          {champ.name}
                        </h3>
                        <span className="text-xs font-semibold bg-green-50 text-green-600 border border-green-200 px-2.5 py-0.5 rounded-full">
                          Open
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {champ.description ||
                          "Join a group and race at your scheduled time."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-sm text-gray-400 font-medium hidden sm:block group-hover:text-sky-500 transition-colors">
                      View groups
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-sky-500 flex items-center justify-center transition-colors">
                      <FaArrowRight className="text-gray-400 group-hover:text-white text-xs transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {finished.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-2 h-2 rounded-full bg-gray-300" />
              <h2
                className="text-gray-400 font-bold text-sm uppercase tracking-wide"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Past Championships
              </h2>
            </div>

            <div className="flex flex-col gap-2">
              {finished.map((champ) => (
                <Link
                  key={champ._id}
                  href={`/championships/${champ._id}`}
                  className="group flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-6 py-4 hover:border-gray-200 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                      <FaTrophy className="text-gray-400 text-sm" />
                    </div>
                    <div>
                      <p className="text-gray-500 font-semibold text-sm">
                        {champ.name}
                      </p>
                      {champ.description && (
                        <p className="text-gray-400 text-xs mt-0.5 max-w-xs truncate">
                          {champ.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-gray-300 text-xs font-medium hidden sm:block">
                      View results
                    </span>
                    <FaArrowRight className="text-gray-300 text-xs group-hover:text-gray-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 bg-white px-6 py-10 mt-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p
              className="font-bold text-gray-900 text-lg mb-1"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Not ready for a championship?
            </p>
            <p className="text-gray-400 text-sm">
              Try a quick race first — no sign-up needed to test your speed.
            </p>
          </div>
          <Link
            href="/race/quick"
            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl px-6 py-3 font-bold text-sm transition-colors shadow-md shadow-sky-100 shrink-0"
          >
            <FaBolt className="text-xs" />
            Try Quick Race
          </Link>
        </div>
      </div>
    </div>
  );
}
