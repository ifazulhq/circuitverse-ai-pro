export type CircuitGenerationResult = {
  success: boolean;
  data?: unknown;
  error?: string;
};

export async function generateCircuit(
  prompt: string
): Promise<CircuitGenerationResult> {
  const response = await fetch("/api/ai/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
    }),
  });

  let data: Record<string, unknown> | null = null;
  try {
    data = await response.json();
  } catch {
    // Response was not JSON (e.g. 502/504 gateway timeout HTML page)
  }

  if (!response.ok) {
    const errorMsg =
      data && typeof data.error === "string"
        ? data.error
        : `AI generation failed with status ${response.status}. Please try again.`;

    return {
      success: false,
      error: errorMsg,
    };
  }

  return {
    success: true,
    data: data?.data,
  };
}