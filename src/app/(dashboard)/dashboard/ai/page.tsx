"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import {
  getAIExplanationFocusPreference,
  getAIResponseStylePreference,
} from "@/lib/settingsPreferences";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useProjects } from "@/context/ProjectContext";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function AIAssistantContent() {
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get("projectId");
  const router = useRouter();
  const { projects, isLoading: isProjectsLoading } = useProjects();

  const effectiveProjectId = useMemo(() => {
    if (isProjectsLoading) {
      return "";
    }
    if (projects.length === 0) {
      return "";
    }
    const matched = projects.find((p) => p.id === projectIdParam);
    return matched ? matched.id : projects[0].id;
  }, [isProjectsLoading, projects, projectIdParam]);

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const recentChatMessages = chatMessages.slice(-10);
  const [circuit, setCircuit] = useState<{
    placedComponents: unknown[];
    connections: unknown[];
    sequentialState: unknown;
  }>({
    placedComponents: [],
    connections: [],
    sequentialState: {},
  });

  const [isCircuitLoading, setIsCircuitLoading] = useState(false);

  // Synchronize URL query parameter if missing or pointing to a non-existent/mock project
  useEffect(() => {
    if (isProjectsLoading) {
      return;
    }

    if (projects.length > 0) {
      const isValidProject = projects.some((p) => p.id === projectIdParam);
      if (!projectIdParam || !isValidProject) {
        router.replace(`/dashboard/ai?projectId=${projects[0].id}`);
      }
    }
  }, [projectIdParam, projects, isProjectsLoading, router]);

  // Load Circuit for the active project
  useEffect(() => {
    if (!effectiveProjectId) {
      return;
    }

    async function loadCircuit() {
      try {
        setIsCircuitLoading(true);
        setError("");

        const response = await fetch(
          `/api/projects/${effectiveProjectId}/circuit`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (response.status === 404) {
          setCircuit({
            placedComponents: [],
            connections: [],
            sequentialState: {},
          });
          return;
        }

        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");

        if (!response.ok) {
          if (isJson) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || `Failed to load circuit (status ${response.status})`);
          }
          throw new Error(`Failed to load circuit (status ${response.status})`);
        }

        if (!isJson) {
          throw new Error("Received non-JSON response from circuit API");
        }

        const data = await response.json();
        const circuitData = data.data;

        setCircuit({
          placedComponents: Array.isArray(circuitData?.placedComponents)
            ? circuitData.placedComponents
            : [],
          connections: Array.isArray(circuitData?.connections)
            ? circuitData.connections
            : [],
          sequentialState: circuitData?.sequentialState ?? {},
        });
      } catch (err) {
        console.error("Circuit loading error:", err);
        setError(err instanceof Error ? err.message : "Failed to load circuit");
      } finally {
        setIsCircuitLoading(false);
      }
    }

    loadCircuit();
  }, [effectiveProjectId]);

  // Load Chat History for the active project
  useEffect(() => {
    if (!effectiveProjectId) {
      return;
    }

    async function loadChatHistory() {
      try {
        const response = await fetch(
          `/api/projects/${effectiveProjectId}/ai-chats`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (response.status === 404) {
          setChatMessages([]);
          setChatId(null);
          return;
        }

        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");

        if (!response.ok) {
          if (isJson) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || `Failed to load AI chat history (status ${response.status})`);
          }
          throw new Error(`Failed to load AI chat history (status ${response.status})`);
        }

        if (!isJson) {
          throw new Error("Received non-JSON response from AI chat history API");
        }

        const data = await response.json();
        const chats = Array.isArray(data.data) ? data.data : [];

        if (chats.length === 0) {
          setChatMessages([]);
          setChatId(null);
          return;
        }

        const latestChat = chats[0];

        setChatId(
          typeof latestChat?.id === "string" ? latestChat.id : null
        );

        const storedMessages = chats.flatMap(
          (chat: {
            id?: string;
            messages?: Array<{ role?: string; content?: string }>;
          }) => (Array.isArray(chat.messages) ? chat.messages : [])
        );

        setChatMessages(
          storedMessages
            .filter(
              (chatMessage: { role?: string; content?: string }) =>
                (chatMessage.role === "user" ||
                  chatMessage.role === "assistant") &&
                typeof chatMessage.content === "string"
            )
            .map(
              (chatMessage: {
                role: "user" | "assistant";
                content: string;
              }) => ({
                role: chatMessage.role,
                content: chatMessage.content,
              })
            )
        );
      } catch (err) {
        console.error("AI chat history loading error:", err);
        setError(
          err instanceof Error
            ? `Notice: ${err.message}. You can still ask new questions.`
            : "Notice: Failed to load previous chat history. You can still ask new questions."
        );
      }
    }

    loadChatHistory();
  }, [effectiveProjectId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message.trim()) {
      return;
    }

    if (!effectiveProjectId) {
      setError("Please create or select a project before asking the AI Assistant.");
      return;
    }

    setError("");

    const userMessage = message.trim();

    setChatMessages((previousMessages) => [
      ...previousMessages,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    const responseStyle = getAIResponseStylePreference();
    const explanationFocus = getAIExplanationFocusPreference();

    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: effectiveProjectId,
          message: userMessage,
          circuit,
          history: recentChatMessages,
          responseStyle,
          explanationFocus,
          chatId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process AI request");
      }

      if (typeof data.chatId === "string") {
        setChatId(data.chatId);
      }

      const aiMessage = data.data?.message;

      if (typeof aiMessage !== "string" || aiMessage.trim().length === 0) {
        throw new Error("The AI returned an empty response. Please try again.");
      }

      setChatMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "assistant",
          content: aiMessage,
        },
      ]);
    } catch (err) {
      console.error("AI request error:", err);
      setError(
        err instanceof Error
          ? `AI Assistant error: ${err.message}`
          : "AI Assistant error: Failed to process the request. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  // While projects are loading initially
  if (isProjectsLoading) {
    return (
      <main className="min-h-screen bg-zinc-950 p-6 text-white">
        <div className="mx-auto flex h-96 max-w-4xl flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <p className="text-sm font-medium text-zinc-400">Loading projects...</p>
        </div>
      </main>
    );
  }

  // If user has no projects at all and loading finished
  if (!isProjectsLoading && projects.length === 0) {
    return (
      <main className="min-h-screen bg-zinc-950 p-6 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold">AI Assistant</h1>
          <p className="mt-2 text-zinc-400">
            Your AI assistant works with a specific circuit project.
          </p>

          <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
            <h2 className="text-xl font-semibold text-white">
              No Projects Found
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-400">
              Create a circuit project first to enable AI-powered circuit analysis, truth table generation, signal flow tracking, and intelligent error detection.
            </p>
            <Link
              href="/dashboard/projects"
              className="mt-6 inline-block rounded-xl bg-cyan-400 px-5 py-3 font-medium text-black transition hover:bg-cyan-300"
            >
              Go to Projects →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5">
          <div>
            <h1 className="text-3xl font-bold">AI Assistant</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Ask questions about your digital circuits, analyze signal flow, or inspect truth tables.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {projects.length > 0 && (
              <div className="flex items-center gap-2">
                <label htmlFor="project-select" className="text-xs text-zinc-400 font-medium">
                  Project:
                </label>
                <select
                  id="project-select"
                  value={effectiveProjectId}
                  onChange={(e) => {
                    router.push(`/dashboard/ai?projectId=${e.target.value}`);
                  }}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {effectiveProjectId && (
              <Link
                href={`/dashboard/projects/${effectiveProjectId}`}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-zinc-700"
              >
                ← Back to Project
              </Link>
            )}
          </div>
        </div>

        {effectiveProjectId && isCircuitLoading && (
          <p className="mt-3 text-sm text-zinc-500 animate-pulse">
            Loading project circuit data...
          </p>
        )}

        {effectiveProjectId && !isCircuitLoading && (
          <p className="mt-3 text-sm text-zinc-400">
            Active circuit: <span className="text-cyan-400 font-medium">{circuit.placedComponents.length}</span> components,{" "}
            <span className="text-cyan-400 font-medium">{circuit.connections.length}</span> connections
          </p>
        )}

        <div className="mt-8 space-y-4">
          {chatMessages.length === 0 && !isLoading && (
            <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-8 text-center backdrop-blur-xl shadow-lg">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

              <h2 className="text-xl font-bold tracking-tight text-white">
                CircuitVerse AI Copilot
              </h2>

              <p className="mx-auto mt-2 max-w-2xl text-sm text-zinc-400">
                Ask me about your current circuit, signal flow, truth tables,
                circuit errors, or simulation optimizations.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                {[
                  "Explain my circuit",
                  "Explain signal flow",
                  "Generate truth table",
                  "Find circuit errors",
                ].map((promptText) => (
                  <button
                    key={promptText}
                    type="button"
                    onClick={() => setMessage(promptText)}
                    className="group flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-xs font-medium text-zinc-300 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-500/50 hover:bg-zinc-800/80 hover:text-cyan-300 hover:shadow-[0_4px_15px_rgba(6,182,212,0.15)]"
                  >
                    <span className="text-cyan-400 opacity-70 transition-opacity group-hover:opacity-100">✨</span>
                    <span>{promptText}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {chatMessages.map((chatMessage, index) => (
            <div
              key={`${chatMessage.role}-${index}`}
              className={`animate-chat-bubble rounded-2xl p-5 shadow-sm transition-all duration-200 ${
                chatMessage.role === "user"
                  ? "ml-12 rounded-tr-sm border border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 via-blue-600/15 to-transparent text-cyan-50 backdrop-blur-md shadow-[0_4px_20px_rgba(6,182,212,0.12)]"
                  : "mr-12 rounded-tl-sm border border-zinc-800/90 bg-zinc-900/70 text-zinc-100 backdrop-blur-md shadow-lg"
              }`}
            >
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {chatMessage.role === "user" ? (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    <span>You</span>
                  </>
                ) : (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                    <span>CircuitVerse AI</span>
                  </>
                )}
              </div>

              <div className="max-w-none leading-7 text-zinc-100">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {chatMessage.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {isLoading && (
            <div
              className="mr-12 animate-chat-bubble flex items-center gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4 text-sm text-zinc-300 backdrop-blur-md shadow-md"
              aria-live="polite"
              aria-busy="true"
            >
              <div className="flex h-5 items-center gap-1">
                <span className="h-4 w-1 rounded-full bg-cyan-400 animate-neural-wave" style={{ animationDelay: "0ms" }} />
                <span className="h-4 w-1 rounded-full bg-cyan-400 animate-neural-wave" style={{ animationDelay: "150ms" }} />
                <span className="h-4 w-1 rounded-full bg-indigo-400 animate-neural-wave" style={{ animationDelay: "300ms" }} />
                <span className="h-4 w-1 rounded-full bg-indigo-400 animate-neural-wave" style={{ animationDelay: "450ms" }} />
              </div>
              <span className="font-medium text-cyan-300">CircuitVerse AI is analyzing...</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-800/60 bg-red-950/40 px-4 py-3 text-sm text-red-300 backdrop-blur-sm"
            >
              <p>{error}</p>
              <button
                type="button"
                onClick={() => setError("")}
                className="mt-3 rounded-lg border border-red-700/80 px-3 py-1.5 text-xs font-medium text-red-200 transition hover:bg-red-900/40"
              >
                Dismiss
              </button>
            </div>
          )}

          <p className="text-xs text-zinc-500">
            Ask about circuit behavior, signal flow, errors, truth tables, or improvements.
          </p>

          <div className="relative rounded-2xl border border-zinc-800/90 bg-zinc-900/70 backdrop-blur-xl transition-all duration-300 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/30 focus-within:shadow-[0_0_30px_rgba(6,182,212,0.18)]">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask CircuitVerse AI about your circuit..."
              disabled={isLoading}
              rows={4}
              className="min-h-32 w-full resize-y rounded-2xl bg-transparent p-4 text-white outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 px-6 py-3 font-semibold text-zinc-950 shadow-md transition-all duration-200 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              {isLoading ? "Analyzing..." : "Ask AI →"}
            </span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
          </button>
        </form>
      </div>
    </main>
  );
}

export default function AIAssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 w-full animate-pulse flex-col items-center justify-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-8 text-zinc-400">
          <div className="h-8 w-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-zinc-300">Loading AI Assistant...</p>
        </div>
      }
    >
      <AIAssistantContent />
    </Suspense>
  );
}