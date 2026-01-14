"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaKeyboard,
  FaBolt,
  FaTrophy,
  FaChartBar,
  FaSignOutAlt,
  FaCog,
  FaUserCircle,
  FaHome,
  FaUsers,
} from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import { useAuthStore } from "@/store/auth.store";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  function handleLogout() {
    logout();
    router.push("/");
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/admin/dashboard") return pathname === "/admin/dashboard";
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const guestLinks = [
    { href: "/", label: "Home", icon: <FaHome className="text-xs" /> },
    {
      href: "/championships",
      label: "Championships",
      icon: <FaTrophy className="text-xs" />,
    },
    {
      href: "/stats",
      label: "Leaderboard",
      icon: <FaChartBar className="text-xs" />,
    },
  ];

  const userLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <FaChartBar className="text-xs" />,
    },
    {
      href: "/championships",
      label: "Championships",
      icon: <FaTrophy className="text-xs" />,
    },
    {
      href: "/stats",
      label: "Leaderboard",
      icon: <FaChartBar className="text-xs" />,
    },
  ];

  const adminLinks = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: <FaChartBar className="text-xs" />,
    },
    {
      href: "/admin/championships",
      label: "Championships",
      icon: <FaTrophy className="text-xs" />,
    },
    {
      href: "/admin/groups",
      label: "Groups",
      icon: <FaUsers className="text-xs" />,
    },
    {
      href: "/stats",
      label: "Leaderboard",
      icon: <FaChartBar className="text-xs" />,
    },
  ];

  const navLinks =
    mounted && isAuthenticated
      ? user?.role === "admin"
        ? adminLinks
        : userLinks
      : guestLinks;

  const logoHref =
    mounted && isAuthenticated
      ? user?.role === "admin"
        ? "/admin/dashboard"
        : "/dashboard"
      : "/";

  const profileHref =
    user?.role === "admin" ? "/admin/dashboard" : "/dashboard";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b ${scrolled ? "bg-white shadow-sm border-gray-200" : "bg-white border-gray-100"}`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href={logoHref} className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
            <FaKeyboard className="text-white text-sm" />
          </div>
          <span
            className="font-bold text-lg text-gray-900 tracking-tight"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Key<span className="text-sky-500">Race</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive(link.href)
                  ? "text-sky-600 bg-sky-50"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {mounted && isAuthenticated && user?.role !== "admin" && (
            <Link
              href="/race/quick"
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
            >
              <FaBolt className="text-xs" />
              Quick Race
            </Link>
          )}

          {mounted && isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 rounded-xl px-3 py-2 text-sm transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-medium text-gray-800">
                  {user?.username}
                </span>
                {user?.role === "admin" && (
                  <span className="text-xs bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-lg font-semibold">
                    admin
                  </span>
                )}
                <svg
                  className={`w-3 h-3 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-2xl shadow-lg shadow-gray-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-gray-900 text-sm font-bold">
                      {user?.username}
                    </p>
                    <p className="text-gray-400 text-xs">{user?.username}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href={profileHref}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <FaChartBar className="text-xs text-gray-400" />
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <FaCog className="text-xs text-gray-400" />
                      Profile Settings
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer bg-transparent border-none"
                    >
                      <FaSignOutAlt className="text-xs" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            mounted && (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-xl transition-colors"
                >
                  Sign up for free
                </Link>
              </div>
            )
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-700 bg-transparent border-none cursor-pointer p-1"
        >
          {menuOpen ? <HiX size={22} /> : <HiMenu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
                isActive(link.href)
                  ? "text-sky-600 bg-sky-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}

          <div className="border-t border-gray-100 mt-3 pt-3 flex flex-col gap-2">
            {mounted && isAuthenticated && user?.role !== "admin" && (
              <Link
                href="/race/quick"
                className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-4 py-3 text-sm font-semibold transition-colors"
              >
                <FaBolt className="text-xs" />
                Quick Race
              </Link>
            )}

            {mounted && isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <FaCog className="text-xs text-gray-400" />
                  Profile Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer bg-transparent border-none w-full"
                >
                  <FaSignOutAlt className="text-xs" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 text-center px-4 py-3 text-sm text-gray-600 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors font-medium"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="flex-1 text-center px-4 py-3 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-xl transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
