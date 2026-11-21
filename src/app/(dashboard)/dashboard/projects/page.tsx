"use client";
import ProjectCard from "@/components/dashboard/ProjectCard";
import ProjectsHeader from "@/components/dashboard/ProjectsHeader";
import ProjectsToolbar from "@/components/dashboard/ProjectsToolbar";
import EmptyProjects from "@/components/dashboard/EmptyProjects";
import { useProjects } from "@/context/ProjectContext";
import { useToast } from "@/context/ToastContext";
import { filterAndSortProjects } from "@/lib/projectFilters";

export default function ProjectsPage() {
  const {
  projects,
  isLoading,
  error,
  searchQuery,
  selectedFilter,
  sortOption,
  toggleFavorite,
} = useProjects();
const { showToast } = useToast();
const sortedProjects = filterAndSortProjects({
  projects,
  searchQuery,
  selectedFilter,
  sortOption,
});

  return (
    <div>
        
      <ProjectsHeader />
      <ProjectsToolbar />
      <div className="space-y-4">
  {isLoading ? (
  <div className="py-12 text-center text-sm text-muted-foreground">
    Loading projects...
  </div>
) : error ? (
  <div
    role="alert"
    className="rounded-xl border border-red-500/30 bg-red-950/20 px-6 py-10 text-center"
  >
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-xl text-red-400">
      !
    </div>

    <h3 className="mt-4 text-lg font-semibold text-red-300">
      Unable to load projects
    </h3>

    <p className="mt-2 text-sm text-red-400">
      {error}
    </p>

    <p className="mt-2 text-sm text-zinc-400">
      Please refresh the page and try again.
    </p>
  </div>
) : sortedProjects.length === 0 ? (
  <EmptyProjects />
) : (
    sortedProjects.map((project, index) => (
      <div
        key={project.id}
        className="animate-cascade"
        style={{ animationDelay: `${index * 65}ms` }}
      >
        <ProjectCard
          id={project.id}
          title={project.name}
          description={project.description}
          status={project.status}
          priority={project.priority}
          owner={project.owner}
          createdAt={project.createdAt}
          updatedAt={project.updatedAt}
          dueDate={project.dueDate}
          completion={project.completion}
          progress={project.progress ?? project.completion}
          isFavorite={project.isFavorite}
          onToggleFavorite={async () => {
            try {
              await toggleFavorite(project.id);
              showToast(
                project.isFavorite
                  ? "Project removed from favorites."
                  : "Project added to favorites.",
                "success"
              );
            } catch (error) {
              console.error("Failed to update favorite:", error);
              showToast("Failed to update favorite status.", "error");
            }
          }}
        />
      </div>
    ))
  )}
</div>
    </div>
  );
}