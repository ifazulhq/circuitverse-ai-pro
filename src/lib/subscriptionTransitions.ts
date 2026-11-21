import type { PlanType } from "@/lib/plans";
import type { SubscriptionStatus } from "@/lib/subscription";

export type SubscriptionTransition = {
  from: PlanType;
  to: PlanType;
  status: SubscriptionStatus;
};

export function getPlanAfterSubscriptionStatus(
  currentPlan: PlanType,
  status: SubscriptionStatus
): PlanType {
  if (status === "ACTIVE" || status === "TRIALING") {
    return currentPlan === "PRO" ? "PRO" : "FREE";
  }

  return "FREE";
}
