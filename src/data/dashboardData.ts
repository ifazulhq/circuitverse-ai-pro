import { DashboardProject, DashboardStat } from "@/types/dashboard";
export const stats: DashboardStat[] = [
  {
    title: "Projects",
    value: "12",
    icon: "📁",
  },
  {
    title: "AI Chats",
    value: "48",
    icon: "🤖",
  },
  {
    title: "Success Rate",
    value: "98%",
    icon: "🚀",
  },
];

export const projects: DashboardProject[] = [
  {
  id: "project-1",
  name: "Traffic Light Controller",
  description: "Emergency vehicle traffic management system.",
  category: "IoT",
  owner: "Ifazul Haque",
  status: "Completed",
  priority: "High",
  dueDate: "2026-09-01",
  completion: 0,
  isFavorite: false,
  createdAt: "Jul 20, 2026",
  updatedAt: "Updated 2 days ago",
  lastOpenedAt: "2026-08-05"
},
  {
  id: "project-2",
  name: "4-bit ALU",
  description: "Arithmetic Logic Unit built using digital logic.",
  category: "Digital Logic",
  owner: "Ifazul Haque",
  status: "In Progress",
  priority: "Medium",
  dueDate: "2026-09-01",
  completion: 0,
  isFavorite: false,
  createdAt: "Jul 22, 2026",
  updatedAt: "Updated 5 hours ago",
  lastOpenedAt: "2026-08-05"
},
  {
  id: "project-3",
  name: "Circuit Simulator",
  description: "Interactive digital logic circuit simulator.",
  category: "Web Development",
  owner: "Ifazul Haque",
  status: "In Progress",
  priority: "Low",
  dueDate: "2026-09-01",
  completion: 0,
  isFavorite: false,
  createdAt: "Jul 25, 2026",
  updatedAt: "Updated 2 hours ago",
  lastOpenedAt: "2026-08-05"
},
];