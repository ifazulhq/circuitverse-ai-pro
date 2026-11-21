import { auth } from "@auth";
import { prisma } from "@/lib/prisma";
import { projects } from "@/data/dashboardData";
import { NextResponse } from "next/server";

export async function POST() {
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
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const migratedProjects = [];

    for (const project of projects) {
      const existingProject = await prisma.project.findFirst({
        where: {
          name: project.name,
          userId: user.id,
        },
      });

      if (existingProject) {
        migratedProjects.push(existingProject);
        continue;
      }

      const migratedProject = await prisma.project.create({
        data: {
          name: project.name,
          description: project.description,
          category: project.category,
          owner: project.owner,
          status: project.status,
          priority: project.priority,
          dueDate: project.dueDate,
          completion: project.completion,
          isFavorite: project.isFavorite,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          lastOpenedAt: project.lastOpenedAt,
          userId: user.id,
        },
      });

      migratedProjects.push(migratedProject);
    }

    return NextResponse.json({
      message: "Original projects migrated successfully",
      projects: migratedProjects,
    });
  } catch (error) {
    console.error("POST /api/projects/migrate error:", error);
    return NextResponse.json(
      { error: "Failed to migrate projects" },
      { status: 500 }
    );
  }
}