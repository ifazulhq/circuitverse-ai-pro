export type AIGeneratedComponent = {
  id: number;
  type: string;
  x: number;
  y: number;
  value: number;
};

export type AIGeneratedConnection = {
  id: number;
  sourceId: number;
  targetId: number;
  sourcePort?: number;
};

export type AIGeneratedCircuit = {
  components: AIGeneratedComponent[];
  connections: AIGeneratedConnection[];
  sequentialState: Record<string, number>;
};
export const SUPPORTED_AI_COMPONENT_TYPES = [
  "INPUT",
  "OUTPUT",
  "CLOCK",
  "NOT Gate",
  "AND Gate",
  "OR Gate",
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
  "SR LATCH",
  "D FLIP-FLOP",
  "T FLIP-FLOP",
  "JK FLIP-FLOP",
] as const;
export function buildCircuitGenerationPrompt(
  userRequest: string
): string {
  return [
    "You are CircuitVerse AI, an expert digital circuit design assistant.",
    "",
    "The user wants you to generate a digital circuit.",
    "",
    "User request:",
    userRequest,
    "",
    "Return ONLY valid JSON.",
    "",
    "The JSON must follow this exact structure:",
    "",
    "{",
    '  "components": [',
    "    {",
    '      "id": number,',
    '      "type": "supported component type",',
    '      "x": number,',
    '      "y": number,',
    '      "value": number',
    "    }",
    "  ],",
    '  "connections": [',
    "    {",
    '      "id": number,',
    '      "sourceId": number,',
    '      "targetId": number,',
    '      "sourcePort": number',
    "    }",
    "  ],",
    '  "sequentialState": {}',
    "}",
    "",
    "Rules:",
    "- Every component id must be unique.",
    "- Every connection id must be unique.",
    "- Every sourceId must reference an existing component.",
    "- Every targetId must reference an existing component.",
    "- Use only supported component types.",
    "- Use numeric x and y positions.",
    "- Use numeric component values.",
    "- sourcePort must reference a valid output port.",
    "- Do not create components that were not requested or required.",
    "- Do not create connections to nonexistent components.",
    "- Do not include markdown.",
    "- Do not include explanations outside the JSON.",
    "",
    "Supported component types:",
    SUPPORTED_AI_COMPONENT_TYPES.join(", "),
  ].join("\n");
}
export function validateGeneratedCircuit(
  data: unknown
): boolean {
  if (!data || typeof data !== "object") {
    return false;
  }

  const circuit = data as {
    components?: unknown;
    connections?: unknown;
    sequentialState?: unknown;
  };

  if (!Array.isArray(circuit.components)) {
    return false;
  }

  if (!Array.isArray(circuit.connections)) {
    return false;
  }

  const componentIds = new Set<number>();

  for (const component of circuit.components) {
    if (!component || typeof component !== "object") {
      return false;
    }

    const item = component as {
      id?: unknown;
      type?: unknown;
      x?: unknown;
      y?: unknown;
      value?: unknown;
    };

    if (
  typeof item.id !== "number" ||
  !Number.isInteger(item.id)
) {
  return false;
}

    if (componentIds.has(item.id)) {
      return false;
    }

    componentIds.add(item.id);

    if (
      typeof item.type !== "string" ||
      !SUPPORTED_AI_COMPONENT_TYPES.includes(
        item.type as (typeof SUPPORTED_AI_COMPONENT_TYPES)[number]
      )
    ) {
      return false;
    }

    if (
      typeof item.x !== "number" ||
      !Number.isFinite(item.x)
    ) {
      return false;
    }

    if (
      typeof item.y !== "number" ||
      !Number.isFinite(item.y)
    ) {
      return false;
    }

    if (
      item.value !== undefined &&
      typeof item.value !== "number" &&
      typeof item.value !== "string" &&
      typeof item.value !== "boolean"
    ) {
      return false;
    }
  }

  const connectionIds = new Set<number>();

  for (const connection of circuit.connections) {
    if (!connection || typeof connection !== "object") {
      return false;
    }

    const item = connection as {
      id?: unknown;
      sourceId?: unknown;
      targetId?: unknown;
      sourcePort?: unknown;
      targetPort?: unknown;
    };

    if (
  typeof item.id !== "number" ||
  !Number.isInteger(item.id)
) {
  return false;
}

    if (connectionIds.has(item.id)) {
      return false;
    }

    connectionIds.add(item.id);

    if (
  typeof item.sourceId !== "number" ||
  typeof item.targetId !== "number"
) {
  return false;
}

    if (
      !componentIds.has(item.sourceId) ||
      !componentIds.has(item.targetId)
    ) {
      return false;
    }

    if (item.sourceId === item.targetId) {
      return false;
    }

    if (
  typeof item.sourcePort !== "number" ||
  !Number.isInteger(item.sourcePort) ||
  item.sourcePort < 0
) {
  return false;
}

const sourceComponent = circuit.components.find(
  (component) =>
    component &&
    typeof component === "object" &&
    "id" in component &&
    component.id === item.sourceId
);

if (!sourceComponent || typeof sourceComponent !== "object") {
  return false;
}

const sourceType =
  "type" in sourceComponent &&
  typeof sourceComponent.type === "string"
    ? sourceComponent.type
    : null;

if (!sourceType) {
  return false;
}

const outputPortCounts: Record<string, number> = {
  INPUT: 1,
  CLOCK: 1,
  OUTPUT: 0,
  "NOT Gate": 1,
  "AND Gate": 1,
  "OR Gate": 1,
  "NAND Gate": 1,
  "NOR Gate": 1,
  "XOR Gate": 1,
  "XNOR Gate": 1,
  MUX: 1,
  DEMUX: 3,
  DECODER: 4,
  ENCODER: 2,
  "HALF ADDER": 2,
  "FULL ADDER": 2,
  "SR LATCH": 2,
  "D FLIP-FLOP": 2,
  "T FLIP-FLOP": 2,
  "JK FLIP-FLOP": 2,
};

const outputPortCount =
  outputPortCounts[sourceType];

if (
  outputPortCount === undefined ||
  item.sourcePort >= outputPortCount
) {
  return false;
}

    if (
      item.targetPort !== undefined &&
      (
        typeof item.targetPort !== "number" ||
        !Number.isInteger(item.targetPort) ||
        item.targetPort < 0
      )
    ) {
      return false;
    }
  }

  if (
    circuit.sequentialState !== undefined &&
    (
      circuit.sequentialState === null ||
      typeof circuit.sequentialState !== "object"
    )
  ) {
    return false;
  }

  return true;
}
export type CircuitFileMetadata = {
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type CircuitFile = {
  format: "circuitverse-ai-pro";
  version: 1;
  type: "circuit";
  metadata: CircuitFileMetadata;
  circuit: EditorCircuitState;
};
export type EditorCircuitState = {
  placedComponents: Array<{
    id: number;
    type: string;
    x: number;
    y: number;
    value?: 0 | 1;
  }>;

  connections: Array<{
    id: number;
    sourceId: number;
    targetId: number;
    sourcePort?: number;
  }>;

  sequentialState: Record<number, 0 | 1>;
};

export function convertGeneratedCircuitToEditorCircuit(
  data: AIGeneratedCircuit
): EditorCircuitState {
  const placedComponents: EditorCircuitState["placedComponents"] =
  data.components.map((component) => ({
    id: component.id,
    type: component.type,
    x: component.x,
    y: component.y,
    value: component.value === 1 ? 1 : 0,
  }));

  const connections = data.connections.map((connection) => ({
    id: connection.id,
    sourceId: connection.sourceId,
    targetId: connection.targetId,
    ...(connection.sourcePort !== undefined
      ? { sourcePort: connection.sourcePort }
      : {}),
  }));

  const sequentialState: Record<number, 0 | 1> = {};

  for (const [componentId, value] of Object.entries(
    data.sequentialState ?? {}
  )) {
    const numericId = Number(componentId);

    if (!Number.isInteger(numericId)) {
      continue;
    }

    sequentialState[numericId] = value === 1 ? 1 : 0;
  }

  return {
    placedComponents,
    connections,
    sequentialState,
  };
}

/**
 * Strips markdown code-block fences (e.g. ```json ... ```) or extracts the outermost
 * JSON object from model responses to prevent JSON.parse syntax errors.
 */
export function extractJsonFromMarkdown(text: string): string {
  if (!text) return "";
  const trimmed = text.trim();

  // 1. Try markdown code block fence matching
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch && fenceMatch[1]) {
    return fenceMatch[1].trim();
  }

  // 2. Try finding outermost { ... }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1).trim();
  }

  return trimmed;
}

/**
 * Offsets coordinates and remaps component/connection IDs for an AI-generated sub-circuit
 * so that it can be cleanly inserted into an active canvas without ID collisions or overlap.
 */
export function offsetAndRemapSubCircuit(
  generatedCircuit: AIGeneratedCircuit | EditorCircuitState,
  existingComponents: Array<{ id: number; x: number; y: number }>,
  targetOffset?: { x: number; y: number }
): {
  components: Array<{
    id: number;
    type: string;
    x: number;
    y: number;
    value?: 0 | 1;
  }>;
  connections: Array<{
    id: number;
    sourceId: number;
    targetId: number;
    sourcePort?: number;
  }>;
  sequentialState: Record<number, 0 | 1>;
  newComponentIds: number[];
} {
  const rawComponents =
    "components" in generatedCircuit
      ? generatedCircuit.components
      : generatedCircuit.placedComponents;

  const rawConnections = generatedCircuit.connections ?? [];

  if (rawComponents.length === 0) {
    return {
      components: [],
      connections: [],
      sequentialState: {},
      newComponentIds: [],
    };
  }

  // Calculate placement offset
  let offsetX = targetOffset?.x ?? 0;
  let offsetY = targetOffset?.y ?? 0;

  if (targetOffset === undefined) {
    if (existingComponents.length > 0) {
      const maxX = Math.max(...existingComponents.map((c) => c.x));
      const minY = Math.min(...existingComponents.map((c) => c.y));
      offsetX = maxX + 160;
      offsetY = Math.max(80, minY);
    } else {
      offsetX = 120;
      offsetY = 120;
    }
  }

  // Bounding box normalization
  const genMinX = Math.min(...rawComponents.map((c) => c.x));
  const genMinY = Math.min(...rawComponents.map((c) => c.y));

  // Generate unique IDs
  const baseTime = Date.now();
  const idMap = new Map<number, number>();
  const newComponentIds: number[] = [];

  rawComponents.forEach((comp, idx) => {
    const newId = baseTime + idx;
    idMap.set(comp.id, newId);
    newComponentIds.push(newId);
  });

  const remappedComponents = rawComponents.map((comp) => ({
    id: idMap.get(comp.id)!,
    type: comp.type,
    x: Math.round(comp.x - genMinX + offsetX),
    y: Math.round(comp.y - genMinY + offsetY),
    value: (comp.value === 1 ? 1 : 0) as 0 | 1,
  }));

  const remappedConnections: Array<{
    id: number;
    sourceId: number;
    targetId: number;
    sourcePort?: number;
  }> = [];

  rawConnections.forEach((conn, idx) => {
    const newSourceId = idMap.get(conn.sourceId);
    const newTargetId = idMap.get(conn.targetId);

    if (newSourceId !== undefined && newTargetId !== undefined) {
      remappedConnections.push({
        id: baseTime + 5000 + idx,
        sourceId: newSourceId,
        targetId: newTargetId,
        ...(conn.sourcePort !== undefined ? { sourcePort: conn.sourcePort } : {}),
      });
    }
  });

  const remappedSequentialState: Record<number, 0 | 1> = {};
  const rawSeq = generatedCircuit.sequentialState ?? {};
  Object.entries(rawSeq).forEach(([oldIdStr, val]) => {
    const oldId = Number(oldIdStr);
    const newId = idMap.get(oldId);
    if (newId !== undefined) {
      remappedSequentialState[newId] = val === 1 ? 1 : 0;
    }
  });

  return {
    components: remappedComponents,
    connections: remappedConnections,
    sequentialState: remappedSequentialState,
    newComponentIds,
  };
}