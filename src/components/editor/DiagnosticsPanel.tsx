"use client";

import * as React from "react";
import { PlacedComponent, Connection } from "@/types/circuit";

interface DiagnosticsPanelProps {
  simulationError: string | null;
  validationErrors: string[];
  floatingInputErrors: string[];
  invalidConnectionErrors: string[];
  placedComponents: PlacedComponent[];
  connections: Connection[];
  analysisInputCount: number;
  analysisOutputCount: number;
  analysisGateCount: number;
  analysisSequentialCount: number;
  analysisIssueCount: number;
  analysisStatus: string;
  isSimulationRunning: boolean;
  getLogicExpression: (componentId: number) => string;
}

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = React.memo(
  ({
    simulationError,
    validationErrors,
    floatingInputErrors,
    invalidConnectionErrors,
    placedComponents,
    connections,
    analysisInputCount,
    analysisOutputCount,
    analysisGateCount,
    analysisSequentialCount,
    analysisIssueCount,
    analysisStatus,
    isSimulationRunning,
    getLogicExpression,
  }) => {
    const totalDiagnosticIssues =
      validationErrors.length +
      floatingInputErrors.length +
      invalidConnectionErrors.length;

    const outputComponents = React.useMemo(
      () => placedComponents.filter((component) => component.type === "OUTPUT"),
      [placedComponents]
    );

    return (
      <div className="flex flex-col gap-4">
        {/* Inline Simulation Diagnostics Errors Banner */}
        {(simulationError || totalDiagnosticIssues > 0) && (
          <div className="rounded-xl border border-red-900/70 bg-red-950/25 p-4 shadow-[inset_0_1px_0_rgba(248,113,113,0.04)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-red-300">
                  Simulation Diagnostics
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Circuit issues detected before simulation can run.
                </p>
              </div>

              <span className="text-xs font-semibold text-red-400">
                {totalDiagnosticIssues} issue
                {totalDiagnosticIssues === 1 ? "" : "s"}
              </span>
            </div>

            {simulationError && (
              <div className="mt-3 rounded-lg border border-red-900 bg-red-950/50 px-3 py-2">
                <p className="text-sm font-medium text-red-300">
                  {simulationError}
                </p>
              </div>
            )}

            {validationErrors.length > 0 && (
              <div className="mt-3 rounded-lg border border-yellow-900 bg-yellow-950/40 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-yellow-300">
                  Validation Errors
                </p>
                <div className="mt-2 space-y-1">
                  {validationErrors.map((message, index) => (
                    <p
                      key={`simulation-validation-error-${index}`}
                      className="text-sm text-yellow-200"
                    >
                      • {message}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {floatingInputErrors.length > 0 && (
              <div className="mt-3 rounded-lg border border-orange-900 bg-orange-950/40 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-300">
                  Floating Inputs
                </p>
                <div className="mt-2 space-y-1">
                  {floatingInputErrors.map((message, index) => (
                    <p
                      key={`simulation-floating-error-${index}`}
                      className="text-sm text-orange-200"
                    >
                      • {message}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {invalidConnectionErrors.length > 0 && (
              <div className="mt-3 rounded-lg border border-red-900 bg-red-950/40 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-300">
                  Invalid Connections
                </p>
                <div className="mt-2 space-y-1">
                  {invalidConnectionErrors.map((message, index) => (
                    <p
                      key={`simulation-connection-error-${index}`}
                      className="text-sm text-red-200"
                    >
                      • {message}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Circuit Analysis Section */}
        <section className="rounded-xl border border-zinc-800/80 bg-zinc-900/80 p-4 shadow-[0_0_24px_rgba(0,0,0,0.16)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Circuit Analysis
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Analysis of the current circuit topology and simulation state.
              </p>
            </div>

            <span
              className={`text-xs font-semibold ${
                analysisIssueCount > 0
                  ? "text-red-400"
                  : isSimulationRunning
                  ? "text-green-400"
                  : "text-cyan-400"
              }`}
            >
              {analysisStatus}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="min-w-0 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                Components
              </p>
              <p className="mt-1 text-xl font-semibold text-white">
                {placedComponents.length}
              </p>
            </div>

            <div className="min-w-0 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                Connections
              </p>
              <p className="mt-1 text-xl font-semibold text-white">
                {connections.length}
              </p>
            </div>

            <div className="min-w-0 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                Inputs
              </p>
              <p className="mt-1 text-xl font-semibold text-cyan-400">
                {analysisInputCount}
              </p>
            </div>

            <div className="min-w-0 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                Outputs
              </p>
              <p className="mt-1 text-xl font-semibold text-purple-400">
                {analysisOutputCount}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="min-w-0 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                Combinational Logic
              </p>
              <p className="mt-1 text-sm font-medium text-white">
                {analysisGateCount} logic component
                {analysisGateCount === 1 ? "" : "s"}
              </p>
            </div>

            <div className="min-w-0 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                Sequential Logic
              </p>
              <p className="mt-1 text-sm font-medium text-white">
                {analysisSequentialCount} sequential component
                {analysisSequentialCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Diagnostics Summary
            </p>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="flex items-center justify-between rounded-md border border-zinc-800 px-3 py-2">
                <span className="text-sm text-gray-400">Validation</span>
                <span className="text-sm font-semibold text-white">
                  {validationErrors.length}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-md border border-zinc-800 px-3 py-2">
                <span className="text-sm text-gray-400">Floating Inputs</span>
                <span className="text-sm font-semibold text-white">
                  {floatingInputErrors.length}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-md border border-zinc-800 px-3 py-2">
                <span className="text-sm text-gray-400">
                  Invalid Connections
                </span>
                <span className="text-sm font-semibold text-white">
                  {invalidConnectionErrors.length}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Signal Flow
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-md bg-cyan-950 px-2.5 py-1 text-cyan-300">
                {analysisInputCount} Inputs
              </span>
              <span className="text-gray-600">→</span>
              <span className="rounded-md bg-zinc-900 px-2.5 py-1 text-gray-300">
                {connections.length} Connections
              </span>
              <span className="text-gray-600">→</span>
              <span className="rounded-md bg-purple-950 px-2.5 py-1 text-purple-300">
                {analysisOutputCount} Outputs
              </span>
            </div>

            <p className="mt-2 text-xs text-gray-600">
              Signal-flow summary is derived from the current component and
              connection topology.
            </p>
          </div>
        </section>

        {/* Logic Expression Section */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Logic Expression
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Logical expression derived from the current circuit topology.
            </p>
          </div>

          <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-4">
            {outputComponents.length === 0 ? (
              <p className="text-sm text-gray-500">
                Add an OUTPUT component to display the circuit logic expression.
              </p>
            ) : (
              <div className="space-y-3">
                {outputComponents.map((component, index) => (
                  <div
                    key={`logic-expression-${component.id}`}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3"
                  >
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-purple-400">
                      OUTPUT {index + 1}
                    </div>
                    <code className="block overflow-x-auto whitespace-nowrap font-mono text-sm text-cyan-300">
                      Y{index + 1} = {getLogicExpression(component.id)}
                    </code>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }
);
DiagnosticsPanel.displayName = "DiagnosticsPanel";
