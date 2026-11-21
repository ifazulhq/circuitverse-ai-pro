"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  generateCircuit,
} from "@/lib/aiCircuitGenerationClient";
import {
  convertGeneratedCircuitToEditorCircuit,
  validateGeneratedCircuit,
  type EditorCircuitState,
} from "@/lib/aiCircuitGeneration";

function AICircuitGeneratorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [generatedCircuit, setGeneratedCircuit] =
    useState<EditorCircuitState | null>(null);

  async function handleGenerate() {
    if (!prompt.trim()) {
      setError("Please describe the circuit you want to generate.");
      return;
    }

    setError("");
    setGeneratedCircuit(null);
    setIsGenerating(true);

    try {
      const result = await generateCircuit(prompt.trim());

      if (!result.success || !result.data) {
        throw new Error(
          result.error || "Failed to generate circuit."
        );
      }

      if (!validateGeneratedCircuit(result.data)) {
        throw new Error(
          "The generated circuit failed validation."
        );
      }

      const editorCircuit =
        convertGeneratedCircuitToEditorCircuit(
          result.data as Parameters<
            typeof convertGeneratedCircuitToEditorCircuit
          >[0]
        );

      setGeneratedCircuit(editorCircuit);
    } catch (error) {
      console.error(
        "Circuit generation error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to generate circuit."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function handleRegenerate() {
    void handleGenerate();
  }

  function handleApplyToEditor() {
    if (!generatedCircuit) {
      return;
    }

    if (!projectId) {
      setError(
        "No project was selected. Please open the AI Generator from a project."
      );
      return;
    }

    const generatedCircuitStorageKey =
      `circuitverse-generated-circuit-${projectId}`;

    sessionStorage.setItem(
      generatedCircuitStorageKey,
      JSON.stringify(generatedCircuit)
    );

    router.push(`/dashboard/projects/${projectId}/editor`);
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">
            AI Circuit Generator
          </h1>

          {projectId && (
            <Link
              href={`/dashboard/projects/${projectId}`}
              className="rounded-lg bg-zinc-800 px-4 py-2 text-white transition hover:bg-zinc-700"
            >
              ← Back to Project
            </Link>
          )}
        </div>

        <p className="mt-2 text-zinc-400">
          Describe the digital circuit you want to
          create and let AI build it for you.
        </p>

        <div className="mt-8 space-y-4">
          <textarea
            value={prompt}
            onChange={(event) =>
              setPrompt(event.target.value)
            }
            placeholder="Example: Create a 2-bit full adder."
            className="min-h-36 w-full rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-white outline-none focus:border-cyan-400"
          />

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="rounded-lg bg-cyan-400 px-5 py-3 font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating
                ? "Generating..."
                : "Generate Circuit"}
            </button>

            {generatedCircuit && (
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="rounded-lg border border-zinc-700 px-5 py-3 font-medium text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Regenerate
              </button>
            )}
          </div>
        </div>

        {generatedCircuit && (
          <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold">
              Circuit Generated
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              The AI generated a valid circuit structure.
            </p>

            <button
              type="button"
              onClick={handleApplyToEditor}
              className="mt-5 rounded-lg bg-cyan-400 px-5 py-3 font-medium text-black"
            >
              Apply to Editor
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function AICircuitGeneratorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 w-full animate-pulse flex-col items-center justify-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-8 text-zinc-400">
          <div className="h-8 w-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-zinc-300">Loading Circuit Generator...</p>
        </div>
      }
    >
      <AICircuitGeneratorContent />
    </Suspense>
  );
}