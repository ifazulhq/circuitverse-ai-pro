/**
 * Utility for safely extracting JSON from LLM responses that may be wrapped in markdown code fences.
 * Returns the cleaned JSON string, or an empty string if extraction fails.
 */
export function sanitizeAndParseJSON(text: string): string {
  if (!text) return "";
  const trimmed = text.trim();
  // Try to strip markdown fence ```json ... ```
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch && fenceMatch[1]) {
    return fenceMatch[1].trim();
  }
  // Fallback: find outermost braces
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1).trim();
  }
  // Return original trimmed text (may be pure JSON already)
  return trimmed;
}
