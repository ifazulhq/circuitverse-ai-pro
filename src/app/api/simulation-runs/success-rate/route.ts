import { auth } from "@auth";
import { prisma } from "@/lib/prisma";
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

    const simulationRuns = await prisma.simulationRun.findMany({
      where: {
        project: {
          userId: user.id,
        },
      },
      select: {
        status: true,
      },
    });

    const totalRuns = simulationRuns.length;

    const successfulRuns = simulationRuns.filter(
      (run) => run.status === "SUCCESS"
    ).length;

    const successRate =
      totalRuns === 0
        ? 0
        : Math.round((successfulRuns / totalRuns) * 100);

    return NextResponse.json({
      success: true,
      successRate,
      successfulRuns,
      totalRuns,
    });
  } catch (error) {
    console.error(
      "GET /api/simulation-runs/success-rate error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to calculate simulation success rate." },
      { status: 500 }
    );
  }
}