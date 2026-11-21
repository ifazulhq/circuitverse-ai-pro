/**
 * waveformEngine.ts
 * Pure, stateless utility functions for the Digital Timing Diagram feature.
 * No React, no side effects — fully unit-testable.
 */

import {
  LogicValue,
  PlacedComponent,
  WaveformChannel,
  WaveformSample,
} from "@/types/circuit";

// ── Constants ────────────────────────────────────────────────────────────────

/** Default auto-play interval between ticks (ms). */
export const DEFAULT_TICK_RATE_MS = 250;

/** Default ring-buffer depth: how many ticks of history are retained. */
export const MAX_TICKS = 128;

/** Accessible, visually distinct colours assigned round-robin to new channels. */
export const WAVEFORM_COLORS: readonly string[] = [
  "#22d3ee", // cyan-400
  "#a78bfa", // violet-400
  "#34d399", // emerald-400
  "#fb923c", // orange-400
  "#f472b6", // pink-400
  "#facc15", // yellow-400
  "#60a5fa", // blue-400
  "#4ade80", // green-400
];

// ── Label Generation ─────────────────────────────────────────────────────────

/**
 * Returns a human-readable label like "INPUT #1", "CLOCK #2", "AND Gate #3".
 * The index is relative to the count of that type already in the full component list.
 */
export function getChannelLabel(
  component: PlacedComponent,
  allComponents: PlacedComponent[]
): string {
  const sameType = allComponents.filter((c) => c.type === component.type);
  const position = sameType.findIndex((c) => c.id === component.id);
  const number = position >= 0 ? position + 1 : sameType.length + 1;
  return `${component.type} #${number}`;
}

// ── Channel Construction ─────────────────────────────────────────────────────

/**
 * Creates a new empty WaveformChannel for the given component.
 * @param component - the PlacedComponent being probed
 * @param channelIndex - the current total channel count (for colour assignment)
 * @param allComponents - the full list of placed components (for label generation)
 */
export function createChannel(
  component: PlacedComponent,
  channelIndex: number,
  allComponents: PlacedComponent[]
): WaveformChannel {
  return {
    componentId: component.id,
    label: getChannelLabel(component, allComponents),
    color: WAVEFORM_COLORS[channelIndex % WAVEFORM_COLORS.length],
    samples: [],
  };
}

// ── Ring Buffer Recording ─────────────────────────────────────────────────────

/**
 * Immutably appends a new WaveformSample to each channel for the given tick,
 * then slices each channel's samples to at most `maxTicks` entries (ring buffer).
 *
 * @param channels - current channel array (unchanged by reference)
 * @param tick - the current tick index
 * @param getSignal - function to read the live LogicValue for a given componentId
 * @param maxTicks - ring buffer size
 * @returns a new channels array with updated samples
 */
export function recordTick(
  channels: WaveformChannel[],
  tick: number,
  getSignal: (componentId: number) => LogicValue,
  maxTicks: number = MAX_TICKS
): WaveformChannel[] {
  return channels.map((channel) => {
    const newSample: WaveformSample = {
      tick,
      value: getSignal(channel.componentId),
    };

    const updatedSamples = [...channel.samples, newSample];

    // Maintain ring-buffer depth
    const sliced =
      updatedSamples.length > maxTicks
        ? updatedSamples.slice(updatedSamples.length - maxTicks)
        : updatedSamples;

    return { ...channel, samples: sliced };
  });
}

// ── SVG Path Generation ───────────────────────────────────────────────────────

/**
 * Builds an SVG `d=` path string for a digital step-function waveform.
 * - HIGH (value === 1) maps to `y = railPad` (top)
 * - LOW  (value === 0) maps to `y = rowHeight - railPad` (bottom)
 *
 * @param samples - ordered list of WaveformSamples
 * @param maxTicks - total width in ticks (for x-axis scaling)
 * @param pxPerTick - horizontal pixels per tick
 * @param rowHeight - total pixel height of one channel row
 * @param railPad - vertical padding from top/bottom rail (default: 6)
 * @returns SVG path `d` attribute string, or empty string if no samples
 */
export function buildWaveformPath(
  samples: WaveformSample[],
  maxTicks: number,
  pxPerTick: number,
  rowHeight: number,
  railPad: number = 6
): string {
  if (samples.length === 0) return "";

  const highY = railPad;
  const lowY = rowHeight - railPad;

  // Find the tick offset of the first sample (for scrolled views)
  const firstTick = samples[0].tick;

  let path = "";

  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];
    const x = (sample.tick - firstTick) * pxPerTick;
    const y = sample.value === 1 ? highY : lowY;

    if (i === 0) {
      path += `M ${x} ${y}`;
    } else {
      const prevSample = samples[i - 1];
      const prevY = prevSample.value === 1 ? highY : lowY;

      if (prevY !== y) {
        // Vertical edge (transition)
        path += ` V ${y}`;
      }
      // Horizontal segment to the current tick
      path += ` H ${x}`;
    }

    // If this is the last sample, extend the line to its right edge
    if (i === samples.length - 1) {
      path += ` H ${x + pxPerTick}`;
    }
  }

  return path;
}

// ── Probbable Component Filter ────────────────────────────────────────────────

/**
 * Returns all PlacedComponents that can be meaningfully probed:
 * INPUTs, OUTPUTs, CLOCKs, and logic gates.
 * Excludes components already tracked by a channel.
 */
export function getProbableComponents(
  placedComponents: PlacedComponent[],
  existingChannels: WaveformChannel[]
): PlacedComponent[] {
  const trackedIds = new Set(existingChannels.map((ch) => ch.componentId));
  return placedComponents.filter((c) => !trackedIds.has(c.id));
}
