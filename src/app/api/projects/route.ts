import { auth } from "@auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getPlanDefinition, type PlanType } from "@/lib/plans";
import { rateLimit } from "@/lib/rateLimit";
import { createProjectSchema } from "@/lib/validations";

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
    name: true,
  },
});

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  const projects = await prisma.project.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(projects);
  } catch (error) {
    console.error("GET /api/projects error:", error);

    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

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
      `projects:${session.user.email}`,
      30,
      60 * 1000
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many project creation requests. Please try again shortly." },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        name: true,
        plan: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Enforce plan project limit
    const { maxProjects } = getPlanDefinition(
      (user.plan as PlanType) ?? "FREE"
    ).usageLimits;

    const currentProjectCount = await prisma.project.count({
      where: { userId: user.id },
    });

    if (currentProjectCount >= maxProjects) {
      return NextResponse.json(
        {
          error: `Project limit reached. Your ${user.plan} plan allows ${maxProjects} project${maxProjects === 1 ? "" : "s"}.`,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validationResult = createProjectSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: validationResult.error.issues[0]?.message || "Invalid project data",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, description, category, priority, dueDate } = validationResult.data;

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        category,
        owner: user.name || "User",
        status: "In Progress",
        priority,
        dueDate: dueDate || null,
        completion: 0,
        progress: 0,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.id,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);

    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}