"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  getStoredProjects,
  saveProjects,
  subscribeToProjects,
} from "@/lib/projectStorage";
import type {
  DashboardProject,
  ProjectFormData,
} from "@/types/dashboard";

interface ProjectContextType {
  projects: DashboardProject[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;

  selectedFilter: string;
setSelectedFilter: React.Dispatch<React.SetStateAction<string>>;

sortOption: string;
setSortOption: React.Dispatch<React.SetStateAction<string>>;

addProject: (project: ProjectFormData) => void;
getProjectById: (id: string) => DashboardProject | undefined;
deleteProject: (id: string) => void;
updateProject: (
  id: string,
  project: ProjectFormData
) => void;
updateLastOpened: (id: string) => void;
toggleFavorite: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);
const emptyProjects: DashboardProject[] = [];
const getServerProjects = () => emptyProjects;

interface ProjectProviderProps {
  children: ReactNode;
}

export function ProjectProvider({
  children,
}: ProjectProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const projects = useSyncExternalStore(
  subscribeToProjects,
  getStoredProjects,
  getServerProjects
);
useEffect(() => {
  const loadProjectsFromDatabase = async () => {
    try {
      const response = await fetch("/api/projects");

      if (!response.ok) {
  setError("Failed to load projects.");
  return;
}

      const databaseProjects = await response.json();

      saveProjects(databaseProjects);
    } catch (error) {
  console.error("Failed to load projects from database:", error);
  setError("Failed to load projects.");
}finally {
      setIsLoading(false);
    }
  };

  loadProjectsFromDatabase();
}, []);
  
  

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("All");
    const [sortOption, setSortOption] = useState("Newest");
  

  const addProject = useCallback(
  async (project: ProjectFormData) => {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(project),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create project");
  }

  const createdProject: DashboardProject = await response.json();

      const updatedProjects = [createdProject, ...projects];

    saveProjects(updatedProjects);
  },
  [projects]
);


const getProjectById = useCallback(
  (id: string) => {
    return projects.find((project) => project.id === id);
  },
  [projects]
);
const updateLastOpened = useCallback(
  async (id: string) => {
  const response = await fetch(`/api/projects/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      lastOpenedAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.error || "Failed to update last opened time"
    );
  }

  const updatedProjectFromDatabase: DashboardProject =
    await response.json();

  const updatedProjects = projects.map((project) =>
    project.id === id
      ? {
          ...project,
          ...updatedProjectFromDatabase,
        }
      : project
  );

      saveProjects(updatedProjects);
  },
  [projects]
);
const toggleFavorite = useCallback(
  async (id: string) => {
  const project = projects.find((project) => project.id === id);

  if (!project) {
    return;
  }

  const newFavoriteState = !project.isFavorite;

  const response = await fetch(`/api/projects/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      isFavorite: newFavoriteState,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.error || "Failed to update favorite status"
    );
  }

  const updatedProjectFromDatabase: DashboardProject =
    await response.json();

  const updatedProjects = projects.map((project) =>
    project.id === id
      ? {
          ...project,
          ...updatedProjectFromDatabase,
        }
      : project
  );

      saveProjects(updatedProjects);
  },
  [projects]
);
const deleteProject = useCallback(
  async (id: string) => {
  const response = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete project");
  }

  // Clean up local and session storage artifacts for this project
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(`circuitverse-editor-${id}`);
      sessionStorage.removeItem(`circuitverse-generated-circuit-${id}`);
    }
  } catch (e) {
    console.error("Failed to prune project storage:", e);
  }

  const updatedProjects = projects.filter(
    (project) => project.id !== id
  );

      saveProjects(updatedProjects);
  },
  [projects]
);
const updateProject = useCallback(
  async (
    id: string,
    updatedProject: ProjectFormData
  ) => {
  const response = await fetch(`/api/projects/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedProject),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update project");
  }

  const updatedProjectFromDatabase: DashboardProject =
    await response.json();

  const updatedProjects = projects.map((project) =>
    project.id === id
      ? {
          ...project,
          ...updatedProjectFromDatabase,
        }
      : project
  );

      saveProjects(updatedProjects);
  },
  [projects]
);
const contextValue = useMemo(
  () => ({
    projects,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    sortOption,
    setSortOption,
    addProject,
    getProjectById,
    deleteProject,
    updateProject,
    updateLastOpened,
    toggleFavorite,
  }),
  [
    projects,
    isLoading,
    error,
    searchQuery,
    selectedFilter,
    sortOption,
    addProject,
    getProjectById,
    deleteProject,
    updateProject,
    updateLastOpened,
    toggleFavorite,
  ]
);
  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error(
      "useProjects must be used inside ProjectProvider"
    );
  }

  return context;
}
