"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: "⏱" },
    { href: "/summary", label: "Summary", icon: "📊" },
    { href: "/trends", label: "Trends", icon: "📈" },
    { href: "/earnings", label: "Earnings", icon: "💰" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
  ];

  const linkClass = (path: string) =>
    `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      pathname === path
        ? "bg-themed-muted text-white shadow-lg shadow-themed"
        : "text-gray-300 hover:bg-themed-muted/40 hover:text-white"
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-themed/20">
      <div className="w-full px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-themed rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-themed">
              H
            </div>
            <span className="font-bold text-lg text-white">
              Hour<span className="text-themed">Tracker</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 ml-1"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-themed-muted/40 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-1 animate-slide-up">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block ${linkClass(item.href)}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
