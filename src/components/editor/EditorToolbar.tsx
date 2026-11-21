import * as React from "react";

export interface EditorToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isSimulationRunning: boolean;
  onStartSimulation: () => void;
  onStopSimulation: () => void;
  onResetSimulation: () => void;
  onOpenTruthTable: () => void;
  onValidateCircuit: () => void;
  isSavingCircuit: boolean;
  isEditorStateLoaded: boolean;
  onSaveCircuit: () => void;
  onExportCircuit: () => void;
  onImportCircuit: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteCircuit: () => void;
  isWireMode: boolean;
  onToggleWireMode: () => void;
  hasSelectedComponent: boolean;
  selectedConnectionId: number | null;
  onDeleteSelected: () => void;
  hasItemsToClear: boolean;
  onClearCanvas: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = React.memo(
  ({
    zoom,
    onZoomIn,
    onZoomOut,
    onResetZoom,
    showGrid,
    onToggleGrid,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    isSimulationRunning,
    onStartSimulation,
    onStopSimulation,
    onResetSimulation,
    onOpenTruthTable,
    onValidateCircuit,
    isSavingCircuit,
    isEditorStateLoaded,
    onSaveCircuit,
    onExportCircuit,
    onImportCircuit,
    onDeleteCircuit,
    isWireMode,
    onToggleWireMode,
    hasSelectedComponent,
    selectedConnectionId,
    onDeleteSelected,
    hasItemsToClear,
    onClearCanvas,
  }) => {
    return (
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-800/80 bg-zinc-950/40 px-4 py-3">
        <h2 className="font-semibold text-white">Canvas</h2>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-start gap-2.5 rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-2.5 py-2 shadow-[0_0_24px_rgba(0,0,0,0.18)]">
          {/* Zoom Out */}
          <button
            type="button"
            onClick={onZoomOut}
            title="Zoom out"
            className="rounded-lg border border-zinc-700/80 bg-zinc-800 px-3 py-1.5 text-sm text-white transition hover:border-zinc-600 hover:bg-zinc-700"
          >
            −
          </button>

          {/* Zoom % */}
          <span className="min-w-14 text-center text-sm text-gray-300">
            {Math.round(zoom * 100)}%
          </span>

          {/* Zoom In */}
          <button
            type="button"
            onClick={onZoomIn}
            title="Zoom in"
            className="rounded-lg border border-zinc-700/80 bg-zinc-800 px-3 py-1.5 text-sm text-white transition hover:border-zinc-600 hover:bg-zinc-700"
          >
            +
          </button>

          {/* Reset Zoom */}
          <button
            type="button"
            onClick={onResetZoom}
            title="Reset zoom"
            className="rounded-lg border border-zinc-700/80 bg-zinc-800 px-3 py-1.5 text-sm text-white transition hover:border-zinc-600 hover:bg-zinc-700"
          >
            Reset Zoom
          </button>

          {/* Grid Toggle */}
          <button
            type="button"
            onClick={onToggleGrid}
            title="Toggle grid"
            className={`rounded-lg px-3 py-1.5 text-sm text-white transition ${
              showGrid
                ? "bg-cyan-700 hover:bg-cyan-600"
                : "bg-zinc-800 hover:bg-zinc-700"
            }`}
          >
            Grid: {showGrid ? "On" : "Off"}
          </button>

          {/* Undo */}
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
            className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Undo
          </button>

          {/* Redo */}
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
            className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Redo
          </button>

          {/* Simulation Start */}
          <button
            type="button"
            onClick={onStartSimulation}
            title="Start simulation"
            disabled={isSimulationRunning}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white shadow-[0_0_12px_rgba(34,197,94,0.08)] transition hover:bg-green-500 hover:shadow-[0_0_16px_rgba(34,197,94,0.14)] disabled:cursor-not-allowed disabled:border disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:opacity-100 disabled:shadow-none"
          >
            {isSimulationRunning
              ? "Simulation Running"
              : "Start Simulation"}
          </button>

          {/* Simulation Stop */}
          <button
            type="button"
            onClick={onStopSimulation}
            title="Stop simulation"
            disabled={!isSimulationRunning}
            className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-medium text-white shadow-[0_0_12px_rgba(249,115,22,0.06)] transition hover:bg-orange-500 hover:shadow-[0_0_16px_rgba(249,115,22,0.12)] disabled:cursor-not-allowed disabled:border disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:opacity-100 disabled:shadow-none"
          >
            Stop Simulation
          </button>

          {/* Simulation Reset */}
          <button
            type="button"
            onClick={onResetSimulation}
            title="Reset simulation"
            className="rounded-lg bg-zinc-700 px-3 py-1.5 text-sm text-white transition hover:bg-zinc-600"
          >
            Reset Simulation
          </button>

          {/* Truth Table */}
          <button
            type="button"
            onClick={onOpenTruthTable}
            title="Generate truth table"
            className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm text-white transition hover:bg-purple-500"
          >
            Generate Truth Table
          </button>

          {/* Validate Circuit */}
          <button
            type="button"
            onClick={onValidateCircuit}
            title="Validate circuit"
            className="rounded-lg bg-yellow-600 px-3 py-1.5 text-sm text-white transition hover:bg-yellow-500"
          >
            Validate Circuit
          </button>

          {/* Save Circuit */}
          <button
            type="button"
            onClick={onSaveCircuit}
            title="Save circuit"
            disabled={isSavingCircuit || !isEditorStateLoaded}
            className="rounded-lg bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white shadow-[0_0_12px_rgba(34,211,238,0.08)] transition hover:bg-cyan-500 hover:shadow-[0_0_16px_rgba(34,211,238,0.14)] disabled:cursor-not-allowed disabled:border disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:opacity-100 disabled:shadow-none"
          >
            {isSavingCircuit ? "Saving..." : "Save Circuit"}
          </button>

          {/* Export Circuit */}
          <button
            type="button"
            onClick={onExportCircuit}
            title="Export circuit"
            disabled={!isEditorStateLoaded}
            className="rounded-lg border border-cyan-700/70 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-cyan-300 transition hover:border-cyan-500 hover:bg-zinc-800 hover:text-cyan-200 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            Export Circuit
          </button>

          {/* Import Circuit */}
          <label
            title="Import circuit"
            className="cursor-pointer rounded-lg border border-purple-700/70 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-purple-300 transition hover:border-purple-500 hover:bg-zinc-800 hover:text-purple-200"
          >
            Import Circuit
            <input
              type="file"
              accept=".json,application/json"
              onChange={onImportCircuit}
              disabled={!isEditorStateLoaded}
              className="hidden"
            />
          </label>

          {/* Delete Circuit */}
          <button
            type="button"
            onClick={onDeleteCircuit}
            title="Delete saved circuit"
            className="rounded-lg bg-red-700 px-3 py-1.5 text-sm text-white transition hover:bg-red-600"
          >
            Delete Circuit
          </button>

          {/* Wire Mode Toggle */}
          <button
            type="button"
            onClick={onToggleWireMode}
            title={isWireMode ? "Disable wire mode" : "Enable wire mode"}
            className={`rounded-lg px-3 py-1.5 text-sm text-white transition ${
              isWireMode
                ? "bg-cyan-600 shadow-[0_0_14px_rgba(34,211,238,0.22)] hover:bg-cyan-500"
                : "bg-zinc-800 hover:bg-zinc-700"
            }`}
          >
            {isWireMode ? "Wire Mode: ON" : "Wire Mode"}
          </button>

          {/* Delete Selected */}
          <button
            type="button"
            onClick={onDeleteSelected}
            disabled={
              !hasSelectedComponent && selectedConnectionId === null
            }
            title="Delete selected component or connection"
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:border disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:opacity-100"
          >
            Delete Selected
          </button>

          {/* Clear Canvas */}
          <button
            type="button"
            onClick={onClearCanvas}
            disabled={!hasItemsToClear}
            title="Clear entire canvas"
            className="rounded-lg bg-red-800 px-3 py-1.5 text-sm text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear Canvas
          </button>
        </div>
      </div>
    );
  }
);
EditorToolbar.displayName = "EditorToolbar";
