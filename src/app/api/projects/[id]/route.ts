import { auth } from "@auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { updateProjectSchema } from "@/lib/validations";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json(
        { error: "Invalid project ID" },
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
        { error: "User not found" },
        { status: 404 }
      );
    }

    const project = await prisma.project.findFirst({
      where: {
        id: id.trim(),
        userId: user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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
      `project-patch:${session.user.email}`,
      60,
      60 * 1000
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many project update requests. Please try again shortly." },
        { status: 429 }
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
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { id } = await params;

    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validationResult = updateProjectSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: validationResult.error.issues[0]?.message || "Invalid project update data",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      category,
      priority,
      isFavorite,
      lastOpenedAt,
      progress,
      completion,
    } = validationResult.data;

    const targetProgress = progress !== undefined ? progress : completion;

    const existingProject = await prisma.project.findFirst({
      where: {
        id: id.trim(),
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const project = await prisma.project.update({
      where: {
        id: id.trim(),
      },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && {
          description: description || null,
        }),
        ...(category !== undefined && { category }),
        ...(priority !== undefined && { priority }),
        ...(typeof isFavorite === "boolean" && {
          isFavorite,
        }),
        ...(lastOpenedAt !== undefined && {
          lastOpenedAt,
        }),
        ...(targetProgress !== undefined && {
          progress: targetProgress,
          completion: targetProgress,
        }),
        updatedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("PATCH /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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
      `project-delete:${session.user.email}`,
      30,
      60 * 1000
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many project deletion requests. Please try again shortly." },
        { status: 429 }
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
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { id } = await params;

    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const existingProject = await prisma.project.findFirst({
      where: {
        id: id.trim(),
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    await prisma.project.delete({
      where: {
        id: id.trim(),
      },
    });

    return NextResponse.json(
      { message: "Project deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}