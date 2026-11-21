export type ThemePreference = "dark" | "light" | "cyberpunk";

export type MotionPreference = "full" | "reduced";
export type InterfaceDensity = "standard" | "compact";
export type ShowGridPreference = "shown" | "hidden";
export type SnapToGridPreference = "on" | "off";
export type GridSizePreference = 20 | 40 | 60 | 80;
export type DefaultZoomPreference = 50 | 75 | 100 | 125 | 150;
export type KeyboardShortcutsPreference = "enabled" | "disabled";
export type PanWithSpacePreference = "enabled" | "disabled";
export type MultiSelectPreference = "enabled" | "disabled";
export type DoubleClickInputTogglePreference = "enabled" | "disabled";
export type AIResponseStylePreference =
  | "concise"
  | "balanced"
  | "detailed";
export type AIExplanationFocusPreference =
  | "standard"
  | "circuit-analysis"
  | "learning-support";

export interface UserPreferencesPayload {
  theme?: ThemePreference;
  motion?: MotionPreference;
  interfaceDensity?: InterfaceDensity;
  showGrid?: ShowGridPreference;
  snapToGrid?: SnapToGridPreference;
  gridSize?: GridSizePreference;
  defaultZoom?: DefaultZoomPreference;
  keyboardShortcuts?: KeyboardShortcutsPreference;
  panWithSpace?: PanWithSpacePreference;
  multiSelect?: MultiSelectPreference;
  doubleClickInputToggle?: DoubleClickInputTogglePreference;
  aiResponseStyle?: AIResponseStylePreference;
  aiExplanationFocus?: AIExplanationFocusPreference;
}

const THEME_KEY = "circuitverse-theme";
const MOTION_KEY = "circuitverse-motion";
const INTERFACE_DENSITY_KEY = "circuitverse-interface-density";
const SHOW_GRID_KEY = "circuitverse-show-grid";
const SNAP_TO_GRID_KEY = "circuitverse-snap-to-grid";
const GRID_SIZE_KEY = "circuitverse-grid-size";
const DEFAULT_ZOOM_KEY = "circuitverse-default-zoom";
const KEYBOARD_SHORTCUTS_KEY = "circuitverse-keyboard-shortcuts";
const PAN_WITH_SPACE_KEY = "circuitverse-pan-with-space";
const MULTI_SELECT_KEY = "circuitverse-multi-select";
const DOUBLE_CLICK_INPUT_TOGGLE_KEY = "circuitverse-double-click-input-toggle";
const AI_RESPONSE_STYLE_KEY = "circuitverse-ai-response-style";
const AI_EXPLANATION_FOCUS_KEY = "circuitverse-ai-explanation-focus";

export function getThemePreference(): ThemePreference {
  if (typeof window === "undefined") {
    return "dark";
  }

  const storedTheme = localStorage.getItem(THEME_KEY);
  if (storedTheme === "light" || storedTheme === "cyberpunk" || storedTheme === "dark") {
    return storedTheme;
  }
  return "dark";
}

export function saveThemePreference(theme: ThemePreference) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(THEME_KEY, theme);

  if (document?.documentElement) {
    document.documentElement.dataset.theme = theme;
  }

  window.dispatchEvent(
    new CustomEvent("circuitverse-theme-change", { detail: { theme } })
  );
}

export function getMotionPreference(): MotionPreference {
  if (typeof window === "undefined") {
    return "full";
  }

  const storedMotion = localStorage.getItem(MOTION_KEY);
  return storedMotion === "reduced" ? "reduced" : "full";
}

export function saveMotionPreference(motion: MotionPreference) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(MOTION_KEY, motion);

  if (document?.documentElement) {
    document.documentElement.dataset.motion = motion;
  }

  window.dispatchEvent(
    new CustomEvent("circuitverse-motion-change")
  );
}

export function getInterfaceDensity(): InterfaceDensity {
  if (typeof window === "undefined") {
    return "standard";
  }

  const storedDensity = localStorage.getItem(INTERFACE_DENSITY_KEY);
  return storedDensity === "compact" ? "compact" : "standard";
}

export function saveInterfaceDensity(density: InterfaceDensity) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(INTERFACE_DENSITY_KEY, density);

  if (document?.documentElement) {
    document.documentElement.dataset.density = density;
  }

  window.dispatchEvent(
    new CustomEvent("circuitverse-interface-density-change")
  );
}

export function getShowGridPreference(): ShowGridPreference {
  if (typeof window === "undefined") {
    return "shown";
  }

  const storedShowGrid = localStorage.getItem(SHOW_GRID_KEY);
  return storedShowGrid === "hidden" ? "hidden" : "shown";
}

export function saveShowGridPreference(preference: ShowGridPreference) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(SHOW_GRID_KEY, preference);

  window.dispatchEvent(
    new CustomEvent("circuitverse-show-grid-change")
  );
}

export function getSnapToGridPreference(): SnapToGridPreference {
  if (typeof window === "undefined") {
    return "on";
  }

  const storedSnapToGrid = localStorage.getItem(SNAP_TO_GRID_KEY);
  return storedSnapToGrid === "off" ? "off" : "on";
}

export function saveSnapToGridPreference(preference: SnapToGridPreference) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(SNAP_TO_GRID_KEY, preference);

  window.dispatchEvent(
    new CustomEvent("circuitverse-snap-to-grid-change")
  );
}

export function getGridSizePreference(): GridSizePreference {
  if (typeof window === "undefined") {
    return 40;
  }

  const storedGridSize = localStorage.getItem(GRID_SIZE_KEY);

  if (
    storedGridSize === "20" ||
    storedGridSize === "40" ||
    storedGridSize === "60" ||
    storedGridSize === "80"
  ) {
    return Number(storedGridSize) as GridSizePreference;
  }

  return 40;
}

export function saveGridSizePreference(gridSize: GridSizePreference) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(GRID_SIZE_KEY, String(gridSize));

  window.dispatchEvent(
    new CustomEvent("circuitverse-grid-size-change")
  );
}

export function getDefaultZoomPreference(): DefaultZoomPreference {
  if (typeof window === "undefined") {
    return 100;
  }

  const storedDefaultZoom = localStorage.getItem(DEFAULT_ZOOM_KEY);

  if (
    storedDefaultZoom === "50" ||
    storedDefaultZoom === "75" ||
    storedDefaultZoom === "100" ||
    storedDefaultZoom === "125" ||
    storedDefaultZoom === "150"
  ) {
    return Number(storedDefaultZoom) as DefaultZoomPreference;
  }

  return 100;
}

export function saveDefaultZoomPreference(defaultZoom: DefaultZoomPreference) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(DEFAULT_ZOOM_KEY, String(defaultZoom));
}

export function getKeyboardShortcutsPreference(): KeyboardShortcutsPreference {
  if (typeof window === "undefined") {
    return "enabled";
  }

  const storedPreference = localStorage.getItem(KEYBOARD_SHORTCUTS_KEY);

  return storedPreference === "disabled"
    ? "disabled"
    : "enabled";
}

export function saveKeyboardShortcutsPreference(preference: KeyboardShortcutsPreference) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(KEYBOARD_SHORTCUTS_KEY, preference);

  window.dispatchEvent(
    new CustomEvent("circuitverse-keyboard-shortcuts-change")
  );
}

export function getPanWithSpacePreference(): PanWithSpacePreference {
  if (typeof window === "undefined") {
    return "enabled";
  }

  const storedPreference = localStorage.getItem(PAN_WITH_SPACE_KEY);

  return storedPreference === "disabled"
    ? "disabled"
    : "enabled";
}

export function savePanWithSpacePreference(preference: PanWithSpacePreference) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(PAN_WITH_SPACE_KEY, preference);

  window.dispatchEvent(
    new CustomEvent("circuitverse-pan-with-space-change")
  );
}

export function getMultiSelectPreference(): MultiSelectPreference {
  if (typeof window === "undefined") {
    return "enabled";
  }

  const storedPreference = localStorage.getItem(MULTI_SELECT_KEY);

  return storedPreference === "disabled"
    ? "disabled"
    : "enabled";
}

export function saveMultiSelectPreference(preference: MultiSelectPreference) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(MULTI_SELECT_KEY, preference);

  window.dispatchEvent(
    new CustomEvent("circuitverse-multi-select-change")
  );
}

export function getDoubleClickInputTogglePreference(): DoubleClickInputTogglePreference {
  if (typeof window === "undefined") {
    return "enabled";
  }

  const storedPreference = localStorage.getItem(DOUBLE_CLICK_INPUT_TOGGLE_KEY);

  return storedPreference === "disabled"
    ? "disabled"
    : "enabled";
}

export function saveDoubleClickInputTogglePreference(
  preference: DoubleClickInputTogglePreference
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    DOUBLE_CLICK_INPUT_TOGGLE_KEY,
    preference
  );

  window.dispatchEvent(
    new CustomEvent(
      "circuitverse-double-click-input-toggle-change"
    )
  );
}

export function getAIResponseStylePreference(): AIResponseStylePreference {
  if (typeof window === "undefined") {
    return "balanced";
  }

  const storedPreference = localStorage.getItem(AI_RESPONSE_STYLE_KEY);

  if (
    storedPreference === "concise" ||
    storedPreference === "detailed"
  ) {
    return storedPreference;
  }

  return "balanced";
}

export function saveAIResponseStylePreference(
  preference: AIResponseStylePreference
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(AI_RESPONSE_STYLE_KEY, preference);

  window.dispatchEvent(
    new CustomEvent("circuitverse-ai-response-style-change")
  );
}

export function getAIExplanationFocusPreference(): AIExplanationFocusPreference {
  if (typeof window === "undefined") {
    return "standard";
  }

  const storedPreference = localStorage.getItem(AI_EXPLANATION_FOCUS_KEY);

  if (
    storedPreference === "circuit-analysis" ||
    storedPreference === "learning-support"
  ) {
    return storedPreference;
  }

  return "standard";
}

export function saveAIExplanationFocusPreference(
  preference: AIExplanationFocusPreference
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(AI_EXPLANATION_FOCUS_KEY, preference);

  window.dispatchEvent(
    new CustomEvent("circuitverse-ai-explanation-focus-change")
  );
}

export function getAllPreferences(): UserPreferencesPayload {
  return {
    theme: getThemePreference(),
    motion: getMotionPreference(),
    interfaceDensity: getInterfaceDensity(),
    showGrid: getShowGridPreference(),
    snapToGrid: getSnapToGridPreference(),
    gridSize: getGridSizePreference(),
    defaultZoom: getDefaultZoomPreference(),
    keyboardShortcuts: getKeyboardShortcutsPreference(),
    panWithSpace: getPanWithSpacePreference(),
    multiSelect: getMultiSelectPreference(),
    doubleClickInputToggle: getDoubleClickInputTogglePreference(),
    aiResponseStyle: getAIResponseStylePreference(),
    aiExplanationFocus: getAIExplanationFocusPreference(),
  };
}

export async function syncPreferencesToServer(
  partial?: Partial<UserPreferencesPayload>
): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  const payload = partial ?? getAllPreferences();

  try {
    const res = await fetch("/api/user/preferences", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ preferences: payload }),
    });

    if (!res.ok) {
      console.warn("Failed to sync preferences to server:", res.status);
    }
  } catch (error) {
    console.warn("Network error syncing preferences to server:", error);
  }
}

export async function hydratePreferencesFromServer(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const res = await fetch("/api/user/preferences");
    if (!res.ok) {
      return false;
    }

    const data = await res.json();
    const serverPrefs = data?.preferences;

    if (!serverPrefs || typeof serverPrefs !== "object") {
      return false;
    }

    if (
      serverPrefs.theme === "dark" ||
      serverPrefs.theme === "light" ||
      serverPrefs.theme === "cyberpunk"
    ) {
      saveThemePreference(serverPrefs.theme);
    }
    if (serverPrefs.motion === "full" || serverPrefs.motion === "reduced") {
      saveMotionPreference(serverPrefs.motion);
    }
    if (
      serverPrefs.interfaceDensity === "standard" ||
      serverPrefs.interfaceDensity === "compact"
    ) {
      saveInterfaceDensity(serverPrefs.interfaceDensity);
    }
    if (
      serverPrefs.showGrid === "shown" ||
      serverPrefs.showGrid === "hidden"
    ) {
      saveShowGridPreference(serverPrefs.showGrid);
    }
    if (
      serverPrefs.snapToGrid === "on" ||
      serverPrefs.snapToGrid === "off"
    ) {
      saveSnapToGridPreference(serverPrefs.snapToGrid);
    }
    if ([20, 40, 60, 80].includes(Number(serverPrefs.gridSize))) {
      saveGridSizePreference(Number(serverPrefs.gridSize) as GridSizePreference);
    }
    if (
      [50, 75, 100, 125, 150].includes(Number(serverPrefs.defaultZoom))
    ) {
      saveDefaultZoomPreference(
        Number(serverPrefs.defaultZoom) as DefaultZoomPreference
      );
    }
    if (
      serverPrefs.keyboardShortcuts === "enabled" ||
      serverPrefs.keyboardShortcuts === "disabled"
    ) {
      saveKeyboardShortcutsPreference(serverPrefs.keyboardShortcuts);
    }
    if (
      serverPrefs.panWithSpace === "enabled" ||
      serverPrefs.panWithSpace === "disabled"
    ) {
      savePanWithSpacePreference(serverPrefs.panWithSpace);
    }
    if (
      serverPrefs.multiSelect === "enabled" ||
      serverPrefs.multiSelect === "disabled"
    ) {
      saveMultiSelectPreference(serverPrefs.multiSelect);
    }
    if (
      serverPrefs.doubleClickInputToggle === "enabled" ||
      serverPrefs.doubleClickInputToggle === "disabled"
    ) {
      saveDoubleClickInputTogglePreference(
        serverPrefs.doubleClickInputToggle
      );
    }
    if (
      serverPrefs.aiResponseStyle === "concise" ||
      serverPrefs.aiResponseStyle === "balanced" ||
      serverPrefs.aiResponseStyle === "detailed"
    ) {
      saveAIResponseStylePreference(serverPrefs.aiResponseStyle);
    }
    if (
      serverPrefs.aiExplanationFocus === "standard" ||
      serverPrefs.aiExplanationFocus === "circuit-analysis" ||
      serverPrefs.aiExplanationFocus === "learning-support"
    ) {
      saveAIExplanationFocusPreference(serverPrefs.aiExplanationFocus);
    }

    return true;
  } catch (error) {
    console.warn("Failed to hydrate preferences from server:", error);
    return false;
  }
}