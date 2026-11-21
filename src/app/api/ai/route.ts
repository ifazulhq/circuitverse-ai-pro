import { auth } from "@auth";
import { NextResponse } from "next/server";
import { generateAIResponse, generateAIStreamResponse } from "@/lib/aiService";
import { saveAIInteraction } from "@/lib/aiChatPersistence";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { getPlanDefinition, type PlanType } from "@/lib/plans";

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
      `ai:${session.user.email}`,
      10,
      60 * 1000
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error:
            "Too many AI requests. Please try again later.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    const {
      projectId,
      message,
      circuit,
      history,
      responseStyle,
      explanationFocus,
      stream,
    } = body;

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (
      !projectId ||
      typeof projectId !== "string" ||
      projectId.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const trimmedMessage = message.trim();

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        plan: true,
        aiAssistantUsedThisMonth: true,
        aiUsageResetAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const ownedProject = await prisma.project.findFirst({
      where: {
        id: projectId.trim(),
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!ownedProject) {
      return NextResponse.json(
        { error: "Project not found or unauthorized access" },
        { status: 404 }
      );
    }

    // Monthly quota check & calendar-month rollover
    const now = new Date();
    let currentUsage = user.aiAssistantUsedThisMonth;
    const resetDate = user.aiUsageResetAt ? new Date(user.aiUsageResetAt) : null;
    const isNewMonth =
      !resetDate ||
      resetDate.getMonth() !== now.getMonth() ||
      resetDate.getFullYear() !== now.getFullYear();

    if (isNewMonth) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          aiAssistantUsedThisMonth: 0,
          aiGenerationUsedThisMonth: 0,
          aiUsageResetAt: now,
        },
      });
      currentUsage = 0;
    }

    const planDef = getPlanDefinition((user.plan as PlanType) || "FREE");
    const limit = planDef.usageLimits.aiAssistantRequestsPerMonth;

    if (currentUsage >= limit) {
      return NextResponse.json(
        {
          error: `Monthly AI Assistant limit reached (${limit}/${limit} requests used). Upgrade to Pro for 1,000 monthly requests.`,
        },
        { status: 403 }
      );
    }

    const optimizedHistory = Array.isArray(history)
      ? history.slice(-10)
      : [];

    // Real-time streaming response for in-editor Copilot
    if (stream === true) {
      const encoder = new TextEncoder();
      let accumulatedResponse = "";

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of generateAIStreamResponse({
              message: trimmedMessage,
              circuit,
              history: optimizedHistory,
              responseStyle,
              explanationFocus,
            })) {
              accumulatedResponse += chunk;
              controller.enqueue(encoder.encode(chunk));
            }
            controller.close();

            // Persist the completed interaction and increment quota atomically
            if (accumulatedResponse.trim().length > 0) {
              await Promise.all([
                saveAIInteraction({
                  userId: user.id,
                  projectId: projectId.trim(),
                  userMessage: trimmedMessage,
                  assistantMessage: accumulatedResponse,
                }),
                prisma.user.update({
                  where: { id: user.id },
                  data: {
                    aiAssistantUsedThisMonth: { increment: 1 },
                  },
                }),
              ]).catch((err) => {
                console.error("Failed to persist streaming interaction or increment quota:", err);
              });
            }
          } catch (streamError) {
            console.error("Error during AI stream generation:", streamError);
            controller.error(streamError);
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "X-Accel-Buffering": "no",
        },
      });
    }

    // Standard non-streaming JSON response for backward compatibility
    const aiResponse = await generateAIResponse({
      message: trimmedMessage,
      circuit,
      history: optimizedHistory,
      responseStyle,
      explanationFocus,
    });

    const [persistenceResult] = await Promise.all([
      saveAIInteraction({
        userId: user.id,
        projectId: projectId.trim(),
        userMessage: trimmedMessage,
        assistantMessage: aiResponse.message,
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          aiAssistantUsedThisMonth: { increment: 1 },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: aiResponse,
      chatId: persistenceResult.chatId,
    });
  } catch (error) {
    console.error("POST /api/ai error:", error);

    const errorStatus =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number"
        ? error.status
        : null;

    const errorCode =
      typeof error === "object" &&
      error !== null &&
      "error" in error &&
      typeof error.error === "object" &&
      error.error !== null &&
      "code" in error.error &&
      typeof error.error.code === "number"
        ? error.error.code
        : null;

    if (errorStatus === 429 || errorCode === 429) {
      return NextResponse.json(
        {
          error:
            "The AI service quota has been temporarily exceeded. Please try again later.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 }
    );
  }
}