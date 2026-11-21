"use client";

import * as React from "react";
import {
  CircuitEditorSnapshot,
  Connection,
  LogicValue,
  PlacedComponent,
} from "@/types/circuit";
import { CircuitWires } from "./CircuitWires";
import { CircuitSymbol } from "./CircuitSymbols";

interface CircuitCanvasProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  zoomOffset: { x: number; y: number };
  setZoomOffset: React.Dispatch<
    React.SetStateAction<{ x: number; y: number }>
  >;
  handleZoom: (nextZoom: number, clientX?: number, clientY?: number) => void;
  showGrid: boolean;
  gridSizePreference: number;
  snapToGridPreference: string;
  panWithSpacePreference: string;
  multiSelectPreference: string;
  doubleClickInputTogglePreference: string;
  selectedComponent: string | null;
  placedComponents: PlacedComponent[];
  setPlacedComponents: React.Dispatch<
    React.SetStateAction<PlacedComponent[]>
  >;
  connections: Connection[];
  setConnections: React.Dispatch<
    React.SetStateAction<Connection[]>
  >;
  selectedPlacedComponentId: number | null;
  setSelectedPlacedComponentId: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  selectedPlacedComponentIds: number[];
  setSelectedPlacedComponentIds: React.Dispatch<
    React.SetStateAction<number[]>
  >;
  selectedConnectionId: number | null;
  setSelectedConnectionId: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  connectionSourceId: number | null;
  setConnectionSourceId: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  isWireMode: boolean;
  toggleComponentSelection: (id: number, multiSelect: boolean) => void;
  pushUndoSnapshot: (snapshot?: CircuitEditorSnapshot) => void;
  createEditorSnapshot: () => CircuitEditorSnapshot;
  componentDragStartSnapshotRef: React.MutableRefObject<CircuitEditorSnapshot | null>;
  onToggleInput: (id: number) => void;
  getSignalValue: (id: number) => LogicValue;
  getOutputValue: (id: number) => LogicValue;
  setSequentialState: React.Dispatch<
    React.SetStateAction<Record<number, LogicValue>>
  >;
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = React.memo(
  ({
    canvasRef,
    zoom,
    zoomOffset,
    setZoomOffset,
    handleZoom,
    showGrid,
    gridSizePreference,
    snapToGridPreference,
    panWithSpacePreference,
    multiSelectPreference,
    doubleClickInputTogglePreference,
    selectedComponent,
    placedComponents,
    setPlacedComponents,
    connections,
    setConnections,
    setSelectedPlacedComponentId,
    selectedPlacedComponentIds,
    setSelectedPlacedComponentIds,
    selectedConnectionId,
    setSelectedConnectionId,
    connectionSourceId,
    setConnectionSourceId,
    isWireMode,
    toggleComponentSelection,
    pushUndoSnapshot,
    createEditorSnapshot,
    componentDragStartSnapshotRef,
    onToggleInput,
    getSignalValue,
    getOutputValue,
    setSequentialState,
  }) => {
    const [draggingComponentId, setDraggingComponentId] = React.useState<
      number | null
    >(null);
    const [recentlyConnectedId, setRecentlyConnectedId] = React.useState<
      number | null
    >(null);
    const [isPanning, setIsPanning] = React.useState(false);

    const isSpacePressedRef = React.useRef(false);
    const panStartRef = React.useRef({ x: 0, y: 0 });
    const suppressCanvasClickRef = React.useRef(false);
    const pointerMoveFrameRef = React.useRef<number | null>(null);
    const latestPointerPositionRef = React.useRef<{
      clientX: number;
      clientY: number;
    } | null>(null);

    // Component drag offset ref to prevent position jump on initial drag
    const componentDragOffsetRef = React.useRef<{
      x: number;
      y: number;
    }>({ x: 0, y: 0 });

    // Multi-touch tracking ref for mobile pinch-to-zoom and two-finger pan
    const touchStartRef = React.useRef<{
      dist: number;
      midX: number;
      midY: number;
      zoom: number;
      offset: { x: number; y: number };
    } | null>(null);

    // Track space key for panning
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.code === "Space") {
          isSpacePressedRef.current = true;
        }
      };

      const handleKeyUp = (event: KeyboardEvent) => {
        if (event.code === "Space") {
          isSpacePressedRef.current = false;
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        if (pointerMoveFrameRef.current !== null) {
          cancelAnimationFrame(pointerMoveFrameRef.current);
        }
      };
    }, []);

    // Auto-clear recently connected wire highlight pulse after 700ms with cleanup
    React.useEffect(() => {
      if (recentlyConnectedId === null) return;
      const timer = window.setTimeout(() => {
        setRecentlyConnectedId(null);
      }, 700);
      return () => window.clearTimeout(timer);
    }, [recentlyConnectedId]);

    const snapToGrid = React.useCallback(
      (value: number) => {
        if (snapToGridPreference === "off") {
          return value;
        }
        return Math.round(value / gridSizePreference) * gridSizePreference;
      },
      [snapToGridPreference, gridSizePreference]
    );

    // Memoize component and connection lookup maps
    const selectedPlacedComponentIdSet = React.useMemo(
      () => new Set(selectedPlacedComponentIds),
      [selectedPlacedComponentIds]
    );

    const placedComponentsById = React.useMemo(
      () => new Map(placedComponents.map((c) => [c.id, c])),
      [placedComponents]
    );

    const connectionInputIndexById = React.useMemo(() => {
      const inputIndexes = new Map<number, number>();
      const targetCounts = new Map<number, number>();

      connections.forEach((connection) => {
        const currentIndex = targetCounts.get(connection.targetId) ?? 0;
        inputIndexes.set(connection.id, currentIndex);
        targetCounts.set(connection.targetId, currentIndex + 1);
      });

      return inputIndexes;
    }, [connections]);

    // Canvas panning handlers
    const handleCanvasPointerDown = (
      event: React.PointerEvent<HTMLDivElement>
    ) => {
      const shouldPan =
        event.button === 1 ||
        (event.button === 0 &&
          isSpacePressedRef.current &&
          panWithSpacePreference === "enabled");

      if (!shouldPan) {
        return;
      }

      event.preventDefault();
      setIsPanning(true);
      panStartRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
      suppressCanvasClickRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handleCanvasPointerMove = (
      event: React.PointerEvent<HTMLDivElement>
    ) => {
      if (!isPanning) {
        return;
      }

      const deltaX = event.clientX - panStartRef.current.x;
      const deltaY = event.clientY - panStartRef.current.y;

      setZoomOffset((currentOffset) => ({
        x: currentOffset.x + deltaX,
        y: currentOffset.y + deltaY,
      }));

      panStartRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    const handleCanvasPointerUp = (
      event: React.PointerEvent<HTMLDivElement>
    ) => {
      if (!isPanning) {
        return;
      }

      setIsPanning(false);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    };

    const handleCanvasWheel = (
      event: React.WheelEvent<HTMLDivElement>
    ) => {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }

      event.preventDefault();
      const zoomStep = event.deltaY < 0 ? 0.1 : -0.1;
      handleZoom(zoom + zoomStep, event.clientX, event.clientY);
    };

    // Mobile multi-touch gesture handlers: pinch-to-zoom & two-finger pan
    const handleCanvasTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
      if (event.touches.length === 2) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const dist = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        );
        const midX = (touch1.clientX + touch2.clientX) / 2;
        const midY = (touch1.clientY + touch2.clientY) / 2;

        touchStartRef.current = {
          dist: Math.max(dist, 1),
          midX,
          midY,
          zoom,
          offset: { ...zoomOffset },
        };
        suppressCanvasClickRef.current = true;
      }
    };

    const handleCanvasTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
      if (event.touches.length === 2 && touchStartRef.current) {
        if (event.cancelable) {
          event.preventDefault();
        }

        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const currentDist = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        );
        const currentMidX = (touch1.clientX + touch2.clientX) / 2;
        const currentMidY = (touch1.clientY + touch2.clientY) / 2;

        const initial = touchStartRef.current;
        const scale = currentDist / initial.dist;
        const nextZoom = Math.min(2, Math.max(0.5, initial.zoom * scale));

        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const focusX = initial.midX - rect.left;
          const focusY = initial.midY - rect.top;

          const worldX = (focusX - initial.offset.x) / initial.zoom;
          const worldY = (focusY - initial.offset.y) / initial.zoom;

          const deltaX = currentMidX - initial.midX;
          const deltaY = currentMidY - initial.midY;

          setZoomOffset({
            x: focusX - worldX * nextZoom + deltaX,
            y: focusY - worldY * nextZoom + deltaY,
          });
        }

        handleZoom(nextZoom);
      }
    };

    const handleCanvasTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
      if (event.touches.length < 2) {
        touchStartRef.current = null;
        suppressCanvasClickRef.current = true;
        window.setTimeout(() => {
          suppressCanvasClickRef.current = false;
        }, 150);
      }
    };

    // Throttled component dragging via requestAnimationFrame
    const handleComponentPointerMove = (
      event: React.PointerEvent<HTMLDivElement>
    ) => {
      if (draggingComponentId === null) {
        return;
      }

      latestPointerPositionRef.current = {
        clientX: event.clientX,
        clientY: event.clientY,
      };

      if (pointerMoveFrameRef.current !== null) {
        return;
      }

      pointerMoveFrameRef.current = requestAnimationFrame(() => {
        pointerMoveFrameRef.current = null;
        if (draggingComponentId === null) {
          return;
        }

        const pointerPosition = latestPointerPositionRef.current;
        if (!pointerPosition) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const screenX = pointerPosition.clientX - rect.left;
        const screenY = pointerPosition.clientY - rect.top;

        const rawX = (screenX - zoomOffset.x) / zoom;
        const rawY = (screenY - zoomOffset.y) / zoom;

        // Subtract grab offset to keep the component anchored to the exact pointer grab location
        const targetX = rawX - componentDragOffsetRef.current.x;
        const targetY = rawY - componentDragOffsetRef.current.y;

        // Bound within minimum positive coordinate margin, allowing full panning/scrolling across circuit space without artificial height clamping
        const boundedX = Math.max(30, targetX);
        const boundedY = Math.max(30, targetY);

        const x = snapToGrid(boundedX);
        const y = snapToGrid(boundedY);

        setPlacedComponents((current) =>
          current.map((item) =>
            item.id === draggingComponentId ? { ...item, x, y } : item
          )
        );
      });
    };

    const handleComponentPointerRelease = (
      event: React.PointerEvent<HTMLDivElement>
    ) => {
      if (isWireMode) return;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      if (componentDragStartSnapshotRef.current) {
        const startSnapshot = componentDragStartSnapshotRef.current;
        const currentSnapshot = createEditorSnapshot();

        if (
          JSON.stringify(startSnapshot.placedComponents) !==
          JSON.stringify(currentSnapshot.placedComponents)
        ) {
          pushUndoSnapshot(startSnapshot);
        }
      }

      componentDragStartSnapshotRef.current = null;
      componentDragOffsetRef.current = { x: 0, y: 0 };
      event.currentTarget.classList.remove("scale-[1.02]", "z-20");
      setDraggingComponentId(null);
    };

    return (
      <div
        ref={canvasRef}
        className={`relative h-full min-h-[750px] lg:min-h-[80vh] w-full overflow-hidden rounded-b-xl bg-zinc-950/20 touch-none select-none ${
          isPanning ? "cursor-grabbing" : "cursor-crosshair"
        }`}
        onWheel={handleCanvasWheel}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerCancel={handleCanvasPointerUp}
        onTouchStart={handleCanvasTouchStart}
        onTouchMove={handleCanvasTouchMove}
        onTouchEnd={handleCanvasTouchEnd}
        onTouchCancel={handleCanvasTouchEnd}
        onClick={(event) => {
          if (suppressCanvasClickRef.current) {
            suppressCanvasClickRef.current = false;
            return;
          }

          if (!selectedComponent) {
            setSelectedConnectionId(null);
            setSelectedPlacedComponentId(null);
            setSelectedPlacedComponentIds([]);
            return;
          }

          const rect = event.currentTarget.getBoundingClientRect();
          const screenX = event.clientX - rect.left;
          const screenY = event.clientY - rect.top;

          const rawX = (screenX - zoomOffset.x) / zoom;
          const rawY = (screenY - zoomOffset.y) / zoom;

          const x = snapToGrid(rawX);
          const y = snapToGrid(rawY);

          pushUndoSnapshot();
          const newComponentId = Date.now();

          setPlacedComponents((current) => [
            ...current,
            {
              id: newComponentId,
              type: selectedComponent,
              x,
              y,
              value: 0,
            },
          ]);

          if (
            selectedComponent === "SR LATCH" ||
            selectedComponent === "D FLIP-FLOP" ||
            selectedComponent === "JK FLIP-FLOP" ||
            selectedComponent === "T FLIP-FLOP"
          ) {
            setSequentialState((current) => ({
              ...current,
              [newComponentId]: 0,
            }));
          }
        }}
      >
        {/* ZOOM LAYER */}
        <div
          className="absolute left-0 top-0"
          style={{
            width: `${100 / zoom}%`,
            height: `${100 / zoom}%`,
            transform: `translate(${zoomOffset.x}px, ${zoomOffset.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {showGrid && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.065) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.065) 1px, transparent 1px)",
                backgroundSize: `${gridSizePreference}px ${gridSizePreference}px, ${gridSizePreference}px ${gridSizePreference}px, ${
                  gridSizePreference * 5
                }px ${gridSizePreference * 5}px, ${
                  gridSizePreference * 5
                }px ${gridSizePreference * 5}px`,
              }}
            />
          )}

          {/* EMPTY STATE */}
          {!placedComponents.length && (
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div className="rounded-xl border border-cyan-500/15 bg-zinc-950/35 px-9 py-7 shadow-[0_0_30px_rgba(34,211,238,0.06)] backdrop-blur-[2px]">
                <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/5">
                  <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.7)]" />
                </div>
                <p className="text-lg font-semibold tracking-tight text-gray-200">
                  Circuit Workspace
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Select a component and click the canvas to place it.
                </p>
              </div>
            </div>
          )}

          {/* SVG WIRES */}
          <CircuitWires
            connections={connections}
            placedComponents={placedComponents}
            placedComponentsById={placedComponentsById}
            connectionInputIndexById={connectionInputIndexById}
            selectedPlacedComponentIdSet={selectedPlacedComponentIdSet}
            selectedConnectionId={selectedConnectionId}
            recentlyConnectedId={recentlyConnectedId}
            connectionSourceId={connectionSourceId}
            gridSizePreference={gridSizePreference}
            onSelectConnection={(connectionId) => {
              setSelectedConnectionId(connectionId);
            }}
          />

          {/* PLACED COMPONENTS */}
          {placedComponents.map((component) => (
            <div
              key={component.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 ${
                isWireMode && connectionSourceId !== null
                  ? "cursor-crosshair"
                  : "cursor-move"
              } rounded-lg border px-2 py-2 text-sm font-medium transition-[transform,box-shadow,border-color,background-color,color] duration-150 ease-out hover:-translate-y-[calc(50%+1px)] hover:shadow-[0_0_18px_rgba(34,211,238,0.16)] ${
                connectionSourceId === component.id && isWireMode
                  ? "border-cyan-300 bg-cyan-400/20 text-cyan-200 ring-2 ring-cyan-400/50 shadow-[0_0_18px_rgba(34,211,238,0.25)]"
                  : selectedPlacedComponentIdSet.has(component.id)
                  ? "border-yellow-400 bg-yellow-400/20 text-yellow-300 ring-2 ring-yellow-400/40 shadow-[0_0_16px_rgba(250,204,21,0.16)]"
                  : isWireMode && connectionSourceId !== null
                  ? "border-cyan-500 bg-cyan-500/10 text-cyan-400 hover:border-cyan-300 hover:bg-cyan-400/15 hover:ring-2 hover:ring-cyan-400/25"
                  : "border-zinc-800 bg-zinc-900 text-white"
              }`}
              style={{
                left: component.x,
                top: component.y,
              }}
              onPointerDown={(event) => {
                event.stopPropagation();
                if (isWireMode) return;

                const canvas = canvasRef.current;
                if (canvas) {
                  const rect = canvas.getBoundingClientRect();
                  const screenX = event.clientX - rect.left;
                  const screenY = event.clientY - rect.top;
                  const pointerCanvasX = (screenX - zoomOffset.x) / zoom;
                  const pointerCanvasY = (screenY - zoomOffset.y) / zoom;
                  componentDragOffsetRef.current = {
                    x: pointerCanvasX - component.x,
                    y: pointerCanvasY - component.y,
                  };
                }

                componentDragStartSnapshotRef.current = createEditorSnapshot();
                setDraggingComponentId(component.id);
                event.currentTarget.setPointerCapture(event.pointerId);
                event.currentTarget.classList.add("scale-[1.02]", "z-20");
              }}
              onPointerMove={handleComponentPointerMove}
              onPointerUp={handleComponentPointerRelease}
              onPointerCancel={handleComponentPointerRelease}
              onDoubleClick={(event) => {
                event.stopPropagation();
                if (
                  doubleClickInputTogglePreference === "disabled"
                ) {
                  return;
                }

                if (
                  component.type !== "INPUT" &&
                  component.type !== "CLOCK"
                ) {
                  return;
                }

                onToggleInput(component.id);
              }}
              onClick={(event) => {
                event.stopPropagation();

                if (!isWireMode) {
                  toggleComponentSelection(
                    component.id,
                    multiSelectPreference === "enabled" &&
                      (event.ctrlKey || event.metaKey)
                  );
                  setSelectedConnectionId(null);
                  return;
                }

                if (connectionSourceId === null) {
                  setConnectionSourceId(component.id);
                  setSelectedPlacedComponentId(component.id);
                  setSelectedPlacedComponentIds([component.id]);
                  return;
                }

                if (connectionSourceId === component.id) {
                  setConnectionSourceId(null);
                  setSelectedPlacedComponentId(component.id);
                  setSelectedPlacedComponentIds([component.id]);
                  return;
                }

                const connectionExists = connections.some(
                  (connection) =>
                    connection.sourceId === connectionSourceId &&
                    connection.targetId === component.id
                );

                if (!connectionExists) {
                  const outgoingConnections = connections.filter(
                    (connection) => connection.sourceId === connectionSourceId
                  );

                  const sourceComponent = placedComponents.find(
                    (item) => item.id === connectionSourceId
                  );

                  const sourcePort =
                    sourceComponent?.type === "DEMUX" ||
                    sourceComponent?.type === "DECODER" ||
                    sourceComponent?.type === "ENCODER" ||
                    sourceComponent?.type === "HALF ADDER" ||
                    sourceComponent?.type === "FULL ADDER" ||
                    sourceComponent?.type === "SR LATCH" ||
                    sourceComponent?.type === "D FLIP-FLOP" ||
                    sourceComponent?.type === "JK FLIP-FLOP" ||
                    sourceComponent?.type === "T FLIP-FLOP"
                      ? outgoingConnections.length
                      : 0;

                  const newConnectionId = Date.now();

                  setConnections((current) => [
                    ...current,
                    {
                      id: newConnectionId,
                      sourceId: connectionSourceId,
                      targetId: component.id,
                      sourcePort,
                    },
                  ]);

                  setRecentlyConnectedId(newConnectionId);
                }

                setConnectionSourceId(null);
                setSelectedPlacedComponentId(component.id);
                setSelectedPlacedComponentIds([component.id]);
              }}
            >
              <div className="flex items-center justify-center">
                <CircuitSymbol type={component.type} />
              </div>

              {isWireMode && connectionSourceId === component.id && (
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
                  Wire Source
                </div>
              )}

              {(component.type === "INPUT" ||
                component.type === "AND Gate" ||
                component.type === "OR Gate" ||
                component.type === "NOT Gate" ||
                component.type === "NAND Gate" ||
                component.type === "NOR Gate" ||
                component.type === "XOR Gate" ||
                component.type === "XNOR Gate" ||
                component.type === "MUX" ||
                component.type === "DEMUX" ||
                component.type === "DECODER" ||
                component.type === "ENCODER" ||
                component.type === "HALF ADDER" ||
                component.type === "FULL ADDER" ||
                component.type === "CLOCK" ||
                component.type === "SR LATCH" ||
                component.type === "D FLIP-FLOP" ||
                component.type === "JK FLIP-FLOP" ||
                component.type === "T FLIP-FLOP" ||
                component.type === "OUTPUT") && (
                <div className="mt-1 text-xs text-center">
                  Value:{" "}
                  <span className="font-bold">
                    {component.type === "OUTPUT"
                      ? getOutputValue(component.id)
                      : getSignalValue(component.id)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
);
CircuitCanvas.displayName = "CircuitCanvas";
