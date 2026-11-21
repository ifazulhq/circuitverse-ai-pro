import type { PlanType } from "@/lib/plans";
import {
  canAccessProFeatures,
  type SubscriptionStatus,
} from "@/lib/subscription";

export function shouldShowUpgrade(
  plan: PlanType,
  status: SubscriptionStatus
): boolean {
  return !canAccessProFeatures(plan, status);
}