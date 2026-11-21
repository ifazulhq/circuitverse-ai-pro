type SectionHeaderProps = {
  title: string;
  description?: string;
};

export default function SectionHeader({
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-semibold text-white">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-sm text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
}