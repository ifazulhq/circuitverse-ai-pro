export interface DashboardProject {
  id: string;
  name: string;
  description: string;
  category: string;
  owner: string;
  status: string;
  priority: "Low" | "Medium" | "High";
  dueDate: string;
  completion: number;
  progress?: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
}
export interface DashboardStat {
  title: string;
  value: string;
  icon: string;
}
export interface ProjectFormData {
  name: string;
  description: string;
  category: string;
}

export type NewProject = ProjectFormData;