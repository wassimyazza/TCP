"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaFacebook,
  FaKeyboard,
} from "react-icons/fa";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated } = useAuthStore();

  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) router.push("/dashboard");
  }, [isAuthenticated]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      setAuth(res.data.user, res.data.token);
      toast.success("Account created!");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-white">
      <div className="hidden lg:flex flex-1 bg-sky-500 flex-col justify-center px-16">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <FaKeyboard className="text-white" />
          </div>
          <span
            className="font-bold text-2xl text-white"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            TCP
          </span>
        </div>
        <h2
          className="font-bold text-4xl text-white mb-4"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          Join thousands
          <br />
          of racers.
        </h2>
        <p className="text-sky-100 text-base mb-10">
          Create your free account and start competing in less than a minute.
        </p>
        <div className="flex flex-col gap-3">
          {[
            "No credit card required",
            "Instant access to all races",
            "Track your WPM over time",
            "Compete in championships",
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center shrink-0">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-sky-100 text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1
              className="font-bold text-3xl text-gray-900 mb-2"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Create account
            </h1>
            <p className="text-gray-400 text-sm">
              Join thousands of competitive typists
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-100 rounded-2xl px-4 py-3 mb-5">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600 font-medium">
                Username
              </label>
              <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 focus-within:border-sky-400 focus-within:bg-white transition-all">
                <FaUser className="text-gray-300 text-sm shrink-0" />
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="yourname"
                  required
                  minLength={3}
                  maxLength={20}
                  className="bg-transparent text-gray-900 text-sm outline-none w-full placeholder-gray-300"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600 font-medium">Email</label>
              <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 focus-within:border-sky-400 focus-within:bg-white transition-all">
                <FaEnvelope className="text-gray-300 text-sm shrink-0" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="bg-transparent text-gray-900 text-sm outline-none w-full placeholder-gray-300"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600 font-medium">
                Password
              </label>
              <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 focus-within:border-sky-400 focus-within:bg-white transition-all">
                <FaLock className="text-gray-300 text-sm shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="bg-transparent text-gray-900 text-sm outline-none w-full placeholder-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-300 hover:text-gray-600 transition-colors cursor-pointer bg-transparent border-none"
                >
                  {showPassword ? (
                    <FaEyeSlash size={14} />
                  ) : (
                    <FaEye size={14} />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-300">Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-2xl py-3 font-bold text-sm transition-colors disabled:opacity-50 cursor-pointer mt-2 shadow-md shadow-sky-200"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="flex flex-col gap-3 mt-6 pt-6 border-t-2 border-gray-50">
            <p className="text-center text-gray-300 text-xs">
              Or continue with
            </p>
            <a
              href="http://localhost:3001/api/auth/google"
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 hover:border-sky-200 rounded-2xl py-3 text-gray-600 text-sm font-semibold hover:text-gray-900 transition-all"
            >
              <FaGoogle className="text-red-500" />
              Continue with Google
            </a>
            <a
              href="http://localhost:3001/api/auth/facebook"
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 hover:border-sky-200 rounded-2xl py-3 text-gray-600 text-sm font-semibold hover:text-gray-900 transition-all"
            >
              <FaFacebook className="text-blue-600" />
              Continue with Facebook
            </a>
          </div>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-sky-500 hover:text-sky-600 transition-colors font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
