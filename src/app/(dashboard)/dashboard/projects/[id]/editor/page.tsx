"use client";

import * as React from "react";
import Link from "next/link";
import { useProjects } from "@/context/ProjectContext";
import {
  getShowGridPreference,
  saveShowGridPreference,
  getSnapToGridPreference,
  SnapToGridPreference,
  getGridSizePreference,
  getDefaultZoomPreference,
  getKeyboardShortcutsPreference,
  getPanWithSpacePreference,
  PanWithSpacePreference,
  getMultiSelectPreference,
  MultiSelectPreference,
  getDoubleClickInputTogglePreference,
  DoubleClickInputTogglePreference,
  syncPreferencesToServer,
} from "@/lib/settingsPreferences";
import {
  Connection,
  PlacedComponent,
  WaveformEngineState,
} from "@/types/circuit";
import { Sparkles, Activity, AlertCircle, ArrowLeft, X } from "lucide-react";
import { useCanvasHistory } from "@/hooks/useCanvasHistory";
import { useCircuitSimulation } from "@/hooks/useCircuitSimulation";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { CircuitCanvas } from "@/components/editor/CircuitCanvas";
import { DiagnosticsPanel } from "@/components/editor/DiagnosticsPanel";
import { TruthTableModal } from "@/components/editor/TruthTableModal";
import { TimingDiagram } from "@/components/editor/TimingDiagram";
import { AICopilotDrawer } from "@/components/editor/AICopilotDrawer";
import {
  AIGeneratedCircuit,
  EditorCircuitState,
  offsetAndRemapSubCircuit,
} from "@/lib/aiCircuitGeneration";
import {
  createChannel,
  recordTick,
  MAX_TICKS,
  DEFAULT_TICK_RATE_MS,
} from "@/lib/waveformEngine";
import { calculateCircuitProgress } from "@/lib/circuitProgress";
import { getStoredProjects, saveProjects } from "@/lib/projectStorage";

// Subscriptions for settings preferences
const subscribeToShowGrid = (cb: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("circuitverse-show-grid-change", cb);
  return () => window.removeEventListener("circuitverse-show-grid-change", cb);
};
const getShowGridSnapshot = () => getShowGridPreference() === "shown";
const getShowGridServerSnapshot = () => true;

const subscribeToGridSize = (cb: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("circuitverse-grid-size-change", cb);
  return () => window.removeEventListener("circuitverse-grid-size-change", cb);
};
const getGridSizeSnapshot = () => getGridSizePreference();
const getGridSizeServerSnapshot = () => 40;

const subscribeToSnapToGrid = (cb: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("circuitverse-snap-to-grid-change", cb);
  return () =>
    window.removeEventListener("circuitverse-snap-to-grid-change", cb);
};
const getSnapToGridSnapshot = () => getSnapToGridPreference();
const getSnapToGridServerSnapshot = (): SnapToGridPreference => "on";

const subscribeToPanWithSpace = (cb: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("circuitverse-pan-with-space-change", cb);
  return () =>
    window.removeEventListener("circuitverse-pan-with-space-change", cb);
};
const getPanWithSpaceSnapshot = () => getPanWithSpacePreference();
const getPanWithSpaceServerSnapshot = (): PanWithSpacePreference => "enabled";

const subscribeToMultiSelect = (cb: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("circuitverse-multi-select-change", cb);
  return () =>
    window.removeEventListener("circuitverse-multi-select-change", cb);
};
const getMultiSelectSnapshot = () => getMultiSelectPreference();
const getMultiSelectServerSnapshot = (): MultiSelectPreference => "enabled";

const subscribeToDoubleClick = (cb: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(
    "circuitverse-double-click-input-toggle-change",
    cb
  );
  return () =>
    window.removeEventListener(
      "circuitverse-double-click-input-toggle-change",
      cb
    );
};
const getDoubleClickSnapshot = () => getDoubleClickInputTogglePreference();
const getDoubleClickServerSnapshot = (): DoubleClickInputTogglePreference =>
  "enabled";

const COMPONENT_PALETTE = [
  "INPUT",
  "OUTPUT",
  "AND Gate",
  "OR Gate",
  "NOT Gate",
  "NAND Gate",
  "NOR Gate",
  "XOR Gate",
  "XNOR Gate",
  "MUX",
  "DEMUX",
  "DECODER",
  "ENCODER",
  "HALF ADDER",
  "FULL ADDER",
  "CLOCK",
  "SR LATCH",
  "D FLIP-FLOP",
  "JK FLIP-FLOP",
  "T FLIP-FLOP",
];

interface CircuitEditorPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CircuitEditorPage({ params }: CircuitEditorPageProps) {
  const { id } = React.use(params);
  const { getProjectById, isLoading, error } = useProjects();
  const project = getProjectById(id);

  // External Preferences
  const showGrid = React.useSyncExternalStore(
    subscribeToShowGrid,
    getShowGridSnapshot,
    getShowGridServerSnapshot
  );
  const gridSizePreference = React.useSyncExternalStore(
    subscribeToGridSize,
    getGridSizeSnapshot,
    getGridSizeServerSnapshot
  );
  const panWithSpacePreference = React.useSyncExternalStore(
    subscribeToPanWithSpace,
    getPanWithSpaceSnapshot,
    getPanWithSpaceServerSnapshot
  );
  const multiSelectPreference = React.useSyncExternalStore(
    subscribeToMultiSelect,
    getMultiSelectSnapshot,
    getMultiSelectServerSnapshot
  );
  const doubleClickPreference = React.useSyncExternalStore(
    subscribeToDoubleClick,
    getDoubleClickSnapshot,
    getDoubleClickServerSnapshot
  );
  const snapToGridPreference = React.useSyncExternalStore(
    subscribeToSnapToGrid,
    getSnapToGridSnapshot,
    getSnapToGridServerSnapshot
  );

  // Core Editor Circuit State
  const [selectedComponent, setSelectedComponent] = React.useState<
    string | null
  >(null);
  const [placedComponents, setPlacedComponents] = React.useState<
    PlacedComponent[]
  >([]);
  const [connections, setConnections] = React.useState<Connection[]>([]);
  const [selectedPlacedComponentId, setSelectedPlacedComponentId] =
    React.useState<number | null>(null);
  const [selectedPlacedComponentIds, setSelectedPlacedComponentIds] =
    React.useState<number[]>([]);
  const [connectionSourceId, setConnectionSourceId] = React.useState<
    number | null
  >(null);
  const [isWireMode, setIsWireMode] = React.useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = React.useState<
    number | null
  >(null);

  // Persistence & UI State
  const [isEditorStateLoaded, setIsEditorStateLoaded] = React.useState(false);
  const [isSavingCircuit, setIsSavingCircuit] = React.useState(false);
  const [circuitSaveMessage, setCircuitSaveMessage] = React.useState<
    string | null
  >(null);
  const [isTruthTableOpen, setIsTruthTableOpen] = React.useState(false);
  const [isAICopilotOpen, setIsAICopilotOpen] = React.useState(false);

  // ── In-Canvas Bench Dock State (Timing Diagram & Diagnostics) ───────────────
  const [activeBottomDockTab, setActiveBottomDockTab] = React.useState<
    "timing" | "diagnostics" | null
  >(null);
  const isTimingDiagramOpen = activeBottomDockTab === "timing";
  const isDiagnosticsOpen = activeBottomDockTab === "diagnostics";
  const [waveformState, setWaveformState] = React.useState<WaveformEngineState>({
    tick: 0,
    isPlaying: false,
    tickRateMs: DEFAULT_TICK_RATE_MS,
    maxTicks: MAX_TICKS,
    channels: [],
  });
  const waveformIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const autoSaveTimeoutRef = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const hasLoadedDatabaseCircuitRef = React.useRef(false);
  const hasLoadedGeneratedCircuitRef = React.useRef(false);
  const canvasRef = React.useRef<HTMLDivElement | null>(null);

  // Viewport Zoom & Offset
  const [zoom, setZoom] = React.useState(() => {
    if (typeof window === "undefined") return 1;
    return getDefaultZoomPreference() / 100;
  });
  const [zoomOffset, setZoomOffset] = React.useState({ x: 0, y: 0 });

  // History Hook
  const {
    canUndo,
    canRedo,
    componentDragStartSnapshotRef,
    createEditorSnapshot,
    pushUndoSnapshot,
    performUndo,
    performRedo,
  } = useCanvasHistory();

  // Simulation Hook
  const {
    isSimulationRunning,
    simulationError,
    sequentialState,
    setSequentialState,
    validationErrors,
    floatingInputErrors,
    invalidConnectionErrors,
    getComponentOutput,
    getSignalValue,
    getOutputValue,
    handleToggleInput,
    validateCircuit,
    getLogicExpression,
    handleStartSimulation,
    handleStopSimulation,
    handleResetSimulation,
    analysisInputCount,
    analysisOutputCount,
    analysisGateCount,
    analysisSequentialCount,
    analysisIssueCount,
    analysisStatus,
  } = useCircuitSimulation({
    id,
    placedComponents,
    setPlacedComponents,
    connections,
  });

  // Selection toggling
  const toggleComponentSelection = React.useCallback(
    (componentId: number, multiSelect: boolean) => {
      if (!multiSelect) {
        setSelectedPlacedComponentIds([componentId]);
        setSelectedPlacedComponentId(componentId);
        return;
      }

      if (selectedPlacedComponentIds.includes(componentId)) {
        const nextSelection = selectedPlacedComponentIds.filter(
          (itemId) => itemId !== componentId
        );
        setSelectedPlacedComponentIds(nextSelection);
        setSelectedPlacedComponentId(
          nextSelection.length > 0
            ? nextSelection[nextSelection.length - 1]
            : null
        );
        return;
      }

      const nextSelection = [...selectedPlacedComponentIds, componentId];
      setSelectedPlacedComponentIds(nextSelection);
      setSelectedPlacedComponentId(componentId);
    },
    [selectedPlacedComponentIds]
  );

  const snapToGrid = React.useCallback(
    (value: number) => {
      if (snapToGridPreference === "off") return value;
      return Math.round(value / gridSizePreference) * gridSizePreference;
    },
    [snapToGridPreference, gridSizePreference]
  );

  // Undo / Redo handlers
  const handleUndo = React.useCallback(() => {
    if (!canUndo) return;
    const current = createEditorSnapshot(
      placedComponents,
      connections,
      sequentialState
    );
    performUndo(current, (restored) => {
      setPlacedComponents(restored.placedComponents);
      setConnections(restored.connections);
      setSequentialState(restored.sequentialState);
      setSelectedPlacedComponentId(null);
      setSelectedPlacedComponentIds([]);
      setSelectedConnectionId(null);
      setConnectionSourceId(null);

      // Prune timing diagram channels that no longer exist in restored circuit
      const restoredIds = new Set(restored.placedComponents.map((c) => c.id));
      setWaveformState((prev) => ({
        ...prev,
        channels: prev.channels.filter((ch) => restoredIds.has(ch.componentId)),
      }));
    });
  }, [
    canUndo,
    createEditorSnapshot,
    placedComponents,
    connections,
    sequentialState,
    performUndo,
    setSequentialState,
  ]);

  const handleRedo = React.useCallback(() => {
    if (!canRedo) return;
    const current = createEditorSnapshot(
      placedComponents,
      connections,
      sequentialState
    );
    performRedo(current, (restored) => {
      setPlacedComponents(restored.placedComponents);
      setConnections(restored.connections);
      setSequentialState(restored.sequentialState);
      setSelectedPlacedComponentId(null);
      setSelectedPlacedComponentIds([]);
      setSelectedConnectionId(null);
      setConnectionSourceId(null);

      // Prune timing diagram channels that no longer exist in redone circuit
      const redoneIds = new Set(restored.placedComponents.map((c) => c.id));
      setWaveformState((prev) => ({
        ...prev,
        channels: prev.channels.filter((ch) => redoneIds.has(ch.componentId)),
      }));
    });
  }, [
    canRedo,
    createEditorSnapshot,
    placedComponents,
    connections,
    sequentialState,
    performRedo,
    setSequentialState,
  ]);

  // Duplicate Selected Component
  const handleDuplicateSelectedComponent = React.useCallback(() => {
    if (selectedPlacedComponentId === null) return;
    const item = placedComponents.find(
      (c) => c.id === selectedPlacedComponentId
    );
    if (!item) return;

    pushUndoSnapshot(
      createEditorSnapshot(placedComponents, connections, sequentialState)
    );
    const newId = Date.now();
    const duplicated: PlacedComponent = {
      ...structuredClone(item),
      id: newId,
      x: snapToGrid(item.x + gridSizePreference),
      y: snapToGrid(item.y + gridSizePreference),
    };

    setPlacedComponents((current) => [...current, duplicated]);

    if (
      duplicated.type === "SR LATCH" ||
      duplicated.type === "D FLIP-FLOP" ||
      duplicated.type === "JK FLIP-FLOP" ||
      duplicated.type === "T FLIP-FLOP"
    ) {
      setSequentialState((current) => ({
        ...current,
        [newId]: current[item.id] ?? 0,
      }));
    }

    setSelectedPlacedComponentId(newId);
    setSelectedPlacedComponentIds([newId]);
    setSelectedConnectionId(null);
    setConnectionSourceId(null);
  }, [
    selectedPlacedComponentId,
    placedComponents,
    connections,
    sequentialState,
    pushUndoSnapshot,
    createEditorSnapshot,
    snapToGrid,
    gridSizePreference,
    setSequentialState,
  ]);

  // Delete Handlers
  const handleDeleteSelectedComponent = React.useCallback(() => {
    if (selectedPlacedComponentId === null && selectedPlacedComponentIds.length === 0) return;
    pushUndoSnapshot(
      createEditorSnapshot(placedComponents, connections, sequentialState)
    );
    const deletedIds = new Set(
      selectedPlacedComponentIds.length > 0
        ? selectedPlacedComponentIds
        : selectedPlacedComponentId !== null
          ? [selectedPlacedComponentId]
          : []
    );

    setPlacedComponents((current) =>
      current.filter((c) => !deletedIds.has(c.id))
    );
    setConnections((current) =>
      current.filter(
        (conn) =>
          !deletedIds.has(conn.sourceId) && !deletedIds.has(conn.targetId)
      )
    );
    if (connectionSourceId !== null && deletedIds.has(connectionSourceId)) {
      setConnectionSourceId(null);
    }
    setSequentialState((current) => {
      const next = { ...current };
      for (const id of deletedIds) {
        delete next[id];
      }
      return next;
    });

    // Prune deleted component probes from timing diagram
    setWaveformState((prev) => ({
      ...prev,
      channels: prev.channels.filter((ch) => !deletedIds.has(ch.componentId)),
    }));

    setSelectedPlacedComponentId(null);
    setSelectedPlacedComponentIds([]);
  }, [
    selectedPlacedComponentId,
    selectedPlacedComponentIds,
    placedComponents,
    connections,
    sequentialState,
    pushUndoSnapshot,
    createEditorSnapshot,
    connectionSourceId,
    setSequentialState,
  ]);

  const handleDeleteSelectedConnection = React.useCallback(() => {
    if (selectedConnectionId === null) return;
    pushUndoSnapshot(
      createEditorSnapshot(placedComponents, connections, sequentialState)
    );
    setConnections((current) =>
      current.filter((conn) => conn.id !== selectedConnectionId)
    );
    setSelectedConnectionId(null);
  }, [
    selectedConnectionId,
    placedComponents,
    connections,
    sequentialState,
    pushUndoSnapshot,
    createEditorSnapshot,
  ]);

  const handleClearCanvas = React.useCallback(() => {
    if (
      !window.confirm(
        "Clear the entire canvas? This will remove all components and connections."
      )
    ) {
      return;
    }
    pushUndoSnapshot(
      createEditorSnapshot(placedComponents, connections, sequentialState)
    );
    setPlacedComponents([]);
    setConnections([]);
    setSequentialState({});
    setSelectedPlacedComponentId(null);
    setSelectedPlacedComponentIds([]);
    setSelectedConnectionId(null);
    setConnectionSourceId(null);
    setIsWireMode(false);

    // Reset timing diagram channels and playback
    if (waveformIntervalRef.current) {
      clearInterval(waveformIntervalRef.current);
      waveformIntervalRef.current = null;
    }
    setWaveformState((prev) => ({
      ...prev,
      channels: [],
      tick: 0,
      isPlaying: false,
    }));
  }, [
    placedComponents,
    connections,
    sequentialState,
    pushUndoSnapshot,
    createEditorSnapshot,
    setSequentialState,
  ]);

  // Zoom handlers
  const handleZoom = React.useCallback(
    (nextZoom: number, clientX?: number, clientY?: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const clampedZoom = Math.min(2, Math.max(0.5, nextZoom));
      if (clientX === undefined || clientY === undefined) {
        setZoom(clampedZoom);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const cursorX = clientX - rect.left;
      const cursorY = clientY - rect.top;

      setZoomOffset((currentOffset) => {
        const worldX = (cursorX - currentOffset.x) / zoom;
        const worldY = (cursorY - currentOffset.y) / zoom;
        return {
          x: cursorX - worldX * clampedZoom,
          y: cursorY - worldY * clampedZoom,
        };
      });

      setZoom(clampedZoom);
    },
    [zoom]
  );

  const handleZoomIn = React.useCallback(() => {
    handleZoom(zoom + 0.1);
  }, [handleZoom, zoom]);

  const handleZoomOut = React.useCallback(() => {
    handleZoom(zoom - 0.1);
  }, [handleZoom, zoom]);

  const handleResetZoom = React.useCallback(() => {
    setZoom(getDefaultZoomPreference() / 100);
    setZoomOffset({ x: 0, y: 0 });
  }, []);

  // Keyboard Shortcuts Listener
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (getKeyboardShortcutsPreference() === "disabled") {
        return;
      }

      const key = event.key.toLowerCase();
      const isModifierActive = event.ctrlKey || event.metaKey;

      if (isModifierActive && key === "z" && !event.shiftKey) {
        event.preventDefault();
        handleUndo();
        return;
      }

      if (
        isModifierActive &&
        (key === "y" || (key === "z" && event.shiftKey))
      ) {
        event.preventDefault();
        handleRedo();
        return;
      }

      if (isModifierActive && key === "d") {
        event.preventDefault();
        handleDuplicateSelectedComponent();
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedConnectionId !== null) {
          event.preventDefault();
          handleDeleteSelectedConnection();
        } else if (selectedPlacedComponentId !== null) {
          event.preventDefault();
          handleDeleteSelectedComponent();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleUndo,
    handleRedo,
    handleDuplicateSelectedComponent,
    selectedConnectionId,
    selectedPlacedComponentId,
    handleDeleteSelectedConnection,
    handleDeleteSelectedComponent,
  ]);

  // Circuit Save, Export, Import, Delete APIs
  const handleSaveCircuit = React.useCallback(async () => {
    if (isSavingCircuit) return;

    try {
      setIsSavingCircuit(true);
      setCircuitSaveMessage(null);

      const circuitData = {
        placedComponents,
        connections,
        sequentialState,
      };

      const currentProgress = calculateCircuitProgress(
        placedComponents,
        connections
      );

      const existingResponse = await fetch(`/api/projects/${id}/circuit`, {
        method: "GET",
        cache: "no-store",
      });

      const method = existingResponse.status === 404 ? "POST" : "PATCH";
      const response = await fetch(`/api/projects/${id}/circuit`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: circuitData,
          progress: currentProgress,
          completion: currentProgress,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to save circuit");
      }

      const stored = getStoredProjects();
      if (stored.length > 0) {
        const nextStatus =
          currentProgress === 100
            ? "Completed"
            : currentProgress > 0
            ? "In Progress"
            : "Planning";
        const updated = stored.map((p) =>
          p.id === id
            ? {
                ...p,
                progress: currentProgress,
                completion: currentProgress,
                status: nextStatus,
                updatedAt: new Date().toISOString(),
              }
            : p
        );
        saveProjects(updated);
      }

      setCircuitSaveMessage(
        method === "POST"
          ? "Circuit saved successfully."
          : "Circuit updated successfully."
      );
    } catch (err) {
      setCircuitSaveMessage(
        err instanceof Error ? err.message : "Failed to save circuit."
      );
    } finally {
      setIsSavingCircuit(false);
    }
  }, [id, isSavingCircuit, placedComponents, connections, sequentialState]);

  const handleExportCircuit = React.useCallback(() => {
    const circuitFile = {
      format: "CircuitVerse AI Pro",
      version: 1,
      metadata: {
        projectId: id,
        projectName: project?.name ?? "Untitled Project",
        projectDescription: project?.description ?? "",
        category: project?.category ?? "",
        createdAt: project?.createdAt ?? null,
        updatedAt: project?.updatedAt ?? null,
        exportedAt: new Date().toISOString(),
      },
      circuit: {
        placedComponents,
        connections,
        sequentialState,
      },
    };

    const json = JSON.stringify(circuitFile, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeName = (project?.name?.trim() || "circuit")
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .toLowerCase();
    link.download = `${safeName || "circuit"}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setCircuitSaveMessage("Circuit exported successfully.");
  }, [id, project, placedComponents, connections, sequentialState]);

  const handleImportCircuit = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        setCircuitSaveMessage(null);
        const text = await file.text();
        const imported = JSON.parse(text);

        if (!imported || imported.format !== "CircuitVerse AI Pro") {
          throw new Error("Invalid CircuitVerse AI Pro circuit file.");
        }

        if (imported.metadata?.projectId !== id) {
          throw new Error(
            "This circuit file belongs to a different project."
          );
        }

        const circuitData = imported.circuit;
        if (!Array.isArray(circuitData?.placedComponents)) {
          throw new Error("Invalid circuit components data.");
        }

        setPlacedComponents(circuitData.placedComponents);
        setConnections(circuitData.connections ?? []);
        setSequentialState(circuitData.sequentialState ?? {});
        setSelectedPlacedComponentId(null);
        setSelectedPlacedComponentIds([]);
        setSelectedConnectionId(null);
        setConnectionSourceId(null);
        setIsWireMode(false);
        setCircuitSaveMessage("Circuit imported successfully.");
      } catch (err) {
        setCircuitSaveMessage(
          err instanceof Error ? err.message : "Failed to import circuit."
        );
      } finally {
        event.target.value = "";
      }
    },
    [id, setSequentialState]
  );

  const handleDeleteCircuit = React.useCallback(async () => {
    if (!window.confirm("Delete the saved circuit from this project?")) return;
    try {
      setCircuitSaveMessage(null);
      const response = await fetch(`/api/projects/${id}/circuit`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete circuit");

      setPlacedComponents([]);
      setConnections([]);
      setSequentialState({});
      setSelectedPlacedComponentId(null);
      setSelectedPlacedComponentIds([]);
      setSelectedConnectionId(null);
      setConnectionSourceId(null);
      setIsWireMode(false);
      localStorage.removeItem(`circuitverse-editor-${id}`);
      setCircuitSaveMessage("Circuit deleted successfully.");
    } catch (err) {
      setCircuitSaveMessage(
        err instanceof Error ? err.message : "Failed to delete circuit."
      );
    }
  }, [id, setSequentialState]);

  // Load editor state from LocalStorage
  React.useEffect(() => {
    const storageKey = `circuitverse-editor-${id}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.placedComponents)) {
          queueMicrotask(() => setPlacedComponents(parsed.placedComponents));
        }
        if (Array.isArray(parsed.connections)) {
          queueMicrotask(() => setConnections(parsed.connections));
        }
        if (parsed.sequentialState && typeof parsed.sequentialState === "object") {
          queueMicrotask(() => setSequentialState(parsed.sequentialState));
        }
      }
    } catch (err) {
      console.error("Failed to load editor state:", err);
    } finally {
      setIsEditorStateLoaded(true);
    }
  }, [id, setSequentialState]);

  // Load AI Generated Circuit from SessionStorage
  React.useEffect(() => {
    const key = `circuitverse-generated-circuit-${id}`;
    try {
      const stored = sessionStorage.getItem(key);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (!parsed) return;

      hasLoadedGeneratedCircuitRef.current = true;
      hasLoadedDatabaseCircuitRef.current = true;

      queueMicrotask(() => {
        if (Array.isArray(parsed.placedComponents)) {
          setPlacedComponents(parsed.placedComponents);
        }
        if (Array.isArray(parsed.connections)) {
          setConnections(parsed.connections);
        }
        if (parsed.sequentialState) {
          setSequentialState(parsed.sequentialState);
        }
      });
    } catch (err) {
      console.error("Failed to load generated circuit:", err);
    }
  }, [id, setSequentialState]);

  // Debounced Auto-Save
  React.useEffect(() => {
    // Early exit if editor is not yet loaded OR simulation is actively running (prevents main thread disk I/O thrashing)
    if (!isEditorStateLoaded || isSimulationRunning) return;

    const storageKey = `circuitverse-editor-${id}`;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ placedComponents, connections, sequentialState })
      );
    } catch (err) {
      console.error("Failed to save local state:", err);
    }

    if (!hasLoadedDatabaseCircuitRef.current) return;
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);

    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const currentProgress = calculateCircuitProgress(
          placedComponents,
          connections
        );

        const response = await fetch(`/api/projects/${id}/circuit`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: {
              placedComponents: placedComponents.map((c) => ({
                id: c.id,
                type: c.type,
                x: c.x,
                y: c.y,
                value: 0,
              })),
              connections,
              sequentialState: {},
            },
            progress: currentProgress,
            completion: currentProgress,
          }),
        });

        if (!response.ok) {
          const result = await response.json().catch(() => ({}));
          throw new Error(result.error || `Auto-save rejected with status ${response.status}`);
        }

        const stored = getStoredProjects();
        if (stored.length > 0) {
          const nextStatus =
            currentProgress === 100
              ? "Completed"
              : currentProgress > 0
              ? "In Progress"
              : "Planning";
          const updated = stored.map((p) =>
            p.id === id
              ? {
                  ...p,
                  progress: currentProgress,
                  completion: currentProgress,
                  status: nextStatus,
                  updatedAt: new Date().toISOString(),
                }
              : p
          );
          saveProjects(updated);
        }

        setCircuitSaveMessage("Auto-saved.");
      } catch (err) {
        console.error("Auto-save error:", err);
        setCircuitSaveMessage("Auto-save failed.");
      }
    }, 1000);

    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [id, placedComponents, connections, sequentialState, isEditorStateLoaded, isSimulationRunning]);

  // AI Copilot Sub-Circuit Insertion Handler
  const handleInsertSubCircuit = React.useCallback(
    (generatedCircuit: AIGeneratedCircuit | EditorCircuitState) => {
      pushUndoSnapshot(
        createEditorSnapshot(placedComponents, connections, sequentialState)
      );

      const remapped = offsetAndRemapSubCircuit(
        generatedCircuit,
        placedComponents
      );

      const nextPlacedComponents = [
        ...placedComponents,
        ...remapped.components,
      ];
      const nextConnections = [
        ...connections,
        ...remapped.connections,
      ];
      const nextSequentialState = {
        ...sequentialState,
        ...remapped.sequentialState,
      };

      setPlacedComponents(nextPlacedComponents);
      setConnections(nextConnections);
      setSequentialState(nextSequentialState);

      setSelectedPlacedComponentIds(remapped.newComponentIds);
      setSelectedPlacedComponentId(
        remapped.newComponentIds.length > 0 ? remapped.newComponentIds[0] : null
      );

      setCircuitSaveMessage(
        `Inserted ${remapped.components.length} components and ${remapped.connections.length} connections from AI Copilot.`
      );
    },
    [
      placedComponents,
      connections,
      sequentialState,
      pushUndoSnapshot,
      createEditorSnapshot,
      setSequentialState,
    ]
  );

  // ── Waveform Tick Loop ──────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!waveformState.isPlaying || !isSimulationRunning) {
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
        waveformIntervalRef.current = null;
      }
      return;
    }

    waveformIntervalRef.current = setInterval(() => {
      setWaveformState((prev) => {
        const nextTick = prev.tick + 1;
        const updatedChannels = recordTick(
          prev.channels,
          nextTick,
          getSignalValue,
          prev.maxTicks
        );
        return { ...prev, tick: nextTick, channels: updatedChannels };
      });
    }, waveformState.tickRateMs);

    return () => {
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
        waveformIntervalRef.current = null;
      }
    };
  }, [
    waveformState.isPlaying,
    waveformState.tickRateMs,
    isSimulationRunning,
    getSignalValue,
  ]);

  // ── Waveform Handlers ───────────────────────────────────────────────────────
  const handleWaveformAddChannel = React.useCallback(
    (componentId: number) => {
      const comp = placedComponents.find((c) => c.id === componentId);
      if (!comp) return;
      setWaveformState((prev) => {
        if (prev.channels.some((ch) => ch.componentId === componentId)) return prev;
        const newChannel = createChannel(comp, prev.channels.length, placedComponents);
        return { ...prev, channels: [...prev.channels, newChannel] };
      });
    },
    [placedComponents]
  );

  const handleWaveformRemoveChannel = React.useCallback(
    (componentId: number) => {
      setWaveformState((prev) => ({
        ...prev,
        channels: prev.channels.filter((ch) => ch.componentId !== componentId),
      }));
    },
    []
  );

  const handleWaveformPlay = React.useCallback(() => {
    setWaveformState((prev) => ({ ...prev, isPlaying: true }));
  }, []);

  const handleWaveformPause = React.useCallback(() => {
    setWaveformState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const handleWaveformStep = React.useCallback(() => {
    setWaveformState((prev) => {
      const nextTick = prev.tick + 1;
      return {
        ...prev,
        isPlaying: false,
        tick: nextTick,
        channels: recordTick(
          prev.channels,
          nextTick,
          getSignalValue,
          prev.maxTicks
        ),
      };
    });
  }, [getSignalValue]);

  const handleWaveformReset = React.useCallback(() => {
    setWaveformState((prev) => ({
      ...prev,
      tick: 0,
      isPlaying: false,
      channels: prev.channels.map((ch) => ({ ...ch, samples: [] })),
    }));
  }, []);

  const handleWaveformTickRate = React.useCallback((ms: number) => {
    setWaveformState((prev) => ({ ...prev, tickRateMs: ms }));
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-white">
        Loading project...
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-lg border border-red-500 bg-red-950/50 p-4 text-red-200">
        {error}
      </div>
    );
  }
  if (!project) {
    return <div className="text-white p-6">Project not found.</div>;
  }

  return (
    <div className="flex w-full flex-col gap-4 pb-12">
      {/* Editor Header */}
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/80 p-3.5 shadow-[0_0_24px_rgba(0,0,0,0.16)] sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Circuit Editor
          </h1>
          <p className="mt-0.5 text-xs font-medium tracking-wide text-cyan-300/80 sm:text-sm">
            {project.name}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Diagnostics Dock toggle */}
          <button
            type="button"
            onClick={() =>
              setActiveBottomDockTab((prev) =>
                prev === "diagnostics" ? null : "diagnostics"
              )
            }
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              isDiagnosticsOpen
                ? "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.25)]"
                : "border-zinc-700/80 bg-zinc-800/80 text-zinc-300 hover:border-cyan-500/50 hover:bg-zinc-800 hover:text-white"
            }`}
            title={isDiagnosticsOpen ? "Close Diagnostics (Back to Canvas)" : "Toggle Circuit Diagnostics Dock"}
          >
            <AlertCircle className={`h-4 w-4 ${analysisIssueCount > 0 ? "text-amber-400" : "text-cyan-400"}`} />
            <span>Diagnostics</span>
            {analysisIssueCount > 0 && (
              <span className="rounded-full bg-red-500/30 px-1.5 py-0.2 text-[10px] font-bold text-red-300 border border-red-500/40">
                {analysisIssueCount}
              </span>
            )}
            {isDiagnosticsOpen && (
              <X className="ml-0.5 h-3.5 w-3.5 text-cyan-300" />
            )}
          </button>

          {/* Timing Diagram toggle */}
          <button
            type="button"
            onClick={() =>
              setActiveBottomDockTab((prev) =>
                prev === "timing" ? null : "timing"
              )
            }
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              isTimingDiagramOpen
                ? "border-violet-400 bg-violet-500/20 text-violet-200 shadow-[0_0_16px_rgba(139,92,246,0.25)]"
                : "border-violet-500/40 bg-violet-950/30 text-violet-300 hover:border-violet-400 hover:bg-violet-900/40 hover:text-white"
            }`}
            title={isTimingDiagramOpen ? "Close Timing Diagram (Back to Canvas)" : "Toggle Timing Diagram Dock"}
          >
            <Activity className="h-4 w-4 text-violet-400" />
            <span>Timing Diagram</span>
            {isTimingDiagramOpen && (
              <X className="ml-0.5 h-3.5 w-3.5 text-violet-300" />
            )}
          </button>

          {/* AI Copilot toggle */}
          <button
            type="button"
            onClick={() => setIsAICopilotOpen((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              isAICopilotOpen
                ? "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.25)]"
                : "border-cyan-500/40 bg-cyan-950/30 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-900/40 hover:text-white"
            }`}
            title="Toggle In-Editor AI Copilot"
          >
            <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span>AI Copilot</span>
          </button>

          <Link
            href={`/dashboard/projects/${id}`}
            className="inline-flex w-fit items-center rounded-lg border border-zinc-700/80 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-700 hover:text-white sm:text-sm"
          >
            ← Back to Project
          </Link>
        </div>
      </div>

      {/* Editor Workspace: Natural Document Flow */}
      <div className="grid w-full min-w-0 grid-cols-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)] items-start">
        {/* Component Palette Sidebar */}
        <aside className="flex flex-col w-full min-w-0 rounded-xl border border-zinc-800/80 bg-zinc-900/80 p-4 shadow-[0_0_24px_rgba(0,0,0,0.16)] min-h-[750px] lg:min-h-[80vh]">
          <div className="shrink-0">
            <h2 className="text-lg font-semibold tracking-tight text-white">
              Components
            </h2>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Circuit components
            </p>
          </div>

          <div className="mt-4 flex-1 space-y-2.5 overflow-y-auto custom-scrollbar pr-1 max-h-[700px] lg:max-h-none">
            {COMPONENT_PALETTE.map((comp) => (
              <button
                key={comp}
                type="button"
                onClick={() => setSelectedComponent(comp)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${
                  selectedComponent === comp
                    ? "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.12)]"
                    : "border-zinc-800/80 bg-zinc-950/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                {comp}
              </button>
            ))}
          </div>
        </aside>

        {/* Center Canvas Section */}
        <section className="flex w-full min-w-0 flex-col rounded-xl border border-zinc-800/80 bg-zinc-950/90 shadow-[inset_0_0_32px_rgba(0,0,0,0.18)]">
          <div className="shrink-0">
            <EditorToolbar
              zoom={zoom}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onResetZoom={handleResetZoom}
              showGrid={showGrid}
              onToggleGrid={() => {
                const next = showGrid ? "hidden" : "shown";
                saveShowGridPreference(next);
                syncPreferencesToServer({ showGrid: next });
              }}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={handleUndo}
              onRedo={handleRedo}
              isSimulationRunning={isSimulationRunning}
              onStartSimulation={handleStartSimulation}
              onStopSimulation={handleStopSimulation}
              onResetSimulation={handleResetSimulation}
              onOpenTruthTable={() => setIsTruthTableOpen(true)}
              onValidateCircuit={validateCircuit}
              isSavingCircuit={isSavingCircuit}
              isEditorStateLoaded={isEditorStateLoaded}
              onSaveCircuit={handleSaveCircuit}
              onExportCircuit={handleExportCircuit}
              onImportCircuit={handleImportCircuit}
              onDeleteCircuit={handleDeleteCircuit}
              isWireMode={isWireMode}
              onToggleWireMode={() => {
                setIsWireMode((curr) => !curr);
                setConnectionSourceId(null);
              }}
              hasSelectedComponent={
                selectedPlacedComponentId !== null ||
                selectedPlacedComponentIds.length > 0
              }
              selectedConnectionId={selectedConnectionId}
              onDeleteSelected={
                selectedConnectionId !== null
                  ? handleDeleteSelectedConnection
                  : handleDeleteSelectedComponent
              }
              hasItemsToClear={
                placedComponents.length > 0 || connections.length > 0
              }
              onClearCanvas={handleClearCanvas}
            />
          </div>

          {circuitSaveMessage && (
            <div className="shrink-0 border-b border-cyan-900 bg-cyan-950/40 px-4 py-2.5 text-sm text-cyan-300">
              {circuitSaveMessage}
            </div>
          )}

          {/* Full Canvas Dimensions: Generous Natural Height */}
          <div className="relative min-h-[750px] lg:min-h-[80vh] h-[750px] lg:h-[80vh] w-full overflow-hidden">
            <CircuitCanvas
              canvasRef={canvasRef}
              zoom={zoom}
              zoomOffset={zoomOffset}
              setZoomOffset={setZoomOffset}
              handleZoom={handleZoom}
              showGrid={showGrid}
              gridSizePreference={gridSizePreference}
              snapToGridPreference={snapToGridPreference}
              panWithSpacePreference={panWithSpacePreference}
              multiSelectPreference={multiSelectPreference}
              doubleClickInputTogglePreference={doubleClickPreference}
              selectedComponent={selectedComponent}
              placedComponents={placedComponents}
              setPlacedComponents={setPlacedComponents}
              connections={connections}
              setConnections={setConnections}
              selectedPlacedComponentId={selectedPlacedComponentId}
              setSelectedPlacedComponentId={setSelectedPlacedComponentId}
              selectedPlacedComponentIds={selectedPlacedComponentIds}
              setSelectedPlacedComponentIds={setSelectedPlacedComponentIds}
              selectedConnectionId={selectedConnectionId}
              setSelectedConnectionId={setSelectedConnectionId}
              connectionSourceId={connectionSourceId}
              setConnectionSourceId={setConnectionSourceId}
              isWireMode={isWireMode}
              toggleComponentSelection={toggleComponentSelection}
              pushUndoSnapshot={() =>
                pushUndoSnapshot(
                  createEditorSnapshot(
                    placedComponents,
                    connections,
                    sequentialState
                  )
                )
              }
              createEditorSnapshot={() =>
                createEditorSnapshot(
                  placedComponents,
                  connections,
                  sequentialState
                )
              }
              componentDragStartSnapshotRef={componentDragStartSnapshotRef}
              onToggleInput={handleToggleInput}
              getSignalValue={getSignalValue}
              getOutputValue={getOutputValue}
              setSequentialState={setSequentialState}
            />
          </div>

          {/* Downward Expanding Bench Panel (Timing Diagram & Diagnostics) */}
          {activeBottomDockTab !== null && (
            <div className="border-t border-zinc-800 bg-zinc-950/95 flex flex-col overflow-hidden rounded-b-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              {/* Dock Tab Selector Strip */}
              <div className="shrink-0 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/90 px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveBottomDockTab("timing")}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      activeBottomDockTab === "timing"
                        ? "bg-violet-500/20 text-violet-200 border border-violet-500/40 shadow-xs"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                    }`}
                  >
                    <Activity className="h-3.5 w-3.5 text-violet-400" />
                    <span>Timing Diagram</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveBottomDockTab("diagnostics")}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      activeBottomDockTab === "diagnostics"
                        ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-xs"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                    }`}
                  >
                    <AlertCircle className={`h-3.5 w-3.5 ${analysisIssueCount > 0 ? "text-amber-400" : "text-cyan-400"}`} />
                    <span>Diagnostics & Analysis</span>
                    {analysisIssueCount > 0 && (
                      <span className="rounded-full bg-red-500/30 px-1.5 py-0.2 text-[10px] font-bold text-red-300">
                        {analysisIssueCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Prominent Close Dock / Back to Canvas Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveBottomDockTab(null);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-700 hover:text-white"
                    title="Close dock and return to full canvas view"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Back to Canvas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveBottomDockTab(null)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-900/60 bg-red-950/30 px-2.5 py-1 text-xs font-semibold text-red-300 transition hover:border-red-500/60 hover:bg-red-900/40 hover:text-red-100"
                    title="Close bottom dock"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Close</span>
                  </button>
                </div>
              </div>

              {/* Dock Tab Content Host */}
              <div className="h-80 min-h-[320px] overflow-hidden">
                {activeBottomDockTab === "timing" && (
                  <TimingDiagram
                    isOpen={true}
                    placedComponents={placedComponents}
                    isSimulationRunning={isSimulationRunning}
                    getSignalValue={getSignalValue}
                    waveformState={waveformState}
                    onAddChannel={handleWaveformAddChannel}
                    onRemoveChannel={handleWaveformRemoveChannel}
                    onPlay={handleWaveformPlay}
                    onPause={handleWaveformPause}
                    onStep={handleWaveformStep}
                    onReset={handleWaveformReset}
                    onChangeTickRate={handleWaveformTickRate}
                    onToggleOpen={() => setActiveBottomDockTab(null)}
                  />
                )}

                {activeBottomDockTab === "diagnostics" && (
                  <div className="h-full overflow-y-auto p-4 custom-scrollbar">
                    <DiagnosticsPanel
                      simulationError={simulationError}
                      validationErrors={validationErrors}
                      floatingInputErrors={floatingInputErrors}
                      invalidConnectionErrors={invalidConnectionErrors}
                      placedComponents={placedComponents}
                      connections={connections}
                      analysisInputCount={analysisInputCount}
                      analysisOutputCount={analysisOutputCount}
                      analysisGateCount={analysisGateCount}
                      analysisSequentialCount={analysisSequentialCount}
                      analysisIssueCount={analysisIssueCount}
                      analysisStatus={analysisStatus}
                      isSimulationRunning={isSimulationRunning}
                      getLogicExpression={getLogicExpression}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Truth Table Modal */}
      <TruthTableModal
        isOpen={isTruthTableOpen}
        onClose={() => setIsTruthTableOpen(false)}
        placedComponents={placedComponents}
        getComponentOutput={getComponentOutput}
      />

      {/* Bottom Status Bar */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/80 px-4 py-2.5 shadow-[0_0_20px_rgba(0,0,0,0.12)]">
        <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">Editor Status:</span>
            <span
              className={
                isSimulationRunning
                  ? "font-medium text-green-400"
                  : analysisIssueCount > 0
                  ? "font-medium text-red-400"
                  : "font-medium text-green-400"
              }
            >
              {isSimulationRunning
                ? "Simulation Running"
                : analysisIssueCount > 0
                ? `Diagnostics Required (${analysisIssueCount} issues)`
                : "Ready"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setActiveBottomDockTab((prev) =>
                  prev === "diagnostics" ? null : "diagnostics"
                )
              }
              className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                activeBottomDockTab === "diagnostics"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              Diagnostics Dock
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveBottomDockTab((prev) =>
                  prev === "timing" ? null : "timing"
                )
              }
              className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                activeBottomDockTab === "timing"
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              Timing Dock
            </button>
          </div>
        </div>
      </div>

      {/* In-Editor AI Copilot Drawer */}
      <AICopilotDrawer
        isOpen={isAICopilotOpen}
        onClose={() => setIsAICopilotOpen(false)}
        projectId={id}
        placedComponents={placedComponents}
        connections={connections}
        sequentialState={sequentialState}
        onInsertSubCircuit={handleInsertSubCircuit}
      />
    </div>
  );
}