import Link from "next/link";
import {
  Zap,
  Sparkles,
  Activity,
  Cpu,
  Layers,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import FeatureCard from "@/components/FeatureCard";
import { HeroCircuitPreview } from "@/components/marketing/HeroCircuitPreview";

export default function Home() {
  const metrics = [
    { label: "Logic Tick Rate", value: "< 1ms", detail: "Sub-millisecond loop" },
    { label: "Active Gate Library", value: "20+", detail: "Gates, Latches & ICs" },
    { label: "Native Execution", value: "100%", detail: "Zero install required" },
    { label: "AI Co-Design", value: "Hybrid", detail: "Gemini + GPT Synthesis" },
  ];

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Real-Time Digital Engine",
      description:
        "High-performance discrete event simulation calculating wire signals and propagation transitions with zero lag.",
      tag: "Sub-Millisecond",
      accentColor: "cyan" as const,
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "In-Editor AI Copilot",
      description:
        "Prompt the AI copilot to explain truth conditions, resolve race conditions, or synthesize and insert sub-circuits on demand.",
      tag: "Streaming LLM",
      accentColor: "violet" as const,
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Logic Analyzer Waveforms",
      description:
        "Probe any wire or gate output to trace HIGH/LOW digital clock cycles on an authentic digital oscilloscope.",
      tag: "Oscilloscope",
      accentColor: "emerald" as const,
    },
    {
      icon: <Cpu className="h-6 w-6" />,
      title: "Truth Table Extraction",
      description:
        "Automatically solve and generate comprehensive combinational truth tables with full input/output safety boundaries.",
      tag: "Automated",
      accentColor: "blue" as const,
    },
    {
      icon: <Layers className="h-6 w-6" />,
      title: "Cross-Device Cloud Sync",
      description:
        "Persist all your projects, custom components, and editor density settings securely in cloud PostgreSQL storage.",
      tag: "PostgreSQL",
      accentColor: "cyan" as const,
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Interactive Learning Lab",
      description:
        "Master boolean algebra, multiplexers, decoders, and sequential flip-flops through tactile hands-on experimentation.",
      tag: "Curriculum",
      accentColor: "emerald" as const,
    },
  ];

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white selection:bg-cyan-500 selection:text-black">
      {/* ── Cybernetic Background Gradients & Floating Plasma Glows ───────── */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Schematic Grid */}
        <div className="absolute inset-0 bg-cyber-grid opacity-30" />

        {/* Ambient Top Glow */}
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-cyan-950/20 via-transparent to-transparent" />

        {/* Floating Cyan Plasma Orb */}
        <div className="absolute left-1/4 top-16 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[120px] animate-float-slow" />

        {/* Floating Violet Plasma Orb */}
        <div className="absolute right-1/4 top-40 h-[450px] w-[450px] translate-x-1/2 rounded-full bg-violet-600/15 blur-[140px] animate-float-reverse" />
      </div>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-28">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          {/* Animated Futuristic Pill Badge */}
          <div className="group mb-8 inline-flex items-center gap-2.5 rounded-full border border-cyan-500/30 bg-zinc-900/80 px-4 py-1.5 shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-xl transition hover:border-cyan-400/60">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-semibold tracking-wider text-cyan-300">
              NEXT-GEN AI DIGITAL CIRCUIT CAD
            </span>
            <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-mono font-bold text-cyan-400 border border-cyan-500/20">
              v2.0
            </span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Design Digital Logic{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(34,211,238,0.25)]">
              Powered by AI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-3xl text-base text-zinc-400 sm:text-xl md:text-2xl leading-relaxed">
            Build, simulate, and analyze digital circuits with real-time waveform timing,
            automated truth tables, and an in-editor AI copilot that synthesizes logic on demand.
          </p>

          {/* Primary & Secondary CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/dashboard"
              className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-4 text-base sm:text-lg font-bold text-black shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_45px_rgba(6,182,212,0.7)]"
            >
              {/* Shimmer sweep reflection on hover */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
              <span>Launch Studio Free</span>
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/pricing"
              className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-8 py-4 text-base sm:text-lg font-semibold text-zinc-300 backdrop-blur-md transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
            >
              <span>Explore Plans</span>
            </Link>
          </div>

          {/* Value Props Strip */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>100% In-Browser Simulator</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span>Free Forever Tier</span>
            </div>
          </div>

          {/* ── Interactive Hero Playground Component ────────────────────── */}
          <HeroCircuitPreview />
        </div>
      </section>

      {/* ── Metrics / Capabilities Social Proof Bar ────────────────────── */}
      <section className="border-y border-zinc-800/80 bg-zinc-950/60 py-10 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="flex flex-col items-center justify-center rounded-xl border border-zinc-900 bg-zinc-900/30 p-4 text-center transition hover:border-zinc-800"
              >
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
                  {m.value}
                </span>
                <span className="mt-1 text-sm font-semibold text-cyan-400">
                  {m.label}
                </span>
                <span className="text-xs text-zinc-500">
                  {m.detail}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid Section ───────────────────────────────────────── */}
      <section id="features" className="relative px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-cyan-400">
              COMPLETE DIGITAL WORKSTATION
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl text-white">
              Everything You Need to Build, Test & Learn
            </h2>
            <p className="mt-4 text-base sm:text-lg text-zinc-400">
              Designed from the ground up for electrical engineers, computer science students,
              and hobbyists who demand sub-millisecond precision and AI capability.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                tag={feature.tag}
                accentColor={feature.accentColor}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom Conversion Banner ────────────────────────────────────── */}
      <section className="relative px-6 pb-24 sm:pb-32">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-8 sm:p-14 text-center shadow-[0_0_80px_rgba(6,182,212,0.15)] backdrop-blur-2xl">
          <div className="mx-auto max-w-2xl">
            <span className="rounded-full border border-cyan-500/30 bg-cyan-950/60 px-3.5 py-1 text-xs font-mono font-semibold text-cyan-300">
              START BUILDING IN SECONDS
            </span>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl lg:text-5xl text-white">
              Ready to Design Logic at the Speed of Thought?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-zinc-400">
              Join thousands of students and engineers simulating digital logic with real-time AI assistance.
            </p>

            <div className="mt-8 flex justify-center">
              <Link
                href="/dashboard"
                className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-cyan-400 px-8 py-4 text-base sm:text-lg font-bold text-black shadow-[0_0_30px_rgba(34,211,238,0.5)] transition hover:bg-cyan-300 hover:scale-105"
              >
                <span>Launch CircuitVerse AI Pro Free</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
