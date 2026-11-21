"use client";

import * as React from "react";
import { Sparkles, Zap } from "lucide-react";

export function HeroCircuitPreview() {
  const [inputA, setInputA] = React.useState(true);
  const [inputB, setInputB] = React.useState(true);
  const [gate, setGate] = React.useState<"AND" | "OR" | "XOR">("AND");

  // Real-time digital logic output calculation
  const output = React.useMemo(() => {
    if (gate === "AND") return inputA && inputB;
    if (gate === "OR") return inputA || inputB;
    if (gate === "XOR") return inputA !== inputB;
    return false;
  }, [inputA, inputB, gate]);

  const explanation = React.useMemo(() => {
    if (gate === "AND") {
      return inputA && inputB
        ? "Both inputs are HIGH (1). The AND gate condition is satisfied, driving the output to HIGH."
        : "At least one input is LOW (0). The AND condition fails, holding output at LOW.";
    }
    if (gate === "OR") {
      return inputA || inputB
        ? "At least one input is HIGH (1). The OR gate activates, driving the output to HIGH."
        : "Both inputs are LOW (0). The OR gate output remains LOW.";
    }
    return inputA !== inputB
      ? "Inputs are strictly complementary (1 ≠ 0). The XOR gate outputs HIGH."
      : "Inputs are identical. The XOR parity check outputs LOW.";
  }, [inputA, inputB, gate]);

  return (
    <div className="relative mx-auto mt-12 w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/90 shadow-[0_0_60px_rgba(0,0,0,0.6),0_0_30px_rgba(34,211,238,0.12)] backdrop-blur-2xl transition-all duration-300">
      {/* Window Header Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-xs font-mono font-medium tracking-wider text-zinc-400">
            CIRCUITVERSE CAD SCHEMATIC // INTERACTIVE DEMO
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-mono font-medium uppercase tracking-widest text-emerald-400">
            SIMULATING: 60 FPS
          </span>
        </div>
      </div>

      {/* Main Schematic Body */}
      <div className="relative p-6 sm:p-8 bg-cyber-grid">
        {/* Gate Selector Pills */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 p-1">
            {(["AND", "OR", "XOR"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGate(g)}
                className={`rounded px-3 py-1 text-xs font-mono font-semibold transition-all duration-200 ${
                  gate === g
                    ? "bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.3)] border border-cyan-500/40"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {g} GATE
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-950/40 px-3 py-1 text-xs font-medium text-cyan-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span>Click switches below to toggle live inputs</span>
          </div>
        </div>

        {/* Schematic Circuit Canvas Layout */}
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[180px_1fr_180px]">
          {/* Inputs Column */}
          <div className="flex flex-col gap-5">
            {/* Input A Switch */}
            <div className="flex flex-col gap-1.5 rounded-xl border border-zinc-800/90 bg-zinc-900/70 p-3 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-zinc-400">INPUT A</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                    inputA
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {inputA ? "1 (HIGH)" : "0 (LOW)"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setInputA((prev) => !prev)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                  inputA
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_16px_rgba(6,182,212,0.4)]"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                <span>Switch A</span>
                <div
                  className={`h-4 w-7 rounded-full p-0.5 transition-colors ${
                    inputA ? "bg-black/40" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`h-3 w-3 rounded-full bg-white transition-transform ${
                      inputA ? "translate-x-3 bg-cyan-200" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
            </div>

            {/* Input B Switch */}
            <div className="flex flex-col gap-1.5 rounded-xl border border-zinc-800/90 bg-zinc-900/70 p-3 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-zinc-400">INPUT B</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                    inputB
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {inputB ? "1 (HIGH)" : "0 (LOW)"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setInputB((prev) => !prev)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                  inputB
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_16px_rgba(6,182,212,0.4)]"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                <span>Switch B</span>
                <div
                  className={`h-4 w-7 rounded-full p-0.5 transition-colors ${
                    inputB ? "bg-black/40" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`h-3 w-3 rounded-full bg-white transition-transform ${
                      inputB ? "translate-x-3 bg-cyan-200" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Schematic SVG Traces & Gate Center */}
          <div className="relative flex h-52 items-center justify-center">
            <svg
              className="h-full w-full overflow-visible"
              viewBox="0 0 340 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Wire A -> Gate Top Terminal */}
              <path
                d="M 10 50 L 90 50 L 90 70 L 130 70"
                stroke={inputA ? "#22d3ee" : "#334155"}
                strokeWidth={inputA ? "3" : "2"}
                strokeDasharray={inputA ? "6 6" : undefined}
                className={inputA ? "animate-wire-flow" : undefined}
                style={{
                  filter: inputA ? "drop-shadow(0 0 6px rgba(34,211,238,0.8))" : undefined,
                  transition: "stroke 200ms ease",
                }}
              />
              <circle
                cx="10"
                cy="50"
                r="4"
                fill={inputA ? "#22d3ee" : "#475569"}
                style={{ filter: inputA ? "drop-shadow(0 0 4px #22d3ee)" : undefined }}
              />

              {/* Wire B -> Gate Bottom Terminal */}
              <path
                d="M 10 130 L 90 130 L 90 110 L 130 110"
                stroke={inputB ? "#22d3ee" : "#334155"}
                strokeWidth={inputB ? "3" : "2"}
                strokeDasharray={inputB ? "6 6" : undefined}
                className={inputB ? "animate-wire-flow" : undefined}
                style={{
                  filter: inputB ? "drop-shadow(0 0 6px rgba(34,211,238,0.8))" : undefined,
                  transition: "stroke 200ms ease",
                }}
              />
              <circle
                cx="10"
                cy="130"
                r="4"
                fill={inputB ? "#22d3ee" : "#475569"}
                style={{ filter: inputB ? "drop-shadow(0 0 4px #22d3ee)" : undefined }}
              />

              {/* Logic Gate Body */}
              <g transform="translate(130, 60)">
                {/* Gate Silhouette */}
                <rect
                  x="0"
                  y="0"
                  width="70"
                  height="60"
                  rx="10"
                  fill="#18181b"
                  stroke={output ? "#22d3ee" : "#3f3f46"}
                  strokeWidth="2"
                  style={{
                    filter: output ? "drop-shadow(0 0 12px rgba(34,211,238,0.35))" : undefined,
                    transition: "stroke 250ms ease, filter 250ms ease",
                  }}
                />
                <text
                  x="35"
                  y="35"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#ffffff"
                  fontSize="13"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {gate}
                </text>
              </g>

              {/* Output Wire -> Right Terminal */}
              <path
                d="M 200 90 L 330 90"
                stroke={output ? "#10b981" : "#334155"}
                strokeWidth={output ? "3.5" : "2"}
                strokeDasharray={output ? "6 6" : undefined}
                className={output ? "animate-wire-flow" : undefined}
                style={{
                  filter: output ? "drop-shadow(0 0 10px rgba(16,185,129,0.9))" : undefined,
                  transition: "stroke 200ms ease, filter 200ms ease",
                }}
              />
              <circle
                cx="330"
                cy="90"
                r="5"
                fill={output ? "#10b981" : "#475569"}
                style={{ filter: output ? "drop-shadow(0 0 8px #10b981)" : undefined }}
              />
            </svg>
          </div>

          {/* Output Lamp Column */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800/90 bg-zinc-900/70 p-5 shadow-inner">
            <span className="mb-2 text-xs font-mono font-semibold tracking-wider text-zinc-400">
              LOGIC OUTPUT
            </span>

            {/* Glowing Lamp / Indicator */}
            <div
              className={`relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 ${
                output
                  ? "bg-emerald-500 text-black shadow-[0_0_35px_rgba(16,185,129,0.85)] ring-4 ring-emerald-400/40"
                  : "bg-zinc-800 text-zinc-500 ring-2 ring-zinc-700/50"
              }`}
            >
              <Zap className={`h-8 w-8 transition-transform duration-300 ${output ? "scale-110 fill-current animate-pulse" : "scale-90 opacity-40"}`} />
            </div>

            <div className="mt-4 flex flex-col items-center gap-1">
              <span
                className={`font-mono text-sm font-bold ${
                  output ? "text-emerald-400" : "text-zinc-500"
                }`}
              >
                {output ? "1 — ACTIVE (HIGH)" : "0 — IDLE (LOW)"}
              </span>
              <span className="text-[11px] text-zinc-400">
                {output ? "Current flowing" : "No voltage"}
              </span>
            </div>
          </div>
        </div>

        {/* AI Copilot Explanation Tooltip Strip */}
        <div className="mt-6 flex flex-col gap-2 rounded-xl border border-cyan-500/20 bg-cyan-950/30 p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-cyan-500/20 text-cyan-400">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <p className="text-xs text-zinc-300">
              <strong className="font-semibold text-cyan-300">AI Copilot Analysis: </strong>
              {explanation}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] font-semibold text-zinc-400">
            <span>A:{inputA ? 1 : 0}</span>
            <span>·</span>
            <span>B:{inputB ? 1 : 0}</span>
            <span>→</span>
            <span className={output ? "text-emerald-400 font-bold" : "text-zinc-400 font-bold"}>
              OUT:{output ? 1 : 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
