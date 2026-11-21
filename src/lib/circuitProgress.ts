import { ComponentPortCounts, Connection, PlacedComponent } from "@/types/circuit";

export const getComponentPortCounts = (type: string): ComponentPortCounts => {
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
    case "D FLIP-FLOP":
    case "T FLIP-FLOP":
      return { input: 2, output: 2 };

    case "JK FLIP-FLOP":
      return { input: 3, output: 2 };

    default:
      return { input: 0, output: 0 };
  }
};

/**
 * Calculates a lightweight, deterministic progress percentage (0-100) based on
 * placed component port saturation and functional circuit viability.
 * Runs in O(|V| + |E|) time with zero impact on UI animation frames.
 */
export function calculateCircuitProgress(
  placedComponents: PlacedComponent[] = [],
  connections: Connection[] = []
): number {
  if (!placedComponents || placedComponents.length === 0) {
    return 0;
  }

  // Pre-index connection counts in a single O(|E|) pass
  const incomingMap = new Map<number, number>();
  const outgoingMap = new Map<number, number>();

  for (const conn of connections) {
    incomingMap.set(conn.targetId, (incomingMap.get(conn.targetId) ?? 0) + 1);
    outgoingMap.set(conn.sourceId, (outgoingMap.get(conn.sourceId) ?? 0) + 1);
  }

  let totalRequiredPorts = 0;
  let totalConnectedPorts = 0;
  let hasStimulusSource = false;
  let hasObserverSink = false;

  for (const comp of placedComponents) {
    const portCounts = getComponentPortCounts(comp.type);

    if (comp.type === "INPUT" || comp.type === "CLOCK") {
      hasStimulusSource = true;
    }
    if (comp.type === "OUTPUT") {
      hasObserverSink = true;
    }

    const requiredInputs = portCounts.input;
    const requiredOutputs = portCounts.output > 0 ? 1 : 0;

    const actualIncoming = incomingMap.get(comp.id) ?? 0;
    const actualOutgoing = outgoingMap.get(comp.id) ?? 0;

    const connectedInputs = Math.min(requiredInputs, actualIncoming);
    const connectedOutputs = requiredOutputs > 0 && actualOutgoing > 0 ? 1 : 0;

    totalRequiredPorts += requiredInputs + requiredOutputs;
    totalConnectedPorts += connectedInputs + connectedOutputs;
  }

  if (totalRequiredPorts === 0) {
    return 0;
  }

  // Port wiring ratio contributes up to 80 points
  const wiringRatio = totalConnectedPorts / totalRequiredPorts;
  const wiringScore = wiringRatio * 80;

  // Functional IO completeness contributes up to 20 points
  const ioScore = (hasStimulusSource ? 10 : 0) + (hasObserverSink ? 10 : 0);

  const rawScore = wiringScore + ioScore;

  return Math.min(100, Math.max(0, Math.round(rawScore)));
}
