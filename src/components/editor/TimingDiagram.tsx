"use client";

import * as React from "react";
import {
  Play,
  Pause,
  Square,
  SkipForward,
  RotateCcw,
  Plus,
  Minus,
  Activity,
  Radio,
  X,
} from "lucide-react";
import {
  PlacedComponent,
  LogicValue,
  WaveformEngineState,
} from "@/types/circuit";
import { buildWaveformPath, getProbableComponents } from "@/lib/waveformEngine";

// ── Constants ─────────────────────────────────────────────────────────────────

const PX_PER_TICK = 28;
const ROW_HEIGHT = 44;
const LABEL_WIDTH = 130;
const GRID_INTERVAL = 8; // vertical guide lines every N ticks

// ── Props ─────────────────────────────────────────────────────────────────────

export interface TimingDiagramProps {
  isOpen: boolean;
  placedComponents: PlacedComponent[];
  isSimulationRunning: boolean;
  getSignalValue: (id: number) => LogicValue;
  waveformState: WaveformEngineState;
  onAddChannel: (componentId: number) => void;
  onRemoveChannel: (componentId: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onChangeTickRate: (ms: number) => void;
  onToggleOpen: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Formats a tick-rate value (ms) to a human-readable string.
 */
function formatTickRate(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

// ── Sub-component: WaveformRow ────────────────────────────────────────────────

interface WaveformRowProps {
  label: string;
  color: string;
  componentId: number;
  samples: WaveformEngineState["channels"][0]["samples"];
  visibleTicks: number;
  onRemove: (id: number) => void;
}

const WaveformRow = React.memo<WaveformRowProps>(
  ({ label, color, componentId, samples, visibleTicks, onRemove }) => {
    const svgWidth = visibleTicks * PX_PER_TICK;

    const pathD = React.useMemo(
      () => buildWaveformPath(samples, visibleTicks, PX_PER_TICK, ROW_HEIGHT),
      [samples, visibleTicks]
    );

    // Vertical grid lines
    const gridLines = React.useMemo(() => {
      const lines: number[] = [];
      for (let t = GRID_INTERVAL; t < visibleTicks; t += GRID_INTERVAL) {
        lines.push(t);
      }
      return lines;
    }, [visibleTicks]);

    return (
      <div className="flex min-w-0 border-b border-zinc-800/60">
        {/* Label column */}
        <div
          className="sticky left-0 z-10 flex shrink-0 items-center justify-between gap-1 border-r border-zinc-800/60 bg-zinc-900/95 px-2 backdrop-blur-xs"
          style={{ width: LABEL_WIDTH }}
        >
          <div className="flex min-w-0 items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span
              className="truncate text-[11px] font-medium text-zinc-300"
              title={label}
            >
              {label}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onRemove(componentId)}
            className="shrink-0 rounded p-0.5 text-zinc-600 transition hover:bg-zinc-800 hover:text-rose-400"
            title={`Remove ${label}`}
          >
            <Minus className="h-3 w-3" />
          </button>
        </div>

        {/* SVG waveform */}
        <div className="min-w-0 flex-1">
          <svg
            width={Math.max(svgWidth, 200)}
            height={ROW_HEIGHT}
            className="block"
            aria-label={`Waveform for ${label}`}
          >
            {/* Grid lines */}
            {gridLines.map((t) => (
              <line
                key={t}
                x1={t * PX_PER_TICK}
                y1={0}
                x2={t * PX_PER_TICK}
                y2={ROW_HEIGHT}
                className="timing-grid-line"
                strokeWidth={1}
              />
            ))}

            {/* HIGH rail guide */}
            <line
              x1={0}
              y1={6}
              x2={svgWidth}
              y2={6}
              className="timing-rail-guide"
              strokeWidth={0.5}
              strokeDasharray="2 4"
            />
            {/* LOW rail guide */}
            <line
              x1={0}
              y1={ROW_HEIGHT - 6}
              x2={svgWidth}
              y2={ROW_HEIGHT - 6}
              className="timing-rail-guide"
              strokeWidth={0.5}
              strokeDasharray="2 4"
            />

            {/* Waveform path */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth={1.75}
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
            )}

            {/* No-data placeholder */}
            {samples.length === 0 && (
              <text
                x={12}
                y={ROW_HEIGHT / 2 + 4}
                className="timing-label-text"
                fontSize={11}
              >
                No data — press Play or Step
              </text>
            )}
          </svg>
        </div>
      </div>
    );
  }
);
WaveformRow.displayName = "WaveformRow";

// ── Main Component ────────────────────────────────────────────────────────────

export const TimingDiagram: React.FC<TimingDiagramProps> = React.memo(
  ({
    isOpen,
    placedComponents,
    isSimulationRunning,
    waveformState,
    onAddChannel,
    onRemoveChannel,
    onPlay,
    onPause,
    onStep,
    onReset,
    onChangeTickRate,
    onToggleOpen,
  }) => {
    const [selectedProbeId, setSelectedProbeId] = React.useState<string>("");

    const { tick, isPlaying, tickRateMs, maxTicks, channels } = waveformState;

    // Components available to probe (not already tracked)
    const probableComponents = React.useMemo(
      () => getProbableComponents(placedComponents, channels),
      [placedComponents, channels]
    );

    // Sync selected probe when options change
    React.useEffect(() => {
      if (
        selectedProbeId &&
        !probableComponents.some((c) => String(c.id) === selectedProbeId)
      ) {
        setSelectedProbeId(
          probableComponents.length > 0 ? String(probableComponents[0].id) : ""
        );
      } else if (!selectedProbeId && probableComponents.length > 0) {
        setSelectedProbeId(String(probableComponents[0].id));
      }
    }, [probableComponents, selectedProbeId]);

    const handleAddProbe = () => {
      const id = parseInt(selectedProbeId, 10);
      if (!isNaN(id)) {
        onAddChannel(id);
        // Move selection to next available
        const remaining = probableComponents.filter((c) => c.id !== id);
        setSelectedProbeId(remaining.length > 0 ? String(remaining[0].id) : "");
      }
    };

    // Visible ticks in the SVG (either maxTicks or the current tick count)
    const visibleTicks = Math.min(Math.max(tick, 16), maxTicks);

    if (!isOpen) return null;

    return (
      <section
        className="flex h-full w-full min-h-0 flex-col overflow-hidden rounded-xl border border-violet-800/40 bg-zinc-950/95 shadow-[0_0_24px_rgba(139,92,246,0.08)] backdrop-blur-sm"
        aria-label="Timing Diagram Panel"
      >
        {/* ── Panel Header ── */}
        <div className="shrink-0 flex flex-wrap items-center gap-3 border-b border-zinc-800/80 bg-zinc-900/60 px-4 py-2.5">
          {/* Title */}
          <div className="flex items-center gap-2 mr-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">
              Timing Diagram
            </span>
            {/* Tick counter badge */}
            <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
              T={tick}
            </span>
            {isPlaying && (
              <span className="flex items-center gap-1 rounded-full bg-violet-500/10 border border-violet-500/30 px-2 py-0.5 text-[10px] text-violet-400">
                <Radio className="h-2.5 w-2.5 animate-pulse" />
                LIVE
              </span>
            )}
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-1.5">
            {/* Play/Pause */}
            {isPlaying ? (
              <button
                type="button"
                onClick={onPause}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-200 transition hover:border-violet-500/60 hover:bg-zinc-700"
                title="Pause auto-play"
              >
                <Pause className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onPlay}
                disabled={!isSimulationRunning}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-200 transition hover:border-violet-500/60 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                title={
                  isSimulationRunning
                    ? "Start auto-play"
                    : "Start Simulation first"
                }
              >
                <Play className="h-4 w-4" />
              </button>
            )}

            {/* Step */}
            <button
              type="button"
              onClick={onStep}
              disabled={!isSimulationRunning}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-200 transition hover:border-violet-500/60 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
              title={
                isSimulationRunning
                  ? "Step one tick"
                  : "Start Simulation first"
              }
            >
              <SkipForward className="h-4 w-4" />
            </button>

            {/* Stop (clears playing only) */}
            <button
              type="button"
              onClick={onPause}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-700"
              title="Stop"
            >
              <Square className="h-3.5 w-3.5" />
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={onReset}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-200 transition hover:border-rose-500/50 hover:bg-zinc-700 hover:text-rose-300"
              title="Reset all waveform data"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Tick Rate Slider */}
          <div className="flex items-center gap-2 ml-1">
            <span className="text-[11px] text-zinc-500 uppercase tracking-wider whitespace-nowrap">
              Rate:
            </span>
            <input
              type="range"
              min={50}
              max={2000}
              step={50}
              value={tickRateMs}
              onChange={(e) => onChangeTickRate(Number(e.target.value))}
              className="h-1.5 w-24 accent-violet-400 cursor-pointer"
              title={`Tick rate: ${formatTickRate(tickRateMs)}`}
            />
            <span className="font-mono text-[11px] text-violet-400 w-12 shrink-0">
              {formatTickRate(tickRateMs)}
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Add Probe Row */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-zinc-500 uppercase tracking-wider whitespace-nowrap">
              Probe:
            </span>
            <select
              value={selectedProbeId}
              onChange={(e) => setSelectedProbeId(e.target.value)}
              disabled={probableComponents.length === 0}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 focus:border-violet-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {probableComponents.length === 0 ? (
                <option value="">— All probed —</option>
              ) : (
                probableComponents.map((comp) => (
                  <option key={comp.id} value={String(comp.id)}>
                    {comp.type} (id {comp.id})
                  </option>
                ))
              )}
            </select>

            <button
              type="button"
              onClick={handleAddProbe}
              disabled={probableComponents.length === 0 || !selectedProbeId}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-violet-500/50 bg-violet-500/10 text-violet-300 transition hover:bg-violet-500/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              title="Add probe channel"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Close Dock / Back to Canvas button */}
          <button
            type="button"
            onClick={onToggleOpen}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/90 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:border-violet-400 hover:bg-violet-950/40 hover:text-white"
            title="Close dock and return to full canvas"
          >
            <X className="h-3.5 w-3.5 text-zinc-400" />
            <span>Close Dock</span>
          </button>
        </div>

        {/* ── Waveform Grid ── */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {channels.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-800/40 bg-violet-500/5 text-violet-400/60">
                <Activity className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-zinc-400">
                No signals probed yet
              </p>
              <p className="max-w-xs text-xs text-zinc-600">
                Use the <span className="text-zinc-400 font-medium">Probe</span> picker above to select any INPUT, OUTPUT, CLOCK, or gate and observe its waveform in real time.
              </p>
            </div>
          ) : (
            /* Channel rows inside unified scroll container */
            <div className="overflow-x-auto custom-scrollbar">
              <div className="min-w-fit divide-y divide-zinc-800/40">
                {/* Tick ruler */}
                <div className="flex border-b border-zinc-800/60">
                  <div
                    className="sticky left-0 z-10 shrink-0 border-r border-zinc-800/60 bg-zinc-900/95 px-2 py-1 backdrop-blur-xs"
                    style={{ width: LABEL_WIDTH }}
                  >
                    <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                      Signal
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <svg
                      width={Math.max(visibleTicks * PX_PER_TICK, 200)}
                      height={20}
                      className="block"
                    >
                      {Array.from({ length: Math.floor(visibleTicks / GRID_INTERVAL) }, (_, i) => {
                        const t = (i + 1) * GRID_INTERVAL;
                        return (
                          <text
                            key={t}
                            x={t * PX_PER_TICK}
                            y={14}
                            className="timing-label-text"
                            fontSize={9}
                            textAnchor="middle"
                          >
                            {t}
                          </text>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {channels.map((channel) => (
                  <WaveformRow
                    key={channel.componentId}
                    label={channel.label}
                    color={channel.color}
                    componentId={channel.componentId}
                    samples={channel.samples}
                    visibleTicks={visibleTicks}
                    onRemove={onRemoveChannel}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer status ── */}
        {channels.length > 0 && (
          <div className="shrink-0 flex items-center justify-between border-t border-zinc-800/60 bg-zinc-900/40 px-4 py-1.5">
            <span className="text-[11px] text-zinc-600">
              {channels.length} channel{channels.length !== 1 ? "s" : ""} &bull; max {maxTicks} ticks
            </span>
            <span className="font-mono text-[11px] text-zinc-600">
              {isSimulationRunning ? (isPlaying ? "Recording…" : "Paused") : "Simulation stopped"}
            </span>
          </div>
        )}
      </section>
    );
  }
);

TimingDiagram.displayName = "TimingDiagram";
