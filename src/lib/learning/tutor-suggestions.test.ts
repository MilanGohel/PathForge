import { describe, expect, it } from "vitest";
import {
  GENERIC_TUTOR_SUGGESTIONS,
  presentTutorSuggestions,
} from "./tutor-suggestions";

describe("presentTutorSuggestions", () => {
  it("returns three generics when there are no titles", () => {
    const s = presentTutorSuggestions([]);
    expect(s).toHaveLength(3);
    expect(s).toEqual([...GENERIC_TUTOR_SUGGESTIONS].slice(0, 3));
  });

  it("mixes one title with generics", () => {
    const s = presentTutorSuggestions(["Sliding windows"]);
    expect(s).toHaveLength(3);
    expect(s[0]).toContain("Sliding windows");
    expect(s.slice(1).every((x) => GENERIC_TUTOR_SUGGESTIONS.includes(x as typeof GENERIC_TUTOR_SUGGESTIONS[number]))).toBe(
      true,
    );
  });

  it("uses two specific H2s plus one generic when many titles", () => {
    const s = presentTutorSuggestions([
      "Why context bites",
      "The aperture model",
      "Truncation walkthrough",
      "Extra section",
    ]);
    expect(s).toHaveLength(3);
    expect(s[0]).toContain("Why context bites");
    expect(s[1]).toContain("The aperture model");
    expect(GENERIC_TUTOR_SUGGESTIONS).toContain(s[2] as typeof GENERIC_TUTOR_SUGGESTIONS[number]);
  });

  it("is deterministic for the same titles", () => {
    const titles = ["A", "B", "C"];
    expect(presentTutorSuggestions(titles)).toEqual(
      presentTutorSuggestions(titles),
    );
  });

  it("ignores blank titles", () => {
    const s = presentTutorSuggestions(["  ", "Real title", ""]);
    expect(s[0]).toContain("Real title");
    expect(s).toHaveLength(3);
  });

  it("dedupes repeated titles before building specifics", () => {
    const s = presentTutorSuggestions(["Same", "Same", "Other"]);
    expect(s[0]).toContain("Same");
    expect(s[1]).toContain("Other");
    expect(s).toHaveLength(3);
  });
});
