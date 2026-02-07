"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FaTrophy,
  FaArrowLeft,
  FaClock,
  FaUsers,
  FaPlay,
  FaChartBar,
} from "react-icons/fa";
import { io } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

export default function RacePage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = use(params);
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();

  const [race, setRace] = useState<any>(null);
  const [currentInput, setCurrentInput] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordStatuses, setWordStatuses] = useState<string[]>([]);
  const [correctWords, setCorrectWords] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [connected, setConnected] = useState(false);
  const [starting, setStarting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const socketRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const raceIdRef = useRef<string | null>(null);

  const isAdmin = user?.role === "admin";
  const API = process.env.NEXT_PUBLIC_API_URL;
  const SOCKET = process.env.NEXT_PUBLIC_SOCKET_URL;

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    if (!token) return;

    const socket = io(SOCKET!, { auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("race_updated", (data: any) => {
      setRace(data);
      raceIdRef.current = data._id;
      setPageLoading(false);
      setWordStatuses((prev) => {
        if (prev.length === 0) {
          return data.text
            .trim()
            .split(" ")
            .map(() => "pending");
        }
        return prev;
      });
    });

    socket.on("countdown_started", () => setCountdown(3));
    socket.on("countdown_tick", (data: any) => setCountdown(data.seconds));

    socket.on("race_started", (data: any) => {
      setRace(data);
      setCountdown(null);
      setTimeLeft(60);
      setCurrentInput("");
      setCurrentWordIndex(0);
      setCorrectWords(0);
      setTotalWords(0);
      setWpm(0);
      setAccuracy(100);
      const raceWords = data.text.trim().split(" ");
      setWordStatuses(raceWords.map(() => "pending"));
      if (!isAdmin) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    });

    socket.on("timer_tick", (data: any) => setTimeLeft(data.timeLeft));

    socket.on("race_finished", (data: any) => {
      setRace(data);
      setCountdown(null);
      inputRef.current?.blur();
    });

    socket.on("player_left", () =>
      toast("A player left the race", { icon: "👋" }),
    );

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!connected || !socketRef.current || !groupId || groupId === "undefined")
      return;
    joinRace();
  }, [connected, groupId]);

  async function joinRace() {
    if (!groupId || groupId === "undefined") {
      toast.error("Invalid group");
      router.push("/championships");
      return;
    }

    try {
      const response = await fetch(`${API}/races/group/${groupId}`);
      const text = await response.text();
      const existing = text ? JSON.parse(text) : null;

      if (existing && existing._id) {
        raceIdRef.current = existing._id;
        socketRef.current.emit("join_race", { raceId: existing._id });
        return;
      }

      const createResponse = await fetch(`${API}/races/group/${groupId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const createText = await createResponse.text();
      const created = createText ? JSON.parse(createText) : null;

      if (created && created._id) {
        raceIdRef.current = created._id;
        socketRef.current.emit("join_race", { raceId: created._id });
      } else {
        toast.error("Could not connect to race");
        setPageLoading(false);
      }
    } catch {
      toast.error("Could not connect to race");
      setPageLoading(false);
    }
  }

  function startRace() {
    if (!raceIdRef.current || !socketRef.current) return;
    setStarting(true);
    socketRef.current.emit("admin_start_race", { raceId: raceIdRef.current });
    setTimeout(() => setStarting(false), 2000);
  }

  function handleTyping(e: React.ChangeEvent<HTMLInputElement>) {
    if (!race || race.status !== "in_progress" || isAdmin) return;

    const value = e.target.value;

    if (value.endsWith(" ")) {
      const typedWord = value.trim();
      const raceWords = race.text.trim().split(" ");
      const expectedWord = raceWords[currentWordIndex];
      const isCorrect = typedWord === expectedWord;

      const newStatuses = [...wordStatuses];
      newStatuses[currentWordIndex] = isCorrect ? "correct" : "wrong";
      setWordStatuses(newStatuses);

      const newCorrectWords = isCorrect ? correctWords + 1 : correctWords;
      const newTotalWords = totalWords + 1;

      setCorrectWords(newCorrectWords);
      setTotalWords(newTotalWords);
      setCurrentWordIndex(currentWordIndex + 1);
      setCurrentInput("");

      const newWpm = newCorrectWords;
      const newAccuracy = Math.round((newCorrectWords / newTotalWords) * 100);

      setWpm(newWpm);
      setAccuracy(newAccuracy);

      const progress = Math.min(
        Math.round((newCorrectWords / raceWords.length) * 100),
        100,
      );

      if (socketRef.current && raceIdRef.current) {
        socketRef.current.emit("update_progress", {
          raceId: raceIdRef.current,
          progress,
          wpm: newWpm,
          accuracy: newAccuracy,
        });
      }
    } else {
      setCurrentInput(value);
    }
  }

  function renderWords() {
    if (!race) return null;

    const raceWords = race.text.trim().split(" ");

    return raceWords.map((word: string, wordIndex: number) => {
      const status = wordStatuses[wordIndex];
      const isCurrent = wordIndex === currentWordIndex;

      if (status === "correct") {
        return (
          <span key={wordIndex} className="text-green-500 font-medium mr-2">
            {word}
          </span>
        );
      }

      if (status === "wrong") {
        return (
          <span key={wordIndex} className="text-red-400 line-through mr-2">
            {word}
          </span>
        );
      }

      if (isCurrent) {
        return (
          <span
            key={wordIndex}
            className="mr-2 underline decoration-sky-400 decoration-2 underline-offset-4 inline-block"
          >
            {word.split("").map((char, charIndex) => {
              if (charIndex < currentInput.length) {
                return (
                  <span
                    key={charIndex}
                    className={
                      currentInput[charIndex] === char
                        ? "text-sky-600"
                        : "text-red-400"
                    }
                  >
                    {char}
                  </span>
                );
              }
              if (charIndex === currentInput.length) {
                return (
                  <span
                    key={charIndex}
                    className="border-b-2 border-sky-500 text-gray-400"
                  >
                    {char}
                  </span>
                );
              }
              return (
                <span key={charIndex} className="text-gray-300">
                  {char}
                </span>
              );
            })}
          </span>
        );
      }

      return (
        <span key={wordIndex} className="text-gray-300 mr-2">
          {word}
        </span>
      );
    });
  }

  const isWaiting = race?.status === "waiting";
  const isCountdown = race?.status === "countdown";
  const isRunning = race?.status === "in_progress";
  const isFinished = race?.status === "finished";
  const myPlayer = race?.players.find((p: any) => p.user === user?.id);

  const timerColor =
    timeLeft <= 5
      ? "text-red-500"
      : timeLeft <= 10
        ? "text-amber-500"
        : "text-sky-600";

  if (pageLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-7 h-7 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
          <p className="text-gray-400 text-sm">Connecting to race room...</p>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50">
        <div className="bg-white border-b border-gray-100 px-6 py-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div>
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors mb-3 text-sm bg-transparent border-none cursor-pointer"
              >
                <FaArrowLeft className="text-xs" />
                Admin Dashboard
              </button>
              <h1
                className="font-extrabold text-2xl text-gray-900"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Race Monitor
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {isRunning && (
                <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-xl px-4 py-2">
                  <FaClock className="text-sky-500 text-xs" />
                  <span
                    className={`font-extrabold text-lg ${timerColor}`}
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    {timeLeft}s
                  </span>
                </div>
              )}
              <div
                className={`flex items-center gap-2 border rounded-xl px-3 py-2 ${connected ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-400"}`}
                />
                <span
                  className={`text-xs font-medium ${connected ? "text-green-600" : "text-red-500"}`}
                >
                  {connected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <FaChartBar className="text-sky-500 text-sm shrink-0" />
            <p className="text-sky-700 text-sm font-medium">
              You are the admin. You can monitor the race but you cannot type.
            </p>
          </div>

          {(isWaiting || isCountdown) && (
            <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center mb-6 shadow-sm">
              {isCountdown && countdown !== null ? (
                <div>
                  <p className="text-gray-400 text-sm mb-3">
                    Race starting in...
                  </p>
                  <p
                    className="font-extrabold text-8xl text-sky-500"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    {countdown}
                  </p>
                </div>
              ) : (
                <div>
                  <FaUsers className="text-sky-300 text-4xl mx-auto mb-4" />
                  <p
                    className="font-bold text-xl text-gray-900 mb-2"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    Waiting Room
                  </p>
                  <p className="text-gray-400 text-sm mb-6">
                    {race?.players.length || 0} player(s) connected
                  </p>

                  {race && race.players.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mb-8">
                      {race.players.map((p: any) => (
                        <span
                          key={p.user}
                          className="text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 font-medium"
                        >
                          {p.username}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={startRace}
                    disabled={starting || !race || race.players.length < 1}
                    className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl px-10 py-4 font-bold text-base transition-colors cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-sky-100"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    <FaPlay className="text-sm" />
                    {starting ? "Starting..." : "Start Race Now"}
                  </button>

                  <p className="text-gray-400 text-xs mt-3">
                    {!race || race.players.length < 1
                      ? "Need at least 1 player to start"
                      : `${race?.players.length} player(s) ready`}
                  </p>
                </div>
              )}
            </div>
          )}

          {(isRunning || isFinished) && race && (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-sm">
                  <p className="text-gray-400 text-xs mb-1">Players Racing</p>
                  <p
                    className="font-extrabold text-3xl text-gray-900"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    {race.players.length}
                  </p>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-sm">
                  <p className="text-gray-400 text-xs mb-1">Finished</p>
                  <p
                    className="font-extrabold text-3xl text-gray-900"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    {race.players.filter((p: any) => p.finishedAt).length}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-6 shadow-sm">
                <p
                  className="font-bold text-gray-900 mb-5"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {isRunning ? "Live Progress" : "Final Results"}
                </p>
                <div className="flex flex-col gap-5">
                  {race.players
                    .slice()
                    .sort((a: any, b: any) =>
                      isFinished ? a.rank - b.rank : b.progress - a.progress,
                    )
                    .map((player: any, i: number) => (
                      <div key={player.user}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {isFinished && (
                              <span className="text-base">
                                {i === 0
                                  ? "🥇"
                                  : i === 1
                                    ? "🥈"
                                    : i === 2
                                      ? "🥉"
                                      : `#${i + 1}`}
                              </span>
                            )}
                            <span className="text-gray-900 text-sm font-semibold">
                              {player.username}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-400 text-xs">
                              {player.accuracy}% acc
                            </span>
                            <span className="text-gray-900 text-sm font-bold">
                              {player.wpm} WPM
                            </span>
                            <span className="text-gray-400 text-xs">
                              {player.progress}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300 bg-sky-500"
                            style={{ width: `${player.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {isFinished && (
                <div className="text-center">
                  <button
                    onClick={() => router.push("/admin/dashboard")}
                    className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl px-6 py-3 font-bold text-sm transition-colors cursor-pointer border-none shadow-md shadow-sky-100"
                  >
                    <FaChartBar />
                    Back to Dashboard
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="bg-white border-b border-gray-100 px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <button
              onClick={() => router.push("/championships")}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors mb-3 text-sm bg-transparent border-none cursor-pointer"
            >
              <FaArrowLeft className="text-xs" />
              Leave Race
            </button>
            <h1
              className="font-extrabold text-2xl text-gray-900"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Championship Race
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {isRunning && (
              <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-xl px-4 py-2">
                <FaClock className="text-sky-500 text-xs" />
                <span
                  className={`font-extrabold text-lg ${timerColor}`}
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {timeLeft}s
                </span>
              </div>
            )}
            <div
              className={`flex items-center gap-2 border rounded-xl px-3 py-2 ${connected ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
            >
              <div
                className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-400"}`}
              />
              <span
                className={`text-xs font-medium ${connected ? "text-green-600" : "text-red-500"}`}
              >
                {connected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {(isWaiting || isCountdown) && (
          <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center mb-6 shadow-sm">
            {isCountdown && countdown !== null ? (
              <div>
                <p className="text-gray-400 text-sm mb-3">
                  Race starting in...
                </p>
                <p
                  className="font-extrabold text-8xl text-sky-500"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {countdown}
                </p>
              </div>
            ) : (
              <div>
                <FaUsers className="text-sky-300 text-4xl mx-auto mb-4" />
                <p
                  className="font-bold text-xl text-gray-900 mb-2"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  Waiting for race to start
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  {race?.players.length || 0} player(s) in the room
                </p>

                {race && race.players.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {race.players.map((p: any) => (
                      <span
                        key={p.user}
                        className={`text-sm px-3 py-1.5 rounded-full font-medium ${p.user === user?.id ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-500"}`}
                      >
                        {p.username} {p.user === user?.id && "(you)"}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-col items-center gap-2 mt-8">
                  <div className="w-6 h-6 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
                  <p className="text-gray-400 text-sm">
                    Waiting for admin to start...
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {(isRunning || isFinished) && race && (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
                <p className="text-gray-400 text-xs mb-1">WPM</p>
                <p
                  className="font-extrabold text-2xl text-sky-600"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {wpm}
                </p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
                <p className="text-gray-400 text-xs mb-1">Accuracy</p>
                <p
                  className="font-extrabold text-2xl text-emerald-600"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {accuracy}%
                </p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
                <p className="text-gray-400 text-xs mb-1">Progress</p>
                <p
                  className="font-extrabold text-2xl text-gray-900"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {myPlayer?.progress || 0}%
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-4">
                Players
              </p>
              <div className="flex flex-col gap-4">
                {race.players.map((player: any) => (
                  <div key={player.user}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${player.user === user?.id ? "text-sky-600" : "text-gray-700"}`}
                        >
                          {player.username}{" "}
                          {player.user === user?.id && "(you)"}
                        </span>
                        {player.finishedAt && (
                          <span className="text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold">
                            #{player.rank}
                          </span>
                        )}
                      </div>
                      <span className="text-gray-400 text-xs">
                        {player.wpm} WPM
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${player.user === user?.id ? "bg-sky-500" : "bg-gray-300"}`}
                        style={{ width: `${player.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {isFinished ? (
              <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center shadow-sm">
                <div className="text-5xl mb-4">🏁</div>
                <h2
                  className="font-extrabold text-3xl text-gray-900 mb-6"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  Race Complete!
                </h2>
                <div className="flex flex-col gap-3 mb-8 max-w-sm mx-auto">
                  {[...race.players]
                    .sort((a: any, b: any) => a.rank - b.rank)
                    .map((player: any, i: number) => (
                      <div
                        key={player.user}
                        className={`flex items-center justify-between rounded-2xl px-5 py-3 ${player.user === user?.id ? "bg-sky-50 border-2 border-sky-200" : "bg-gray-50 border border-gray-100"}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">
                            {i === 0
                              ? "🥇"
                              : i === 1
                                ? "🥈"
                                : i === 2
                                  ? "🥉"
                                  : `#${i + 1}`}
                          </span>
                          <span
                            className={`text-sm font-semibold ${player.user === user?.id ? "text-sky-700" : "text-gray-700"}`}
                          >
                            {player.username}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-900 text-sm font-bold">
                            {player.wpm} WPM
                          </p>
                          <p className="text-gray-400 text-xs">
                            {player.accuracy}% acc
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl px-6 py-3 font-bold text-sm transition-colors cursor-pointer border-none shadow-md shadow-sky-100"
                  >
                    <FaTrophy />
                    View Dashboard
                  </button>
                  <button
                    onClick={() => router.push("/championships")}
                    className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-sky-300 text-gray-700 rounded-2xl px-6 py-3 font-bold text-sm transition-all cursor-pointer"
                  >
                    Championships
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                <div className="font-mono text-lg mb-6 leading-loose select-none tracking-wide">
                  <div className="flex flex-wrap gap-y-2">{renderWords()}</div>
                </div>
                <div className="w-full h-px bg-gray-100 mb-5" />
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={handleTyping}
                  className="w-full bg-slate-50 border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-900 text-sm outline-none focus:border-sky-400 transition-colors"
                  placeholder="Type the current word and press space..."
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
