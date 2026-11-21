import { prisma } from "@/lib/prisma";
import {
  getEffectivePlan,
  type UserSubscription,
} from "@/lib/subscription";

export async function getUserSubscription(
  userId: string
): Promise<UserSubscription | null> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      plan: true,
      subscriptionStatus: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      subscriptionEndsAt: true,
    },
  });

  if (!user) {
    return null;
  }

  const subscription: UserSubscription = {
    plan: user.plan === "PRO" ? "PRO" : "FREE",
    status:
      user.subscriptionStatus === "CANCELED"
        ? "CANCELED"
        : user.subscriptionStatus === "PAST_DUE"
          ? "PAST_DUE"
          : user.subscriptionStatus === "INCOMPLETE"
            ? "INCOMPLETE"
            : user.subscriptionStatus === "INCOMPLETE_EXPIRED"
              ? "INCOMPLETE_EXPIRED"
              : user.subscriptionStatus === "TRIALING"
                ? "TRIALING"
                : user.subscriptionStatus === "UNPAID"
                  ? "UNPAID"
                  : "ACTIVE",
    stripeCustomerId: user.stripeCustomerId,
    stripeSubscriptionId: user.stripeSubscriptionId,
    subscriptionEndsAt: user.subscriptionEndsAt,
  };

  return {
    ...subscription,
    plan: getEffectivePlan(subscription),
  };
}