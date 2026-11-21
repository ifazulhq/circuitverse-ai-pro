import SectionHeader from "@/components/ui/SectionHeader";
type DashboardSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function DashboardSection({
  title,
  description,
  children,
}: DashboardSectionProps) {
  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <SectionHeader
  title={title}
  description={description}
/>

      {children}
    </section>
  );
}