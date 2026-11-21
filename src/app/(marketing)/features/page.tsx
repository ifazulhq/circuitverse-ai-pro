import Link from "next/link";
import {
  Zap,
  Sparkles,
  Activity,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle2,
  Binary,
} from "lucide-react";

export default function FeaturesPage() {
  const featureCategories = [
    {
      icon: <Zap className="h-7 w-7 text-cyan-400" />,
      tag: "CORE ENGINE",
      title: "Sub-Millisecond Simulation",
      description:
        "High-performance discrete-event evaluation engine executing wire propagation and combinational gate transitions with zero perceptible latency.",
      points: [
        "Sub-1ms simulation tick loop with deterministic event queues",
        "Infinite feedback loop detection & race-condition mitigation",
        "Variable clock generator with configurable 100ms–2000ms intervals",
        "Live high-impedance, undefined (X), and digital HIGH/LOW states",
      ],
      borderGlow: "hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]",
    },
    {
      icon: <Sparkles className="h-7 w-7 text-violet-400" />,
      tag: "AI CO-PILOT",
      title: "Generative Sub-Circuit Synthesis",
      description:
        "Prompt the AI copilot to analyze circuit schematics, explain truth tables, diagnose wiring bugs, or synthesize complete sub-circuits directly onto the canvas.",
      points: [
        "Natural language prompt to interactive gate schematic generation",
        "Deterministic pin remapping with collision-free canvas placement",
        "Automated logic bug detection & race condition explanations",
        "Streaming LLM synthesis powered by Google Gemini AI",
      ],
      borderGlow: "hover:border-violet-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]",
    },
    {
      icon: <Activity className="h-7 w-7 text-emerald-400" />,
      tag: "DIAGNOSTICS",
      title: "Digital Logic Oscilloscope",
      description:
        "Probe any wire or gate output to trace live HIGH/LOW digital clock cycles on an authentic digital waveform timing analyzer.",
      points: [
        "Multi-channel concurrent probe pinning with custom channel labels",
        "Interactive tick timeline scrubbing and real-time transition edges",
        "Run, pause, single-step, and reset simulation clock controls",
        "Automatic probe synchronization with undo/redo circuit snapshots",
      ],
      borderGlow: "hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    },
    {
      icon: <Cpu className="h-7 w-7 text-blue-400" />,
      tag: "ANALYSIS",
      title: "Automated Truth Table Solver",
      description:
        "Exhaustively evaluate all combinational input states with one click to verify logic correctness and generate formal truth tables.",
      points: [
        "Automatic discovery of circuit input switches and output probes",
        "Exhaustive 2ⁿ permutation evaluation with boundary safety limits",
        "Visual HIGH (1) and LOW (0) matrix display with CSV export",
        "Instant logic equivalence testing against reference specifications",
      ],
      borderGlow: "hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
    },
    {
      icon: <Binary className="h-7 w-7 text-amber-400" />,
      tag: "COMPONENT LIBRARY",
      title: "Extensive Gate & IC Catalog",
      description:
        "Comprehensive collection of elementary logic gates, multiplexers, arithmetic circuits, and sequential memory elements.",
      points: [
        "Elementary gates: AND, OR, NOT, NAND, NOR, XOR, XNOR",
        "Routing ICs: Multiplexers (MUX 2:1), Demultiplexers, Decoders, Encoders",
        "Arithmetic blocks: Half Adders and Full Adders with carry-lookahead",
        "Sequential latches: Set-Reset (SR) Latches and D-Type Flip-Flops",
      ],
      borderGlow: "hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    },
    {
      icon: <Layers className="h-7 w-7 text-cyan-400" />,
      tag: "PLATFORM",
      title: "Cloud Sync & Multi-Theming",
      description:
        "Enterprise-grade cloud synchronization backed by PostgreSQL and Prisma ORM, paired with responsive touch controls and adaptive themes.",
      points: [
        "Real-time debounced auto-save with offline localStorage fallback",
        "Multi-theme engine: Dark Slate, Light Clean, and Cyberpunk Neon",
        "Mobile & tablet gesture controls: pinch-to-zoom and two-finger pan",
        "Non-destructive multi-level Undo/Redo canvas history stack",
      ],
      borderGlow: "hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]",
    },
  ];

  const comparisons = [
    {
      feature: "Installation Required",
      circuitVerse: "Zero (100% Web-Native)",
      legacy: "GBs of legacy desktop installers",
    },
    {
      feature: "Simulation Latency",
      circuitVerse: "< 1ms real-time event loop",
      legacy: "Slow batch-mode compiling",
    },
    {
      feature: "AI Logic Synthesis",
      circuitVerse: "Built-in Copilot (Gemini)",
      legacy: "None / Third-party CLI tools",
    },
    {
      feature: "Waveform Analysis",
      circuitVerse: "Integrated digital oscilloscope",
      legacy: "Separate clunky viewer app",
    },
    {
      feature: "Cloud Synchronization",
      circuitVerse: "Instant PostgreSQL cloud sync",
      legacy: "Local files (.v, .circ, .sch)",
    },
    {
      feature: "Mobile / Tablet Support",
      circuitVerse: "Full touch & pinch gestures",
      legacy: "Desktop Windows/Linux only",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white selection:bg-cyan-500 selection:text-black">
      {/* Ambient Cybernetic Backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-cyber-grid opacity-30" />
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-cyan-950/20 via-transparent to-transparent" />
        <div className="absolute left-1/4 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute right-1/4 top-48 h-[450px] w-[450px] translate-x-1/2 rounded-full bg-violet-600/15 blur-[140px]" />
      </div>

      {/* Hero Header */}
      <section className="relative px-6 pt-16 pb-16 sm:pt-24 sm:pb-20 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="group mb-6 inline-flex items-center gap-2.5 rounded-full border border-cyan-500/30 bg-zinc-900/80 px-4 py-1.5 shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-xl">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-semibold tracking-wider text-cyan-300">
              FEATURES & ARCHITECTURE
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Engineered for Precision{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
              Digital CAD
            </span>
          </h1>

          <p className="mt-6 text-lg text-zinc-400 sm:text-xl max-w-3xl mx-auto leading-relaxed">
            Experience an industrial-grade digital logic CAD environment built with modern web technologies. From sub-millisecond propagation loops to streaming AI synthesis, explore the features driving CircuitVerse AI Pro.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-[0_0_25px_rgba(6,182,212,0.4)] transition hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:brightness-110"
            >
              Launch Studio Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/80 px-6 py-3 font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              View Plan Options
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="relative px-6 py-12 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureCategories.map((item, index) => (
            <div
              key={index}
              className={`rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 backdrop-blur-xl transition-all duration-300 ${item.borderGlow}`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-3">
                  {item.icon}
                </div>
                <span className="text-xs font-mono font-semibold tracking-wider text-zinc-400 border border-zinc-800 rounded-full px-3 py-1 bg-zinc-950/40">
                  {item.tag}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white mb-3">{item.title}</h2>
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                {item.description}
              </p>

              <ul className="space-y-2.5 border-t border-zinc-800/80 pt-6">
                {item.points.map((point, pIndex) => (
                  <li key={pIndex} className="flex items-start gap-2.5 text-xs text-zinc-300">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Matrix Table */}
      <section className="relative px-6 py-16 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            CircuitVerse AI Pro vs. Legacy Desktop CAD
          </h2>
          <p className="mt-3 text-sm text-zinc-400 max-w-xl mx-auto">
            Traditional hardware simulators were built decades ago. See how modern web-first architecture changes the game.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl shadow-2xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-950/50 text-xs font-mono uppercase text-zinc-400">
              <tr>
                <th className="px-6 py-4">Capability</th>
                <th className="px-6 py-4 text-cyan-400">CircuitVerse AI Pro</th>
                <th className="px-6 py-4 text-zinc-500">Legacy Desktop EDA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {comparisons.map((row, index) => (
                <tr key={index} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{row.feature}</td>
                  <td className="px-6 py-4 text-cyan-300 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    {row.circuitVerse}
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{row.legacy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/40 via-zinc-900/80 to-zinc-900/40 p-10 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.15)]">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Start Designing Circuits in Seconds
          </h2>
          <p className="mt-4 text-base text-zinc-400 max-w-xl mx-auto">
            No installation, no licensing files, no wait. Open the studio right in your browser and build your next digital logic masterpiece.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:brightness-110"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}