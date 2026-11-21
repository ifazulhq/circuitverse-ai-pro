import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
async function verifyStripeUser(
  userId: string,
  subscription: Stripe.Subscription
) {
  const stripeCustomerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  return prisma.user.findFirst({
    where: {
      id: userId,
      stripeCustomerId,
    },
    select: {
      id: true,
    },
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook secret is not configured." },
      { status: 500 }
    );
  }

  try {
    const body = await request.text();
    const stripe = getStripe();

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    if (event.type === "customer.subscription.created") {
  const subscription = event.data.object;

  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error(
      "Stripe subscription.created event is missing userId metadata."
    );

    return NextResponse.json(
      { error: "Missing userId metadata." },
      { status: 400 }
    );
  }
  const verifiedUser = await verifyStripeUser(
  userId,
  subscription
);

if (!verifiedUser) {
  console.error(
    "Stripe subscription.created event failed user ownership verification."
  );

  return NextResponse.json(
    { error: "Stripe customer ownership verification failed." },
    { status: 400 }
  );
}

  const statusMap: Record<string, string> = {
    active: "ACTIVE",
    canceled: "CANCELED",
    past_due: "PAST_DUE",
    incomplete: "INCOMPLETE",
    incomplete_expired: "INCOMPLETE_EXPIRED",
    trialing: "TRIALING",
    unpaid: "UNPAID",
  };

  const status = statusMap[subscription.status] ?? "INCOMPLETE";

const subscriptionItem = subscription.items.data[0];

if (!subscriptionItem) {
  return NextResponse.json(
    { error: "Subscription has no subscription items." },
    { status: 400 }
  );
}

await prisma.user.update({
  where: {
    id: userId,
  },
  data: {
    plan:
      subscription.status === "active" ||
      subscription.status === "trialing"
        ? "PRO"
        : "FREE",
    subscriptionStatus: status,
    stripeSubscriptionId: subscription.id,
    subscriptionEndsAt: new Date(
      subscriptionItem.current_period_end * 1000
    ),
  },
});

  console.log(
    `Subscription created for user ${userId}: ${subscription.id}`
  );
}
if (event.type === "customer.subscription.updated") {
  const subscription = event.data.object;

  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error(
      "Stripe subscription.updated event is missing userId metadata."
    );

    return NextResponse.json(
      { error: "Missing userId metadata." },
      { status: 400 }
    );
  }
  const verifiedUser = await verifyStripeUser(
  userId,
  subscription
);

if (!verifiedUser) {
  console.error(
    "Stripe subscription.updated event failed user ownership verification."
  );

  return NextResponse.json(
    { error: "Stripe customer ownership verification failed." },
    { status: 400 }
  );
}

  const statusMap: Record<string, string> = {
    active: "ACTIVE",
    canceled: "CANCELED",
    past_due: "PAST_DUE",
    incomplete: "INCOMPLETE",
    incomplete_expired: "INCOMPLETE_EXPIRED",
    trialing: "TRIALING",
    unpaid: "UNPAID",
  };

  const status = statusMap[subscription.status] ?? "INCOMPLETE";

  const subscriptionItem = subscription.items.data[0];

  if (!subscriptionItem) {
    return NextResponse.json(
      { error: "Subscription has no subscription items." },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      plan:
        subscription.status === "active" ||
        subscription.status === "trialing"
          ? "PRO"
          : "FREE",
      subscriptionStatus: status,
      stripeSubscriptionId: subscription.id,
      subscriptionEndsAt: new Date(
        subscriptionItem.current_period_end * 1000
      ),
    },
  });

  console.log(
    `Subscription updated for user ${userId}: ${subscription.id}`
  );
}
if (event.type === "customer.subscription.deleted") {
  const subscription = event.data.object;

  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error(
      "Stripe subscription.deleted event is missing userId metadata."
    );

    return NextResponse.json(
      { error: "Missing userId metadata." },
      { status: 400 }
    );
  }
  const verifiedUser = await verifyStripeUser(
  userId,
  subscription
);

if (!verifiedUser) {
  console.error(
    "Stripe subscription.deleted event failed user ownership verification."
  );

  return NextResponse.json(
    { error: "Stripe customer ownership verification failed." },
    { status: 400 }
  );
}

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      plan: "FREE",
      subscriptionStatus: "CANCELED",
      stripeSubscriptionId: subscription.id,
      subscriptionEndsAt: null,
    },
  });

  console.log(
    `Subscription cancelled for user ${userId}: ${subscription.id}`
  );
}
if (event.type === "invoice.paid") {
  const invoice = event.data.object;

  if (invoice.parent?.type !== "subscription_details") {
    console.log(
      "invoice.paid event is not associated with a subscription."
    );
  } else {
    const subscriptionReference =
  invoice.parent.subscription_details?.subscription;

const subscriptionId =
  typeof subscriptionReference === "string"
    ? subscriptionReference
    : subscriptionReference?.id;

if (!subscriptionId) {
  console.error(
    "Stripe renewal subscription is missing subscription ID."
  );

  return NextResponse.json(
    { error: "Missing subscription ID." },
    { status: 400 }
  );
}

const stripe = getStripe();

const subscription =
  await stripe.subscriptions.retrieve(subscriptionId);

    const userId = subscription.metadata?.userId;

    if (!userId) {
      console.error(
        "Stripe renewal subscription is missing userId metadata."
      );

      return NextResponse.json(
        { error: "Missing userId metadata." },
        { status: 400 }
      );
    }
    const verifiedUser = await verifyStripeUser(
  userId,
  subscription
);

if (!verifiedUser) {
  console.error(
    "Stripe renewal subscription failed user ownership verification."
  );

  return NextResponse.json(
    { error: "Stripe customer ownership verification failed." },
    { status: 400 }
  );
}

    const statusMap: Record<string, string> = {
      active: "ACTIVE",
      canceled: "CANCELED",
      past_due: "PAST_DUE",
      incomplete: "INCOMPLETE",
      incomplete_expired: "INCOMPLETE_EXPIRED",
      trialing: "TRIALING",
      unpaid: "UNPAID",
    };

    const status = statusMap[subscription.status] ?? "INCOMPLETE";

    const subscriptionItem = subscription.items.data[0];

    if (!subscriptionItem) {
      return NextResponse.json(
        { error: "Subscription has no subscription items." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        plan:
          subscription.status === "active" ||
          subscription.status === "trialing"
            ? "PRO"
            : "FREE",
        subscriptionStatus: status,
        stripeSubscriptionId: subscription.id,
        subscriptionEndsAt: new Date(
          subscriptionItem.current_period_end * 1000
        ),
      },
    });

    console.log(
      `Subscription renewed for user ${userId}: ${subscription.id}`
    );
  }
}

    return NextResponse.json(
      { received: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Stripe webhook error:", error);

    return NextResponse.json(
      { error: "Invalid Stripe webhook." },
      { status: 400 }
    );
  }
}