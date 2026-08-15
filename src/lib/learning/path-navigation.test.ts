import { describe, expect, it } from "vitest";
import {
  presentPathNavigation,
  sortPathModules,
  type NavModule,
} from "./path-navigation";

function mod(
  partial: Partial<NavModule> & Pick<NavModule, "id" | "title"> & {
    stagePos?: number;
    pos?: number;
    completed?: boolean;
    stageId?: string;
    stageTitle?: string;
  },
): NavModule {
  return {
    id: partial.id,
    title: partial.title,
    position: partial.pos ?? partial.position ?? 0,
    completed_at: partial.completed
      ? "2026-01-01T00:00:00Z"
      : (partial.completed_at ?? null),
    stage: {
      id: partial.stageId ?? partial.stage?.id ?? "s1",
      title: partial.stageTitle ?? partial.stage?.title ?? "Stage",
      position: partial.stagePos ?? partial.stage?.position ?? 0,
    },
  };
}

describe("sortPathModules", () => {
  it("orders by stage position then module position", () => {
    const sorted = sortPathModules([
      mod({ id: "b", title: "B", stagePos: 1, pos: 0 }),
      mod({ id: "a", title: "A", stagePos: 0, pos: 1 }),
      mod({ id: "c", title: "C", stagePos: 0, pos: 0 }),
    ]);
    expect(sorted.map((m) => m.id)).toEqual(["c", "a", "b"]);
  });
});

describe("presentPathNavigation", () => {
  const list = [
    mod({ id: "m1", title: "One", stagePos: 0, pos: 0, stageId: "s1" }),
    mod({
      id: "m2",
      title: "Two",
      stagePos: 0,
      pos: 1,
      stageId: "s1",
      completed: true,
    }),
    mod({
      id: "m3",
      title: "Three",
      stagePos: 1,
      pos: 0,
      stageId: "s2",
      stageTitle: "Next stage",
    }),
  ];

  it("returns null prev on first module and next across stages", () => {
    const nav = presentPathNavigation(list, "m1");
    expect(nav.prev).toBeNull();
    expect(nav.next?.id).toBe("m2");
    expect(nav.index).toBe(0);
    expect(nav.total).toBe(3);
    expect(nav.pathComplete).toBe(false);
  });

  it("returns prev and next in the middle", () => {
    const nav = presentPathNavigation(list, "m2");
    expect(nav.prev?.id).toBe("m1");
    expect(nav.next?.id).toBe("m3");
    expect(nav.next?.stageTitle).toBe("Next stage");
  });

  it("returns null next on last module", () => {
    const nav = presentPathNavigation(list, "m3");
    expect(nav.prev?.id).toBe("m2");
    expect(nav.next).toBeNull();
  });

  it("handles unknown current id", () => {
    const nav = presentPathNavigation(list, "missing");
    expect(nav.index).toBe(-1);
    expect(nav.prev).toBeNull();
    expect(nav.next).toBeNull();
    expect(nav.nextIncomplete?.id).toBe("m1");
  });

  it("handles empty list", () => {
    const nav = presentPathNavigation([], "x");
    expect(nav.total).toBe(0);
    expect(nav.pathComplete).toBe(false);
    expect(nav.nextIncomplete).toBeNull();
  });

  it("marks path complete when all done and nextIncomplete null", () => {
    const done = list.map((m) => ({
      ...m,
      completed_at: "2026-01-01T00:00:00Z",
    }));
    const nav = presentPathNavigation(done, "m2");
    expect(nav.pathComplete).toBe(true);
    expect(nav.nextIncomplete).toBeNull();
  });

  it("nextIncomplete skips completed modules", () => {
    const nav = presentPathNavigation(list, "m2");
    // m2 complete → continue to m3 (m1 still incomplete but earlier;
    // continue prefers first incomplete that isn't current — m1)
    expect(nav.nextIncomplete?.id).toBe("m1");
  });

  it("nextIncomplete is next module after completing current first item", () => {
    const onlyFirstOpen = [
      mod({ id: "m1", title: "One", stagePos: 0, pos: 0, completed: true }),
      mod({ id: "m2", title: "Two", stagePos: 0, pos: 1 }),
    ];
    const nav = presentPathNavigation(onlyFirstOpen, "m1");
    expect(nav.nextIncomplete?.id).toBe("m2");
  });
});
