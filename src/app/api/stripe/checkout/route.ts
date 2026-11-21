import { auth } from "@auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import Stripe from "stripe";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const rateLimitResult = rateLimit(
      `stripe-checkout:${session.user.email}`,
      5,
      60 * 1000
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error:
            "Too many checkout attempts. Please wait a moment before trying again.",
        },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
  where: {
    email: session.user.email,
  },
  select: {
    id: true,
    email: true,
    name: true,
    stripeCustomerId: true,
  },
});

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const priceId = process.env.STRIPE_PRO_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe Pro price is not configured." },
        { status: 500 }
      );
    }

    const stripe = getStripe();

    const origin = new URL(request.url).origin;
let customer = user.stripeCustomerId;

if (!customer) {
  const stripeCustomer = await stripe.customers.create({
    email: user.email ?? undefined,
    name: user.name ?? undefined,
    metadata: {
      userId: user.id,
    },
  });

  customer = stripeCustomer.id;

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      stripeCustomerId: customer,
    },
  });
}
    const checkoutSession =
  await stripe.checkout.sessions.create({
    mode: "subscription",
    client_reference_id: user.id,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${origin}/dashboard?checkout=success`,
        cancel_url: `${origin}/dashboard?checkout=cancelled`,
        customer: customer,
        metadata: {
          userId: user.id,
        },
        subscription_data: {
          metadata: {
            userId: user.id,
          },
        },
      });

    return NextResponse.json({
      url: checkoutSession.url,
    });
  } catch (error) {
  console.error("POST /api/stripe/checkout error:", error);

  if (error instanceof Stripe.errors.StripeError) {
    switch (error.type) {
      case "StripeInvalidRequestError":
        return NextResponse.json(
          { error: "Invalid Stripe checkout request." },
          { status: 400 }
        );

      case "StripeAuthenticationError":
        return NextResponse.json(
          { error: "Stripe authentication failed." },
          { status: 500 }
        );

      case "StripeConnectionError":
        return NextResponse.json(
          { error: "Unable to connect to Stripe. Please try again." },
          { status: 503 }
        );

      case "StripeRateLimitError":
        return NextResponse.json(
          { error: "Too many billing requests. Please try again shortly." },
          { status: 429 }
        );

      case "StripeAPIError":
        return NextResponse.json(
          { error: "Stripe is temporarily unavailable. Please try again." },
          { status: 503 }
        );

      default:
        return NextResponse.json(
          { error: "A Stripe billing error occurred." },
          { status: 500 }
        );
    }
  }

  return NextResponse.json(
    { error: "Unable to start checkout. Please try again." },
    { status: 500 }
  );
  }
}