import { auth } from "@auth";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import {
  buildCircuitGenerationPrompt,
  extractJsonFromMarkdown,
  validateGeneratedCircuit,
} from "@/lib/aiCircuitGeneration";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { getPlanDefinition, type PlanType } from "@/lib/plans";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
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
      select: {
        id: true,
        plan: true,
        aiGenerationUsedThisMonth: true,
        aiUsageResetAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Monthly quota check & calendar-month rollover
    const now = new Date();
    let currentGenUsage = user.aiGenerationUsedThisMonth;
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
      currentGenUsage = 0;
    }

    const planDef = getPlanDefinition((user.plan as PlanType) || "FREE");
    const genLimit = planDef.usageLimits.aiCircuitGenerationsPerMonth;

    if (currentGenUsage >= genLimit) {
      return NextResponse.json(
        {
          error: `Monthly AI Circuit Generation limit reached (${genLimit}/${genLimit} generations used). Upgrade to Pro for 200 monthly circuit generations.`,
        },
        { status: 403 }
      );
    }

    const rateLimitResult = rateLimit(
      `ai-generate:${session.user.email}`,
      10,
      60 * 1000
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error:
            "Too many AI generation requests. Please try again later.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    const { prompt } = body;

    if (
      !prompt ||
      typeof prompt !== "string" ||
      prompt.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Circuit generation request is required" },
        { status: 400 }
      );
    }

    const trimmedPrompt = prompt.trim();

    if (trimmedPrompt.length > 2000) {
      return NextResponse.json(
        {
          error:
            "Circuit generation request is too long. Please keep it under 2000 characters.",
        },
        { status: 400 }
      );
    }

    const generationPrompt =
      buildCircuitGenerationPrompt(trimmedPrompt);

    const FALLBACK_MODELS = ["gemini-3.6-flash", "gemini-2.5-flash"] as const;
    const AI_TIMEOUT_MS = 15_000;
    let rawText: string | undefined;
    let lastError: unknown = null;

    for (const model of FALLBACK_MODELS) {
      try {
        let timer: ReturnType<typeof setTimeout>;
        const timeoutPromise = new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            const err = new Error("Circuit generation request timed out after 15 seconds.");
            err.name = "TimeoutError";
            reject(err);
          }, AI_TIMEOUT_MS);
        });

        const generatePromise = ai.models.generateContent({
          model,
          contents: generationPrompt,
          config: { abortSignal: AbortSignal.timeout(AI_TIMEOUT_MS) },
        }).then((res) => {
          clearTimeout(timer);
          return res;
        });

        const response = await Promise.race([generatePromise, timeoutPromise]);
        rawText = response.text?.trim();
        if (rawText) break;
      } catch (err) {
        console.warn(`Circuit generation with model ${model} failed, trying fallback:`, err);
        lastError = err;
      }
    }

    if (!rawText) {
      if (lastError) {
        throw lastError;
      }
      return NextResponse.json(
        {
          error:
            "The AI returned an empty circuit generation response.",
        },
        { status: 422 }
      );
    }

    let generatedCircuit: unknown;

    try {
      const sanitizedJson = extractJsonFromMarkdown(rawText);
      generatedCircuit = JSON.parse(sanitizedJson);
    } catch {
      return NextResponse.json(
        {
          error:
            "The AI returned invalid circuit JSON. Please try again.",
        },
        { status: 422 }
      );
    }

    if (!validateGeneratedCircuit(generatedCircuit)) {
      return NextResponse.json(
        {
          error:
            "The AI returned an invalid circuit structure. Please try again.",
        },
        { status: 422 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        aiGenerationUsedThisMonth: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      data: generatedCircuit,
    });
  } catch (error) {
    console.error(
      "POST /api/ai/generate error:",
      error
    );

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
      {
        error:
          "Failed to generate the circuit. Please try again.",
      },
      { status: 500 }
    );
  }
}