import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
export type AIServiceRequest = {
  message: string;
  circuit?: unknown;
  history?: {
    role: "user" | "assistant";
    content: string;
  }[];
  responseStyle?: "concise" | "balanced" | "detailed";
  explanationFocus?: "standard" | "circuit-analysis" | "learning-support";
};

export type AIServiceResponse = {
  message: string;
  circuit: unknown;
};
type AIIntent =
  | "circuit_explanation"
  | "gate_explanation"
  | "signal_flow"
  | "error_analysis"
  | "improvement"
  | "truth_table"
  | "general";

type CircuitComponent = {
  id?: string;
  type?: string;
  position?: {
    x?: number;
    y?: number;
  };
  value?: unknown;
};

type CircuitConnection = {
  id?: string;
  source?: string;
  target?: string;
  sourceId?: string;
  targetId?: string;
  sourcePort?: number;
  targetPort?: number;
};

type CircuitData = {
  placedComponents?: CircuitComponent[];
  components?: CircuitComponent[];
  connections?: CircuitConnection[];
  sequentialState?: unknown;
};
function getPortCounts(type: string): {
  input: number;
  output: number;
} {
  switch (type) {
    case "INPUT":
    case "CLOCK":
      return { input: 0, output: 1 };

    case "OUTPUT":
      return { input: 1, output: 0 };

    case "NOT Gate":
      return { input: 1, output: 1 };

    case "AND Gate":
    case "OR Gate":
    case "NAND Gate":
    case "NOR Gate":
    case "XOR Gate":
    case "XNOR Gate":
      return { input: 2, output: 1 };

    case "MUX":
      return { input: 3, output: 1 };

    case "DEMUX":
      return { input: 2, output: 3 };

    case "DECODER":
      return { input: 2, output: 4 };

    case "ENCODER":
      return { input: 4, output: 2 };

    case "HALF ADDER":
      return { input: 2, output: 2 };

    case "FULL ADDER":
      return { input: 3, output: 2 };

    case "SR LATCH":
      return { input: 2, output: 2 };

    case "D FLIP-FLOP":
    case "T FLIP-FLOP":
      return { input: 2, output: 2 };

    case "JK FLIP-FLOP":
      return { input: 3, output: 2 };

    default:
      return { input: 0, output: 0 };
  }
}
function detectAIIntent(message: string): AIIntent {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("truth table") ||
    normalizedMessage.includes("truth-table")
  ) {
    return "truth_table";
  }

  if (
    normalizedMessage.includes("signal flow") ||
    normalizedMessage.includes("signal path") ||
    normalizedMessage.includes("how does the signal") ||
    normalizedMessage.includes("how does the output")
  ) {
    return "signal_flow";
  }

  if (
    normalizedMessage.includes("error") ||
    normalizedMessage.includes("wrong") ||
    normalizedMessage.includes("problem") ||
    normalizedMessage.includes("invalid") ||
    normalizedMessage.includes("not working")
  ) {
    return "error_analysis";
  }

  if (
    normalizedMessage.includes("improve") ||
    normalizedMessage.includes("improvement") ||
    normalizedMessage.includes("suggest") ||
    normalizedMessage.includes("optimize") ||
    normalizedMessage.includes("optimization")
  ) {
    return "improvement";
  }

  if (
    normalizedMessage.includes("gate") ||
    normalizedMessage.includes("and gate") ||
    normalizedMessage.includes("or gate") ||
    normalizedMessage.includes("not gate") ||
    normalizedMessage.includes("nand gate") ||
    normalizedMessage.includes("nor gate") ||
    normalizedMessage.includes("xor gate") ||
    normalizedMessage.includes("xnor gate")
  ) {
    return "gate_explanation";
  }

  if (
    normalizedMessage.includes("explain my circuit") ||
    normalizedMessage.includes("explain the circuit") ||
    normalizedMessage.includes("describe my circuit") ||
    normalizedMessage.includes("current circuit") ||
    normalizedMessage.includes("circuit overview")
  ) {
    return "circuit_explanation";
  }

  return "general";
}
function extractCircuitContext(circuit: unknown): string {
  if (!circuit || typeof circuit !== "object") {
    return "No circuit data was provided.";
  }

  const circuitData = circuit as CircuitData;

  const components =
    circuitData.placedComponents ?? circuitData.components ?? [];

  const connections = circuitData.connections ?? [];

  const componentSummary =
    components.length > 0
      ? components
          .map((component, index) => {
            const type = component.type ?? "Unknown";
            const id = component.id ?? `component-${index + 1}`;

            const position =
              component.position &&
              typeof component.position.x === "number" &&
              typeof component.position.y === "number"
                ? ` at (${component.position.x}, ${component.position.y})`
                : "";

            const value =
  component.value !== undefined
    ? `, value: ${String(component.value)}`
    : "";

const portCounts = getPortCounts(type);

const ports = `, ports: ${portCounts.input} input, ${portCounts.output} output`;

return `${index + 1}. ${type} (${id})${position}${value}${ports}`;
          })
          .join("\n")
      : "No components.";

  const connectionSummary =
    connections.length > 0
      ? connections
          .map((connection, index) => {
            const source =
              connection.source ??
              connection.sourceId ??
              "unknown source";

            const target =
              connection.target ??
              connection.targetId ??
              "unknown target";

            const sourcePort =
  connection.sourcePort !== undefined
    ? `, source port: ${connection.sourcePort}`
    : "";

const targetPort =
  connection.targetPort !== undefined
    ? `, target port: ${connection.targetPort}`
    : "";

return `${index + 1}. ${source} → ${target}${sourcePort}${targetPort}`;
          })
          .join("\n")
      : "No connections.";

  return [
    "Circuit Context:",
    `Components: ${components.length}`,
    componentSummary,
    `Connections: ${connections.length}`,
    connectionSummary,
    `Sequential state: ${
      circuitData.sequentialState !== undefined
        ? "available"
        : "not provided"
    }`,
  ].join("\n");
}

function buildAIPrompt(
  message: string,
  circuitContext: string,
  history: AIServiceRequest["history"],
  intent: AIIntent,
  responseStyle: AIServiceRequest["responseStyle"],
  explanationFocus: AIServiceRequest["explanationFocus"]
): string {
  const intentInstructions: Record<AIIntent, string> = {
  circuit_explanation:
    "Explain the overall circuit structure, components, ports, connections, values, and signal flow.",

  gate_explanation:
    "Focus on the relevant logic gates, their input and output ports, their current input values, and their logical behavior.",

  signal_flow:
    "Trace the signal step by step from source components through connected ports and gates to destination components.",

  error_analysis:
    "Look for invalid, missing, disconnected, contradictory, or suspicious circuit structures. Only report problems supported by the provided circuit context.",

  improvement:
    "Suggest practical circuit improvements based on the actual components, ports, connections, and values. Clearly distinguish optional suggestions from actual errors.",

  truth_table:
    "Explain or generate the relevant truth table based on the actual circuit structure and logic. Do not assume components that are not present.",

  general:
    "Answer the user's question using the circuit context and previous conversation when relevant.",
};
  const responseStyleInstructions: Record<
    NonNullable<AIServiceRequest["responseStyle"]>,
    string
  > = {
    concise:
      "Keep the response short and direct. Focus only on the most important information needed to answer the user's question. Avoid unnecessary explanation.",
    balanced:
      "Provide a clear, appropriately detailed response. Explain the important reasoning and circuit behavior without unnecessary length.",
    detailed:
      "Provide a comprehensive response with thorough explanations of the relevant circuit structure, logic, signal flow, and reasoning. Include useful details when supported by the provided circuit context.",
  };
  const explanationFocusInstructions: Record<
  NonNullable<AIServiceRequest["explanationFocus"]>,
  string
> = {
  standard:
    "Use a balanced approach when explaining the user's request. Address the most relevant aspects of the question.",
  "circuit-analysis":
    "Prioritize circuit structure, component relationships, connections, logic behavior, signal flow, and technical circuit analysis. Base the explanation on the provided circuit context whenever possible.",
  "learning-support":
    "Prioritize educational explanations and reasoning. Explain concepts step by step in a way that helps the user understand why the circuit behaves as described.",
};

const selectedExplanationFocus =
  explanationFocusInstructions[
    explanationFocus ?? "standard"
  ];

  const selectedResponseStyle =
    responseStyleInstructions[responseStyle ?? "balanced"];
  return [
    "You are CircuitVerse AI, an assistant specialized in digital circuit design and simulation.",
    "",
    "Detected user intent:",
intent,
    "",
    "Response style:",
    selectedResponseStyle,
    "Explanation focus:",
selectedExplanationFocus,
"",
"Intent-specific instructions:",
intentInstructions[intent],
"",
    "Previous conversation:",
...(history && history.length > 0
  ? history.slice(-10).map(
      (item) =>
        `${item.role === "user" ? "User" : "Assistant"}: ${item.content.slice(0, 1000)}`
    )
  : ["No previous conversation."]),
"",
    "User question:",
    message,
    "",
    circuitContext,
    "",
    "Instructions:",
        "- Analyze the provided circuit context carefully.",
    "- When the user asks to explain the circuit, provide a structured circuit explanation.",
    "- When the user asks about a gate, explain its logic function, input ports, output port, current input values, and resulting output when that information is available.",
    "- Identify the major components and describe their roles.",
    "- Explain how the components are connected.",
    "- Explain the signal flow step by step, starting from source components, following each actual connection and its ports, passing through logic components, and ending at destination components or outputs.",
    "- Use the provided input/output port counts and source/target port information when explaining connections.",
    "- Include relevant component values or current states when they are available.",
    "- Explain the resulting circuit behavior based only on the provided structure and values.",
    "- When the user asks for circuit errors or debugging, inspect the provided components, port counts, connections, port assignments, and available values for invalid or suspicious conditions.",
"- Identify issues such as missing connections, invalid port usage, disconnected required inputs, invalid source or target references, incompatible connection directions, or insufficient circuit information.",
"- Clearly distinguish between a confirmed circuit error and a condition that cannot be determined from the available circuit context.",
"- If no circuit error is detected from the available information, clearly state that no obvious structural error was found.",
"- When the user asks for improvements, suggest practical improvements based on the actual circuit structure, connections, ports, values, and signal flow.",
"- When the user asks for a truth table, derive or explain the truth table from the actual circuit structure and logic components provided.",
"- For combinational logic, identify the relevant input and output signals and explain how each input combination affects the output.",
"- Do not present a truth table for components or connections that are not present in the provided circuit.",
"- When current input values are available, distinguish the current circuit state from the complete set of possible truth-table combinations.",
"- Do not suggest changes that are unrelated to the user's circuit.",
"- Distinguish between necessary fixes and optional design improvements.",
"- If the circuit is already structurally sound, explain what is already good and then suggest only meaningful optional improvements.",
    "- If the circuit information is insufficient, clearly say what information is missing.",
    "- Do not invent circuit components, connections, ports, or signal behavior that are not present in the provided context.",
    "- Keep the explanation clear, structured, and useful for a digital circuit designer.",
    "- Do not display internal component IDs, connection IDs, source IDs, or target IDs in the user-facing response unless the user explicitly asks for them.",
  ].join("\n");
}
const FALLBACK_MODELS = ["gemini-3.6-flash", "gemini-2.5-flash"] as const;
const AI_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, timeoutMs = AI_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`AI request timed out after ${timeoutMs / 1000} seconds.`);
      err.name = "TimeoutError";
      reject(err);
    }, timeoutMs);
  });

  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer);
      return res;
    }),
    timeoutPromise,
  ]);
}

export async function generateAIResponse(
  request: AIServiceRequest
): Promise<AIServiceResponse> {
  const circuitContext = extractCircuitContext(request.circuit);
  const intent = detectAIIntent(request.message);

  const prompt = buildAIPrompt(
    request.message,
    circuitContext,
    request.history,
    intent,
    request.responseStyle,
    request.explanationFocus
  );

  let lastError: unknown = null;
  for (const model of FALLBACK_MODELS) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents: prompt,
          config: { abortSignal: AbortSignal.timeout(AI_TIMEOUT_MS) },
        }),
        AI_TIMEOUT_MS
      );

      return {
        message: response.text ?? "Gemini returned an empty response.",
        circuit: request.circuit ?? null,
      };
    } catch (err) {
      console.warn(`Model ${model} failed, trying fallback:`, err);
      lastError = err;
    }
  }

  throw lastError ?? new Error("All Gemini models failed to generate response.");
}

/**
 * Real-time streaming generator for AI explanations and copilot chat.
 * Streams text chunks as they arrive from Gemini with automatic fallback model recovery.
 */
export async function* generateAIStreamResponse(
  request: AIServiceRequest
): AsyncGenerator<string, void, unknown> {
  const circuitContext = extractCircuitContext(request.circuit);
  const intent = detectAIIntent(request.message);

  const prompt = buildAIPrompt(
    request.message,
    circuitContext,
    request.history,
    intent,
    request.responseStyle,
    request.explanationFocus
  );

  let lastError: unknown = null;
  let hasStartedYielding = false;

  for (const model of FALLBACK_MODELS) {
    try {
      const responseStream = await withTimeout(
        ai.models.generateContentStream({
          model,
          contents: prompt,
          config: { abortSignal: AbortSignal.timeout(AI_TIMEOUT_MS) },
        }),
        AI_TIMEOUT_MS
      );

      for await (const chunk of responseStream) {
        if (chunk.text) {
          hasStartedYielding = true;
          yield chunk.text;
        }
      }
      return;
    } catch (err) {
      console.warn(`Streaming with model ${model} failed:`, err);
      lastError = err;
      // If chunks were already yielded to the client, abort immediately rather than
      // retrying from the beginning with a fallback model (prevents garbled/concatenated output)
      if (hasStartedYielding) {
        throw err;
      }
    }
  }

  throw lastError ?? new Error("All Gemini models failed to stream response.");
}