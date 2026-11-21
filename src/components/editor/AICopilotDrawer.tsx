"use client";

import * as React from "react";
import {
  Sparkles,
  X,
  MessageSquare,
  Cpu,
  PlusCircle,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Wand2,
} from "lucide-react";
import { AIChatStream } from "./AIChatStream";
import { PlacedComponent, Connection, LogicValue } from "@/types/circuit";
import {
  AIGeneratedCircuit,
  AIGeneratedComponent,
  AIGeneratedConnection,
  EditorCircuitState,
} from "@/lib/aiCircuitGeneration";

interface GeneratedSubCircuitData {
  name?: string;
  description?: string;
  components: AIGeneratedComponent[];
  connections: AIGeneratedConnection[];
  sequentialState?: Record<string | number, unknown>;
}

export interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  placedComponents: PlacedComponent[];
  connections: Connection[];
  sequentialState: Record<number, LogicValue>;
  onInsertSubCircuit: (
    generatedCircuit: AIGeneratedCircuit | EditorCircuitState
  ) => void;
}

const TEMPLATE_SUGGESTIONS = [
  "2-to-1 Multiplexer using AND, OR, and NOT gates",
  "Full Adder with sum and carry-out",
  "SR Latch with Set and Reset inputs",
  "D Flip-Flop with data and clock",
  "2-to-4 Binary Decoder",
  "Half Adder logic circuit",
];

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  projectId,
  placedComponents,
  connections,
  sequentialState,
  onInsertSubCircuit,
}) => {
  const [activeTab, setActiveTab] = React.useState<"chat" | "generator">("chat");

  // Generator Tab State
  const [generatorPrompt, setGeneratorPrompt] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatorError, setGeneratorError] = React.useState<string | null>(null);
  const [generatedCircuit, setGeneratedCircuit] =
    React.useState<GeneratedSubCircuitData | null>(null);
  const [justInserted, setJustInserted] = React.useState(false);

  const handleGenerateCircuit = async (promptToUse?: string) => {
    const prompt = (promptToUse ?? generatorPrompt).trim();
    if (!prompt || isGenerating) return;

    setIsGenerating(true);
    setGeneratorError(null);
    setGeneratedCircuit(null);
    setJustInserted(false);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        // Capture error message for UI display
        setGeneratorError(result.error || "Failed to generate circuit");
        return;
      }

      setGeneratedCircuit(result.data);
    } catch (err) {
      console.error("Circuit generation error:", err);
      setGeneratorError(err instanceof Error ? err.message : "An error occurred while generating circuit");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsert = () => {
    if (!generatedCircuit) return;

    const seqState: Record<string, number> = {};
    if (generatedCircuit.sequentialState) {
      Object.entries(generatedCircuit.sequentialState).forEach(([k, v]) => {
        seqState[k] = v === 1 ? 1 : 0;
      });
    }

    const circuitToInsert: AIGeneratedCircuit = {
      components: generatedCircuit.components,
      connections: generatedCircuit.connections,
      sequentialState: seqState,
    };

    onInsertSubCircuit(circuitToInsert);
    setJustInserted(true);
    setTimeout(() => {
      setJustInserted(false);
    }, 3000);
  };

  // Group components for preview metrics
  const componentSummary = React.useMemo(() => {
    if (!generatedCircuit?.components) return null;
    const counts: Record<string, number> = {};
    for (const comp of generatedCircuit.components) {
      counts[comp.type] = (counts[comp.type] || 0) + 1;
    }
    return counts;
  }, [generatedCircuit]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm sm:hidden"
          aria-hidden="true"
        />
      )}

      {/* Drawer Container */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-zinc-800/80 bg-zinc-950/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out sm:w-[460px] lg:w-[480px] ${
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.2)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold tracking-tight text-white">
                  AI Copilot
                </span>
                <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                In-Editor Intelligence & Circuit Synthesis
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900 hover:text-white transition"
            title="Close Copilot"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-800/80 bg-zinc-900/40 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-xs font-medium transition ${
              activeTab === "chat"
                ? "bg-zinc-800 text-cyan-400 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Chat & Explanation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("generator")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-xs font-medium transition ${
              activeTab === "generator"
                ? "bg-zinc-800 text-cyan-400 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Sub-Circuit Generator</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "chat" ? (
            <AIChatStream
              projectId={projectId}
              placedComponents={placedComponents}
              connections={connections}
              sequentialState={sequentialState}
            />
          ) : (
            <div className="flex h-full flex-col overflow-y-auto p-4 space-y-4">
              {/* Generator Introduction */}
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Wand2 className="h-4 w-4 text-cyan-400" />
                  Generate Sub-Circuit
                </h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Describe any combinational or sequential block. The AI synthesizes the schematic with verified pinouts and places it directly into your workspace.
                </p>
              </div>

              {/* Prompt Input Form */}
              <div className="space-y-2">
                <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  Sub-Circuit Specification
                </label>
                <textarea
                  value={generatorPrompt}
                  onChange={(e) => setGeneratorPrompt(e.target.value)}
                  placeholder="e.g., 2-to-1 Multiplexer with inputs A, B, selector S, and output Y..."
                  rows={3}
                  disabled={isGenerating}
                  className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950/90 p-3 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => handleGenerateCircuit()}
                  disabled={isGenerating || !generatorPrompt.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 py-2.5 text-xs font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 shadow-[0_0_16px_rgba(34,211,238,0.2)]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Synthesizing Circuit...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      <span>Synthesize Sub-Circuit</span>
                    </>
                  )}
                </button>
              </div>

              {/* Suggestions Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  Template Presets
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {TEMPLATE_SUGGESTIONS.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => {
                        setGeneratorPrompt(suggestion);
                        handleGenerateCircuit(suggestion);
                      }}
                      className="rounded-full border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-[11px] text-zinc-300 hover:border-cyan-500/40 hover:text-white transition disabled:opacity-50"
                    >
                      {suggestion.split(" ")[0]} {suggestion.split(" ")[1] ?? ""}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error banner */}
              {generatorError && (
                <div className="flex items-start gap-2 rounded-lg border border-rose-800/60 bg-rose-950/40 p-3 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                  <div className="flex-1">
                    <p>{generatorError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGeneratorError(null)}
                    className="text-rose-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Success Notification */}
              {justInserted && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-800/60 bg-emerald-950/40 p-3 text-xs text-emerald-300 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Sub-circuit successfully inserted into active canvas!</span>
                </div>
              )}

              {/* Generated Circuit Preview & Insertion */}
              {generatedCircuit && (
                <div className="rounded-xl border border-cyan-500/30 bg-zinc-900/80 p-4 shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-cyan-300">
                      {generatedCircuit.name || "Generated Sub-Circuit"}
                    </h4>
                    <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-400 border border-cyan-500/20">
                      Ready to Insert
                    </span>
                  </div>

                  {generatedCircuit.description && (
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {generatedCircuit.description}
                    </p>
                  )}

                  {/* Metrics Badges */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-2 text-center">
                      <span className="block text-zinc-500 text-[10px] uppercase">
                        Components
                      </span>
                      <span className="text-base font-bold text-white">
                        {generatedCircuit.components.length}
                      </span>
                    </div>

                    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-2 text-center">
                      <span className="block text-zinc-500 text-[10px] uppercase">
                        Connections
                      </span>
                      <span className="text-base font-bold text-white">
                        {generatedCircuit.connections.length}
                      </span>
                    </div>
                  </div>

                  {/* Component Breakdown */}
                  {componentSummary && (
                    <div className="text-[11px] text-zinc-400 bg-zinc-950/40 rounded-lg p-2 border border-zinc-800/50">
                      <span className="font-semibold text-zinc-300 block mb-1">
                        Breakdown:
                      </span>
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {Object.entries(componentSummary).map(([type, count]) => (
                          <span key={type} className="text-zinc-300">
                            {type}: <strong className="text-cyan-400">{count}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Insertion Action */}
                  <button
                    type="button"
                    onClick={handleInsert}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 text-xs font-semibold text-black transition hover:bg-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.25)]"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Insert into Canvas</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
