import { auth } from "@auth";
import { prisma } from "@/lib/prisma";
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

    const count = await getAIChatCount(user.id);

    return NextResponse.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("GET /api/ai-chats/count error:", error);

    return NextResponse.json(
      { error: "Failed to load AI chat count." },
      { status: 500 }
    );
  }
}