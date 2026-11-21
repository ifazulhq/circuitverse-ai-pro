export type LogicValue = 0 | 1;

export interface PlacedComponent {
  id: number;
  type: string;
  x: number;
  y: number;
  value?: LogicValue;
}

export interface Connection {
  id: number;
  sourceId: number;
  targetId: number;
  sourcePort?: number;
}

export interface CircuitEditorSnapshot {
  placedComponents: PlacedComponent[];
  connections: Connection[];
  sequentialState: Record<number, LogicValue>;
}

export interface TruthTableRow {
  inputs: Record<number, LogicValue>;
  outputs: Record<number, LogicValue>;
}

export interface WireSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  orientation: "horizontal" | "vertical";
}

export interface WireCrossing {
  x: number;
  y: number;
  firstOrientation: "horizontal" | "vertical";
  secondOrientation: "horizontal" | "vertical";
}

export interface PortPosition {
  x: number;
  y: number;
}

export interface ComponentPortCounts {
  input: number;
  output: number;
}

export interface ExportedCircuitFile {
  format: string;
  version: number;
  metadata: {
    projectId: string;
    projectName: string;
    projectDescription: string;
    category: string;
    createdAt: string | null;
    updatedAt: string | null;
    exportedAt: string;
  };
  circuit: {
    placedComponents: PlacedComponent[];
    connections: Connection[];
    sequentialState: Record<number, LogicValue>;
  };
}

// ── Timing Diagram Types ─────────────────────────────────────────────────────

/** One recorded tick sample for a single probed signal. */
export interface WaveformSample {
  tick: number;      // global tick index (0, 1, 2, …)
  value: LogicValue; // 0 | 1
}

/** A named channel tracked in the timing diagram. */
export interface WaveformChannel {
  componentId: number;
  label: string;     // e.g. "INPUT #1", "CLOCK #1", "AND Gate #2"
  color: string;     // CSS hex/hsl colour for this channel's waveform
  samples: WaveformSample[];
}

/** Full state snapshot of the waveform engine, lifted to editor/page.tsx. */
export interface WaveformEngineState {
  tick: number;
  isPlaying: boolean;
  tickRateMs: number; // milliseconds between auto-play ticks
  maxTicks: number;   // ring-buffer depth
  channels: WaveformChannel[];
}
