import * as React from "react";
import {
  Connection,
  LogicValue,
  PlacedComponent,
} from "@/types/circuit";

/**
 * Pure recursive evaluator for component logic output.
 * Isolated as a pure function to allow safe recursion without React hook TDZ issues.
 */
export function computeComponentOutput(
  componentId: number,
  placedComponents: PlacedComponent[],
  connections: Connection[],
  sequentialState: Record<number, LogicValue>,
  visited = new Set<number>(),
  requestedOutputPort: number = 0,
  inputOverrides: Record<number, LogicValue> = {}
): LogicValue {
  if (visited.has(componentId)) {
    return 0;
  }

  const component = placedComponents.find(
    (item) => item.id === componentId
  );

  if (!component) {
    return 0;
  }

  if (component.type === "INPUT" || component.type === "CLOCK") {
    return (
      inputOverrides[component.id] ??
      component.value ??
      0
    );
  }

  const nextVisited = new Set(visited);
  nextVisited.add(componentId);

  const incomingConnections = connections.filter(
    (connection) => connection.targetId === componentId
  );

  if (component.type === "AND Gate") {
    if (incomingConnections.length === 0) {
      return 0;
    }

    return incomingConnections.every(
      (connection) =>
        computeComponentOutput(
          connection.sourceId,
          placedComponents,
          connections,
          sequentialState,
          nextVisited,
          connection.sourcePort ?? 0,
          inputOverrides
        ) === 1
    )
      ? 1
      : 0;
  }

  if (component.type === "OR Gate") {
    if (incomingConnections.length === 0) {
      return 0;
    }

    return incomingConnections.some(
      (connection) =>
        computeComponentOutput(
          connection.sourceId,
          placedComponents,
          connections,
          sequentialState,
          nextVisited,
          0,
          inputOverrides
        ) === 1
    )
      ? 1
      : 0;
  }

  if (component.type === "NOT Gate") {
    if (incomingConnections.length === 0) {
      return 0;
    }

    return computeComponentOutput(
      incomingConnections[0].sourceId,
      placedComponents,
      connections,
      sequentialState,
      nextVisited,
      0,
      inputOverrides
    ) === 1
      ? 0
      : 1;
  }

  if (component.type === "NAND Gate") {
    if (incomingConnections.length === 0) {
      return 0;
    }

    return incomingConnections.every(
      (connection) =>
        computeComponentOutput(
          connection.sourceId,
          placedComponents,
          connections,
          sequentialState,
          nextVisited,
          0,
          inputOverrides
        ) === 1
    )
      ? 0
      : 1;
  }

  if (component.type === "NOR Gate") {
    if (incomingConnections.length === 0) {
      return 0;
    }

    return incomingConnections.some(
      (connection) =>
        computeComponentOutput(
          connection.sourceId,
          placedComponents,
          connections,
          sequentialState,
          nextVisited,
          0,
          inputOverrides
        ) === 1
    )
      ? 0
      : 1;
  }

  if (component.type === "XOR Gate") {
    if (incomingConnections.length === 0) {
      return 0;
    }

    const inputValues = incomingConnections.map((connection) =>
      computeComponentOutput(
        connection.sourceId,
        placedComponents,
        connections,
        sequentialState,
        nextVisited,
        0,
        inputOverrides
      )
    );

    const numberOfHighInputs = inputValues.filter(
      (value) => value === 1
    ).length;

    return numberOfHighInputs % 2 === 1 ? 1 : 0;
  }

  if (component.type === "XNOR Gate") {
    if (incomingConnections.length === 0) {
      return 0;
    }

    const inputValues = incomingConnections.map((connection) =>
      computeComponentOutput(
        connection.sourceId,
        placedComponents,
        connections,
        sequentialState,
        nextVisited,
        0,
        inputOverrides
      )
    );

    const numberOfHighInputs = inputValues.filter(
      (value) => value === 1
    ).length;

    return numberOfHighInputs % 2 === 0 ? 1 : 0;
  }

  if (component.type === "MUX") {
    const data0Connection = incomingConnections[0];
    const data1Connection = incomingConnections[1];
    const selectConnection = incomingConnections[2];

    if (!data0Connection || !data1Connection || !selectConnection) {
      return 0;
    }

    const selectValue = computeComponentOutput(
      selectConnection.sourceId,
      placedComponents,
      connections,
      sequentialState,
      nextVisited,
      0,
      inputOverrides
    );

    if (selectValue === 0) {
      return computeComponentOutput(
        data0Connection.sourceId,
        placedComponents,
        connections,
        sequentialState,
        nextVisited,
        0,
        inputOverrides
      );
    }

    return computeComponentOutput(
      data1Connection.sourceId,
      placedComponents,
      connections,
      sequentialState,
      nextVisited,
      0,
      inputOverrides
    );
  }

  if (component.type === "DEMUX") {
    const inputConnection = incomingConnections[0];
    if (!inputConnection) {
      return 0;
    }

    const inputValue = computeComponentOutput(
      inputConnection.sourceId,
      placedComponents,
      connections,
      sequentialState,
      nextVisited,
      0,
      inputOverrides
    );

    const selectConnection = incomingConnections[1];
    if (!selectConnection) {
      return 0;
    }

    const selectValue = computeComponentOutput(
      selectConnection.sourceId,
      placedComponents,
      connections,
      sequentialState,
      nextVisited,
      0,
      inputOverrides
    );

    if (requestedOutputPort === 0) {
      return selectValue === 0 ? inputValue : 0;
    }

    if (requestedOutputPort === 1) {
      return selectValue === 1 ? inputValue : 0;
    }

    return 0;
  }

  if (component.type === "DECODER") {
    const inputAConnection = incomingConnections[0];
    const inputBConnection = incomingConnections[1];

    if (!inputAConnection || !inputBConnection) {
      return 0;
    }

    const inputA = computeComponentOutput(
      inputAConnection.sourceId,
      placedComponents,
      connections,
      sequentialState,
      nextVisited,
      inputAConnection.sourcePort ?? 0,
      inputOverrides
    );

    const inputB = computeComponentOutput(
      inputBConnection.sourceId,
      placedComponents,
      connections,
      sequentialState,
      nextVisited,
      inputAConnection.sourcePort ?? 0,
      inputOverrides
    );

    const selectedOutput = inputA * 2 + inputB;
    return requestedOutputPort === selectedOutput ? 1 : 0;
  }

  if (component.type === "ENCODER") {
    const inputConnections = incomingConnections.slice(0, 4);

    if (inputConnections.length < 4) {
      return 0;
    }

    const inputValues = inputConnections.map((connection) =>
      computeComponentOutput(
        connection.sourceId,
        placedComponents,
        connections,
        sequentialState,
        nextVisited,
        connection.sourcePort ?? 0,
        inputOverrides
      )
    );

    const activeInput = inputValues.findIndex((value) => value === 1);

    if (activeInput === -1) {
      return 0;
    }

    if (requestedOutputPort === 0) {
      return activeInput >= 2 ? 1 : 0;
    }

    if (requestedOutputPort === 1) {
      return activeInput === 1 || activeInput === 3 ? 1 : 0;
    }

    return 0;
  }

  if (component.type === "HALF ADDER") {
    const inputAConnection = incomingConnections[0];
    const inputBConnection = incomingConnections[1];

    if (!inputAConnection || !inputBConnection) {
      return 0;
    }

    const inputA = computeComponentOutput(
      inputAConnection.sourceId,
      placedComponents,
      connections,
      sequentialState,
      nextVisited,
      inputAConnection.sourcePort ?? 0,
      inputOverrides
    );

    const inputB = computeComponentOutput(
      inputBConnection.sourceId,
      placedComponents,
      connections,
      sequentialState,
      nextVisited,
      inputBConnection.sourcePort ?? 0,
      inputOverrides
    );

    const sum = inputA ^ inputB;
    const carry = inputA & inputB;

    if (requestedOutputPort === 0) {
      return sum as LogicValue;
    }

    if (requestedOutputPort === 1) {
      return carry as LogicValue;
    }

    return 0;
  }

  if (component.type === "FULL ADDER") {
    const inputAConnection = incomingConnections[0];
    const inputBConnection = incomingConnections[1];
    const carryInConnection = incomingConnections[2];

    if (!inputAConnection || !inputBConnection || !carryInConnection) {
      return 0;
    }

    const inputA = computeComponentOutput(
      inputAConnection.sourceId,
      placedComponents,
      connections,
      sequentialState,
      nextVisited,
      inputAConnection.sourcePort ?? 0,
      inputOverrides
    );

    const inputB = computeComponentOutput(
      inputBConnection.sourceId,
      placedComponents,
      connections,
      sequentialState,
      nextVisited,
      inputBConnection.sourcePort ?? 0,
      inputOverrides
    );

    const carryIn = computeComponentOutput(
      carryInConnection.sourceId,
      placedComponents,
      connections,
      sequentialState,
      nextVisited,
      carryInConnection.sourcePort ?? 0,
      inputOverrides
    );

    const sum = inputA ^ inputB ^ carryIn;
    const carryOut = (inputA & inputB) | (carryIn & (inputA ^ inputB));

    if (requestedOutputPort === 0) {
      return sum as LogicValue;
    }

    if (requestedOutputPort === 1) {
      return carryOut as LogicValue;
    }

    return 0;
  }

  if (component.type === "SR LATCH") {
    const q = sequentialState[component.id] ?? 0;
    if (requestedOutputPort === 0) return q;
    if (requestedOutputPort === 1) return q === 1 ? 0 : 1;
    return 0;
  }

  if (component.type === "D FLIP-FLOP") {
    const q = sequentialState[component.id] ?? 0;
    if (requestedOutputPort === 0) return q;
    if (requestedOutputPort === 1) return q === 1 ? 0 : 1;
    return 0;
  }

  if (component.type === "JK FLIP-FLOP") {
    const q = sequentialState[component.id] ?? 0;
    if (requestedOutputPort === 0) return q;
    if (requestedOutputPort === 1) return q === 1 ? 0 : 1;
    return 0;
  }

  if (component.type === "T FLIP-FLOP") {
    const q = sequentialState[component.id] ?? 0;
    if (requestedOutputPort === 0) return q;
    if (requestedOutputPort === 1) return q === 1 ? 0 : 1;
    return 0;
  }

  if (component.type === "OUTPUT") {
    if (incomingConnections.length === 0) {
      return 0;
    }

    return computeComponentOutput(
      incomingConnections[0].sourceId,
      placedComponents,
      connections,
      sequentialState,
      nextVisited,
      incomingConnections[0].sourcePort ?? 0,
      inputOverrides
    );
  }

  return 0;
}

/**
 * Pure recursive derivation for circuit logic expression.
 * Isolated as a pure function to allow safe recursion without React hook TDZ issues.
 */
export function deriveLogicExpression(
  componentId: number,
  placedComponents: PlacedComponent[],
  connections: Connection[],
  visited = new Set<number>(),
  requestedOutputPort = 0
): string {
  if (visited.has(componentId)) {
    return "LOOP";
  }

  const component = placedComponents.find((item) => item.id === componentId);

  if (!component) {
    return "UNKNOWN";
  }

  const nextVisited = new Set(visited);
  nextVisited.add(componentId);

  if (component.type === "INPUT") {
    const inputComponents = placedComponents.filter(
      (item) => item.type === "INPUT"
    );

    const inputIndex = inputComponents.findIndex(
      (item) => item.id === componentId
    );

    return `I${inputIndex + 1}`;
  }

  if (component.type === "CLOCK") {
    return "CLOCK";
  }

  const incomingConnections = connections.filter(
    (connection) => connection.targetId === componentId
  );

  const getInputExpression = (index: number): string => {
    const connection = incomingConnections[index];

    if (!connection) {
      return "UNCONNECTED";
    }

    return deriveLogicExpression(
      connection.sourceId,
      placedComponents,
      connections,
      nextVisited,
      connection.sourcePort ?? 0
    );
  };

  if (component.type === "NOT Gate") {
    return `NOT(${getInputExpression(0)})`;
  }

  if (
    component.type === "AND Gate" ||
    component.type === "OR Gate" ||
    component.type === "NAND Gate" ||
    component.type === "NOR Gate" ||
    component.type === "XOR Gate" ||
    component.type === "XNOR Gate"
  ) {
    const operatorMap: Record<string, string> = {
      "AND Gate": "AND",
      "OR Gate": "OR",
      "NAND Gate": "NAND",
      "NOR Gate": "NOR",
      "XOR Gate": "XOR",
      "XNOR Gate": "XNOR",
    };

    const operator = operatorMap[component.type];

    if (incomingConnections.length === 0) {
      return `${operator}(UNCONNECTED)`;
    }

    const expressions = incomingConnections.map((connection) =>
      deriveLogicExpression(
        connection.sourceId,
        placedComponents,
        connections,
        nextVisited,
        connection.sourcePort ?? 0
      )
    );

    return `(${expressions.join(` ${operator} `)})`;
  }

  if (component.type === "MUX") {
    const data0 = getInputExpression(0);
    const data1 = getInputExpression(1);
    const select = getInputExpression(2);

    return `MUX(${data0}, ${data1}, S=${select})`;
  }

  if (component.type === "DEMUX") {
    const input = getInputExpression(0);
    const select = getInputExpression(1);

    return `DEMUX(${input}, S=${select})[Y${requestedOutputPort}]`;
  }

  if (component.type === "DECODER") {
    const inputA = getInputExpression(0);
    const inputB = getInputExpression(1);

    return `DECODER(${inputA}, ${inputB})[Y${requestedOutputPort}]`;
  }

  if (component.type === "ENCODER") {
    const expressions = incomingConnections
      .slice(0, 4)
      .map((connection) =>
        deriveLogicExpression(
          connection.sourceId,
          placedComponents,
          connections,
          nextVisited,
          connection.sourcePort ?? 0
        )
      );

    return `ENCODER(${expressions.join(", ")})`;
  }

  if (component.type === "HALF ADDER") {
    const inputA = getInputExpression(0);
    const inputB = getInputExpression(1);

    if (requestedOutputPort === 0) {
      return `SUM(${inputA}, ${inputB})`;
    }

    return `CARRY(${inputA}, ${inputB})`;
  }

  if (component.type === "FULL ADDER") {
    const inputA = getInputExpression(0);
    const inputB = getInputExpression(1);
    const carryIn = getInputExpression(2);

    if (requestedOutputPort === 0) {
      return `SUM(${inputA}, ${inputB}, ${carryIn})`;
    }

    return `CARRY(${inputA}, ${inputB}, ${carryIn})`;
  }

  if (
    component.type === "SR LATCH" ||
    component.type === "D FLIP-FLOP" ||
    component.type === "JK FLIP-FLOP" ||
    component.type === "T FLIP-FLOP"
  ) {
    return `${component.type} Q`;
  }

  if (component.type === "OUTPUT") {
    const connection = incomingConnections[0];

    if (!connection) {
      return "UNCONNECTED OUTPUT";
    }

    return deriveLogicExpression(
      connection.sourceId,
      placedComponents,
      connections,
      nextVisited,
      connection.sourcePort ?? 0
    );
  }

  return component.type;
}

interface UseCircuitSimulationParams {
  id: string;
  placedComponents: PlacedComponent[];
  setPlacedComponents: React.Dispatch<
    React.SetStateAction<PlacedComponent[]>
  >;
  connections: Connection[];
}

export function useCircuitSimulation({
  id,
  placedComponents,
  setPlacedComponents,
  connections,
}: UseCircuitSimulationParams) {
  const [isSimulationRunning, setIsSimulationRunning] = React.useState(false);
  const [simulationError, setSimulationError] = React.useState<string | null>(
    null
  );
  const [sequentialState, setSequentialState] = React.useState<
    Record<number, LogicValue>
  >({});
  const [validationErrors, setValidationErrors] = React.useState<string[]>([]);
  const [floatingInputErrors, setFloatingInputErrors] = React.useState<
    string[]
  >([]);
  const [invalidConnectionErrors, setInvalidConnectionErrors] = React.useState<
    string[]
  >([]);

  const getComponentOutput = React.useCallback(
    (
      componentId: number,
      visited = new Set<number>(),
      requestedOutputPort: number = 0,
      inputOverrides: Record<number, LogicValue> = {}
    ): LogicValue => {
      return computeComponentOutput(
        componentId,
        placedComponents,
        connections,
        sequentialState,
        visited,
        requestedOutputPort,
        inputOverrides
      );
    },
    [placedComponents, connections, sequentialState]
  );

  const getSignalValue = React.useCallback(
    (componentId: number): LogicValue => {
      return computeComponentOutput(
        componentId,
        placedComponents,
        connections,
        sequentialState
      );
    },
    [placedComponents, connections, sequentialState]
  );

  const getOutputValue = React.useCallback(
    (componentId: number): LogicValue => {
      const component = placedComponents.find(
        (item) => item.id === componentId
      );

      if (!component || component.type !== "OUTPUT") {
        return 0;
      }

      return computeComponentOutput(
        componentId,
        placedComponents,
        connections,
        sequentialState
      );
    },
    [placedComponents, connections, sequentialState]
  );

  const updateSRLatchState = React.useCallback(
    (
      componentList: PlacedComponent[],
      connectionList: Connection[]
    ) => {
      setSequentialState((current) => {
        let changed = false;
        const next = { ...current };

        componentList
          .filter((component) => component.type === "SR LATCH")
          .forEach((latch) => {
            const incomingConnections = connectionList.filter(
              (connection) => connection.targetId === latch.id
            );

            const setConnection = incomingConnections[0];
            const resetConnection = incomingConnections[1];

            if (!setConnection || !resetConnection) {
              return;
            }

            const setValue = computeComponentOutput(
              setConnection.sourceId,
              componentList,
              connectionList,
              current,
              new Set(),
              setConnection.sourcePort ?? 0
            );

            const resetValue = computeComponentOutput(
              resetConnection.sourceId,
              componentList,
              connectionList,
              current,
              new Set(),
              resetConnection.sourcePort ?? 0
            );

            const previousQ = current[latch.id] ?? 0;
            let nextQ = previousQ;

            if (setValue === 1 && resetValue === 0) {
              nextQ = 1;
            } else if (setValue === 0 && resetValue === 1) {
              nextQ = 0;
            }

            if (nextQ !== previousQ) {
              next[latch.id] = nextQ;
              changed = true;
            }
          });

        return changed ? next : current;
      });
    },
    []
  );

  const updateDFlipFlopState = React.useCallback(
    (
      componentList: PlacedComponent[],
      connectionList: Connection[]
    ) => {
      setSequentialState((current) => {
        let changed = false;
        const next = { ...current };

        componentList
          .filter((component) => component.type === "D FLIP-FLOP")
          .forEach((flipFlop) => {
            const incomingConnections = connectionList.filter(
              (connection) => connection.targetId === flipFlop.id
            );

            const dataConnection = incomingConnections[0];
            const clockConnection = incomingConnections[1];

            if (!dataConnection || !clockConnection) {
              return;
            }

            const dataSource = componentList.find(
              (component) => component.id === dataConnection.sourceId
            );

            const clockSource = componentList.find(
              (component) => component.id === clockConnection.sourceId
            );

            if (!dataSource || !clockSource) {
              return;
            }

            const dataValue =
              dataSource.type === "INPUT" || dataSource.type === "CLOCK"
                ? dataSource.value ?? 0
                : computeComponentOutput(
                    dataSource.id,
                    componentList,
                    connectionList,
                    current,
                    new Set(),
                    dataConnection.sourcePort ?? 0
                  );

            const clockValue =
              clockSource.type === "INPUT" || clockSource.type === "CLOCK"
                ? clockSource.value ?? 0
                : computeComponentOutput(
                    clockSource.id,
                    componentList,
                    connectionList,
                    current,
                    new Set(),
                    clockConnection.sourcePort ?? 0
                  );

            const previousQ = current[flipFlop.id] ?? 0;

            if (clockValue === 1 && previousQ !== dataValue) {
              next[flipFlop.id] = dataValue;
              changed = true;
            }
          });

        return changed ? next : current;
      });
    },
    []
  );

  const updateJKFlipFlopState = React.useCallback(
    (
      componentList: PlacedComponent[],
      connectionList: Connection[]
    ) => {
      setSequentialState((current) => {
        let changed = false;
        const next = { ...current };

        componentList
          .filter((component) => component.type === "JK FLIP-FLOP")
          .forEach((flipFlop) => {
            const incomingConnections = connectionList.filter(
              (connection) => connection.targetId === flipFlop.id
            );

            const jConnection = incomingConnections[0];
            const kConnection = incomingConnections[1];
            const clockConnection = incomingConnections[2];

            if (!jConnection || !kConnection || !clockConnection) {
              return;
            }

            const jSource = componentList.find(
              (component) => component.id === jConnection.sourceId
            );

            const kSource = componentList.find(
              (component) => component.id === kConnection.sourceId
            );

            const clockSource = componentList.find(
              (component) => component.id === clockConnection.sourceId
            );

            if (!jSource || !kSource || !clockSource) {
              return;
            }

            const jValue =
              jSource.type === "INPUT" || jSource.type === "CLOCK"
                ? jSource.value ?? 0
                : computeComponentOutput(
                    jSource.id,
                    componentList,
                    connectionList,
                    current,
                    new Set(),
                    jConnection.sourcePort ?? 0
                  );

            const kValue =
              kSource.type === "INPUT" || kSource.type === "CLOCK"
                ? kSource.value ?? 0
                : computeComponentOutput(
                    kSource.id,
                    componentList,
                    connectionList,
                    current,
                    new Set(),
                    kConnection.sourcePort ?? 0
                  );

            const clockValue =
              clockSource.type === "INPUT" || clockSource.type === "CLOCK"
                ? clockSource.value ?? 0
                : computeComponentOutput(
                    clockSource.id,
                    componentList,
                    connectionList,
                    current,
                    new Set(),
                    clockConnection.sourcePort ?? 0
                  );

            const previousQ = current[flipFlop.id] ?? 0;

            if (clockValue === 1) {
              let nextQ = previousQ;

              if (jValue === 0 && kValue === 0) {
                nextQ = previousQ;
              } else if (jValue === 0 && kValue === 1) {
                nextQ = 0;
              } else if (jValue === 1 && kValue === 0) {
                nextQ = 1;
              } else if (jValue === 1 && kValue === 1) {
                nextQ = previousQ === 1 ? 0 : 1;
              }

              if (nextQ !== previousQ) {
                next[flipFlop.id] = nextQ;
                changed = true;
              }
            }
          });

        return changed ? next : current;
      });
    },
    []
  );

  const updateTFlipFlopState = React.useCallback(
    (
      componentList: PlacedComponent[],
      connectionList: Connection[]
    ) => {
      setSequentialState((current) => {
        let changed = false;
        const next = { ...current };

        componentList
          .filter((component) => component.type === "T FLIP-FLOP")
          .forEach((flipFlop) => {
            const incomingConnections = connectionList.filter(
              (connection) => connection.targetId === flipFlop.id
            );

            if (incomingConnections.length < 2) {
              return;
            }

            const clockConnection = incomingConnections.find(
              (connection) => {
                const source = componentList.find(
                  (component) => component.id === connection.sourceId
                );
                return source?.type === "CLOCK";
              }
            );

            const tConnection = incomingConnections.find((connection) => {
              const source = componentList.find(
                (component) => component.id === connection.sourceId
              );
              return source?.type !== "CLOCK";
            });

            if (!tConnection || !clockConnection) {
              return;
            }

            const tSource = componentList.find(
              (component) => component.id === tConnection.sourceId
            );

            const clockSource = componentList.find(
              (component) => component.id === clockConnection.sourceId
            );

            if (!tSource || !clockSource) {
              return;
            }

            const tValue =
              tSource.type === "INPUT" || tSource.type === "CLOCK"
                ? tSource.value ?? 0
                : computeComponentOutput(
                    tSource.id,
                    componentList,
                    connectionList,
                    current,
                    new Set(),
                    tConnection.sourcePort ?? 0
                  );

            const clockValue =
              clockSource.type === "INPUT" || clockSource.type === "CLOCK"
                ? clockSource.value ?? 0
                : computeComponentOutput(
                    clockSource.id,
                    componentList,
                    connectionList,
                    current,
                    new Set(),
                    clockConnection.sourcePort ?? 0
                  );

            const previousQ = current[flipFlop.id] ?? 0;

            if (clockValue === 1) {
              const nextQ =
                tValue === 1
                  ? previousQ === 1
                    ? 0
                    : 1
                  : previousQ;

              if (nextQ !== previousQ) {
                next[flipFlop.id] = nextQ;
                changed = true;
              }
            }
          });

        return changed ? next : current;
      });
    },
    []
  );

  const handleToggleInput = React.useCallback(
    (componentId: number) => {
      setPlacedComponents((current) => {
        const toggledComponent = current.find(
          (component) => component.id === componentId
        );

        const wasClockLow =
          toggledComponent?.type === "CLOCK" &&
          toggledComponent.value === 0;

        const nextComponents = current.map((component) =>
          component.id === componentId &&
          (component.type === "INPUT" || component.type === "CLOCK")
            ? {
                ...component,
                value:
                  component.value === 1
                    ? (0 as LogicValue)
                    : (1 as LogicValue),
              }
            : component
        );

        queueMicrotask(() => {
          updateSRLatchState(nextComponents, connections);

          if (wasClockLow) {
            updateDFlipFlopState(nextComponents, connections);
            updateJKFlipFlopState(nextComponents, connections);
            updateTFlipFlopState(nextComponents, connections);
          }
        });

        return nextComponents;
      });
    },
    [
      setPlacedComponents,
      connections,
      updateSRLatchState,
      updateDFlipFlopState,
      updateJKFlipFlopState,
      updateTFlipFlopState,
    ]
  );

  const connectionsRef = React.useRef(connections);
  React.useEffect(() => {
    connectionsRef.current = connections;
  }, [connections]);

  // Automated 2Hz Simulation Clock Oscillator (500ms cycle: 250ms HIGH / 250ms LOW)
  React.useEffect(() => {
    if (!isSimulationRunning) return;

    const clockInterval = setInterval(() => {
      setPlacedComponents((current) => {
        const hasClock = current.some((c) => c.type === "CLOCK");
        if (!hasClock) return current;

        let hasRisingEdge = false;
        const nextComponents = current.map((component) => {
          if (component.type !== "CLOCK") return component;

          const nextValue: LogicValue = component.value === 1 ? 0 : 1;
          if (component.value === 0 && nextValue === 1) {
            hasRisingEdge = true;
          }

          return { ...component, value: nextValue };
        });

        const activeConnections = connectionsRef.current;
        queueMicrotask(() => {
          updateSRLatchState(nextComponents, activeConnections);

          if (hasRisingEdge) {
            updateDFlipFlopState(nextComponents, activeConnections);
            updateJKFlipFlopState(nextComponents, activeConnections);
            updateTFlipFlopState(nextComponents, activeConnections);
          }
        });

        return nextComponents;
      });
    }, 250);

    return () => clearInterval(clockInterval);
  }, [
    isSimulationRunning,
    setPlacedComponents,
    updateSRLatchState,
    updateDFlipFlopState,
    updateJKFlipFlopState,
    updateTFlipFlopState,
  ]);

  const detectFloatingInputs = React.useCallback((): string[] => {
    const errors: string[] = [];

    const requiredInputCounts: Record<string, number> = {
      "NOT Gate": 1,
      "AND Gate": 2,
      "OR Gate": 2,
      "NAND Gate": 2,
      "NOR Gate": 2,
      "XOR Gate": 2,
      "XNOR Gate": 2,
      MUX: 3,
      DEMUX: 2,
      DECODER: 2,
      ENCODER: 4,
      "HALF ADDER": 2,
      "FULL ADDER": 3,
      "SR LATCH": 2,
      "D FLIP-FLOP": 2,
      "JK FLIP-FLOP": 3,
      "T FLIP-FLOP": 2,
    };

    placedComponents.forEach((component) => {
      const requiredInputs = requiredInputCounts[component.type];
      if (requiredInputs === undefined) {
        return;
      }

      const incomingConnections = connections.filter(
        (connection) => connection.targetId === component.id
      );

      if (incomingConnections.length < requiredInputs) {
        const floatingCount =
          requiredInputs - incomingConnections.length;

        errors.push(
          `${component.type}: ${floatingCount} input port${
            floatingCount === 1 ? "" : "s"
          } not connected.`
        );
      }
    });

    setFloatingInputErrors(errors);
    return errors;
  }, [placedComponents, connections]);

  const validateCircuit = React.useCallback((): string[] => {
    const errors: string[] = [];
    const connectionErrors: string[] = [];

    connections.forEach((connection) => {
      const source = placedComponents.find(
        (component) => component.id === connection.sourceId
      );

      const target = placedComponents.find(
        (component) => component.id === connection.targetId
      );

      if (!source) {
        connectionErrors.push(
          `Connection ${connection.id}: source component does not exist.`
        );
        return;
      }

      if (!target) {
        connectionErrors.push(
          `Connection ${connection.id}: target component does not exist.`
        );
        return;
      }

      if (connection.sourceId === connection.targetId) {
        connectionErrors.push(
          `Connection ${connection.id}: component cannot connect to itself.`
        );
      }

      if (
        connection.sourcePort !== undefined &&
        (!Number.isInteger(connection.sourcePort) ||
          connection.sourcePort < 0)
      ) {
        connectionErrors.push(
          `Connection ${connection.id}: invalid source port.`
        );
      }

      const duplicateConnection = connections.some(
        (otherConnection) =>
          otherConnection.id !== connection.id &&
          otherConnection.sourceId === connection.sourceId &&
          otherConnection.targetId === connection.targetId &&
          (otherConnection.sourcePort ?? 0) ===
            (connection.sourcePort ?? 0)
      );

      if (duplicateConnection) {
        connectionErrors.push(
          `Connection ${connection.id}: duplicate connection detected.`
        );
      }
    });

    setInvalidConnectionErrors(connectionErrors);
    errors.push(...connectionErrors);

    const inputComponents = placedComponents.filter(
      (component) => component.type === "INPUT"
    );

    const outputComponents = placedComponents.filter(
      (component) => component.type === "OUTPUT"
    );

    if (inputComponents.length === 0) {
      errors.push("Circuit must contain at least one INPUT component.");
    }

    if (outputComponents.length === 0) {
      errors.push("Circuit must contain at least one OUTPUT component.");
    }

    const requiredInputCounts: Record<string, number> = {
      "NOT Gate": 1,
      "AND Gate": 2,
      "OR Gate": 2,
      "NAND Gate": 2,
      "NOR Gate": 2,
      "XOR Gate": 2,
      "XNOR Gate": 2,
      MUX: 3,
      DEMUX: 2,
      DECODER: 2,
      ENCODER: 4,
      "HALF ADDER": 2,
      "FULL ADDER": 3,
      "SR LATCH": 2,
      "D FLIP-FLOP": 2,
      "JK FLIP-FLOP": 3,
      "T FLIP-FLOP": 2,
    };

    placedComponents.forEach((component) => {
      const requiredInputs = requiredInputCounts[component.type];
      if (requiredInputs === undefined) {
        return;
      }

      const incomingConnections = connections.filter(
        (connection) => connection.targetId === component.id
      );

      if (incomingConnections.length < requiredInputs) {
        errors.push(
          `${component.type} requires ${requiredInputs} input connections but has ${incomingConnections.length}.`
        );
      }
    });

    detectFloatingInputs();
    setValidationErrors(errors);

    return errors;
  }, [connections, placedComponents, detectFloatingInputs]);

  const getLogicExpression = React.useCallback(
    (
      componentId: number,
      visited = new Set<number>(),
      requestedOutputPort = 0
    ): string => {
      return deriveLogicExpression(
        componentId,
        placedComponents,
        connections,
        visited,
        requestedOutputPort
      );
    },
    [placedComponents, connections]
  );

  const handleStartSimulation = React.useCallback(async () => {
    try {
      const validationResults = validateCircuit();

      if (validationResults.length > 0) {
        setIsSimulationRunning(false);
        setSimulationError(
          `Simulation cannot start: ${validationResults.length} issue${
            validationResults.length === 1 ? "" : "s"
          } detected.`
        );

        try {
          await fetch(`/api/projects/${id}/simulation-runs`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: "FAILED",
              errorCount: validationResults.length,
            }),
          });
        } catch (persistenceError) {
          console.error(
            "Failed to record simulation run:",
            persistenceError
          );
        }

        return;
      }

      setSimulationError(null);
      setIsSimulationRunning(true);

      try {
        await fetch(`/api/projects/${id}/simulation-runs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "SUCCESS",
            errorCount: 0,
          }),
        });
      } catch (persistenceError) {
        console.error(
          "Failed to record simulation run:",
          persistenceError
        );
      }
    } catch (error) {
      console.error("Simulation error:", error);
      setIsSimulationRunning(false);
      setSimulationError(
        "Simulation could not start because an unexpected error occurred."
      );
    }
  }, [id, validateCircuit]);

  const handleStopSimulation = React.useCallback(() => {
    setIsSimulationRunning(false);
    setSimulationError(null);
  }, []);

  const handleResetSimulation = React.useCallback(() => {
    setPlacedComponents((current) =>
      current.map((component) => ({
        ...component,
        value: 0,
      }))
    );
    setSequentialState({});
    setIsSimulationRunning(false);
    setSimulationError(null);
  }, [setPlacedComponents]);

  // Topology metrics
  const analysisInputCount = React.useMemo(
    () =>
      placedComponents.filter(
        (component) => component.type === "INPUT"
      ).length,
    [placedComponents]
  );

  const analysisOutputCount = React.useMemo(
    () =>
      placedComponents.filter(
        (component) => component.type === "OUTPUT"
      ).length,
    [placedComponents]
  );

  const analysisGateCount = React.useMemo(
    () =>
      placedComponents.filter(
        (component) =>
          component.type.includes("Gate") ||
          component.type === "MUX" ||
          component.type === "DEMUX" ||
          component.type === "DECODER" ||
          component.type === "ENCODER" ||
          component.type === "HALF ADDER" ||
          component.type === "FULL ADDER"
      ).length,
    [placedComponents]
  );

  const analysisSequentialCount = React.useMemo(
    () =>
      placedComponents.filter(
        (component) =>
          component.type === "SR LATCH" ||
          component.type === "D FLIP-FLOP" ||
          component.type === "JK FLIP-FLOP" ||
          component.type === "T FLIP-FLOP"
      ).length,
    [placedComponents]
  );

  const analysisIssueCount =
    validationErrors.length +
    floatingInputErrors.length +
    invalidConnectionErrors.length;

  const analysisStatus =
    analysisIssueCount > 0
      ? "Issues Detected"
      : isSimulationRunning
      ? "Simulation Running"
      : placedComponents.length === 0
      ? "Empty Circuit"
      : "Circuit Ready";

  return {
    isSimulationRunning,
    setIsSimulationRunning,
    simulationError,
    setSimulationError,
    sequentialState,
    setSequentialState,
    validationErrors,
    floatingInputErrors,
    invalidConnectionErrors,
    getComponentOutput,
    getSignalValue,
    getOutputValue,
    updateSRLatchState,
    updateDFlipFlopState,
    updateJKFlipFlopState,
    updateTFlipFlopState,
    handleToggleInput,
    validateCircuit,
    getLogicExpression,
    handleStartSimulation,
    handleStopSimulation,
    handleResetSimulation,
    analysisInputCount,
    analysisOutputCount,
    analysisGateCount,
    analysisSequentialCount,
    analysisIssueCount,
    analysisStatus,
  };
}
