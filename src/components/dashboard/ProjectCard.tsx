import Link from "next/link";
import { Star, User, Calendar, Clock, ArrowRight } from "lucide-react";

const priorityClasses: Record<"Low" | "Medium" | "High", string> = {
  High: "border-red-500/30 bg-red-500/10 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.2)]",
  Medium: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  Low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
};

const statusClasses: Record<string, string> = {
  Completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  "In Progress": "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  Planning: "border-blue-500/30 bg-blue-500/10 text-blue-400",
};

type ProjectCardProps = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: "Low" | "Medium" | "High";
  owner: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  completion: number;
  progress?: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

export default function ProjectCard({
  id,
  title,
  description,
  status,
  priority,
  owner,
  createdAt,
  updatedAt,
  dueDate,
  completion,
  progress,
  isFavorite,
  onToggleFavorite,
}: ProjectCardProps) {
  const displayProgress = progress !== undefined ? progress : (completion ?? 0);
  const currentStatusClass =
    statusClasses[status] ??
    "border-zinc-700/50 bg-zinc-800/40 text-zinc-300";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-[0_12px_30px_-10px_rgba(6,182,212,0.2)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Full-card click overlay link (excluding favorite button) */}
      <Link
        href={`/dashboard/projects/${id}`}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={`Open project ${title}`}
        tabIndex={-1}
      />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/projects/${id}`}
              className="relative z-10 truncate text-xl font-bold tracking-tight text-white transition-colors duration-200 group-hover:text-cyan-300 hover:underline"
            >
              {title}
            </Link>

            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onToggleFavorite();
              }}
              className="relative z-10 rounded-lg p-1.5 transition-transform duration-200 ease-out active:scale-75 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star
                size={18}
                className={
                  isFavorite
                    ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                    : "text-zinc-600 transition-colors hover:text-zinc-300"
                }
              />
            </button>
          </div>

          <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
            {description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <User size={13} className="text-zinc-500" />
              <span>{owner}</span>
            </span>

            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-zinc-500" />
              <span>Created {createdAt}</span>
            </span>

            {dueDate && (
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-zinc-500" />
                <span>Due {dueDate}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${currentStatusClass}`}
          >
            {status}
          </span>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              priorityClasses[priority] ?? priorityClasses.Low
            }`}
          >
            {priority} Priority
          </span>
        </div>
      </div>

      <div className="relative z-10 mt-5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-zinc-400">Completion</span>
          <span className="font-bold tabular-nums text-white">{displayProgress}%</span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/90 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, displayProgress))}%` }}
          />
        </div>
      </div>

      <div className="relative z-10 mt-6 flex items-center justify-between border-t border-zinc-800/60 pt-4 text-xs text-zinc-500">
        <span>Updated {updatedAt}</span>

        <Link
          href={`/dashboard/projects/${id}`}
          className="relative z-10 overflow-hidden rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-400 px-4 py-2 font-semibold text-zinc-950 shadow-md transition-all duration-200 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
        >
          <span className="relative z-10 flex items-center gap-1.5 text-xs font-bold">
            Open Studio
            <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
        </Link>
      </div>
    </div>
  );
}