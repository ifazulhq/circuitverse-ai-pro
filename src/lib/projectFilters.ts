import type { DashboardProject } from "@/types/dashboard";
import { PRIORITY_ORDER } from "@/constants/project";

interface FilterProjectsParams {
  projects: DashboardProject[];
  searchQuery: string;
  selectedFilter: string;
  sortOption: string;
}

export function filterAndSortProjects({
  projects,
  searchQuery,
  selectedFilter,
  sortOption,
}: FilterProjectsParams): DashboardProject[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      normalizedQuery.length === 0 ||
      project.name.toLowerCase().includes(normalizedQuery);

    const matchesFilter =
      selectedFilter === "All" ||
      project.status === selectedFilter ||
      project.category === selectedFilter ||
      project.priority === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  return [...filteredProjects].sort((a, b) => {
    switch (sortOption) {
      case "Oldest":
        return a.createdAt.localeCompare(b.createdAt);

      case "A-Z":
        return a.name.localeCompare(b.name);

      case "Z-A":
        return b.name.localeCompare(a.name);

      case "High Priority": {
      

        return (
  PRIORITY_ORDER[b.priority] -
  PRIORITY_ORDER[a.priority]
);
      }

      case "Recently Updated":
        return b.updatedAt.localeCompare(a.updatedAt);

      case "Newest":
default:
  return (
    new Date(b.createdAt).getTime() -
    new Date(a.createdAt).getTime()
  );
    }
  });
}