"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import NewProjectModal from "./NewProjectModal";
import { useProjects } from "@/context/ProjectContext";
import { useToast } from "@/context/ToastContext";
import type { NewProject } from "@/types/dashboard";

const navItems = [
  { href: "/dashboard", label: "Dashboard", exact: true },
  { href: "/dashboard/projects", label: "Projects", exact: false },
  { href: "/dashboard/ai", label: "AI Assistant", exact: false },
  { href: "/dashboard/settings", label: "Settings", exact: false },
];

function getPageTitle(path: string): string {
  if (path === "/dashboard") return "Dashboard";
  if (path.includes("/editor")) return "Circuit Editor";
  if (path.startsWith("/dashboard/projects/")) return "Project Details";
  if (path.startsWith("/dashboard/projects")) return "Projects";
  if (path.startsWith("/dashboard/ai/generate")) return "AI Circuit Generator";
  if (path.startsWith("/dashboard/ai")) return "AI Assistant";
  if (path.startsWith("/dashboard/settings")) return "Settings";
  return "Dashboard";
}

export default function DashboardNavbar() {
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { addProject } = useProjects();
  const { showToast } = useToast();

  const handleCreateProject = async (project: NewProject) => {
    try {
      await addProject(project);
      showToast("Project created successfully.", "success");
      setOpen(false);
    } catch (error) {
      console.error("Failed to create project:", error);
      showToast("Failed to create project.", "error");
    }
  };

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-zinc-950 px-6 text-white">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-gray-300 transition hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-zinc-950 md:hidden"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <h2 className="text-xl font-semibold text-white">
            {getPageTitle(pathname)}
          </h2>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setOpen(true)}
            className="shrink-0 whitespace-nowrap rounded-lg bg-cyan-500 px-4 py-2 font-medium text-black transition hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-zinc-950"
          >
            + New Project
          </button>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 overflow-hidden">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "User"}
                width={40}
                height={40}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span>
                {session?.user?.name?.charAt(0) ?? "U"}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/signin" })}
            className="shrink-0 whitespace-nowrap rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
          >
            Sign Out
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-800 bg-zinc-950 px-4 py-3">
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-lg px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-400 font-semibold border-l-2 border-cyan-400"
                      : "text-gray-300 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="mt-2 border-t border-gray-800 pt-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-cyan-300"
              >
                <span>← Back to Landing Page</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
      {open && (
        <NewProjectModal
  onClose={() => setOpen(false)}
  onCreateProject={handleCreateProject}
/>
      )}
    </>
  );
}