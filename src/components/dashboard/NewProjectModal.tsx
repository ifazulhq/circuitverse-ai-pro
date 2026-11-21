"use client";

import { useEffect, useState } from "react";
import type { ProjectFormData } from "@/types/dashboard";
import { useToast } from "@/context/ToastContext";
import { AlertCircle } from "lucide-react";
import ProjectForm from "./ProjectForm";
import ModalActions from "./ModalActions";

interface NewProjectModalProps {
  onClose: () => void;
  onCreateProject: (project: ProjectFormData) => void;
}

export default function NewProjectModal({
  onClose,
  onCreateProject,
}: NewProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleCreateProject = () => {
    const trimmedProjectName = projectName.trim();
    const trimmedDescription = description.trim();

    if (!trimmedProjectName || !trimmedDescription) {
      const errorMessage = !trimmedProjectName
        ? "Please enter a project name."
        : "Please enter a project description.";
      setError(errorMessage);
      showToast(errorMessage, "error");
      return;
    }

    const newProject: ProjectFormData = {
      name: trimmedProjectName,
      description: trimmedDescription,
      category,
    };

    onCreateProject(newProject);

    setProjectName("");
    setDescription("");
    setCategory("Web Development");
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <h2 className="mb-6 text-2xl font-bold text-white">
          Create Project
        </h2>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <ProjectForm
          name={projectName}
          description={description}
          category={category}
          onNameChange={(val) => {
            setProjectName(val);
            if (error) setError(null);
          }}
          onDescriptionChange={(val) => {
            setDescription(val);
            if (error) setError(null);
          }}
          onCategoryChange={setCategory}
        />

        <ModalActions
          onCancel={onClose}
          onSubmit={handleCreateProject}
          submitText="Create Project"
        />
      </div>
    </div>
  );
}