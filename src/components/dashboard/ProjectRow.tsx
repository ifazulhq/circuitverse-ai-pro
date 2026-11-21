import Link from "next/link";

type ProjectRowProps = {
  id: string;
  name: string;
  status: string;
  progress?: number;
  completion?: number;
};

export default function ProjectRow({
  id,
  name,
  status,
  progress,
  completion,
}: ProjectRowProps) {
  const displayProgress = progress !== undefined ? progress : (completion ?? 0);

  const statusStyles = {
    Completed:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    "In Progress":
      "border-amber-500/30 bg-amber-500/10 text-amber-400",
    Planning:
      "border-blue-500/30 bg-blue-500/10 text-blue-400",
  };

  const statusDot = {
    Completed: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
    "In Progress": "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]",
    Planning: "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]",
  };

  const currentStatus = (status as keyof typeof statusStyles) in statusStyles
    ? (status as keyof typeof statusStyles)
    : "Planning";

  return (
    <Link
      href={`/dashboard/projects/${id}`}
      className="group flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-md transition-all duration-200 hover:translate-x-1.5 hover:border-cyan-500/50 hover:bg-zinc-800/70 hover:shadow-[0_4px_20px_rgba(6,182,212,0.12)]"
    >
      <div className="flex items-center gap-3">
        <div className="h-1.5 w-1.5 rounded-full bg-zinc-600 transition-colors duration-200 group-hover:bg-cyan-400" />
        <span className="font-medium text-white transition-colors duration-200 group-hover:text-cyan-300">
          {name}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="font-medium">Progress</span>
            <span className="font-bold tabular-nums text-white">{displayProgress}%</span>
          </div>
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-800 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, displayProgress))}%` }}
            />
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
            statusStyles[currentStatus]
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              statusDot[currentStatus]
            }`}
          />
          {status}
        </span>
      </div>
    </Link>
  );
}