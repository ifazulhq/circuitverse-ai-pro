import * as React from "react";

export type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  tag?: string;
  accentColor?: "cyan" | "violet" | "emerald" | "blue";
};

export default function FeatureCard({
  icon,
  title,
  description,
  tag,
  accentColor = "cyan",
}: FeatureCardProps) {
  const accentStyles = {
    cyan: {
      border: "hover:border-cyan-500/50 hover:shadow-[0_20px_50px_rgba(6,182,212,0.15)]",
      glow: "bg-cyan-500/10 group-hover:bg-cyan-500/20",
      line: "via-cyan-500/50",
      iconBox: "border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]",
      tagText: "text-cyan-400",
      tagBorder: "border-cyan-500/30 bg-cyan-950/40",
    },
    violet: {
      border: "hover:border-violet-500/50 hover:shadow-[0_20px_50px_rgba(139,92,246,0.15)]",
      glow: "bg-violet-500/10 group-hover:bg-violet-500/20",
      line: "via-violet-500/50",
      iconBox: "border-violet-500/30 bg-gradient-to-br from-violet-500/20 to-purple-500/10 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.2)]",
      tagText: "text-violet-400",
      tagBorder: "border-violet-500/30 bg-violet-950/40",
    },
    emerald: {
      border: "hover:border-emerald-500/50 hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)]",
      glow: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
      line: "via-emerald-500/50",
      iconBox: "border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
      tagText: "text-emerald-400",
      tagBorder: "border-emerald-500/30 bg-emerald-950/40",
    },
    blue: {
      border: "hover:border-blue-500/50 hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)]",
      glow: "bg-blue-500/10 group-hover:bg-blue-500/20",
      line: "via-blue-500/50",
      iconBox: "border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]",
      tagText: "text-blue-400",
      tagBorder: "border-blue-500/30 bg-blue-950/40",
    },
  };

  const style = accentStyles[accentColor] || accentStyles.cyan;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:bg-zinc-900/70 ${style.border}`}
    >
      {/* Ambient background corner spotlight */}
      <div
        className={`absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150 ${style.glow}`}
      />

      {/* Top glowing accent line */}
      <div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${style.line} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      />

      <div className="relative z-10 flex flex-col">
        {/* Header row with Icon and Tag */}
        <div className="flex items-center justify-between gap-3">
          <div
            className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${style.iconBox}`}
          >
            {icon}
          </div>

          {tag && (
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-semibold tracking-wider uppercase ${style.tagBorder} ${style.tagText}`}
            >
              {tag}
            </span>
          )}
        </div>

        {/* Content */}
        <h3 className="mt-5 text-xl font-bold tracking-tight text-white transition-colors duration-200 group-hover:text-cyan-100">
          {title}
        </h3>

        <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">
          {description}
        </p>
      </div>
    </div>
  );
}