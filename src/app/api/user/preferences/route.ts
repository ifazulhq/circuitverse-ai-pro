import { auth } from "@auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { userPreferencesSchema } from "@/lib/validations";

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
      where: { email: session.user.email },
      select: { preferences: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      preferences: user.preferences ?? {},
    });
  } catch (error) {
    console.error("GET /api/user/preferences error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user preferences" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const rateLimitResult = rateLimit(
      `preferences:${session.user.email}`,
      60,
      60 * 1000
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many preferences update requests. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      typeof body.preferences !== "object" ||
      body.preferences === null
    ) {
      return NextResponse.json(
        { error: "Preferences object is required" },
        { status: 400 }
      );
    }

    const validationResult = userPreferencesSchema.safeParse(body.preferences);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: validationResult.error.issues[0]?.message || "Invalid preferences data",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const validatedPreferences = validationResult.data;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, preferences: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const existingPreferences =
      user.preferences && typeof user.preferences === "object"
        ? (user.preferences as Record<string, unknown>)
        : {};

    const updatedPreferences: Record<string, unknown> = {
      ...existingPreferences,
      ...validatedPreferences,
    };

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { preferences: updatedPreferences as Prisma.InputJsonValue },
      select: { preferences: true },
    });

    return NextResponse.json({
      success: true,
      preferences: updatedUser.preferences,
    });
  } catch (error) {
    console.error("PUT /api/user/preferences error:", error);
    return NextResponse.json(
      { error: "Failed to update user preferences" },
      { status: 500 }
    );
  }
}
