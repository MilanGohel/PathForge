/**
 * Build empty-state tutor prompt suggestions from this lesson's H2 titles.
 * Mix up to 2 topic-specific prompts with at least 1 generic.
 */

export const GENERIC_TUTOR_SUGGESTIONS = [
  "Give me one practice question on this module",
  "What common mistake should I watch for?",
  "Explain the core idea in simpler words",
] as const;

/**
 * Deterministic suggestions for the empty tutor state.
 * - 0 titles → 3 generics
 * - 1+ titles → up to 2 from real H2s + enough generics to reach 3
 */
export function presentTutorSuggestions(titles: string[]): string[] {
  const cleaned = titles.map((t) => t.trim()).filter(Boolean);
  const unique: string[] = [];
  for (const t of cleaned) {
    if (!unique.some((u) => u.toLowerCase() === t.toLowerCase())) {
      unique.push(t);
    }
  }

  const specific: string[] = [];
  if (unique[0]) {
    specific.push(`Explain “${unique[0]}” another way`);
  }
  if (unique[1]) {
    specific.push(`Quiz me lightly on “${unique[1]}”`);
  }

  // Up to 2 from real H2s; pad with generics to 3
  const out = [...specific];
  for (const g of GENERIC_TUTOR_SUGGESTIONS) {
    if (out.length >= 3) break;
    out.push(g);
  }
  return out.slice(0, 3);
}
