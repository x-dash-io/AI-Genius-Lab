export function estimateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const plainText = content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const wordCount = plainText ? plainText.split(" ").length : 0;
  const minutes = wordCount / wordsPerMinute;
  return Math.max(1, Math.ceil(minutes));
}
