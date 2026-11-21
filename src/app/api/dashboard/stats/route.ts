import { auth } from "@auth";
import { prisma } from "@/lib/prisma";
import { getUserSubscription } from "@/lib/getUserSubscription";
import { getAIChatCount } from "@/lib/aiChatCount";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // Fetch subscription, AI chats, and simulation counts concurrently via direct database aggregations
    const [subscription, aiChatCount, totalRuns, successfulRuns] =
      await Promise.all([
        getUserSubscription(user.id),
        getAIChatCount(user.id),
        prisma.simulationRun.count({
          where: {
            project: {
              userId: user.id,
            },
          },
        }),
        prisma.simulationRun.count({
          where: {
            project: {
              userId: user.id,
            },
            status: "SUCCESS",
          },
        }),
      ]);

    const successRate =
      totalRuns === 0
        ? 0
        : Math.round((successfulRuns / totalRuns) * 100);

    return NextResponse.json({
      success: true,
      subscription: subscription
        ? {
            plan: subscription.plan,
            status: subscription.status,
            subscriptionEndsAt: subscription.subscriptionEndsAt
              ? subscription.subscriptionEndsAt.toISOString()
              : null,
          }
        : {
            plan: "FREE" as const,
            status: "ACTIVE",
            subscriptionEndsAt: null,
          },
      aiChatCount: typeof aiChatCount === "number" ? aiChatCount : 0,
      successRate,
      simulationStats: {
        totalRuns,
        successfulRuns,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard/stats error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard statistics." },
      { status: 500 }
    );
  }
}
