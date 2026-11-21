import Link from "next/link";
import {
  Sparkles,
  Cpu,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

export default function AboutPage() {
  const pillars = [
    {
      icon: <GraduationCap className="h-6 w-6 text-cyan-400" />,
      title: "Pedagogy First",
      description:
        "Designed from the ground up for learning. Whether you are an undergraduate studying boolean algebra or a seasoned digital architect designing a RISC pipeline, the UI provides immediate tactile feedback.",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-violet-400" />,
      title: "Intelligent Co-Design",
      description:
        "AI shouldn't replace understanding—it should illuminate it. Our Copilot explains circuit state transitions, detects race conditions, and generates clean building blocks to accelerate comprehension.",
    },
    {
      icon: <Cpu className="h-6 w-6 text-emerald-400" />,
      title: "Zero-Barrier Access",
      description:
        "No complex toolchains, multi-gigabyte desktop installers, or license dongles. CircuitVerse AI Pro runs natively at 60 FPS in any modern web browser across Windows, macOS, Linux, and iPadOS.",
    },
  ];

  const milestones = [
    {
      year: "2024",
      title: "The Vision",
      detail:
        "Started with a goal to modernize computer architecture education by combining responsive vector graphics with discrete event simulation.",
    },
    {
      year: "2025",
      title: "Waveform Engine & Cloud Sync",
      detail:
        "Engineered the in-browser digital logic oscilloscope and PostgreSQL cloud persistence with Prisma ORM for seamless project storage.",
    },
    {
      year: "2026",
      title: "CircuitVerse AI Pro",
      detail:
        "Introduced the streaming Gemini AI Copilot, automated sub-circuit synthesis, multi-theming engine, and full touch tablet support.",
    },
  ];

  const stackItems = [
    { name: "Next.js 16", role: "App Router & SSR Architecture" },
    { name: "React 19", role: "Modern Component State & Concurrency" },
    { name: "Prisma ORM 7", role: "Type-Safe Relational Data Layer" },
    { name: "PostgreSQL", role: "Robust Cloud Project Storage" },
    { name: "Tailwind CSS v4", role: "Design Tokens & Responsive Styling" },
    { name: "Google Gemini AI", role: "Generative Circuit Co-Design" },
  ];

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white selection:bg-cyan-500 selection:text-black">
      {/* Ambient Cybernetic Backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-cyber-grid opacity-30" />
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-cyan-950/20 via-transparent to-transparent" />
        <div className="absolute left-1/3 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute right-1/4 top-48 h-[450px] w-[450px] translate-x-1/2 rounded-full bg-violet-600/15 blur-[140px]" />
      </div>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-16 sm:pt-24 sm:pb-20 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="group mb-6 inline-flex items-center gap-2.5 rounded-full border border-cyan-500/30 bg-zinc-900/80 px-4 py-1.5 shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-xl">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-semibold tracking-wider text-cyan-300">
              OUR MISSION & STORY
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Democratizing{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
              Digital Hardware Design
            </span>
          </h1>

          <p className="mt-6 text-lg text-zinc-400 sm:text-xl max-w-3xl mx-auto leading-relaxed">
            CircuitVerse AI Pro combines academic computer architecture pedagogy with industrial-grade AI synthesis to make digital logic design accessible, visual, and delightfully fast.
          </p>
        </div>
      </section>

      {/* The Story & Narrative */}
      <section className="relative px-6 py-12 lg:px-8 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 sm:p-12 backdrop-blur-xl shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6">Why We Built CircuitVerse AI Pro</h2>
          <div className="space-y-4 text-zinc-400 leading-relaxed text-base">
            <p>
              For decades, learning digital electronics and computer hardware meant struggling with legacy desktop EDA suites built in the 1990s. Students and engineers endured steep learning curves, incompatible file formats, and zero real-time interactivity.
            </p>
            <p>
              We believed hardware design deserved the same joyful, instant-feedback experience that modern web developers enjoy every day. By pairing high-performance SVG vector rendering with sub-millisecond discrete event simulation, we built an engine that simulates complex combinational and sequential digital systems directly inside the browser.
            </p>
            <p>
              With the integration of Google Gemini AI, CircuitVerse AI Pro takes the next evolutionary leap—giving every engineer a dedicated digital logic copilot to verify truth tables, troubleshoot race conditions, and synthesize custom sub-circuits in real time.
            </p>
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="relative px-6 py-12 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Our Core Philosophy</h2>
          <p className="mt-3 text-sm text-zinc-400 max-w-xl mx-auto">
            The principles guiding every architectural decision in CircuitVerse AI Pro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <div
              key={index}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 backdrop-blur-xl hover:border-cyan-500/50 transition-all duration-300"
            >
              <div className="mb-5 inline-block rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-3">
                {pillar.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{pillar.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Stack Grid */}
      <section className="relative px-6 py-16 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Built on Modern Engineering</h2>
          <p className="mt-3 text-sm text-zinc-400 max-w-xl mx-auto">
            Engineered with a robust, enterprise-grade open-source stack.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stackItems.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm flex flex-col justify-between"
            >
              <div className="text-base font-semibold text-cyan-300">{item.name}</div>
              <div className="mt-2 text-xs text-zinc-400">{item.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="relative px-6 py-12 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Our Journey</h2>
        </div>

        <div className="space-y-6">
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row gap-4 sm:gap-8 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-6"
            >
              <div className="text-xl font-mono font-bold text-cyan-400 sm:w-24 shrink-0">
                {milestone.year}
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1.5">{milestone.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{milestone.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/40 via-zinc-900/80 to-zinc-900/40 p-10 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.15)]">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Join the Next Generation of Circuit Designers
          </h2>
          <p className="mt-4 text-base text-zinc-400 max-w-xl mx-auto">
            Ready to explore digital hardware with real-time feedback and intelligent AI co-design?
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:brightness-110"
            >
              Open Studio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}