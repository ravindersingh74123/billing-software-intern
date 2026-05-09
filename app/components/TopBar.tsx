
"use client";
// app/components/TopBar.tsx

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { ArrowUpRight, BarChart3, Search } from "lucide-react";

interface Props {
  user: { name: string; email: string };
}

export default function TopBar({ user }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-50 w-full border-b border-[#ddeaed]/70 bg-white/70 backdrop-blur-xl no-print">
      <div className="flex w-full items-center justify-between px-6 lg:px-10 py-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center">
            <img
              src="/logo.png"
              className="h-14 w-32 object-contain cursor-pointer"
              alt="Logo"
            />
          </Link>
          <div>
            <div
              className="text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ color: "#2c9fb0" }}
            >
              BanavatNest
            </div>
            <div className="text-[11px]" style={{ color: "#94adb5" }}>
              Build with Purpose. Nurture to Impact.
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          

          {/* ── USER MENU ── */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 border border-[#2aacb840] hover:border-[#2aacb8] rounded px-3 py-1.5 transition"
            >
              {/* Avatar */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2aacb8] to-[#1a7a85] flex items-center justify-center text-white text-[10px] font-bold">
                {initials}
              </div>

              <div className="text-left max-w-[140px]">
                <p className="text-xs font-semibold text-[#2aacb8aa] truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-[#2aacb8aa] truncate">
                  {user.email}
                </p>
              </div>

              {/* Chevron */}
              <svg
                className={`w-3 h-3 text-[#2aacb899] transition ${
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

                <div className="absolute right-0 mt-2 z-20 w-[190px] bg-[#0f1f2e] border border-[#2aacb833] shadow-xl animate-fadeUp">
                  <div className="px-4 py-3 border-b border-[#2aacb820]">
                    <p className="text-[10px] uppercase tracking-wider text-[#2aacb880]">
                      Signed in as
                    </p>
                    <p className="text-sm text-white font-medium">
                      {user.name}
                    </p>
                    <p className="text-xs text-[#2aacb8aa]">{user.email}</p>
                  </div>

                  <div className="border-t border-[#2aacb820] py-1">
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition
                      ${
                        loggingOut
                          ? "text-red-400/40 cursor-wait"
                          : "text-red-400 hover:bg-red-500/10"
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
