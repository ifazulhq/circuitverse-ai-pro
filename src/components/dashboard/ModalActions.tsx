interface ModalActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  submitText: string;
  disabled?: boolean;
}

export default function ModalActions({
  onCancel,
  onSubmit,
  submitText,
  disabled = false,
}: ModalActionsProps) {
  return (
    <div className="mt-8 flex justify-end gap-3">
      <button
        onClick={onCancel}
        className="rounded-lg border border-zinc-700 px-4 py-2 text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled}
        className={`rounded-lg px-4 py-2 text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
  disabled
    ? "cursor-not-allowed bg-zinc-700 text-zinc-400"
    : "bg-cyan-600 hover:bg-cyan-500"
}`}
      >
        {submitText}
      </button>
    </div>
  );
}