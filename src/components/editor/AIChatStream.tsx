"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import {
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Square,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { PlacedComponent, Connection, LogicValue } from "@/types/circuit";

export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AIChatStreamProps {
  projectId: string;
  placedComponents: PlacedComponent[];
  connections: Connection[];
  sequentialState: Record<number, LogicValue>;
}

const PRESET_PROMPTS = [
  "Explain this circuit's logic and behavior",
  "Check for floating pins or invalid connections",
  "How do the sequential flip-flops / latches transition?",
  "Suggest optimizations for this circuit layout",
];

export const AIChatStream: React.FC<AIChatStreamProps> = ({
  projectId,
  placedComponents,
  connections,
  sequentialState,
}) => {
  const [messages, setMessages] = React.useState<AIChatMessage[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [streamedResponse, setStreamedResponse] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const abortControllerRef = React.useRef<AbortController | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  const scrollToBottom = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, streamedResponse, scrollToBottom]);

  const handleSendMessage = async (promptToSend?: string) => {
    const text = (promptToSend ?? inputValue).trim();
    if (!text || isStreaming) return;

    setErrorMessage(null);
    setInputValue("");
    const userMessage: AIChatMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    setIsStreaming(true);
    setStreamedResponse("");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          projectId,
          message: text,
          circuit: {
            placedComponents,
            connections,
            sequentialState,
          },
          history: updatedMessages.slice(-8),
          stream: true,
        }),
      });

      if (!response.ok) {
        let errDesc = "Failed to communicate with AI service";
        try {
          const errJson = await response.json();
          if (errJson?.error) errDesc = errJson.error;
        } catch {
          // Response body was not JSON
        }
        throw new Error(errDesc);
      }

      if (!response.body) {
        throw new Error("No response stream received from AI service");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullAssistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullAssistantText += chunk;
        setStreamedResponse(fullAssistantText);
      }

      if (fullAssistantText.trim().length > 0) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: fullAssistantText },
        ]);
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // Stream aborted by user
        if (streamedResponse.trim().length > 0) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `${streamedResponse} *(cancelled)*` },
          ]);
        }
      } else {
        console.error("AI stream error:", err);
        setErrorMessage(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      }
    } finally {
      setIsStreaming(false);
      setStreamedResponse("");
      abortControllerRef.current = null;
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleClearHistory = () => {
    if (isStreaming) handleStopStreaming();
    setMessages([]);
    setStreamedResponse("");
    setErrorMessage(null);
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header Actions */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-2.5 bg-zinc-900/40">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Context: {placedComponents.length} components</span>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleClearHistory}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition"
            title="Clear Chat History"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scroll-smooth">
        {messages.length === 0 && !isStreaming && (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200">
              In-Editor Circuit Copilot
            </h3>
            <p className="mt-1 text-xs text-zinc-400 max-w-xs mx-auto">
              Ask questions about your live schematic, verify Boolean formulas, or debug signal propagation.
            </p>

            <div className="mt-4 flex flex-col gap-1.5 text-left">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-1">
                Suggested Prompts
              </span>
              {PRESET_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="rounded-lg border border-zinc-800/80 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-300 text-left hover:border-cyan-500/40 hover:bg-zinc-800/80 hover:text-white transition group"
                >
                  <span className="text-cyan-400 mr-1.5 opacity-80 group-hover:opacity-100">›</span>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Existing Messages */}
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={index}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[11px] font-medium text-zinc-500">
                {isUser ? (
                  <>
                    <span>You</span>
                    <User className="h-3 w-3 text-cyan-400" />
                  </>
                ) : (
                  <>
                    <Bot className="h-3 w-3 text-cyan-400" />
                    <span>Circuit Copilot</span>
                  </>
                )}
              </div>

              <div
                className={`relative group max-w-[90%] rounded-xl px-3.5 py-2.5 shadow-sm leading-relaxed ${
                  isUser
                    ? "bg-cyan-950/60 border border-cyan-800/50 text-cyan-100"
                    : "bg-zinc-900/90 border border-zinc-800/80 text-zinc-200"
                }`}
              >
                {!isUser && (
                  <button
                    type="button"
                    onClick={() => handleCopy(msg.content, index)}
                    className="absolute right-2 top-2 hidden group-hover:flex items-center p-1 rounded bg-zinc-800/90 text-zinc-400 hover:text-white transition"
                    title="Copy to clipboard"
                  >
                    {copiedIndex === index ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                )}

                <div className="prose prose-invert prose-xs max-w-none text-xs sm:text-sm">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          );
        })}

        {/* Active Streaming Message */}
        {isStreaming && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5 mb-1 text-[11px] font-medium text-zinc-500">
              <Bot className="h-3 w-3 text-cyan-400" />
              <span>Circuit Copilot</span>
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping ml-1" />
            </div>

            <div className="max-w-[90%] rounded-xl px-3.5 py-2.5 shadow-sm leading-relaxed bg-zinc-900/90 border border-cyan-800/40 text-zinc-200">
              {streamedResponse ? (
                <div className="prose prose-invert prose-xs max-w-none text-xs sm:text-sm">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {streamedResponse}
                  </ReactMarkdown>
                  <span className="inline-block w-1.5 h-3.5 ml-1 bg-cyan-400 animate-pulse align-middle" />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-zinc-400 py-1">
                  <span className="flex gap-1" aria-hidden="true">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400 [animation-delay:300ms]" />
                  </span>
                  <span>Analyzing circuit context...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-800/60 bg-rose-950/40 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1">
              <p>{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-zinc-800/80 p-3 bg-zinc-900/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-end gap-2"
        >
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask Copilot about circuit logic, bugs, or gates..."
            disabled={isStreaming}
            rows={2}
            className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950/90 px-3 py-2 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-60"
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={handleStopStreaming}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-rose-800/60 bg-rose-900/40 text-rose-300 hover:bg-rose-900/80 transition"
              title="Stop generating"
            >
              <Square className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500 text-black hover:bg-cyan-400 transition disabled:opacity-40 disabled:hover:bg-cyan-500 shadow-[0_0_12px_rgba(34,211,238,0.2)]"
              title="Send prompt"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </form>
        <span className="mt-1.5 block text-[10px] text-zinc-500 text-right">
          Press Enter to send, Shift+Enter for new line
        </span>
      </div>
    </div>
  );
};
