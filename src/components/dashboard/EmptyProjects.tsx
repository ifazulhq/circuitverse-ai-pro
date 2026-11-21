interface EmptyProjectsProps {
  message?: string;
}

export default function EmptyProjects({
  message = "No projects found.",
}: EmptyProjectsProps) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-700 p-10 text-center">
      <h3 className="text-xl font-semibold text-white">
        {message}
      </h3>

      <p className="mt-2 text-zinc-400">
        Create a new project to get started.
      </p>
    </div>
  );
}