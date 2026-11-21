"use client";

import * as React from "react";
import {
  Connection,
  PlacedComponent,
  PortPosition,
  WireSegment,
  WireCrossing,
} from "@/types/circuit";
import { getComponentPortCounts } from "@/lib/circuitProgress";

export const getComponentPortPosition = (
  component: {
    type: string;
    x: number;
    y: number;
  },
  direction: "input" | "output",
  portIndex = 0
): PortPosition => {
  const { type, x, y } = component;

  switch (type) {
    case "INPUT":
    case "CLOCK":
      return direction === "output"
        ? { x: x + 36, y }
        : { x: x - 36, y };

    case "OUTPUT":
      return direction === "input"
        ? { x: x - 36, y }
        : { x: x + 36, y };

    case "AND Gate":
    case "OR Gate":
    case "NAND Gate":
    case "NOR Gate":
    case "XOR Gate":
    case "XNOR Gate":
      if (direction === "input") {
        return {
          x: x - 36,
          y: y + (portIndex === 0 ? -8 : 8),
        };
      }

      return {
        x: x + 36,
        y,
      };

    case "NOT Gate":
      return direction === "input"
        ? { x: x - 36, y }
        : { x: x + 36, y };

    case "MUX":
      if (direction === "input") {
        if (portIndex === 0) {
          return { x: x - 40, y: y - 12 };
        }

        if (portIndex === 1) {
          return { x: x - 40, y: y + 12 };
        }

        return { x, y: y + 28 };
      }

      return {
        x: x + 40,
        y,
      };

    case "DEMUX":
      if (direction === "input") {
        if (portIndex === 0) {
          return { x: x - 40, y };
        }

        return { x, y: y + 28 };
      }

      return {
        x: x + 40,
        y: y + (portIndex - 1) * 14 - 14,
      };

    case "DECODER":
      if (direction === "input") {
        return {
          x: x - 41,
          y: y + (portIndex === 0 ? -12 : 12),
        };
      }

      return {
        x: x + 41,
        y: y + (portIndex - 1.5) * 12,
      };

    case "ENCODER":
      if (direction === "input") {
        return {
          x: x - 41,
          y: y + (portIndex - 1.5) * 12,
        };
      }

      return {
        x: x + 41,
        y: y + (portIndex === 0 ? -8 : 8),
      };

    case "HALF ADDER":
      if (direction === "input") {
        return {
          x: x - 44,
          y: y + (portIndex === 0 ? -10 : 10),
        };
      }

      return {
        x: x + 44,
        y: y + (portIndex === 0 ? -10 : 10),
      };

    case "FULL ADDER":
      if (direction === "input") {
        return {
          x: x - 46,
          y: y + (portIndex - 1) * 18,
        };
      }

      return {
        x: x + 46,
        y: y + (portIndex === 0 ? -10 : 14),
      };

    case "SR LATCH":
      if (direction === "input") {
        return {
          x: x - 44,
          y: y + (portIndex === 0 ? -12 : 12),
        };
      }

      return {
        x: x + 44,
        y: y + (portIndex === 0 ? -12 : 12),
      };

    case "D FLIP-FLOP":
    case "T FLIP-FLOP":
      if (direction === "input") {
        if (portIndex === 0) {
          return { x: x - 44, y: y - 12 };
        }

        return { x: x - 44, y: y + 12 };
      }

      return {
        x: x + 44,
        y: y + (portIndex === 0 ? -12 : 12),
      };

    case "JK FLIP-FLOP":
      if (direction === "input") {
        if (portIndex === 0) {
          return { x: x - 46, y: y - 18 };
        }

        if (portIndex === 1) {
          return { x: x - 46, y };
        }

        return { x: x - 46, y: y + 20 };
      }

      return {
        x: x + 46,
        y: y + (portIndex === 0 ? -12 : 12),
      };

    default:
      return direction === "input"
        ? { x: x - 36, y }
        : { x: x + 36, y };
  }
};

export { getComponentPortCounts };

export const getOrthogonalWirePath = (
  source: { x: number; y: number },
  target: { x: number; y: number },
  components: Array<{
    id: number;
    type: string;
    x: number;
    y: number;
  }>,
  sourceId: number,
  targetId: number,
  targetInputIndex = 0,
  gridSize = 40
): string => {
  const GRID_SIZE_VALUE = gridSize;
  const COMPONENT_HALF_WIDTH = 50;
  const COMPONENT_HALF_HEIGHT = 38;
  const ROUTE_MARGIN = 20;

  const snapRoute = (value: number) =>
    Math.round(value / GRID_SIZE_VALUE) * GRID_SIZE_VALUE;

  const obstacles = components
    .filter(
      (component) =>
        component.id !== sourceId &&
        component.id !== targetId
    )
    .map((component) => ({
      left:
        component.x -
        COMPONENT_HALF_WIDTH -
        ROUTE_MARGIN,
      right:
        component.x +
        COMPONENT_HALF_WIDTH +
        ROUTE_MARGIN,
      top:
        component.y -
        COMPONENT_HALF_HEIGHT -
        ROUTE_MARGIN,
      bottom:
        component.y +
        COMPONENT_HALF_HEIGHT +
        ROUTE_MARGIN,
    }));

  const segmentIntersectsObstacle = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    for (const obstacle of obstacles) {
      if (x1 === x2) {
        if (
          x1 >= obstacle.left &&
          x1 <= obstacle.right &&
          Math.max(y1, y2) >= obstacle.top &&
          Math.min(y1, y2) <= obstacle.bottom
        ) {
          return true;
        }
      }

      if (y1 === y2) {
        if (
          y1 >= obstacle.top &&
          y1 <= obstacle.bottom &&
          Math.max(x1, x2) >= obstacle.left &&
          Math.min(x1, x2) <= obstacle.right
        ) {
          return true;
        }
      }
    }

    return false;
  };

  const buildHorizontalFirstRoute = (routeX: number) => {
    const blocked =
      segmentIntersectsObstacle(
        source.x,
        source.y,
        routeX,
        source.y
      ) ||
      segmentIntersectsObstacle(
        routeX,
        source.y,
        routeX,
        target.y
      ) ||
      segmentIntersectsObstacle(
        routeX,
        target.y,
        target.x,
        target.y
      );

    return {
      path: [
        `M ${source.x} ${source.y}`,
        `H ${routeX}`,
        `V ${target.y}`,
        `H ${target.x}`,
      ].join(" "),
      blocked,
    };
  };

  const buildVerticalFirstRoute = (routeY: number) => {
    const blocked =
      segmentIntersectsObstacle(
        source.x,
        source.y,
        source.x,
        routeY
      ) ||
      segmentIntersectsObstacle(
        source.x,
        routeY,
        target.x,
        routeY
      ) ||
      segmentIntersectsObstacle(
        target.x,
        routeY,
        target.x,
        target.y
      );

    return {
      path: [
        `M ${source.x} ${source.y}`,
        `V ${routeY}`,
        `H ${target.x}`,
        `V ${target.y}`,
      ].join(" "),
      blocked,
    };
  };

  const midpointX = snapRoute((source.x + target.x) / 2);
  const laneOffset = targetInputIndex * GRID_SIZE_VALUE;
  const preferredRouteX = midpointX - laneOffset;
  const midpointY = snapRoute((source.y + target.y) / 2);

  const horizontalCandidates = [
    preferredRouteX,
    preferredRouteX - GRID_SIZE_VALUE,
    preferredRouteX + GRID_SIZE_VALUE,
    preferredRouteX - GRID_SIZE_VALUE * 2,
    preferredRouteX + GRID_SIZE_VALUE * 2,
  ];

  const verticalCandidates = [
    midpointY,
    midpointY - GRID_SIZE_VALUE,
    midpointY + GRID_SIZE_VALUE,
    midpointY - GRID_SIZE_VALUE * 2,
    midpointY + GRID_SIZE_VALUE * 2,
  ];

  const horizontalRoutes = horizontalCandidates.map(buildHorizontalFirstRoute);
  const verticalRoutes = verticalCandidates.map(buildVerticalFirstRoute);

  const clearHorizontalRoute = horizontalRoutes.find(
    (route) => !route.blocked
  );

  if (clearHorizontalRoute) {
    return clearHorizontalRoute.path;
  }

  const clearVerticalRoute = verticalRoutes.find(
    (route) => !route.blocked
  );

  if (clearVerticalRoute) {
    return clearVerticalRoute.path;
  }

  return horizontalRoutes[0].path;
};

export const getWireSegments = (path: string): WireSegment[] => {
  const segments: WireSegment[] = [];
  const commands = path.match(/[MHV][^MHV]*/g) ?? [];

  let currentX = 0;
  let currentY = 0;

  commands.forEach((command) => {
    const type = command[0];
    const values = command
      .slice(1)
      .trim()
      .split(/\s+/)
      .map(Number);

    if (type === "M") {
      currentX = values[0];
      currentY = values[1];
      return;
    }

    if (type === "H") {
      const nextX = values[0];
      if (nextX !== currentX) {
        segments.push({
          x1: currentX,
          y1: currentY,
          x2: nextX,
          y2: currentY,
          orientation: "horizontal",
        });
      }
      currentX = nextX;
      return;
    }

    if (type === "V") {
      const nextY = values[0];
      if (nextY !== currentY) {
        segments.push({
          x1: currentX,
          y1: currentY,
          x2: currentX,
          y2: nextY,
          orientation: "vertical",
        });
      }
      currentY = nextY;
    }
  });

  return segments;
};

export const getWireCrossings = (
  firstSegments: WireSegment[],
  secondSegments: WireSegment[]
): WireCrossing[] => {
  const crossings: WireCrossing[] = [];

  const isStrictlyBetween = (
    value: number,
    start: number,
    end: number
  ) => {
    const min = Math.min(start, end);
    const max = Math.max(start, end);
    return value > min && value < max;
  };

  firstSegments.forEach((firstSegment) => {
    secondSegments.forEach((secondSegment) => {
      if (
        firstSegment.orientation === "horizontal" &&
        secondSegment.orientation === "vertical"
      ) {
        const crossingX = secondSegment.x1;
        const crossingY = firstSegment.y1;

        if (
          isStrictlyBetween(crossingX, firstSegment.x1, firstSegment.x2) &&
          isStrictlyBetween(crossingY, secondSegment.y1, secondSegment.y2)
        ) {
          crossings.push({
            x: crossingX,
            y: crossingY,
            firstOrientation: firstSegment.orientation,
            secondOrientation: secondSegment.orientation,
          });
        }
      }

      if (
        firstSegment.orientation === "vertical" &&
        secondSegment.orientation === "horizontal"
      ) {
        const crossingX = firstSegment.x1;
        const crossingY = secondSegment.y1;

        if (
          isStrictlyBetween(crossingX, secondSegment.x1, secondSegment.x2) &&
          isStrictlyBetween(crossingY, firstSegment.y1, firstSegment.y2)
        ) {
          crossings.push({
            x: crossingX,
            y: crossingY,
            firstOrientation: firstSegment.orientation,
            secondOrientation: secondSegment.orientation,
          });
        }
      }
    });
  });

  return crossings.filter(
    (crossing, index, allCrossings) =>
      allCrossings.findIndex(
        (item) => item.x === crossing.x && item.y === crossing.y
      ) === index
  );
};

export const getConnectionWirePath = (
  connection: Connection,
  placedComponentsById: Map<number, PlacedComponent>,
  connectionInputIndexById: Map<number, number>,
  placedComponents: PlacedComponent[],
  gridSizePreference = 40
): string | null => {
  const source = placedComponentsById.get(connection.sourceId);
  const target = placedComponentsById.get(connection.targetId);

  if (!source || !target) {
    return null;
  }

  const sourcePosition = getComponentPortPosition(
    source,
    "output",
    connection.sourcePort ?? 0
  );

  const targetInputIndex =
    connectionInputIndexById.get(connection.id) ?? 0;

  const targetPosition = getComponentPortPosition(
    target,
    "input",
    Math.max(targetInputIndex, 0)
  );

  return getOrthogonalWirePath(
    sourcePosition,
    targetPosition,
    placedComponents,
    connection.sourceId,
    connection.targetId,
    Math.max(targetInputIndex, 0),
    gridSizePreference
  );
};

interface CircuitWiresProps {
  connections: Connection[];
  placedComponents: PlacedComponent[];
  placedComponentsById: Map<number, PlacedComponent>;
  connectionInputIndexById: Map<number, number>;
  selectedPlacedComponentIdSet: Set<number>;
  selectedConnectionId: number | null;
  recentlyConnectedId: number | null;
  connectionSourceId: number | null;
  gridSizePreference: number;
  onSelectConnection: (connectionId: number) => void;
}

export const CircuitWires: React.FC<CircuitWiresProps> = React.memo(
  ({
    connections,
    placedComponents,
    placedComponentsById,
    connectionInputIndexById,
    selectedPlacedComponentIdSet,
    selectedConnectionId,
    recentlyConnectedId,
    connectionSourceId,
    gridSizePreference,
    onSelectConnection,
  }) => {
    // Memoize rendered wire paths so we don't recalculate multiple times per render
    const wirePaths = React.useMemo(() => {
      const map = new Map<number, string>();
      for (const connection of connections) {
        const path = getConnectionWirePath(
          connection,
          placedComponentsById,
          connectionInputIndexById,
          placedComponents,
          gridSizePreference
        );
        if (path) {
          map.set(connection.id, path);
        }
      }
      return map;
    }, [
      connections,
      placedComponentsById,
      connectionInputIndexById,
      placedComponents,
      gridSizePreference,
    ]);

    return (
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {/* PORT INDICATOR DOTS */}
        {placedComponents
          .filter(
            (component) =>
              selectedPlacedComponentIdSet.has(component.id) ||
              connectionSourceId === component.id
          )
          .flatMap((component) => {
            const portCounts = getComponentPortCounts(component.type);
            const indicators = [];

            for (let index = 0; index < portCounts.input; index++) {
              const position = getComponentPortPosition(
                component,
                "input",
                index
              );
              indicators.push(
                <circle
                  key={`input-port-${component.id}-${index}`}
                  cx={position.x}
                  cy={position.y}
                  r="3"
                  fill="currentColor"
                  className="text-cyan-300"
                  pointerEvents="none"
                />
              );
            }

            for (let index = 0; index < portCounts.output; index++) {
              const position = getComponentPortPosition(
                component,
                "output",
                index
              );
              indicators.push(
                <circle
                  key={`output-port-${component.id}-${index}`}
                  cx={position.x}
                  cy={position.y}
                  r="3"
                  fill="currentColor"
                  className="text-cyan-300"
                  pointerEvents="none"
                />
              );
            }

            return indicators;
          })}

        {/* CONNECTION PATHS */}
        {connections.map((connection) => {
          const wirePath = wirePaths.get(connection.id);
          if (!wirePath) {
            return null;
          }

          const isSelected = selectedConnectionId === connection.id;
          const isRecent = recentlyConnectedId === connection.id;

          return (
            <path
              key={connection.id}
              d={wirePath}
              fill="none"
              stroke="currentColor"
              strokeWidth={isSelected || isRecent ? "4" : "2"}
              vectorEffect="non-scaling-stroke"
              className={
                isSelected
                  ? "text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.65)]"
                  : isRecent
                  ? "text-cyan-300 drop-shadow-[0_0_7px_rgba(34,211,238,0.65)]"
                  : "circuit-wire-path text-cyan-400/90"
              }
              style={{
                pointerEvents: "stroke",
                cursor: isSelected ? "grab" : "pointer",
                transition:
                  "stroke-width 150ms ease, opacity 150ms ease, filter 150ms ease",
              }}
              onClick={(event) => {
                event.stopPropagation();
                onSelectConnection(connection.id);
              }}
            />
          );
        })}

        {/* WIRE CROSSING BRIDGES */}
        {connections.flatMap((connection, connectionIndex) => {
          const wirePath = wirePaths.get(connection.id);
          if (!wirePath) return [];
          const wireSegments = getWireSegments(wirePath);

          return connections
            .slice(connectionIndex + 1)
            .flatMap((otherConnection) => {
              const otherWirePath = wirePaths.get(otherConnection.id);
              if (!otherWirePath) return [];
              const otherWireSegments = getWireSegments(otherWirePath);
              const crossings = getWireCrossings(
                wireSegments,
                otherWireSegments
              );

              return crossings.map((crossing, crossingIndex) => {
                const bridgeOnHorizontal =
                  crossing.secondOrientation === "horizontal";
                const bridgeSize = 7;

                const bridgePath = bridgeOnHorizontal
                  ? `
                      M ${crossing.x - bridgeSize}
                        ${crossing.y}
                      A ${bridgeSize}
                        ${bridgeSize}
                        0 0 1
                        ${crossing.x + bridgeSize}
                        ${crossing.y}
                    `
                  : `
                      M ${crossing.x}
                        ${crossing.y - bridgeSize}
                      A ${bridgeSize}
                        ${bridgeSize}
                        0 0 0
                        ${crossing.x}
                        ${crossing.y + bridgeSize}
                    `;

                return (
                  <g
                    key={`crossing-${connection.id}-${otherConnection.id}-${crossingIndex}`}
                    pointerEvents="none"
                  >
                    <circle
                      cx={crossing.x}
                      cy={crossing.y}
                      r="7"
                      className="wire-bridge-mask"
                    />
                    <path
                      d={bridgePath}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="circuit-wire-path text-cyan-400/90"
                      strokeLinecap="round"
                    />
                  </g>
                );
              });
            });
        })}
      </svg>
    );
  }
);
CircuitWires.displayName = "CircuitWires";
