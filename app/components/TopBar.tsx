
"use client";
// app/components/TopBar.tsx

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { ArrowUpRight, BarChart3, Search, Sun, Moon } from "lucide-react";

interface Props {
  user: { name: string; email: string };
}

export default function TopBar({ user }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", newTheme);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  // Initials avatar
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // ✅ ACTIVE CHECK (supports nested routes too)
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#ddeaed]/70 dark:border-zinc-800 bg-white/70 dark:bg-[#09090b]/90 backdrop-blur-xl print:hidden transition-colors duration-300">
      <div className="flex w-full items-center justify-between px-6 lg:px-10 py-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center">
            <img
              src="/logo.png"
              className="h-14 w-32 object-contain cursor-pointer"
              alt="Logo"
            />
          </Link>
          <div className="hidden sm:block">
            <div
              className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#2D3561] dark:text-zinc-100"
            >
              BanavatNest
            </div>
            <div className="text-[11px] text-[#94adb5] dark:text-zinc-400">
              Build with Purpose. Nurture to Impact.
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 ml-auto mr-8 text-sm font-bold text-[#2D3561] dark:text-zinc-300">
          <Link href="/dashboard" className={`transition hover:text-[#3A9B9B] ${isActive("/dashboard") ? "text-[#3A9B9B] border-b-2 border-[#3A9B9B] py-1" : "py-1"}`}>
            Dashboard
          </Link>
          <Link href="/emi-calculator" className={`transition hover:text-[#3A9B9B] ${isActive("/emi-calculator") ? "text-[#3A9B9B] border-b-2 border-[#3A9B9B] py-1" : "py-1"}`}>
            EMI Calculator
          </Link>
          <Link href="/cryptocalculator" className={`transition hover:text-[#3A9B9B] ${isActive("/cryptocalculator") ? "text-[#3A9B9B] border-b-2 border-[#3A9B9B] py-1" : "py-1"}`}>
            Crypto Calculator
          </Link>
          <Link href="/gst-calculator" className={`transition hover:text-[#3A9B9B] ${isActive("/gst-calculator") ? "text-[#3A9B9B] border-b-2 border-[#3A9B9B] py-1" : "py-1"}`}>
            GST Calculator
          </Link>
          <Link href="/incometax-calculator" className={`transition hover:text-[#3A9B9B] ${isActive("/incometax-calculator") ? "text-[#3A9B9B] border-b-2 border-[#3A9B9B] py-1" : "py-1"}`}>
            Tax Calculator
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-300 text-zinc-600 dark:text-zinc-400"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* ── USER MENU ── */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 border border-[#2aacb840] dark:border-zinc-800 hover:border-[#3A9B9B] rounded px-3 py-1.5 transition"
            >
              {/* Avatar */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3A9B9B] to-[#2D3561] flex items-center justify-center text-white text-[10px] font-bold">
                {initials}
              </div>

              <div className="text-left max-w-[140px] hidden sm:block">
                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-500 truncate">
                  {user.email}
                </p>
              </div>

              {/* Chevron */}
              <svg
                className={`w-3 h-3 text-zinc-400 transition ${
                  menuOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />

                <div className="absolute right-0 mt-2 z-20 w-[190px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-xl animate-fadeUp rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                      Signed in as
                    </p>
                    <p className="text-sm text-zinc-900 dark:text-zinc-100 font-bold">
                      {user.name}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left font-bold transition
                      ${
                        loggingOut
                          ? "text-red-400/40 cursor-wait"
                          : "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                      }`}
                    >
                      {loggingOut ? "Signing out…" : "Sign Out"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
