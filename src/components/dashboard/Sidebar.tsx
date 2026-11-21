"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Bot, Settings, ArrowLeft } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", exact: true, icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Projects", exact: false, icon: FolderKanban },
  { href: "/dashboard/ai", label: "AI Assistant", exact: false, icon: Bot },
  { href: "/dashboard/settings", label: "Settings", exact: false, icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex min-h-screen w-64 flex-col border-r border-gray-800 bg-zinc-950 text-white">
      {/* Logo */}
      <div className="border-b border-gray-800 p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-cyan-400 tracking-tight">
            CircuitVerse AI
          </h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-zinc-950 ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400 font-semibold border-l-2 border-cyan-400"
                  : "text-zinc-400 hover:bg-zinc-800/80 hover:text-white"
              }`}
            >
              <Icon size={18} className={isActive ? "text-cyan-400" : "text-zinc-400"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Return Home */}
      <div className="mt-auto border-t border-gray-800/80 p-4">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-3.5 py-2.5 text-xs font-semibold text-zinc-400 transition hover:border-cyan-500/50 hover:bg-zinc-800/60 hover:text-cyan-300"
        >
          <ArrowLeft size={14} className="transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back to Landing Page</span>
        </Link>
      </div>
    </aside>
  );
}