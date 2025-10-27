export function extractJsonFromMessage(message: any) {
  if (!message?.content) return [];

  // Extract everything between ```json ... ``` or raw [ ... ]
  const text = message.content.trim();

  // Try matching JSON inside code blocks
  const codeBlockMatch = text.match(/```json([\s\S]*?)```/);
  const jsonCandidate = codeBlockMatch
    ? codeBlockMatch[1].trim()
    : text.match(/\[([\s\S]*)\]/)
    ? `[${text.match(/\[([\s\S]*)\]/)![1]}]`
    : null;

  if (!jsonCandidate) {
    console.warn("⚠️ No JSON found in message.");
    return [];
  }

  try {
    return JSON.parse(jsonCandidate);
  } catch (error) {
    console.error("❌ JSON parsing failed:", error);
    return [];
  }
}
