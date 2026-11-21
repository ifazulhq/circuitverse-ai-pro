import type { DashboardProject } from "@/types/dashboard";

const STORAGE_KEY = "circuitverse-projects";

const listeners = new Set<() => void>();

let clientProjects: DashboardProject[] = [];

let initialized = false;

function initializeStore() {
  if (initialized || typeof window === "undefined") {
    return;
  }

  initialized = true;

  const storedProjects = localStorage.getItem(STORAGE_KEY);

  if (!storedProjects) {
    clientProjects = [];
    return;
  }

  try {
    clientProjects = JSON.parse(
      storedProjects
    ) as DashboardProject[];
  } catch {
    clientProjects = [];
  }
}

export function getStoredProjects(): DashboardProject[] {
  initializeStore();

  return clientProjects;
}

export function getServerProjects(): DashboardProject[] {
  return clientProjects;
}

export function saveProjects(
  projects: DashboardProject[]
): void {
  if (typeof window === "undefined") {
    return;
  }

  clientProjects = projects;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(projects)
  );

  listeners.forEach((listener) => listener());
}

export function subscribeToProjects(
  listener: () => void
): () => void {
  initializeStore();

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}