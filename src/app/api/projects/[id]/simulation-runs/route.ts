import { auth } from "@auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { simulationRunSchema } from "@/lib/validations";

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const rateLimitResult = rateLimit(
      `sim-run:${session.user.email}`,
      60,
      60 * 1000
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many simulation run records. Please try again shortly." },
        { status: 429 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required." },
        { status: 400 }
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

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    const rawBody = await request.json();
    const validationResult = simulationRunSchema.safeParse(rawBody);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: validationResult.error.issues[0]?.message || "Invalid simulation run data.",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { status, errorCount } = validationResult.data;

    const simulationRun = await prisma.simulationRun.create({
      data: {
        projectId: project.id,
        status,
        errorCount,
      },
      select: {
        id: true,
        projectId: true,
        status: true,
        errorCount: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: simulationRun,
    });
  } catch (error) {
    console.error(
      "POST /api/projects/[id]/simulation-runs error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to save simulation run." },
      { status: 500 }
    );
  }
}