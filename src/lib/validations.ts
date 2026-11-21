import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer")
    .optional()
    .nullable(),
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(50, "Category must be 50 characters or fewer"),
  priority: z.enum(["Low", "Medium", "High"]).optional().default("Medium"),
  dueDate: z.string().trim().max(50).optional().nullable(),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name must not be empty")
    .max(100, "Name must be 100 characters or fewer")
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer")
    .optional()
    .nullable(),
  category: z
    .string()
    .trim()
    .min(1, "Category must not be empty")
    .max(50, "Category must be 50 characters or fewer")
    .optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  isFavorite: z.boolean().optional(),
  lastOpenedAt: z.string().trim().max(50).optional().nullable(),
  progress: z.number().int().min(0).max(100).optional(),
  completion: z.number().int().min(0).max(100).optional(),
});

export const userPreferencesSchema = z
  .object({
    theme: z.enum(["dark", "light", "cyberpunk"]).optional(),
    motion: z.enum(["full", "reduced"]).optional(),
    interfaceDensity: z.enum(["standard", "compact"]).optional(),
    showGrid: z.enum(["shown", "hidden"]).optional(),
    snapToGrid: z.enum(["on", "off"]).optional(),
    gridSize: z
      .union([z.literal(20), z.literal(40), z.literal(60), z.literal(80)])
      .optional(),
    defaultZoom: z
      .union([
        z.literal(50),
        z.literal(75),
        z.literal(100),
        z.literal(125),
        z.literal(150),
      ])
      .optional(),
    keyboardShortcuts: z.enum(["enabled", "disabled"]).optional(),
    panWithSpace: z.enum(["enabled", "disabled"]).optional(),
    multiSelect: z.enum(["enabled", "disabled"]).optional(),
    doubleClickInputToggle: z.enum(["enabled", "disabled"]).optional(),
    aiResponseStyle: z.enum(["concise", "balanced", "detailed"]).optional(),
    aiExplanationFocus: z
      .enum(["standard", "circuit-analysis", "learning-support"])
      .optional(),
  })
  .passthrough();

export const simulationRunSchema = z.object({
  status: z.enum(["SUCCESS", "FAILED"]),
  errorCount: z.number().int().min(0).optional().default(0),
});
