"use client";

import * as React from "react";
import { LogicValue, PlacedComponent, TruthTableRow } from "@/types/circuit";

interface TruthTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  placedComponents: PlacedComponent[];
  getComponentOutput: (
    componentId: number,
    visited?: Set<number>,
    requestedOutputPort?: number,
    inputOverrides?: Record<number, LogicValue>
  ) => LogicValue;
}

const MAX_INPUT_SAFETY_LIMIT = 10;

export const TruthTableModal: React.FC<TruthTableModalProps> = React.memo(
  ({ isOpen, onClose, placedComponents, getComponentOutput }) => {
    const inputComponents = React.useMemo(
      () => placedComponents.filter((component) => component.type === "INPUT"),
      [placedComponents]
    );

    const outputComponents = React.useMemo(
      () => placedComponents.filter((component) => component.type === "OUTPUT"),
      [placedComponents]
    );

    const isExceedingSafetyLimit =
      inputComponents.length > MAX_INPUT_SAFETY_LIMIT;

    const truthTable = React.useMemo(() => {
      if (
        !isOpen ||
        isExceedingSafetyLimit ||
        inputComponents.length === 0 ||
        outputComponents.length === 0
      ) {
        return [];
      }

      const inputComponentIds = inputComponents.map((c) => c.id);
      const totalCombinations = 2 ** inputComponentIds.length;
      const rows: TruthTableRow[] = [];

      for (let index = 0; index < totalCombinations; index++) {
        const inputValues: Record<number, LogicValue> = {};

        inputComponentIds.forEach((componentId, inputIndex) => {
          const bitPosition = inputComponentIds.length - inputIndex - 1;
          inputValues[componentId] = ((index >> bitPosition) & 1) as LogicValue;
        });

        const outputValues: Record<number, LogicValue> = {};
        outputComponents.forEach((component) => {
          outputValues[component.id] = getComponentOutput(
            component.id,
            new Set(),
            0,
            inputValues
          );
        });

        rows.push({
          inputs: inputValues,
          outputs: outputValues,
        });
      }

      return rows;
    }, [
      isOpen,
      isExceedingSafetyLimit,
      inputComponents,
      outputComponents,
      getComponentOutput,
    ]);

    // Close on Escape key
    React.useEffect(() => {
      if (!isOpen) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onClose();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) {
      return null;
    }

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="relative flex max-h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-white">Truth Table</h2>
                {truthTable.length > 0 && (
                  <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400 border border-green-500/20">
                    {truthTable.length} combinations
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-400">
                Generated from the current circuit inputs and outputs.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-zinc-800 hover:text-white transition"
              title="Close Truth Table"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {isExceedingSafetyLimit ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-lg font-bold">
                  ⚠️
                </div>
                <h3 className="text-base font-semibold text-amber-300">
                  Input Safety Limit Exceeded
                </h3>
                <p className="mt-2 text-sm text-gray-300 max-w-lg mx-auto">
                  Calculating truth tables for {inputComponents.length} inputs
                  would require{" "}
                  <strong>{2 ** inputComponents.length} rows</strong>, which
                  causes browser thread lockups.
                </p>
                <p className="mt-2 text-xs text-amber-400/80">
                  Truth table generation is safely capped at{" "}
                  {MAX_INPUT_SAFETY_LIMIT} inputs (1,024 combinations). Please
                  reduce the number of inputs to inspect the truth table.
                </p>
              </div>
            ) : inputComponents.length === 0 || outputComponents.length === 0 ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-12 text-center">
                <p className="text-base font-medium text-gray-400">
                  No truth table generated yet.
                </p>
                <p className="mt-2 text-xs text-gray-600">
                  Add at least one INPUT and one OUTPUT component on the canvas
                  to generate a complete truth table.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-zinc-950/95 backdrop-blur-sm z-10">
                    <tr>
                      {inputComponents.map((component, index) => (
                        <th
                          key={`input-header-${component.id}`}
                          className="border-b border-zinc-800 px-4 py-3 text-left font-semibold text-cyan-400"
                        >
                          INPUT {index + 1}
                        </th>
                      ))}
                      {outputComponents.map((component, index) => (
                        <th
                          key={`output-header-${component.id}`}
                          className="border-b border-zinc-800 px-4 py-3 text-left font-semibold text-purple-400"
                        >
                          OUTPUT {index + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {truthTable.map((row, rowIndex) => (
                      <tr
                        key={`truth-row-${rowIndex}`}
                        className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/40"
                      >
                        {inputComponents.map((component) => (
                          <td
                            key={`input-${rowIndex}-${component.id}`}
                            className="px-4 py-2.5 font-mono text-white"
                          >
                            {row.inputs[component.id]}
                          </td>
                        ))}

                        {outputComponents.map((component) => (
                          <td
                            key={`output-${rowIndex}-${component.id}`}
                            className="px-4 py-2.5 font-mono font-semibold text-white"
                          >
                            <span
                              className={
                                row.outputs[component.id] === 1
                                  ? "text-purple-300"
                                  : "text-gray-500"
                              }
                            >
                              {row.outputs[component.id]}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t border-zinc-800 px-6 py-3 bg-zinc-950/50 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
);
TruthTableModal.displayName = "TruthTableModal";
