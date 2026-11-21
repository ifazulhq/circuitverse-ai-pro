import { useProjects } from "@/context/ProjectContext";
export default function ProjectsToolbar() {
  const {
  searchQuery,
  setSearchQuery,
  selectedFilter,
  setSelectedFilter,
  sortOption,
  setSortOption,
} = useProjects();
  return (
    <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <input
  type="text"
  placeholder="Search projects..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white outline-none focus:border-cyan-500"
/>

      <select
  value={selectedFilter}
  onChange={(e) => setSelectedFilter(e.target.value)}
  className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white outline-none focus:border-cyan-500"
>
  <option value="All">All</option>

  <option value="Completed">Completed</option>
  <option value="In Progress">In Progress</option>

  <option value="IoT">IoT</option>
  <option value="Digital Logic">Digital Logic</option>
  <option value="Web Development">Web Development</option>
  <option value="High">High Priority</option>
<option value="Medium">Medium Priority</option>
<option value="Low">Low Priority</option>
</select>
<select
  value={sortOption}
  onChange={(e) => setSortOption(e.target.value)}
  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none"
>
  <option>Newest</option>
  <option>Oldest</option>
  <option>A-Z</option>
  <option>Z-A</option>
  <option value="High Priority">High Priority</option>
<option value="Recently Updated">Recently Updated</option>
</select>
    </div>
  );
}