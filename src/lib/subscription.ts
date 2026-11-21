import {
  getPlanDefinition,
  type PlanDefinition,
  type PlanType,
} from "@/lib/plans";

export type SubscriptionStatus =
  | "ACTIVE"
  | "CANCELED"
  | "PAST_DUE"
  | "INCOMPLETE"
  | "INCOMPLETE_EXPIRED"
  | "TRIALING"
  | "UNPAID";

export type UserSubscription = {
  plan: PlanType;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionEndsAt: Date | null;
};
export type PlanFeature = keyof PlanDefinition["features"];

export function isProSubscription(
  subscription: UserSubscription
): boolean {
  return (
    subscription.plan === "PRO" &&
    subscription.status === "ACTIVE"
  );
}

export function getEffectivePlan(
  subscription: UserSubscription
): PlanType {
  if (isProSubscription(subscription)) {
    return "PRO";
  }

  return "FREE";
}
export function canAccessProFeatures(
  plan: PlanType,
  status: SubscriptionStatus
): boolean {
  return (
    plan === "PRO" &&
    (status === "ACTIVE" || status === "TRIALING")
  );
}

export function canUpgrade(
  plan: PlanType,
  status: SubscriptionStatus
): boolean {
  return !canAccessProFeatures(plan, status);
}
export function canAccessFeature(
  plan: PlanType,
  status: SubscriptionStatus,
  feature: PlanFeature
): boolean {
  if (plan === "PRO" && !canAccessProFeatures(plan, status)) {
    return false;
  }

  return getPlanDefinition(plan).features[feature];
}