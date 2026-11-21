"use client";

import * as React from "react";
import { useState } from "react";
import { useProjects } from "@/context/ProjectContext";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EditProjectModal from "@/components/dashboard/EditProjectModal";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";


interface ProjectDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectDetailsPage({
  params,
}: ProjectDetailsPageProps) {
  const {
    getProjectById,
    deleteProject,
    updateProject,
    updateLastOpened,
    isLoading,
    error: projectsError,
  } = useProjects();

  const { showToast } = useToast();

  const { id } = React.use(params);
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const project = getProjectById(id);
  React.useEffect(() => {
    if (project) {
      updateLastOpened(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };
  const handleDelete = async () => {
    try {
      await deleteProject(id);
      showToast("Project deleted successfully.", "success");
      router.push("/dashboard/projects");
    } catch (error) {
      console.error("Failed to delete project:", error);
      showToast("Failed to delete project.", "error");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };
  const handleUpdateProject = async (
    id: string,
    updates: {
      name: string;
      description: string;
      category: string;
    }
  ) => {
    try {
      await updateProject(id, updates);
      showToast("Project updated successfully.", "success");
    } catch (error) {
      console.error("Failed to update project:", error);
      showToast("Failed to update project.", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-36 rounded-lg bg-zinc-800" />
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <div className="h-8 w-64 rounded bg-zinc-800" />
          <div className="h-4 w-96 rounded bg-zinc-800/60" />
          <div className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-4">
            <div className="h-16 rounded-lg bg-zinc-800/40" />
            <div className="h-16 rounded-lg bg-zinc-800/40" />
            <div className="h-16 rounded-lg bg-zinc-800/40" />
            <div className="h-16 rounded-lg bg-zinc-800/40" />
          </div>
        </div>
      </div>
    );
  }

  if (projectsError) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-8 text-center">
        <h3 className="text-lg font-semibold text-red-300">Unable to load project</h3>
        <p className="mt-2 text-sm text-red-400">{projectsError}</p>
        <Link
          href="/dashboard/projects"
          className="mt-6 inline-block rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700"
        >
          ← Back to Projects
        </Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center text-white">
        <h2 className="text-xl font-semibold">Project not found</h2>
        <p className="mt-2 text-sm text-zinc-400">
          The project you are looking for does not exist or has been deleted.
        </p>
        <Link
          href="/dashboard/projects"
          className="mt-6 inline-block rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700"
        >
          ← Back to Projects
        </Link>
      </div>
    );
  }
  const statusClasses = {
  Completed: "bg-green-500/20 text-green-400",
  "In Progress": "bg-blue-500/20 text-blue-400",
};

  return (
    <div className="space-y-6 animate-cascade">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-zinc-300 backdrop-blur-sm transition hover:border-cyan-500/50 hover:bg-zinc-800/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <span>←</span>
          <span>Back to Projects</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={`/dashboard/projects/${id}/editor`}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              ⚡ Open Circuit Editor
            </span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
          </Link>

          <Link
            href={`/dashboard/ai?projectId=${id}`}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-[0_0_20px_rgba(168,85,247,0.35)] focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              ✨ AI Assistant
            </span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
          </Link>

          <Link
            href={`/dashboard/ai/generate?projectId=${id}`}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-[0_0_20px_rgba(6,182,212,0.35)] focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              ⚙️ Generate Circuit
            </span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
          </Link>

          <button
            type="button"
            onClick={handleEdit}
            className="rounded-xl border border-zinc-700/80 bg-zinc-800/80 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="rounded-xl border border-red-500/30 bg-red-950/40 px-3.5 py-2 text-sm font-medium text-red-300 transition hover:border-red-500/60 hover:bg-red-900/60 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {project.name}
            </h1>

            <p className="mt-2 text-sm text-zinc-400 sm:text-base">
              {project.description || "No description provided for this circuit."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                statusClasses[project.status as keyof typeof statusClasses] ??
                "border-zinc-700 bg-zinc-800 text-zinc-300"
              }`}
            >
              {project.status}
            </span>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                project.priority === "High"
                  ? "border-red-500/30 bg-red-500/10 text-red-400"
                  : project.priority === "Medium"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {project.priority} Priority
            </span>

            {project.isFavorite && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.3)]">
                ⭐ Favorited
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {(() => {
            const displayProgress =
              project.progress !== undefined
                ? project.progress
                : (project.completion ?? 0);
            return (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-zinc-400">
                    Simulation Progress
                  </span>
                  <span className="font-bold tabular-nums text-white">
                    {displayProgress}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800 shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500 transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min(100, Math.max(0, displayProgress))}%`,
                    }}
                  />
                </div>
              </>
            );
          })()}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-zinc-800/80 pt-6 sm:grid-cols-4">
          <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/50 p-3.5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Owner</p>
            <p className="mt-1 truncate font-semibold text-white">{project.owner}</p>
          </div>

          <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/50 p-3.5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Category</p>
            <p className="mt-1 truncate font-semibold text-white">{project.category || "General"}</p>
          </div>

          <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/50 p-3.5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Created</p>
            <p className="mt-1 truncate font-semibold text-white">{project.createdAt}</p>
          </div>

          <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/50 p-3.5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Due Date</p>
            <p className="mt-1 truncate font-semibold text-white">{project.dueDate || "None"}</p>
          </div>
        </div>
      </div>
 {isEditModalOpen && (
    <EditProjectModal
  project={project!}
  onClose={() => setIsEditModalOpen(false)}
  onUpdate={handleUpdateProject}
/>
    )}
    {isDeleteDialogOpen && (
  <ConfirmDialog
    title="Delete Project?"
    message={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
    onCancel={() => setIsDeleteDialogOpen(false)}
    onConfirm={handleDelete}
    confirmText="Delete Project"
  />
)}
</div>
    
  );
}