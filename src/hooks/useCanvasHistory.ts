import * as React from "react";
import {
  CircuitEditorSnapshot,
  PlacedComponent,
  Connection,
  LogicValue,
} from "@/types/circuit";

export function useCanvasHistory() {
  const undoStackRef = React.useRef<CircuitEditorSnapshot[]>([]);
  const redoStackRef = React.useRef<CircuitEditorSnapshot[]>([]);
  const componentDragStartSnapshotRef = React.useRef<CircuitEditorSnapshot | null>(
    null
  );

  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);

  const createEditorSnapshot = React.useCallback(
    (
      placedComponents: PlacedComponent[],
      connections: Connection[],
      sequentialState: Record<number, LogicValue>
    ): CircuitEditorSnapshot => ({
      placedComponents: structuredClone(placedComponents),
      connections: structuredClone(connections),
      sequentialState: structuredClone(sequentialState),
    }),
    []
  );

  const pushUndoSnapshot = React.useCallback(
    (snapshot: CircuitEditorSnapshot) => {
      undoStackRef.current.push(snapshot);
      redoStackRef.current = [];

      if (undoStackRef.current.length > 50) {
        undoStackRef.current.shift();
      }

      setCanUndo(undoStackRef.current.length > 0);
      setCanRedo(false);
    },
    []
  );

  const performUndo = React.useCallback(
    (
      currentSnapshot: CircuitEditorSnapshot,
      onRestore: (snapshot: CircuitEditorSnapshot) => void
    ) => {
      const previousSnapshot = undoStackRef.current.pop();
      if (!previousSnapshot) {
        return;
      }

      redoStackRef.current.push(currentSnapshot);
      setCanUndo(undoStackRef.current.length > 0);
      setCanRedo(redoStackRef.current.length > 0);

      onRestore(structuredClone(previousSnapshot));
    },
    []
  );

  const performRedo = React.useCallback(
    (
      currentSnapshot: CircuitEditorSnapshot,
      onRestore: (snapshot: CircuitEditorSnapshot) => void
    ) => {
      const nextSnapshot = redoStackRef.current.pop();
      if (!nextSnapshot) {
        return;
      }

      undoStackRef.current.push(currentSnapshot);
      setCanUndo(undoStackRef.current.length > 0);
      setCanRedo(redoStackRef.current.length > 0);

      onRestore(structuredClone(nextSnapshot));
    },
    []
  );

  const resetHistory = React.useCallback(() => {
    undoStackRef.current = [];
    redoStackRef.current = [];
    componentDragStartSnapshotRef.current = null;
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  return {
    canUndo,
    canRedo,
    undoStackRef,
    redoStackRef,
    componentDragStartSnapshotRef,
    createEditorSnapshot,
    pushUndoSnapshot,
    performUndo,
    performRedo,
    resetHistory,
  };
}
