type StatCardProps = {
  title: string;
  value: string;
  icon: string;
};

export default function StatCard({
  title,
  value,
  icon,
}: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-500/50 hover:shadow-[0_12px_30px_-10px_rgba(6,182,212,0.25)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400">
            {title}
          </p>

          <h2 className="mt-3 text-4xl font-bold tracking-tight text-white tabular-nums">
            {value}
          </h2>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/15 via-cyan-500/5 to-transparent text-3xl shadow-inner transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-6">
          {icon}
        </div>
      </div>
    </div>
  );
}