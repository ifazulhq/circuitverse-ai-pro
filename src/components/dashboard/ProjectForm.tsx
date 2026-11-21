"use client";
import type { ProjectFormData } from "@/types/dashboard";

interface ProjectFormProps extends ProjectFormData {
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export default function ProjectForm({
  name,
  description,
  category,
  onNameChange,
  onDescriptionChange,
  onCategoryChange,
}: ProjectFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <label
  htmlFor="project-name"
  className="mb-2 block text-sm text-gray-300"
>
  Project Name
</label>

        <input
          id="project-name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter project name..."
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
        />
      </div>

      <div>
        <label
  htmlFor="project-description"
  className="mb-2 block text-sm text-gray-300"
>
  Description
</label>

        <textarea
          id="project-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe your project..."
          rows={4}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
        />
      </div>

      <div>
        <label
  htmlFor="project-category"
  className="mb-2 block text-sm text-gray-300"
>
  Category
</label>

        <select
          id="project-category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
        >
          <option value="Web Development">Web Development</option>
          <option value="Digital Logic">Digital Logic</option>
          <option value="Microcontroller">Microcontroller</option>
          <option value="IoT">IoT</option>
          <option value="PCB Design">PCB Design</option>
        </select>
      </div>
    </div>
  );
}