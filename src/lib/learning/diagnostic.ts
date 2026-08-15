import type {
  DiagnosticAnswer,
  DiagnosticQuestion,
  DiagnosticResult,
} from "@/types/domain";

export function scoreDiagnostic(
  questions: DiagnosticQuestion[],
  answers: DiagnosticAnswer[],
): DiagnosticResult {
  const byId = new Map(answers.map((a) => [a.questionId, a.choiceIndex]));
  let score = 0;
  const strengthTags: string[] = [];
  const gapTags: string[] = [];

  for (const q of questions) {
    const choice = byId.get(q.id);
    const tag = q.skillTag || "general";
    if (choice === q.correctIndex) {
      score += 1;
      if (!strengthTags.includes(tag)) strengthTags.push(tag);
    } else if (choice != null) {
      if (!gapTags.includes(tag)) gapTags.push(tag);
    } else if (!gapTags.includes(tag)) {
      gapTags.push(tag);
    }
  }

  const maxScore = questions.length || 1;
  const ratio = score / maxScore;
  const levelLabel =
    ratio >= 0.75 ? "advanced" : ratio >= 0.45 ? "intermediate" : "beginner";

  const summary =
    levelLabel === "advanced"
      ? "Strong placement — path will move faster through fundamentals and emphasize build/production depth."
      : levelLabel === "intermediate"
        ? "Solid base with gaps — path mixes refreshers and new material where you missed questions."
        : "Early placement — path starts with foundations and builds up carefully.";

  return {
    score,
    maxScore,
    levelLabel,
    summary,
    strengthTags,
    gapTags,
  };
}
