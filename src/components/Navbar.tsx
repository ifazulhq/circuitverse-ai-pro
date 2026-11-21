"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 border-b border-gray-800 bg-black/80 backdrop-blur-md">
      <Link
        href="/"
        className="text-2xl md:text-3xl font-extrabold text-blue-500 tracking-wide transition-colors duration-300 hover:text-blue-400"
      >
        CircuitVerse AI Pro
      </Link>

      <div className="hidden md:flex items-center gap-7 text-gray-300 text-sm font-medium">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`transition-all duration-300 hover:text-blue-400 hover:-translate-y-0.5 ${
                isActive
                  ? "text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5"
                  : "text-gray-300"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="hidden md:flex items-center gap-4">
        <Link
          href="/dashboard"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
        >
          Launch App →
        </Link>
      </div>

      <button
        type="button"
        className="md:hidden text-2xl text-gray-300 focus:outline-none"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-black/95 border-b border-gray-800 px-8 py-6 flex flex-col gap-4 md:hidden backdrop-blur-xl">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`text-base py-1 transition-colors ${
                  isActive
                    ? "text-cyan-400 font-semibold pl-2 border-l-2 border-cyan-400"
                    : "text-gray-300 hover:text-blue-400"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="mt-2 text-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Launch App →
          </Link>
        </div>
      )}
    </nav>
  );
}