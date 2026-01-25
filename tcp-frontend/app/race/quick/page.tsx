"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaBolt, FaRedo, FaArrowLeft, FaClock } from "react-icons/fa";
import { useAuthStore } from "@/store/auth.store";
import { generateWords } from "@/lib/words";

const TIMER_OPTIONS = [15, 30, 60, 120];
const CHUNK_SIZE = 25;

export default function QuickRacePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [chunk, setChunk] = useState<string[]>([]);
  const [chunkStatuses, setChunkStatuses] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState("idle");
  const [countdown, setCountdown] = useState(3);
  const [timeLimit, setTimeLimit] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [language, setLanguage] = useState("en");
  const [correctWords, setCorrectWords] = useState(0);
  const [totalWords, setTotalWords] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to race");
      router.push("/login");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    startNewGame();
  }, [language]);

  useEffect(() => {
    setTimeLeft(timeLimit);
  }, [timeLimit]);

  function startNewGame() {
    const newChunk = generateWords(language as "en" | "fr", CHUNK_SIZE);
    setChunk(newChunk);
    setChunkStatuses(newChunk.map(() => "pending"));
    setCurrentInput("");
    setCurrentIndex(0);
    setStatus("idle");
    setCorrectWords(0);
    setTotalWords(0);
    setTimeLeft(timeLimit);
  }

  function loadNewChunk() {
    const newChunk = generateWords(language as "en" | "fr", CHUNK_SIZE);
    setChunk(newChunk);
    setChunkStatuses(newChunk.map(() => "pending"));
    setCurrentIndex(0);
    setCurrentInput("");
  }

  function startCountdown() {
    setStatus("countdown");
    setCountdown(3);
    let count = 3;
    const interval = setInterval(() => {
      count = count - 1;
      setCountdown(count);
      if (count === 0) {
        clearInterval(interval);
        beginRace();
      }
    }, 1000);
  }

  function beginRace() {
    setStatus("running");
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 50);

    let remaining = timeLimit;
    const interval = setInterval(() => {
      remaining = remaining - 1;
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        setStatus("finished");
        if (inputRef.current) inputRef.current.blur();
      }
    }, 1000);
  }

  function handleTyping(e: React.ChangeEvent<HTMLInputElement>) {
    if (status !== "running") return;
    const value = e.target.value;

    if (value.endsWith(" ")) {
      const typedWord = value.trim();
      const expectedWord = chunk[currentIndex];
      const isCorrect = typedWord === expectedWord;

      const newStatuses = [...chunkStatuses];
      newStatuses[currentIndex] = isCorrect ? "correct" : "wrong";
      setChunkStatuses(newStatuses);

      if (isCorrect) setCorrectWords((prev) => prev + 1);
      setTotalWords((prev) => prev + 1);

      const newIndex = currentIndex + 1;
      if (newIndex >= chunk.length) {
        loadNewChunk();
      } else {
        setCurrentIndex(newIndex);
        setCurrentInput("");
        e.target.value = "";
      }
    } else {
      setCurrentInput(value);
    }
  }

  const wpm = Math.round(correctWords / (timeLimit / 60));
  const accuracy =
    totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 100;
  const liveWpm =
    status === "running" && timeLeft < timeLimit
      ? Math.round(correctWords / ((timeLimit - timeLeft) / 60))
      : 0;

  const timerPercent = (timeLeft / timeLimit) * 100;
  const timerBg =
    timeLeft <= 5
      ? "bg-red-500"
      : timeLeft <= 10
        ? "bg-amber-400"
        : "bg-sky-500";
  const timerText =
    timeLeft <= 5
      ? "text-red-500"
      : timeLeft <= 10
        ? "text-amber-500"
        : "text-gray-900";

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <div className="bg-sky-500 px-6 py-12">
        <div className="max-w-3xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-sky-100 hover:text-white transition-colors mb-3 text-sm bg-transparent border-none cursor-pointer"
            >
              <FaArrowLeft className="text-xs" />
              Back to Dashboard
            </button>
            <h1
              className="font-bold text-3xl text-white"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Quick Race
            </h1>
            <p className="text-sky-100 text-sm mt-1">
              Type as many correct words as possible before time runs out
            </p>
          </div>
          <button
            onClick={startNewGame}
            disabled={status === "running" || status === "countdown"}
            className="flex items-center gap-2 bg-white/20 border border-white/30 text-white hover:bg-white/30 rounded-xl px-4 py-2 text-sm transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FaRedo className="text-xs" />
            Restart
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex flex-wrap gap-2 mb-6">
          {["en", "fr"].map((lang) => (
            <button
              key={lang}
              disabled={status === "running" || status === "countdown"}
              onClick={() => setLanguage(lang)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                language === lang
                  ? "bg-sky-50 border-sky-300 text-sky-700"
                  : "bg-white border-gray-200 text-gray-500 hover:border-sky-200 hover:text-sky-600"
              }`}
            >
              {lang === "en" ? "English" : "French"}
            </button>
          ))}

          <div className="w-px bg-gray-200 mx-1" />

          {TIMER_OPTIONS.map((t) => (
            <button
              key={t}
              disabled={status === "running" || status === "countdown"}
              onClick={() => {
                setTimeLimit(t);
                setTimeLeft(t);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 ${
                timeLimit === t
                  ? "bg-sky-50 border-sky-300 text-sky-700"
                  : "bg-white border-gray-200 text-gray-500 hover:border-sky-200 hover:text-sky-600"
              }`}
            >
              <FaClock className="text-xs" />
              {t}s
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-sky-50 border-2 border-sky-100 rounded-2xl p-4 text-center">
            <p className="text-gray-400 text-xs mb-1">Live WPM</p>
            <p
              className="text-gray-900 font-bold text-2xl"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              {status === "running" ? liveWpm : "—"}
            </p>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 text-center">
            <p className="text-gray-400 text-xs mb-1">Correct Words</p>
            <p
              className="text-gray-900 font-bold text-2xl"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              {status === "idle" ? "—" : correctWords}
            </p>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 text-center">
            <p className="text-gray-400 text-xs mb-1">Time Left</p>
            <p
              className={`font-bold text-2xl ${timerText}`}
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              {status === "idle" ? `${timeLimit}s` : `${timeLeft}s`}
            </p>
          </div>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
          <div
            className={`${timerBg} h-1.5 rounded-full transition-all duration-1000`}
            style={{
              width: `${status === "running" ? timerPercent : status === "idle" ? 100 : 0}%`,
            }}
          />
        </div>

        {status === "finished" ? (
          <div className="bg-white border-2 border-sky-200 rounded-3xl p-10 text-center">
            <div className="text-5xl mb-4">🏁</div>
            <h2
              className="font-bold text-3xl text-gray-900 mb-6"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Time's Up!
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-8 max-w-sm mx-auto">
              <div className="bg-sky-50 border-2 border-sky-100 rounded-2xl p-4">
                <p className="text-gray-400 text-xs mb-1">WPM</p>
                <p
                  className="text-sky-600 font-bold text-2xl"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {wpm}
                </p>
              </div>
              <div className="bg-green-50 border-2 border-green-100 rounded-2xl p-4">
                <p className="text-gray-400 text-xs mb-1">Accuracy</p>
                <p
                  className="text-green-600 font-bold text-2xl"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {accuracy}%
                </p>
              </div>
              <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-4">
                <p className="text-gray-400 text-xs mb-1">Words</p>
                <p
                  className="text-gray-900 font-bold text-2xl"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {totalWords}
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={startNewGame}
                className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl px-6 py-3 font-bold text-sm transition-colors cursor-pointer border-none shadow-md shadow-sky-200"
              >
                <FaRedo /> Try Again
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-sky-300 text-gray-700 rounded-2xl px-6 py-3 font-bold text-sm transition-colors cursor-pointer"
              >
                Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-gray-100 rounded-3xl p-8">
            {status === "countdown" && (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <p className="text-gray-400 text-sm">Get ready...</p>
                <p
                  className="font-bold text-7xl text-sky-500"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {countdown}
                </p>
              </div>
            )}

            {(status === "idle" || status === "running") && (
              <>
                <div className="flex flex-wrap gap-x-3 gap-y-3 font-mono text-lg mb-6 select-none">
                  {chunk.map((word, i) => {
                    const isDone = chunkStatuses[i] === "correct";
                    const isWrong = chunkStatuses[i] === "wrong";
                    const isCurrent = i === currentIndex;

                    if (isDone)
                      return (
                        <span key={i} className="text-green-600">
                          {word}
                        </span>
                      );
                    if (isWrong)
                      return (
                        <span key={i} className="text-red-400 line-through">
                          {word}
                        </span>
                      );

                    if (isCurrent) {
                      return (
                        <span
                          key={i}
                          className="underline decoration-sky-500 decoration-2 underline-offset-4"
                        >
                          {word.split("").map((char, ci) => {
                            if (ci < currentInput.length) {
                              return (
                                <span
                                  key={ci}
                                  className={
                                    currentInput[ci] === char
                                      ? "text-sky-600"
                                      : "text-red-400"
                                  }
                                >
                                  {char}
                                </span>
                              );
                            }
                            if (ci === currentInput.length) {
                              return (
                                <span
                                  key={ci}
                                  className="text-gray-400 border-b-2 border-sky-500"
                                >
                                  {char}
                                </span>
                              );
                            }
                            return (
                              <span key={ci} className="text-gray-300">
                                {char}
                              </span>
                            );
                          })}
                        </span>
                      );
                    }

                    return (
                      <span key={i} className="text-gray-300">
                        {word}
                      </span>
                    );
                  })}
                </div>

                <div className="w-full h-px bg-gray-100 mb-6" />
              </>
            )}

            {status === "idle" && (
              <button
                onClick={startCountdown}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-2xl py-3 font-bold text-sm transition-colors cursor-pointer border-none flex items-center justify-center gap-2 shadow-md shadow-sky-200"
              >
                <FaBolt />
                Start {timeLimit}s Race
              </button>
            )}

            {status === "running" && (
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={handleTyping}
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-900 text-sm outline-none focus:border-sky-400 transition-colors"
                placeholder="Type the highlighted word and press space..."
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
