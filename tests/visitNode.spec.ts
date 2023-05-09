import { describe, it, expect } from "vitest";

import { DEFAULT_MATCHER } from "../lib/definitions.js";
import { visitNode } from "../lib/visitNode.js";

describe("visitNode", () => {
  it("should do nothing when after a `finalMatch` ", async () => {
    const asyncGenerator = visitNode({}, [], [], {
      type: "finalMatch",
      patternName: "test",
    });

    const emptyResult = await asyncGenerator.next();

    expect(emptyResult.value).toBe(undefined);
    expect(emptyResult.done).toBe(true);
  });
  it("should match with `DEFAULT_MATCHER` when after a `noPatterns` ", async () => {
    const asyncGenerator = visitNode({}, [], [], {
      type: "noPatterns",
    });

    const matchResult = await asyncGenerator.next();

    expect(matchResult.value).toStrictEqual({
      path: [],
      value: {},
      matchedPattern: DEFAULT_MATCHER,
    });
    expect(matchResult.done).toBe(false);

    const exits = await asyncGenerator.next();
    expect(exits.value).toBe(undefined);
    expect(exits.done).toBe(true);
  });
  it("should match with `DEFAULT_MATCHER` when after a `noMatch` ", async () => {
    const asyncGenerator = visitNode({}, [], [], {
      type: "noMatch",
      patternNames: ["test"],
    });

    const matchResult = await asyncGenerator.next();

    expect(matchResult.value).toStrictEqual({
      path: [],
      value: {},
      matchedPattern: DEFAULT_MATCHER,
    });
    expect(matchResult.done).toBe(false);

    const exits = await asyncGenerator.next();
    expect(exits.value).toBe(undefined);
    expect(exits.done).toBe(true);
  });
  it("should match with `DEFAULT_MATCHER` when after a `continue` ", async () => {
    const asyncGenerator = visitNode({}, [], [], {
      type: "continue",
      patternName: "test",
    });

    const matchResult = await asyncGenerator.next();

    expect(matchResult.value).toStrictEqual({
      path: [],
      value: {},
      matchedPattern: DEFAULT_MATCHER,
    });
    expect(matchResult.done).toBe(false);

    const exits = await asyncGenerator.next();
    expect(exits.value).toBe(undefined);
    expect(exits.done).toBe(true);
  });
});
