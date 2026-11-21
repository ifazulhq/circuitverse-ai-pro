export type PlanType = "FREE" | "PRO";

export type PlanUsageLimits = {
  aiAssistantRequestsPerMonth: number;
  aiCircuitGenerationsPerMonth: number;
  maxProjects: number;
  maxStoragePerProjectMB: number;
};

export type PlanDefinition = {
  id: PlanType;
  name: string;
  description: string;

  features: {
    circuitEditor: boolean;
    circuitSimulation: boolean;
    components: boolean;
    projectManagement: boolean;
    importExport: boolean;
    truthTables: boolean;
    circuitValidation: boolean;
    aiAssistant: boolean;
    aiCircuitGeneration: boolean;
  };

  aiUsage: "GENEROUS" | "HIGHER";
  usageLimits: PlanUsageLimits;
};

export const FREE_PLAN: PlanDefinition = {
  id: "FREE",
  name: "Free",
  description:
    "A generous free plan with full access to core circuit creation and simulation features.",

  features: {
    circuitEditor: true,
    circuitSimulation: true,
    components: true,
    projectManagement: true,
    importExport: true,
    truthTables: true,
    circuitValidation: true,
    aiAssistant: true,
    aiCircuitGeneration: true,
  },

    aiUsage: "GENEROUS",

  usageLimits: {
    aiAssistantRequestsPerMonth: 100,
    aiCircuitGenerationsPerMonth: 20,
    maxProjects: 10,
    maxStoragePerProjectMB: 10,
  },
};

export const PRO_PLAN: PlanDefinition = {
  id: "PRO",
  name: "Pro",
  description:
    "A premium plan with higher AI usage and additional capacity for advanced users.",

  features: {
    circuitEditor: true,
    circuitSimulation: true,
    components: true,
    projectManagement: true,
    importExport: true,
    truthTables: true,
    circuitValidation: true,
    aiAssistant: true,
    aiCircuitGeneration: true,
  },

    aiUsage: "HIGHER",

  usageLimits: {
    aiAssistantRequestsPerMonth: 1000,
    aiCircuitGenerationsPerMonth: 200,
    maxProjects: 100,
    maxStoragePerProjectMB: 100,
  },
};

export function getPlanDefinition(
  plan: PlanType
): PlanDefinition {
  return plan === "PRO" ? PRO_PLAN : FREE_PLAN;
}