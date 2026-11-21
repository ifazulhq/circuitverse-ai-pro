"use client";

import { useEffect, useState } from "react";
import type {
  DashboardProject,
  ProjectFormData,
} from "@/types/dashboard";
import ProjectForm from "./ProjectForm";
import ModalActions from "./ModalActions";

interface EditProjectModalProps {
  project: DashboardProject;
  onClose: () => void;
  onUpdate: (
  id: string,
  updates: ProjectFormData
) => void;
}

export default function EditProjectModal({
  project,
  onClose,
  onUpdate,
}: EditProjectModalProps) {
    const [name, setName] = useState(project.name);
const [description, setDescription] = useState(project.description);
const [category, setCategory] = useState(project.category);

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

const handleUpdate = () => {
  const trimmedName = name.trim();
  const trimmedDescription = description.trim();
  const trimmedCategory = category.trim();

  if (!trimmedName || !trimmedDescription || !trimmedCategory) {
    return;
  }
  if (
  trimmedName === project.name &&
  trimmedDescription === project.description &&
  trimmedCategory === project.category
) {
  onClose();
  return;
}

  onUpdate(project.id, {
    name: trimmedName,
    description: trimmedDescription,
    category: trimmedCategory,
  });

  onClose();
};
const isFormValid =
  name.trim() !== "" &&
  description.trim() !== "" &&
  category.trim() !== "";
  return (
    <div
  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
  onClick={onClose}
>
      <div
  className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl"
  onClick={(e) => e.stopPropagation()}
>
        <h2 className="mb-6 text-2xl font-bold text-white">Edit Project</h2>

        <div className="space-y-6">
  <ProjectForm
  name={name}
  description={description}
  category={category}
  onNameChange={setName}
  onDescriptionChange={setDescription}
  onCategoryChange={setCategory}
/>
</div>

        <ModalActions
  onCancel={onClose}
  onSubmit={handleUpdate}
  submitText="Update Project"
  disabled={!isFormValid}
/>
      </div>
    </div>
  );
}