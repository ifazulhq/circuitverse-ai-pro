"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import {
  getMotionPreference,
  getThemePreference,
  getInterfaceDensity,
  saveMotionPreference,
  saveThemePreference,
  saveInterfaceDensity,
  MotionPreference,
  ThemePreference,
  InterfaceDensity,
  ShowGridPreference,
  getShowGridPreference,
 saveShowGridPreference,
   getSnapToGridPreference,
  saveSnapToGridPreference,
  GridSizePreference,
getGridSizePreference,
saveGridSizePreference,
DefaultZoomPreference,
getDefaultZoomPreference,
saveDefaultZoomPreference,
  KeyboardShortcutsPreference,
  getKeyboardShortcutsPreference,
  saveKeyboardShortcutsPreference,
  PanWithSpacePreference,
  getPanWithSpacePreference,
  savePanWithSpacePreference,
  MultiSelectPreference,
  getMultiSelectPreference,
  saveMultiSelectPreference,
  DoubleClickInputTogglePreference,
  getDoubleClickInputTogglePreference,
  saveDoubleClickInputTogglePreference,
    AIResponseStylePreference,
  getAIResponseStylePreference,
  saveAIResponseStylePreference,
  AIExplanationFocusPreference,
getAIExplanationFocusPreference,
saveAIExplanationFocusPreference,
syncPreferencesToServer,
} from "@/lib/settingsPreferences";
export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState("account");
    const { data: session, update } = useSession();
const { showToast } = useToast();

const [name, setName] = useState("");
const [nameEdited, setNameEdited] = useState(false);
const [isSavingName, setIsSavingName] = useState(false);
const [themePreference, setThemePreference] =
  useState<ThemePreference>(() => getThemePreference());

const [motionPreference, setMotionPreference] =
  useState<MotionPreference>(() => getMotionPreference());
const [interfaceDensity, setInterfaceDensity] =
  useState<InterfaceDensity>(() => getInterfaceDensity());
const [showGridPreference, setShowGridPreference] =
  useState<ShowGridPreference>(() => getShowGridPreference());

const [snapToGridPreference, setSnapToGridPreference] =
  useState<"on" | "off">(() => getSnapToGridPreference());
const [gridSizePreference, setGridSizePreference] =
  useState<GridSizePreference>(() => getGridSizePreference());
const [defaultZoomPreference, setDefaultZoomPreference] =
  useState<DefaultZoomPreference>(() => getDefaultZoomPreference());
const [keyboardShortcutsPreference, setKeyboardShortcutsPreference] =
  useState<KeyboardShortcutsPreference>(() => getKeyboardShortcutsPreference());
const [panWithSpacePreference, setPanWithSpacePreference] =
  useState<PanWithSpacePreference>(() => getPanWithSpacePreference());

const [multiSelectPreference, setMultiSelectPreference] =
  useState<MultiSelectPreference>(() => getMultiSelectPreference());

const [
  doubleClickInputTogglePreference,
  setDoubleClickInputTogglePreference,
] = useState<DoubleClickInputTogglePreference>(() => getDoubleClickInputTogglePreference());
const [aiResponseStylePreference, setAIResponseStylePreference] =
  useState<AIResponseStylePreference>(() => getAIResponseStylePreference());
const [aiExplanationFocusPreference, setAIExplanationFocusPreference] =
  useState<AIExplanationFocusPreference>(() => getAIExplanationFocusPreference());

  const loadAppearancePreferences = () => {
  const storedTheme = getThemePreference();
  const storedMotion = getMotionPreference();
  const storedDensity = getInterfaceDensity();

  setThemePreference(storedTheme);
  setMotionPreference(storedMotion);
  setInterfaceDensity(storedDensity);

  document.documentElement.dataset.motion = storedMotion;
  document.documentElement.dataset.theme = storedTheme;
};
const loadEditorPreferences = () => {
  const storedShowGrid = getShowGridPreference();
  const storedSnapToGrid = getSnapToGridPreference();
  const storedGridSize = getGridSizePreference();
  const storedDefaultZoom = getDefaultZoomPreference();
const storedKeyboardShortcuts =
  getKeyboardShortcutsPreference();

const storedPanWithSpace =
  getPanWithSpacePreference();

const storedMultiSelect =
  getMultiSelectPreference();

const storedDoubleClickInputToggle =
  getDoubleClickInputTogglePreference();

setShowGridPreference(storedShowGrid);
setSnapToGridPreference(storedSnapToGrid);
setGridSizePreference(storedGridSize);
setDefaultZoomPreference(storedDefaultZoom);
setKeyboardShortcutsPreference(storedKeyboardShortcuts);
setPanWithSpacePreference(storedPanWithSpace);
setMultiSelectPreference(storedMultiSelect);
setDoubleClickInputTogglePreference(
  storedDoubleClickInputToggle
);
};
const loadAIPreferences = () => {
  const storedResponseStyle = getAIResponseStylePreference();
  const storedExplanationFocus =
    getAIExplanationFocusPreference();

  setAIResponseStylePreference(storedResponseStyle);
  setAIExplanationFocusPreference(storedExplanationFocus);
};

const handleSaveName = async () => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    showToast("Name is required.", "error");
    return;
  }

  if (trimmedName.length > 100) {
    showToast("Name must be 100 characters or fewer.", "error");
    return;
  }

  setIsSavingName(true);

  try {
    const response = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: trimmedName,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update name");
    }

    await update();

    setNameEdited(false);
    showToast("Name updated successfully.", "success");
  } catch (error) {
    console.error("Failed to update name:", error);
    showToast("Failed to update name.", "error");
  } finally {
    setIsSavingName(false);
  }
};
  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Settings Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Settings
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Manage your CircuitVerse AI Pro preferences.
        </p>
      </div>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Settings Navigation */}
        <aside className="h-fit rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-2.5 backdrop-blur-xl shadow-lg">
          <nav className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setActiveSection("account")}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 ${
                activeSection === "account"
                  ? "border-l-2 border-cyan-400 bg-gradient-to-r from-cyan-500/15 via-cyan-500/5 to-transparent text-cyan-300 shadow-[inset_0_0_15px_rgba(6,182,212,0.08)]"
                  : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white hover:translate-x-0.5"
              }`}
            >
              Account
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSection("appearance");
                loadAppearancePreferences();
              }}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 ${
                activeSection === "appearance"
                  ? "border-l-2 border-cyan-400 bg-gradient-to-r from-cyan-500/15 via-cyan-500/5 to-transparent text-cyan-300 shadow-[inset_0_0_15px_rgba(6,182,212,0.08)]"
                  : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white hover:translate-x-0.5"
              }`}
            >
              Appearance
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSection("editor");
                loadEditorPreferences();
              }}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 ${
                activeSection === "editor"
                  ? "border-l-2 border-cyan-400 bg-gradient-to-r from-cyan-500/15 via-cyan-500/5 to-transparent text-cyan-300 shadow-[inset_0_0_15px_rgba(6,182,212,0.08)]"
                  : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white hover:translate-x-0.5"
              }`}
            >
              Editor Preferences
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSection("ai");
                loadAIPreferences();
              }}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 ${
                activeSection === "ai"
                  ? "border-l-2 border-cyan-400 bg-gradient-to-r from-cyan-500/15 via-cyan-500/5 to-transparent text-cyan-300 shadow-[inset_0_0_15px_rgba(6,182,212,0.08)]"
                  : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white hover:translate-x-0.5"
              }`}
            >
              AI Preferences
            </button>
          </nav>
        </aside>

        {/* Settings Content */}
        <section className="relative min-w-0 overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
          <div className="border-b border-zinc-800 pb-5">
            <h2 className="text-xl font-bold tracking-tight text-white">
              {activeSection === "account" && "Account Settings"}
              {activeSection === "appearance" && "Appearance & Motion"}
              {activeSection === "editor" && "Circuit Editor Preferences"}
              {activeSection === "ai" && "AI Copilot Preferences"}
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              {activeSection === "account" &&
                "Manage your profile identity and authentication credentials."}

              {activeSection === "appearance" &&
                "Customize the visual theme, motion intensity, and interface density."}

              {activeSection === "editor" &&
                "Configure your circuit editor snap behaviors, grid sizing, and key shortcuts."}

              {activeSection === "ai" &&
                "Fine-tune the response style and explanation depth of your AI copilot."}
            </p>
          </div>

          <div key={activeSection} className="animate-tab-panel pt-6">
  {activeSection === "account" && (
  <div className="space-y-6">
    {/* Profile */}
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800">
        {session?.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name ?? "Profile image"}
            width={80}
            height={80}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="text-2xl font-semibold text-zinc-300">
            {session?.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </span>
        )}
      </div>

      <div>
        <h3 className="text-base font-medium text-white">
          Profile
        </h3>

        <p className="mt-1 text-sm text-zinc-400">
          Your profile information is connected to your account.
        </p>
      </div>
    </div>

    {/* Name */}
    <div>
      <label
        htmlFor="profile-name"
        className="block text-sm font-medium text-zinc-300"
      >
        Name
      </label>

      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          id="profile-name"
          type="text"
          value={nameEdited ? name : session?.user?.name ?? ""}
          onChange={(event) => {
            setName(event.target.value);
            setNameEdited(true);
          }}
          maxLength={100}
          className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25 focus:shadow-[0_0_18px_rgba(6,182,212,0.2)]"
        />

        <button
          type="button"
          onClick={handleSaveName}
          disabled={isSavingName}
          className="shrink-0 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-zinc-950 shadow-md transition-all duration-200 active:scale-95 hover:shadow-[0_0_18px_rgba(6,182,212,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSavingName ? "Saving..." : "Save"}
        </button>
      </div>
    </div>

    {/* Email */}
    <div>
      <label
        htmlFor="profile-email"
        className="block text-sm font-medium text-zinc-300"
      >
        Email
      </label>

      <input
        id="profile-email"
        type="email"
        value={session?.user?.email ?? ""}
        readOnly
        className="mt-2 w-full rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-4 py-2.5 text-sm text-zinc-400 outline-none"
      />

      <p className="mt-2 text-xs text-zinc-500">
        Your email address is managed by your authentication provider.
      </p>
    </div>

    {/* Authentication */}
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition hover:border-zinc-700/80">
      <h3 className="text-sm font-medium text-white">
        Authentication
      </h3>

      <div className="mt-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-300">
            Authentication provider
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Google
          </p>
        </div>

        <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400">
          Connected
        </span>
      </div>
    </div>
  </div>
)}

  {activeSection === "appearance" && (
  <div className="space-y-6">
    {/* Theme */}
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition hover:border-zinc-700/80">
      <div>
        <h3 className="text-sm font-medium text-white">
          Theme
        </h3>

        <p className="mt-1 text-sm text-zinc-500">
          Choose the visual theme used by CircuitVerse AI Pro.
        </p>
      </div>

      <div className="mt-4">
        <label
          htmlFor="theme-preference"
          className="block text-sm font-medium text-zinc-300"
        >
          Theme preference
        </label>

        <select
          id="theme-preference"
          value={themePreference}
          onChange={(event) => {
            const theme = event.target.value as ThemePreference;

            setThemePreference(theme);
            saveThemePreference(theme);
            syncPreferencesToServer({ theme });

            showToast("Theme preference saved.", "success");
          }}
          className="mt-2 w-full rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25 focus:shadow-[0_0_18px_rgba(6,182,212,0.2)]"
        >
          <option value="dark">Dark Space (Default)</option>
          <option value="light">Light Studio</option>
          <option value="cyberpunk">Cyberpunk Neon</option>
        </select>
      </div>
    </div>

    {/* Motion */}
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition hover:border-zinc-700/80">
      <div>
        <h3 className="text-sm font-medium text-white">
          Motion
        </h3>

        <p className="mt-1 text-sm text-zinc-500">
          Control animation and transition behavior across the interface.
        </p>
      </div>

      <div className="mt-4">
        <label
          htmlFor="motion-preference"
          className="block text-sm font-medium text-zinc-300"
        >
          Motion preference
        </label>

        <select
          id="motion-preference"
          value={motionPreference}
          onChange={(event) => {
            const motion = event.target.value as MotionPreference;

            setMotionPreference(motion);
            saveMotionPreference(motion);
            syncPreferencesToServer({ motion });

            showToast("Motion preference saved.", "success");
          }}
          className="mt-2 w-full rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25 focus:shadow-[0_0_18px_rgba(6,182,212,0.2)]"
        >
          <option value="full">Full motion</option>
          <option value="reduced">Reduced motion</option>
        </select>
      </div>
    </div>

    {/* Interface Preferences */}
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition hover:border-zinc-700/80">
      <div>
        <h3 className="text-sm font-medium text-white">
          Interface Preferences
        </h3>

        <p className="mt-1 text-sm text-zinc-500">
          Customize how much spacing the interface uses.
        </p>
      </div>

      <div className="mt-4">
        <label
          htmlFor="interface-density"
          className="block text-sm font-medium text-zinc-300"
        >
          Interface density
        </label>

        <select
          id="interface-density"
          value={interfaceDensity}
          onChange={(event) => {
            const density = event.target.value as InterfaceDensity;

            setInterfaceDensity(density);
            saveInterfaceDensity(density);
            syncPreferencesToServer({ interfaceDensity: density });

            showToast("Interface density saved.", "success");
          }}
          className="mt-2 w-full rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25 focus:shadow-[0_0_18px_rgba(6,182,212,0.2)]"
        >
          <option value="standard">Standard</option>
          <option value="compact">Compact</option>
        </select>
      </div>
    </div>
  </div>
)}

  {activeSection === "editor" && (
  <div className="space-y-6">
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition hover:border-zinc-700/80">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">
            Show Grid
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            Show or hide the grid in the circuit editor.
          </p>
        </div>

        <select
          value={showGridPreference}
          onChange={(event) => {
            const value = event.target.value as ShowGridPreference;

            setShowGridPreference(value);
            saveShowGridPreference(value);
            syncPreferencesToServer({ showGrid: value });

            showToast("Grid preference saved.", "success");
          }}
          className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25 focus:shadow-[0_0_18px_rgba(6,182,212,0.2)] sm:w-48"
          aria-label="Show Grid preference"
        >
          <option value="shown">Show grid</option>
          <option value="hidden">Hide grid</option>
        </select>
      </div>
    </div>

    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition hover:border-zinc-700/80">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">
            Snap to Grid
          </h3>

          <p className="mt-1 text-sm text-zinc-400">
            Control whether components snap to the editor grid.
          </p>
        </div>

        <select
          value={snapToGridPreference}
          onChange={(event) => {
            const value = event.target.value as "on" | "off";

            setSnapToGridPreference(value);
            saveSnapToGridPreference(value);
            syncPreferencesToServer({ snapToGrid: value });

            showToast("Snap-to-Grid preference saved.", "success");
          }}
          className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25 focus:shadow-[0_0_18px_rgba(6,182,212,0.2)] sm:w-48"
          aria-label="Snap to Grid preference"
        >
          <option value="on">Snap to grid</option>
          <option value="off">Free placement</option>
        </select>
      </div>
    </div>

    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition hover:border-zinc-700/80">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">
            Grid Size
          </h3>

          <p className="mt-1 text-sm text-zinc-400">
            Set the spacing between grid lines in the circuit editor.
          </p>
        </div>

        <select
          value={gridSizePreference}
          onChange={(event) => {
            const value = Number(
              event.target.value
            ) as GridSizePreference;

            setGridSizePreference(value);
            saveGridSizePreference(value);
            syncPreferencesToServer({ gridSize: value });

            showToast("Grid size preference saved.", "success");
          }}
          className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25 focus:shadow-[0_0_18px_rgba(6,182,212,0.2)] sm:w-48"
          aria-label="Grid Size preference"
        >
          <option value={20}>20 px</option>
          <option value={40}>40 px</option>
          <option value={60}>60 px</option>
          <option value={80}>80 px</option>
        </select>
      </div>
    </div>

    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition hover:border-zinc-700/80">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">
            Default Zoom
          </h3>

          <p className="mt-1 text-sm text-zinc-400">
            Set the initial zoom level when opening the circuit editor.
          </p>
        </div>

        <select
          value={defaultZoomPreference}
          onChange={(event) => {
            const value = Number(
              event.target.value
            ) as DefaultZoomPreference;

            setDefaultZoomPreference(value);
            saveDefaultZoomPreference(value);
            syncPreferencesToServer({ defaultZoom: value });

            showToast("Default zoom preference saved.", "success");
          }}
          className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25 focus:shadow-[0_0_18px_rgba(6,182,212,0.2)] sm:w-48"
          aria-label="Default Zoom preference"
        >
          <option value={50}>50%</option>
          <option value={75}>75%</option>
          <option value={100}>100%</option>
          <option value={125}>125%</option>
          <option value={150}>150%</option>
        </select>
      </div>
    </div>

    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition hover:border-zinc-700/80">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">
            Keyboard Shortcuts
          </h3>

          <p className="mt-1 text-sm text-zinc-400">
            Enable or disable keyboard shortcuts in the circuit editor.
          </p>
        </div>

        <select
          value={keyboardShortcutsPreference}
          onChange={(event) => {
            const value =
              event.target.value as KeyboardShortcutsPreference;

            setKeyboardShortcutsPreference(value);
            saveKeyboardShortcutsPreference(value);
            syncPreferencesToServer({ keyboardShortcuts: value });

            showToast(
              "Keyboard shortcut preference saved.",
              "success"
            );
          }}
          className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25 focus:shadow-[0_0_18px_rgba(6,182,212,0.2)] sm:w-48"
          aria-label="Keyboard Shortcuts preference"
        >
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>
    </div>

    {/* Pan with Space */}
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition hover:border-zinc-700/80">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">
            Pan with Space
          </h3>

          <p className="mt-1 text-sm text-zinc-400">
            Enable Space + left-drag to pan across the circuit canvas.
          </p>
        </div>

        <select
          value={panWithSpacePreference}
          onChange={(event) => {
            const value =
              event.target.value as PanWithSpacePreference;

            setPanWithSpacePreference(value);
            savePanWithSpacePreference(value);
            syncPreferencesToServer({ panWithSpace: value });

            showToast(
              "Pan with Space preference saved.",
              "success"
            );
          }}
          className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25 focus:shadow-[0_0_18px_rgba(6,182,212,0.2)] sm:w-48"
          aria-label="Pan with Space preference"
        >
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>
    </div>

    {/* Multi-Select */}
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition hover:border-zinc-700/80">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">
            Multi-Select
          </h3>

          <p className="mt-1 text-sm text-zinc-400">
            Allow Ctrl/Cmd + click to select multiple components.
          </p>
        </div>

        <select
          value={multiSelectPreference}
          onChange={(event) => {
            const value =
              event.target.value as MultiSelectPreference;

            setMultiSelectPreference(value);
            saveMultiSelectPreference(value);
            syncPreferencesToServer({ multiSelect: value });

            showToast(
              "Multi-select preference saved.",
              "success"
            );
          }}
          className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25 focus:shadow-[0_0_18px_rgba(6,182,212,0.2)] sm:w-48"
          aria-label="Multi-Select preference"
        >
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>
    </div>

    {/* Double-Click Input Toggle */}
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition hover:border-zinc-700/80">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">
            Double-Click Input Toggle
          </h3>

          <p className="mt-1 text-sm text-zinc-400">
            Enable double-clicking INPUT or CLOCK components to toggle their value.
          </p>
        </div>

        <select
          value={doubleClickInputTogglePreference}
          onChange={(event) => {
            const value =
              event.target.value as DoubleClickInputTogglePreference;

            setDoubleClickInputTogglePreference(value);
            saveDoubleClickInputTogglePreference(value);
            syncPreferencesToServer({ doubleClickInputToggle: value });

            showToast(
              "Double-click input toggle preference saved.",
              "success"
            );
          }}
          className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25 focus:shadow-[0_0_18px_rgba(6,182,212,0.2)] sm:w-48"
          aria-label="Double-Click Input Toggle preference"
        >
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>
    </div>
  </div>
)}

{activeSection === "ai" && (
  <div className="space-y-6">
    {/* Response Style */}
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition hover:border-zinc-700/80">
      <div>
        <h3 className="text-sm font-medium text-white">
          Response Style
        </h3>

        <p className="mt-1 text-sm text-zinc-400">
          Choose how detailed CircuitVerse AI should make its responses.
        </p>
      </div>

      <div className="mt-4">
        <label
          htmlFor="ai-response-style"
          className="block text-sm font-medium text-zinc-300"
        >
          AI response style
        </label>

        <select
          id="ai-response-style"
          value={aiResponseStylePreference}
          onChange={(event) => {
            const value =
              event.target.value as AIResponseStylePreference;

            setAIResponseStylePreference(value);
            saveAIResponseStylePreference(value);
            syncPreferencesToServer({ aiResponseStyle: value });

            showToast(
              "AI response style preference saved.",
              "success"
            );
          }}
          className="mt-2 w-full rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25 focus:shadow-[0_0_18px_rgba(6,182,212,0.2)] sm:w-56"
          aria-label="AI response style preference"
        >
          <option value="concise">Concise</option>
          <option value="balanced">Balanced</option>
          <option value="detailed">Detailed</option>
        </select>
      </div>
    </div>

    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition hover:border-zinc-700/80">
      <div>
        <h3 className="text-sm font-medium text-white">
          Explanation Focus
        </h3>
        <p className="mt-1 text-sm text-zinc-400">
          Choose what CircuitVerse AI should prioritize when
          explaining circuits and answering questions.
        </p>
      </div>

      <div className="mt-4">
        <label
          htmlFor="ai-explanation-focus"
          className="block text-sm font-medium text-zinc-300"
        >
          AI explanation focus
        </label>

        <select
          id="ai-explanation-focus"
          value={aiExplanationFocusPreference}
          onChange={(event) => {
            const value =
              event.target.value as AIExplanationFocusPreference;

            setAIExplanationFocusPreference(value);
            saveAIExplanationFocusPreference(value);
            syncPreferencesToServer({ aiExplanationFocus: value });

            showToast(
              "AI explanation focus preference saved.",
              "success"
            );
          }}
          className="mt-2 w-full rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25 focus:shadow-[0_0_18px_rgba(6,182,212,0.2)] sm:w-64"
          aria-label="AI explanation focus preference"
        >
          <option value="standard">Standard</option>
          <option value="circuit-analysis">Circuit Analysis</option>
          <option value="learning-support">Learning Support</option>
        </select>
      </div>
    </div>
  </div>
)}
</div>
        </section>
      </div>
    </div>
  );
}