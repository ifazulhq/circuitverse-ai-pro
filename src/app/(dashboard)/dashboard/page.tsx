"use client";

import { useSession } from "next-auth/react";
import { useProjects } from "@/context/ProjectContext";
import DashboardSection from "@/components/dashboard/DashboardSection";
import ProjectRow from "@/components/dashboard/ProjectRow";
import StatCard from "@/components/dashboard/StatCard";
import { stats } from "@/data/dashboardData";
import { filterAndSortProjects } from "@/lib/projectFilters";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { getPlanDefinition } from "@/lib/plans";
export default function DashboardPage() {
   const { data: session } = useSession();
   const [subscription, setSubscription] = useState<{
  plan: "FREE" | "PRO";
  status: string;
  subscriptionEndsAt: string | null;
} | null>(null);

const [subscriptionLoading, setSubscriptionLoading] =
  useState(true);
  const [checkoutLoading, setCheckoutLoading] =
  useState(false);

const [checkoutError, setCheckoutError] =
  useState<string | null>(null);
const [aiChatCount, setAIChatCount] = useState<number | null>(null);  
const [successRate, setSuccessRate] = useState<number | null>(null);
  const {
  projects,
  error,
  searchQuery: search,
  setSearchQuery: setSearch,
} = useProjects();
  useEffect(() => {
    let cancelled = false;

    async function loadDashboardStats() {
      try {
        const response = await fetch("/api/dashboard/stats", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load dashboard statistics.");
        }

        const data = await response.json();

        if (!cancelled) {
          if (data.subscription) {
            setSubscription(data.subscription);
          }
          if (typeof data.aiChatCount === "number") {
            setAIChatCount(data.aiChatCount);
          }
          if (typeof data.successRate === "number") {
            setSuccessRate(data.successRate);
          }
        }
      } catch (error) {
        console.error("Failed to load dashboard statistics:", error);
      } finally {
        if (!cancelled) {
          setSubscriptionLoading(false);
        }
      }
    }

    loadDashboardStats();

    return () => {
      cancelled = true;
    };
  }, []);
async function handleUpgrade() {
  setCheckoutLoading(true);
  setCheckoutError(null);

  try {
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ?? "Failed to start checkout."
      );
    }

    if (!data.url) {
      throw new Error(
        "Stripe checkout URL was not returned."
      );
    }

    window.location.href = data.url;
  } catch (error) {
    console.error("Upgrade checkout failed:", error);

    setCheckoutError(
      error instanceof Error
        ? error.message
        : "Failed to start checkout."
    );
  } finally {
    setCheckoutLoading(false);
  }
}
const currentPlan =
  subscription?.plan === "PRO" ? "PRO" : "FREE";

const planDefinition =
  getPlanDefinition(currentPlan);

const projectLimit =
  planDefinition.usageLimits.maxProjects;

const projectUsage =
  Math.min(projects.length, projectLimit);

const filteredProjects = filterAndSortProjects({
  projects,
  searchQuery: search,
  selectedFilter: "All",
  sortOption: "Newest",
}).slice(0, 3);
const dynamicStats = stats.map((stat) => {
  if (stat.title === "Projects") {
    return {
      ...stat,
      value: String(projects.length),
    };
  }
if (stat.title === "AI Chats") {
  return {
    ...stat,
    value: aiChatCount === null ? "..." : String(aiChatCount),
  };
}
if (stat.title === "Success Rate") {
  return {
    ...stat,
    value: successRate === null ? "..." : `${successRate}%`,
  };
}
  if (stat.title === "Completed") {
    return {
      ...stat,
      value: String(
        projects.filter(
          (project) => project.status === "Completed"
        ).length
      ),
    };
  }

  if (stat.title === "In Progress") {
    return {
      ...stat,
      value: String(
        projects.filter(
          (project) => project.status === "In Progress"
        ).length
      ),
    };
  }

  return stat;
});
  return (
  <div>
    <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
  Welcome back, {session?.user?.name?.split(" ")[0] ?? "User"} 👋
</h1>

    <p className="mt-3 max-w-2xl text-sm text-gray-400 sm:text-base">
  Build, simulate and manage your digital circuits here.
</p>
    <div className="relative mt-6 overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-zinc-950/90 via-zinc-900/80 to-zinc-950/90 p-6 backdrop-blur-xl shadow-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400/80">
            Subscription Tier
          </p>

          <p className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {subscriptionLoading
              ? "Loading..."
              : subscription?.plan === "PRO"
                ? "CircuitVerse Pro"
                : "Free Explorer Tier"}
          </p>
        </div>

        {!subscriptionLoading && subscription?.plan === "PRO" && (
          <span className="relative flex items-center gap-2 rounded-full border border-cyan-400/50 bg-cyan-950/60 px-3.5 py-1 text-xs font-semibold text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
            </span>
            Active Pro Plan
          </span>
        )}

        {!subscriptionLoading && subscription?.plan !== "PRO" && (
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={checkoutLoading}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-md transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              {checkoutLoading ? "Starting checkout..." : "Upgrade to Pro →"}
            </span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
          </button>
        )}
      </div>
    </div>

    <div className="mt-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-xl shadow-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Usage & Telemetry
        </h2>
        <span className="text-xs font-medium text-zinc-400">
          Real-Time Limits
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0 rounded-xl border border-zinc-800/90 bg-zinc-950/60 p-4 transition-all duration-200 hover:border-zinc-700/80">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Projects
          </p>

          <p className="mt-1 text-xl font-bold tracking-tight text-white tabular-nums">
            {projectUsage} / {projectLimit}
          </p>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800/80 p-0.5 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-700 ease-out"
              style={{
                width: `${Math.min(
                  (projectUsage / projectLimit) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-zinc-800/90 bg-zinc-950/60 p-4 transition-all duration-200 hover:border-zinc-700/80">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            AI Assistant
          </p>

          <p className="mt-1 text-xl font-bold tracking-tight text-white tabular-nums">
            {planDefinition.usageLimits.aiAssistantRequestsPerMonth}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            requests / month
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-zinc-800/90 bg-zinc-950/60 p-4 transition-all duration-200 hover:border-zinc-700/80">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Circuit Generation
          </p>

          <p className="mt-1 text-xl font-bold tracking-tight text-white tabular-nums">
            {planDefinition.usageLimits.aiCircuitGenerationsPerMonth}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            generations / month
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-zinc-800/90 bg-zinc-950/60 p-4 transition-all duration-200 hover:border-zinc-700/80">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Storage per Project
          </p>

          <p className="mt-1 text-xl font-bold tracking-tight text-white tabular-nums">
            {planDefinition.usageLimits.maxStoragePerProjectMB} MB
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            maximum storage
          </p>
        </div>
      </div>
    </div>
{checkoutError && (
  <div
    role="alert"
    className="mt-4 min-w-0 rounded-xl border border-red-500/30 bg-red-950/20 p-5"
  >
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 font-bold text-red-400">
        !
      </div>

      <div className="min-w-0">
        <p className="font-medium text-red-300">
          Unable to start upgrade
        </p>

        <p className="mt-1 text-sm text-red-400">
          {checkoutError}
        </p>

        <p className="mt-2 text-sm text-zinc-400">
          Please try again. If the problem continues, check your
          subscription settings.
        </p>
      </div>
    </div>
  </div>
)}

    <div className="mt-8 flex w-full max-w-md items-center gap-3">
  <div className="relative flex-1 rounded-xl transition-all duration-200 focus-within:ring-2 focus-within:ring-cyan-500/30 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
    <Search
      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
      size={18}
    />

    <input
      type="text"
      placeholder="Search projects..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/80 py-2.5 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:border-cyan-400 focus:outline-none transition-all duration-200"
    />
  </div>

  {search && (
    <button
  type="button"
  onClick={() => setSearch("")}
  className="shrink-0 rounded-xl border border-zinc-700/80 bg-zinc-800/80 px-3 py-2 text-sm text-zinc-300 transition hover:border-cyan-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-zinc-900 sm:px-4"
>
  Clear
</button>
  )}
</div>
{error && (
  <div
    role="alert"
    className="mt-8 rounded-xl border border-red-500/30 bg-red-950/20 p-5"
  >
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 font-bold text-red-400">
        !
      </div>

      <div className="min-w-0">
        <p className="font-medium text-red-300">
          Unable to load projects
        </p>

        <p className="mt-1 text-sm text-red-400">
          {error}
        </p>

        <p className="mt-2 text-sm text-zinc-400">
          Please refresh the page and try again.
        </p>
      </div>
    </div>
  </div>
)}   

    {/* Statistics */}
    <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
     {dynamicStats.map((stat) => (
  <StatCard
    key={stat.title}
    title={stat.title}
    value={stat.value}
    icon={stat.icon}
  />
))}
    </div>
   <DashboardSection
  title="Recent Projects"
  description="Continue working on your latest circuit simulations."
>
  <div className="min-w-0 space-y-4">
    {filteredProjects.length > 0 ? (
  filteredProjects.map((project) => (
    <ProjectRow
      key={project.id}
      id={project.id}
      name={project.name}
      status={project.status}
      progress={project.progress ?? project.completion}
    />
  ))
) : (
  <div className="rounded-lg border border-dashed border-gray-700 p-8 text-center">
    <p className="text-lg font-medium text-gray-300">
      No projects found
    </p>

    <p className="mt-2 text-sm text-gray-500">
      Try searching with a different keyword.
    </p>
  </div>
)}
  </div>
</DashboardSection>
  </div>
);
}